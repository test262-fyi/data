import fs from 'node:fs';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { $ } from '../../cli.js';

export default async () => {
  // const { version } = await (await fetch('https://storage.googleapis.com/chromium-v8/official/canary/v8-linux-arm64-rel-latest.json')).json();
  const version = '13.8.144'; // https://issues.chromium.org/issues/425634685
  if (fs.existsSync('v8')) return { version };

  const { body } = await fetch(`https://storage.googleapis.com/chromium-v8/official/canary/v8-linux-arm64-rel-${version}.zip`);
  await finished(Readable.fromWeb(body).pipe(fs.createWriteStream('v8.zip')));

  $(`unzip -o v8.zip -d v8`);
  fs.rmSync('v8.zip');

  return { version };
};