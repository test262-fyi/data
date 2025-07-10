import fs from 'node:fs';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { $ } from '../../cli.js';

export default async () => {
  const headers = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
  const runs = (await (await fetch('https://api.github.com/repos/boa-dev/boa/actions/runs?per_page=100', { headers })).json()).workflow_runs;
  const version = (runs.find(x => x.name === 'Nightly Build') ?? runs.at(-1)).head_sha.slice(0, 7);

  const { body } = await fetch(`https://github.com/boa-dev/boa/releases/download/nightly/boa-aarch64-unknown-linux-gnu`);
  await finished(Readable.fromWeb(body).pipe(fs.createWriteStream('boa')));

  $('chmod +x boa');

  return { version };
};