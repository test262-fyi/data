import fs from 'node:fs';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { $ } from '../../util.js';
import platform from '../platform.js';

const latestMacBuild = async () => {
  const body = await (await fetch('https://webkit.org/build-archives/')).text();
  const builds = Array.from(body.matchAll(new RegExp(`href="(https://s3-us-west-2\\.amazonaws\\.com/minified-archives\\.webkit\\.org/mac-${platform.jsc}-release/(\\d+)@main\\.zip)"`, 'g')));
  const latest = builds.toSorted((a, b) => Number(b[2]) - Number(a[2]))[0];
  if (latest) return { url: latest[1], version: latest[2] };

  throw new Error('Could not find a downloadable macOS JavaScriptCore build.');
};

const latestLinuxBuild = async () => {
  const base = `https://webkitgtk.org/jsc-built-products/${platform.jsc}/release`;
  const body = await (await fetch(`${base}/LAST-IS`)).text();
  const version = /(\d+)@main\.zip/.exec(body)[1];
  return {
    version,
    url: `${base}/${version}@main.zip`
  };
};

export default async () => {
  const { version, url } = process.platform === 'linux' ? await latestLinuxBuild() : await latestMacBuild();

  const { body } = await fetch(url);
  await finished(Readable.fromWeb(body).pipe(fs.createWriteStream('jsc.zip')));

  fs.rmSync('jsc', { recursive: true, force: true });
  if (process.platform === 'linux') {
    $('unzip -oq jsc.zip -d jsc');
  } else {
    $('unzip -oq jsc.zip "Release/*" -d jsc');
  }
  fs.rmSync('jsc.zip');

  return { version };
};
