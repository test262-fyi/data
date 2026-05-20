import fs from 'node:fs';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { $ } from '../../util.js';
import platform from '../platform.js';

export default async () => {
  const { version } = await (await fetch(`https://storage.googleapis.com/chromium-v8/official/canary/${platform.v8}-latest.json`)).json();
  if (fs.existsSync('v8')) return { version };

  const { body } = await fetch(`https://storage.googleapis.com/chromium-v8/official/canary/${platform.v8}-${version}.zip`);
  await finished(Readable.fromWeb(body).pipe(fs.createWriteStream('v8.zip')));

  $(`unzip -o v8.zip -d v8`);
  fs.rmSync('v8.zip');

  return { version };
};
