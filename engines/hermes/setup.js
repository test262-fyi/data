import fs from 'node:fs';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { $ } from '../../util.js';

const buildDir = process.env.HOME + '/hermes';
const build = () => {
  console.log('building hermes... (this will take a while)');
  $(`rm -rf ${buildDir}`);
  $(`git clone https://github.com/facebook/hermes.git ${buildDir} --depth=1`);
  const version = $(`git -C ${buildDir} rev-parse HEAD`).trim().slice(0, 7);

  $(`cmake -S ${buildDir} -B ${buildDir}/build -G Ninja -DCMAKE_BUILD_TYPE=Release`);
  $(`cmake --build ${buildDir}/build`);
  $(`cp -rf ${buildDir}/build/bin/hermes ./hermes`);
  $(`rm -rf ${buildDir}`);

  return { version };
};

const download = async () => {
  const headers = process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {};
  const runs = (await (await fetch('https://api.github.com/repos/facebook/hermes/actions/runs?per_page=100&branch=main', { headers })).json()).workflow_runs;
  const artifactName = 'hermes-osx-bin-Release';

  for (const run of runs) {
    if (run.name !== 'RN Build Hermes' || run.status !== 'completed') continue;

    const artifacts = (await (await fetch(run.artifacts_url, { headers })).json()).artifacts;
    const artifact = artifacts.find(x => x.name === artifactName && !x.expired);
    if (!artifact) continue;

    const response = await fetch(artifact.archive_download_url, { headers });
    if (!response.ok) throw new Error(`Failed to download artifact: ${response.status} ${response.statusText}`);
    await finished(Readable.fromWeb(response.body).pipe(fs.createWriteStream('hermes.zip')));

    $('unzip -oq hermes.zip -d _hermes');
    fs.rmSync('hermes.zip', { force: true });
    $('cp -rf $(find _hermes -type f -name hermes -print -quit) ./hermes');
    fs.rmSync('_hermes', { recursive: true, force: true });
    $('chmod +x hermes');

    return { version: run.head_sha.slice(0, 7) };
  }

  throw new Error(`Could not find a downloadable ${artifactName} artifact.`);
};

export default async () => {
  if (process.platform === 'darwin') {
    try {
      return await download();
    } catch {
    }
  }

  return build();
};
