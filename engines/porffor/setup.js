import fs from 'node:fs';
import { Readable } from 'node:stream';
import { finished } from 'node:stream/promises';
import { $ } from '../../util.js';

export default async () => {
  const assetName = `porffor-${process.platform}-${process.arch}.tar.gz`;
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {})
  };

  const releaseResponse = await fetch('https://api.github.com/repos/CanadaHonk/porffor/releases/latest', { headers });
  if (!releaseResponse.ok) throw new Error(`Failed to fetch latest Porffor release: ${releaseResponse.status} ${releaseResponse.statusText}`);

  const release = await releaseResponse.json();
  const asset = release.assets.find(x => x.name === assetName);
  if (!asset) throw new Error(`Porffor release ${release.tag_name} has no ${assetName} asset`);

  const assetResponse = await fetch(asset.browser_download_url, { headers });
  if (!assetResponse.ok) throw new Error(`Failed to download ${assetName}: ${assetResponse.status} ${assetResponse.statusText}`);

  fs.rmSync('porf', { force: true });
  try {
    await finished(Readable.fromWeb(assetResponse.body).pipe(fs.createWriteStream('porffor.tar.gz')));
    $('tar -xzf porffor.tar.gz');
  } finally {
    fs.rmSync('porffor.tar.gz', { force: true });
  }
  $('chmod +x porf');

  return { version: $('./porf --version').trim() };
};
