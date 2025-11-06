import cluster from 'node:cluster';
import fs from 'node:fs';
import read from './read.js';
import { join } from 'node:path';

// setup working directory
const workingDir = '/tmp/test262.fyi';
// fs.rmSync(workingDir, { recursive: true, force: true });
// if (!fs.existsSync(workingDir)) fs.mkdirSync(workingDir);
process.chdir(workingDir);

let engine = process.argv[2];
let experimental = false;
if (engine.endsWith('_exp')) {
  experimental = true;
  engine = engine.slice(0, -4);
}

if (cluster.isPrimary) {
  const meta = await (await import(`../engines/${engine}/setup.js`)).default();
  console.log(meta);

  // read test262 and setup js engine in parallel
  const preludes = meta.preludes ?? fs.readdirSync('test262/harness').reduce((acc, x) => {
    if (!x.endsWith('.js')) {
      if (x.includes('.')) return acc;

      // subdir
      for (const y of fs.readdirSync(`test262/harness/${x}`)) {
        if (!y.endsWith('.js')) continue;
        acc[`${x}/${y}`] = fs.readFileSync(`test262/harness/${x}/${y}`, 'utf8');
      }
      return acc;
    }

    acc[x] = fs.readFileSync(`test262/harness/${x}`, 'utf8');
    return acc;
  }, {});

  let runtime = fs.readFileSync(join(import.meta.dirname, '..', 'engines', engine, 'runtime.js'), 'utf8');
  runtime = runtime.replace('$SOURCE', JSON.stringify(runtime.replace('$SOURCE', '""')));

  const tests = await read('test262', preludes, runtime);

  const out = {};
  const result = (file, pass) => {
    const existing = out[file];
    if ((existing === undefined || existing === true) && pass) out[file] = true;
      else out[file] = false;
    finished++;
  };

  let resolve;
  const promise = new Promise(res => {
    resolve = res;
  });

  let queue = 0, finished = 0, total = tests.length;
  const spawn = () => {
    if (queue >= total) return;

    const worker = cluster.fork();

    let running;
    const enqueue = () => {
      running = tests[queue++];
      if (!running) {
        worker.kill();
        return;
      }

      worker.send(running);
    };

    worker.on('message', pass => {
      const ran = running;
      enqueue();
      if (pass == null) return;

      result(ran.file, pass);
      if (finished === total) resolve();
    });
  };

  const time = performance.now();

  for (let w = 0; w < (process.env.FYI_PARALLEL_TESTS || 32); w++) spawn();
  await promise;

  // kill any runaway engine processes, ignore errors
  try {
    $(`pkill -9 -f ./${engine}`);
  } catch {
  }

  console.log(process.argv[2] + ' passes:', Object.values(out).reduce((acc, x) => acc + x, 0), '/', total);

  if (!fs.existsSync('results')) fs.mkdirSync('results', { recursive: true });
  fs.writeFileSync(`results/${process.argv[2]}.json`, JSON.stringify({
    passes: out,
    time: performance.now() - time,
    ...meta
  }));
} else {
  const _run = (await import(`../engines/${engine}/run.js`)).default;
  const run = ({ file, contents, flags, negative }) => {
    // use tmp file in same dir as test for module resolution
    const tmpFile = `test262/test/${file}.${engine}`;
    fs.writeFileSync(tmpFile, contents);

    const result = _run(tmpFile, flags.module, experimental);
    fs.unlinkSync(tmpFile);

    const combined = result.stdout + '\n' + result.stderr;
    const lowered = combined.toLowerCase();
    const hasError = result.error || lowered.includes('error') || lowered.includes('exception') || lowered.includes('panic');

    if (negative) {
      if (!hasError) return false;
      if (negative.type && !combined.includes(negative.type)) return false;
      return true;
    }

    if (hasError) return false;
    if (flags.async && !combined.includes('Test262:AsyncTestComplete')) return false;
    return true;
  };

  process.on('message', test => {
    let pass = run(test);

    if (test.strictRerun) {
      pass &&= run({
        ...test,
        contents: '"use strict";\n' + test.contents
      });
    }

    process.send(pass);
  });

  process.send(null);
}
