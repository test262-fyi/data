import fs from 'node:fs';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { $ } from '../../util.js';

export default async () => {
  const headers = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
  const artifact = (await (await fetch('https://api.github.com/repos/ladybirdbrowser/ladybird/actions/artifacts', { headers })).json())
    .artifacts.find(x => x.name === 'ladybird-js-Linux-aarch64');

  const version = artifact.workflow_run.head_sha.slice(0, 7);

  const { body } = await fetch(artifact.archive_download_url, { headers });
  await finished(Readable.fromWeb(body).pipe(fs.createWriteStream('libjs.zip')));

  $(`unzip -o libjs.zip -d _libjs`);
  fs.rmSync('libjs.zip', { force: true });
  $(`tar -xf _libjs/ladybird-js-Linux-aarch64.tar.gz -C _libjs`);
  $(`cp -rf _libjs/bin/js libjs`);
  fs.rmSync('_libjs', { recursive: true, force: true });

  return { version };
};
