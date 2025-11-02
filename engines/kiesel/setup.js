import fs from 'node:fs';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { $ } from '../../util.js';

export default async () => {
  const { body } = await fetch(`https://files.kiesel.dev/kiesel-linux-aarch64`);
  await finished(Readable.fromWeb(body).pipe(fs.createWriteStream('kiesel')));

  $('chmod +x kiesel');

  return {
    version: $('./kiesel --version').split('\n')[0].split('+')[1].trim()
  };
};