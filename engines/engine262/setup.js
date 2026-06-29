import fs from 'node:fs';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { $ } from '../../util.js';

export default async () => {
  const metadata = await (await fetch('https://registry.npmjs.org/@engine262%2fengine262/latest')).json();
  const { body } = await fetch(metadata.dist.tarball);
  await finished(Readable.fromWeb(body).pipe(fs.createWriteStream('engine262.tgz')));

  $('rm -rf engine262');
  fs.mkdirSync('engine262');
  $('tar -xzf engine262.tgz -C engine262 --strip-components=1');
  fs.rmSync('engine262.tgz', { force: true });

  return { version: metadata.version };
};
