import fs from 'node:fs';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { $ } from '../../util.js';
import platform from '../platform.js';

export default async () => {
  const headers = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
  const url = `https://api.github.com/repos/ladybirdbrowser/ladybird/actions/artifacts?name=${platform.libjs}`;

  const artifact = (await (await fetch(url, { headers })).json()).artifacts[0];
  const version = artifact.workflow_run.head_sha.slice(0, 7);

  const { body } = await fetch(artifact.archive_download_url, { headers });
  await finished(Readable.fromWeb(body).pipe(fs.createWriteStream('libjs.zip')));

  $(`unzip -oq libjs.zip -d _libjs`);
  fs.rmSync('libjs.zip', { force: true });
  $(`tar -xf _libjs/${platform.libjs}.tar.gz -C _libjs`);
  $(`cp -rf _libjs/bin/js libjs`);
  fs.rmSync('_libjs', { recursive: true, force: true });

  return { version };
};
