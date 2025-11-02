import fs from 'node:fs';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { $ } from '../../util.js';

export default async () => {
  if (fs.existsSync('sm')) return {
    version: $('./sm/js --version').trim().split('-')[1].slice(1)
  };

  const { body } = await fetch(`https://ftp.mozilla.org/pub/firefox/nightly/latest-mozilla-central/jsshell-linux-aarch64.zip`);
  await finished(Readable.fromWeb(body).pipe(fs.createWriteStream('sm.zip')));

  $(`unzip -o sm.zip -d sm`);
  fs.rmSync('sm.zip');

  return {
    version: $('./sm/js --version').trim().split('-')[1].slice(1)
  };
};