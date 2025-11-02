import fs from "node:fs";
import { Readable } from "node:stream";
import { finished } from "node:stream/promises";
import { $ } from "../../util.js";

export default async () => {
  const headers = process.env.GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
    : {};
  const runs = (
    await (
      await fetch(
        "https://api.github.com/repos/trynova/nova/actions/runs?per_page=100",
        { headers },
      )
    ).json()
  ).workflow_runs;
  const latest = runs.find(
    (x) =>
      x.name === "Build and Release Nova CLI" &&
      x.head_branch === "main" &&
      x.status === "completed" &&
      x.conclusion === "success" &&
      x.artifacts_url !== undefined,
  );
  const version = latest?.head_sha.slice(0, 7);
  const artifacts = (
    await (await fetch(latest.artifacts_url, { headers })).json()
  ).artifacts;
  const artifact = artifacts.find((x) => x.name === "nova-linux-arm64");

  const artifactResponse = await fetch(artifact.archive_download_url, {
    headers,
  });
  if (!artifactResponse.ok) {
    throw new Error(
      `Failed to download artifact: ${artifactResponse.status} ${artifactResponse.statusText}`,
    );
  }
  await finished(
    Readable.fromWeb(artifactResponse.body).pipe(
      fs.createWriteStream("nova.zip"),
    ),
  );

  $("unzip nova.zip");
  $("rm nova.zip");
  $("mv nova-linux-arm64 nova");
  $("chmod +x nova");

  return { version };
};
