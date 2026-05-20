import fs from 'node:fs';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { $ } from '../../util.js';
import platform from '../platform.js';

export default async () => {
  const headers = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
  const runs = (await (await fetch('https://api.github.com/repos/boa-dev/boa/actions/runs?per_page=100', { headers })).json()).workflow_runs;
  const version = (runs.find(x => x.name === 'Nightly Build') ?? runs.at(-1)).head_sha.slice(0, 7);

  const { body } = await fetch(`https://github.com/boa-dev/boa/releases/download/nightly/${platform.boa}`);
  await finished(Readable.fromWeb(body).pipe(fs.createWriteStream('boa')));

  $('chmod +x boa');

  return { version };
};
