import { readFileSync, readdirSync, mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import read from '../runner/read.js';

const dataDir = 'deploy';
const results = {}, versions = {}, times = {};

export default async ({ test262Rev, beganAt }) => {
  for (const file of readdirSync('results')) {
    const engine = file.split('.')[0];
    const { passes, time, version } = JSON.parse(readFileSync(`results/${file}`, 'utf8'));
    versions[engine] = version;
    times[engine] = time;
    results[engine] = passes;

    console.log(`loaded results of ${engine}`);
  }

  const engines = Object.keys(results);

  mkdirSync(dataDir, { recursive: true });
  writeFileSync(join(dataDir, 'CNAME'), 'data.test262.fyi');

  console.log(versions);

  writeFileSync(join(dataDir, 'engines.json'), JSON.stringify(versions));
  writeFileSync(join(dataDir, 'times.json'), JSON.stringify({
    generatedAt: Date.now(),
    beganAt,
    timeTaken: times
  }));
  writeFileSync(join(dataDir, 'test262.json'), JSON.stringify({
    revision: test262Rev
  }));

  const orderedFiles = Object.keys(results[engines[0]]).sort((a, b) => a.localeCompare(b));

  let struct = new Map();
  for (const file of orderedFiles) {
    let y = struct;
    let path = [];

    for (const x of file.split('/').slice(0, -1)) {
      if (!y.has(x)) y.set(x, new Map());

      path.push(x);

      y = y.get(x);
      if (typeof y !== 'string') y.set('file', path.join('/'));
    }

    const k = file.split('/').pop();
    if (!y.has(k)) y.set(k, file);
  }

  console.log('generated structure');

  const walk = (x) => {
    let out = { total: 0, engines: {}, files: {} };
    const file = x.get('file') ?? 'index';
    // console.log(file);
    const dataFile = join(dataDir, file + '.json');

    for (const k of x.keys()) {
      if (k === 'file') continue;

      const y = x.get(k);
      if (typeof y === 'string') {
        out.files[y] = { total: 1, engines: {} };
        out.total++;

        for (const engine of engines) {
          if (out.engines[engine] === undefined) out.engines[engine] = 0;
          if (out.files[y].engines[engine] === undefined) out.files[y].engines[engine] = 0;

          if (results[engine][y]) {
            out.files[y].engines[engine]++;
            out.engines[engine]++;
          }
        }
        continue;
      }

      const file = y.get('file');
      const walkOut = walk(y);
      out.total += walkOut.total;

      for (const engine in walkOut.engines) {
        out.engines[engine] = (out.engines[engine] ?? 0) + walkOut.engines[engine];
      }

      out.files[file] = {};
      for (const k in walkOut) {
        if (k === 'files') continue;
        out.files[file][k] = walkOut[k];
      }
    }

    mkdirSync(dirname(dataFile), { recursive: true });
    writeFileSync(dataFile, JSON.stringify(out));
    return out;
  };
  // walkStruct(struct);
  walk(struct);

  const testsWithFeatures = {};
  await read('test262', {}, '', ({ file, contents }) => {
    let features = (contents.match(/^features: \[(.*)\]$/m)?.[1] ?? '').split(',');
    if (features.length === 0) {
      features = (contents.match(/^features:\n(  - .*\s*\n)+/m)?.[0] ?? '').replaceAll('\n  - ',',').slice(10, -1).split(',');
    }

    testsWithFeatures[file] = features.map(x => x.trim());
  });

  const rawFeatures = await (await fetch(`https://raw.githubusercontent.com/tc39/test262/${test262Rev}/features.txt`)).text();
  const features = rawFeatures.split('\n').filter(x => x && x[0] !== '#').map(x => x.split('#')[0].trim());

  const featureResults = new Map(), featureDetails = new Map(), editionResults = {};

  const featureByEdition = new Map(Object.entries({
    // https://github.com/tc39/proposal-intl-locale-info
    "Intl.Locale-info": 99,
    // https://github.com/tc39/proposal-intl-numberformat-v3
    "Intl.NumberFormat-v3": 99,
    // https://github.com/tc39/proposal-regexp-legacy-features
    "legacy-regexp": 99,
    // https://github.com/tc39/proposal-temporal
    "Temporal": 99,
    // https://github.com/tc39/proposal-shadowrealm
    "ShadowRealm": 99,
    // https://github.com/tc39/proposal-decorators
    "decorators": 99,
    // https://github.com/tc39/proposal-duplicate-named-capturing-groups
    "regexp-duplicate-named-groups": 99,
    // https://github.com/tc39/proposal-array-from-async
    "Array.fromAsync": 99,
    // https://github.com/tc39/proposal-json-parse-with-source
    "json-parse-with-source": 99,
    // https://github.com/tc39/proposal-explicit-resource-management
    "explicit-resource-management": 99,
    // https://github.com/tc39/proposal-source-phase-imports
    "source-phase-imports": 99,
    // https://github.com/tc39/proposal-esm-phase-imports
    "source-phase-imports-module-source": 99,
    // https://github.com/tc39/proposal-atomics-microwait
    "Atomics.pause": 99,
    // https://tc39.es/proposal-defer-import-eval
    "import-defer": 99,
    // https://github.com/tc39/proposal-iterator-sequencing
    "iterator-sequencing": 99,
    // https://github.com/tc39/proposal-canonical-tz
    "canonical-tz": 99,
    // https://github.com/tc39/proposal-upsert
    "upsert": 99,
    // https://github.com/tc39/proposal-immutable-arraybuffer
    "immutable-arraybuffer": 99,
    // https://github.com/tc39/proposal-nonextensible-applies-to-private
    "nonextensible-applies-to-private": 99,
    //
    "host-gc-required": 99,

    // ESNext
    "Error.isError": 99,
    "Math.sumPrecise": 99,
    "uint8array-base64": 99,

    // ES2025
    "Float16Array": 16,
    "import-attributes": 16,
    "Intl.DurationFormat": 16,
    "iterator-helpers": 16,
    "json-modules": 16,
    "promise-try": 16,
    "RegExp.escape": 16,
    "regexp-modifiers": 16,
    "set-methods": 16,

    // ES2024
    "Atomics.waitAsync": 15,
    "array-grouping": 15,
    "arraybuffer-transfer": 15,
    "promise-with-resolvers": 15,
    "regexp-v-flag": 15,
    "resizable-arraybuffer": 15,
    "String.prototype.isWellFormed": 15,
    "String.prototype.toWellFormed": 15,

    // ES2023
    "array-find-from-last": 14,
    "change-array-by-copy": 14,
    "hashbang": 14,
    "symbols-as-weakmap-keys": 14,

    // ES2022
    "arbitrary-module-namespace-names": 13,
    "Array.prototype.at": 13,
    "class-fields-private": 13,
    "class-fields-private-in": 13,
    "class-fields-public": 13,
    "class-methods-private": 13,
    "class-static-block": 13,
    "class-static-fields-private": 13,
    "class-static-fields-public": 13,
    "class-static-methods-private": 13,
    "error-cause": 13,
    "Intl.DateTimeFormat-extend-timezonename": 13,
    "Intl.DisplayNames-v2": 13,
    "Intl-enumeration": 13,
    "Intl.Segmenter": 13,
    "Object.hasOwn": 13,
    "regexp-match-indices": 13,
    "String.prototype.at": 13,
    "top-level-await": 13,
    "TypedArray.prototype.at": 13,

    // ES2021
    "AggregateError": 12,
    "align-detached-buffer-semantics-with-web-reality": 12,
    "FinalizationRegistry": 12,
    "Intl.DateTimeFormat-datetimestyle": 12,
    "Intl.DateTimeFormat-formatRange": 12,
    "Intl.DateTimeFormat-fractionalSecondDigits": 12,
    "Intl.DisplayNames": 12,
    "Intl.ListFormat": 12,
    "Intl.Locale": 12,
    "logical-assignment-operators": 12,
    "numeric-separator-literal": 12,
    "Promise.any": 12,
    "String.prototype.replaceAll": 12,
    "WeakRef": 12,

    // ES2020
    "BigInt": 11,
    "coalesce-expression": 11,
    "Intl.NumberFormat-unified": 11,
    "Intl.RelativeTimeFormat": 11,
    "optional-chaining": 11,
    "dynamic-import": 11,
    "export-star-as-namespace-from-module": 11,
    "for-in-order": 11,
    "globalThis": 11,
    "import.meta": 11,
    "Promise.allSettled": 11,
    "String.prototype.matchAll": 11,
    "Symbol.matchAll": 11,

    // ES2019
    "Array.prototype.flat": 10,
    "Array.prototype.flatMap": 10,
    "json-superset": 10,
    "Object.fromEntries": 10,
    "optional-catch-binding": 10,
    "stable-array-sort": 10,
    "stable-typedarray-sort": 10,
    "string-trimming": 10,
    "String.prototype.trimEnd": 10,
    "String.prototype.trimStart": 10,
    "Symbol.prototype.description": 10,
    "well-formed-json-stringify": 10,

    // ES2018
    "async-iteration": 9,
    "IsHTMLDDA": 9,
    "object-rest": 9,
    "object-spread": 9,
    "Promise.prototype.finally": 9,
    "regexp-dotall": 9,
    "regexp-lookbehind": 9,
    "regexp-named-groups": 9,
    "regexp-unicode-property-escapes": 9,
    "Symbol.asyncIterator": 9,

    // ES2017
    "async-functions": 8,
    "Atomics": 8,
    "Intl.DateTimeFormat-dayPeriod": 8,
    "intl-normative-optional": 8,
    "SharedArrayBuffer": 8,

    // ES2016
    "Array.prototype.includes": 7,
    "exponentiation": 7,
    "u180e": 7,

    // ES6
    "ArrayBuffer": 6,
    "Array.prototype.values": 6,
    "arrow-function": 6,
    "class": 6,
    "computed-property-names": 6,
    "const": 6,
    "cross-realm": 6,
    "DataView": 6,
    "DataView.prototype.getFloat32": 6,
    "DataView.prototype.getFloat64": 6,
    "DataView.prototype.getInt16": 6,
    "DataView.prototype.getInt32": 6,
    "DataView.prototype.getInt8": 6,
    "DataView.prototype.getUint16": 6,
    "DataView.prototype.getUint32": 6,
    "DataView.prototype.setUint8": 6,
    "default-parameters": 6,
    "destructuring-assignment": 6,
    "destructuring-binding": 6,
    "for-of": 6,
    "Float32Array": 6,
    "Float64Array": 6,
    "generators": 6,
    "Int8Array": 6,
    "Int16Array": 6,
    "Int32Array": 6,
    "let": 6,
    "Map": 6,
    "new.target": 6,
    "Object.is": 6,
    "Promise": 6,
    "Proxy": 6,
    "proxy-missing-checks": 6,
    "Reflect": 6,
    "Reflect.construct": 6,
    "Reflect.set": 6,
    "Reflect.setPrototypeOf": 6,
    "rest-parameters": 6,
    "Set": 6,
    "String.fromCodePoint": 6,
    "String.prototype.endsWith": 6,
    "String.prototype.includes": 6,
    "super": 6,
    "Symbol": 6,
    "Symbol.hasInstance": 6,
    "Symbol.isConcatSpreadable": 6,
    "Symbol.iterator": 6,
    "Symbol.match": 6,
    "Symbol.replace": 6,
    "Symbol.search": 6,
    "Symbol.species": 6,
    "Symbol.split": 6,
    "Symbol.toPrimitive": 6,
    "Symbol.toStringTag": 6,
    "Symbol.unscopables": 6,
    "tail-call-optimization": 6,
    "template": 6,
    "TypedArray": 6,
    "Uint8Array": 6,
    "Uint16Array": 6,
    "Uint32Array": 6,
    "Uint8ClampedArray": 6,
    "WeakMap": 6,
    "WeakSet": 6,

    // ES5
    "caller": 5,
  }).concat([ ["__proto__", 6], ["__getter__", 8], ["__setter__", 8] ]));

  let info = {};
  for (const line of rawFeatures.split('process-document')[1].split('## Standard')[0].split('\n').filter(x => x)) {
    if (line.startsWith('# https://github.com')) {
      const repo = line.split('github.com/tc39/')[1].replace('/', '').trim();

      let spec = await (await fetch(`https://raw.githubusercontent.com/tc39/${repo}/HEAD/spec.html`)).text();
      if (spec === '404: Not Found' || spec.includes('stage: -1')) spec = await (await fetch(`https://raw.githubusercontent.com/tc39/${repo}/HEAD/spec.emu`)).text();
      if (spec === '404: Not Found' || spec.includes('stage: -1')) spec = await (await fetch(`https://raw.githubusercontent.com/tc39/${repo}/HEAD/README.md`)).text();

      info.name = spec.match(/(title:|#) (.*)/i)?.[2];
      info.stage = parseInt(spec.match(/stage:? ([0-9])/i)?.[1]);
      info.link = `https://github.com/tc39/${repo}`;

      if (!process.env.GITHUB_TOKEN) continue; // skip if no GITHUB_TOKEN in env to avoid rate limiting people
      const repoInfo = await (await fetch(`https://api.github.com/repos/tc39/${repo}`, { headers: { Authorization: 'Bearer ' + process.env.GITHUB_TOKEN }})).json();
      if (!repoInfo.stargazers_count) continue;

      info.description = repoInfo.description;
      info.stars = repoInfo.stargazers_count;
      info.lastUpdated = repoInfo.updated_at;
    }

    if (!line.startsWith('#')) {
      if (info.name) featureDetails.set(line.trim(), info);
      info = {};
    }
  }

  for (const feature of features) {
    const detail = featureDetails.get(feature);
    let edition = featureByEdition.get(feature);
    if (edition === undefined) console.warn(`feature '${feature}' has no associated edition`);
    if (edition === 99) edition = undefined;

    if (!featureResults.has(feature)) featureResults.set(feature, { total: 0, engines: {}, proposal: detail || null });
    if (!editionResults[edition]) editionResults[edition] = { total: 0, engines: {} };

    const r = featureResults.get(feature);

    let tests = [];
    for (const file in testsWithFeatures) {
      if (testsWithFeatures[file].includes(feature)) {
        tests.push(file);
        r.total++;
        editionResults[edition].total++;
      }
    }

    for (const engine of engines) {
      if (r.engines[engine] === undefined) r.engines[engine] = 0;
      if (editionResults[edition].engines[engine] === undefined) editionResults[edition].engines[engine] = 0;

      for (const file of tests) {
        if (results[engine][file]) {
          r.engines[engine]++;
          editionResults[edition].engines[engine]++;
        }
      }
    }
  }

  writeFileSync(join(dataDir, 'features.json'), JSON.stringify(Object.fromEntries(featureResults)));
  writeFileSync(join(dataDir, 'editions.json'), JSON.stringify(editionResults));

  // jank :)
  let history;

  try {
    history = await (await fetch(process.env.FYI_HISTORY_URL || 'https://data.test262.fyi/history.json')).json();
  } catch {
    // failed, probably does not exist or ?????
    history = {};
  }

  const date = (new Date()).toISOString().split('T')[0];
  const indexResults = JSON.parse(readFileSync(join(dataDir, 'index.json')));

  history[date] = {
    time: Date.now(),

    total: indexResults.total,
    ...indexResults.engines,

    versions,
    test262: test262Rev
  };

  writeFileSync(join(dataDir, 'history.json'), JSON.stringify(history));
};
