import fs from 'node:fs';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { $ } from '../../util.js';
import platform from '../platform.js';

export default async () => {
  const headers = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
  const release = await (await fetch('https://api.github.com/repos/lucid-softworks/lumen/releases/tags/nightly', { headers })).json();
  const version = release.target_commitish.slice(0, 7);

  const { body } = await fetch(`https://github.com/lucid-softworks/lumen/releases/download/nightly/${platform.lumen}`);
  await finished(Readable.fromWeb(body).pipe(fs.createWriteStream('lumen')));

  $('chmod +x lumen');

  return { version };
};
