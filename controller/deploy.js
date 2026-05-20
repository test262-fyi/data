import fs from 'node:fs';
import process from 'node:process';
import { join } from 'node:path';
import { $ } from '../util.js';

const deployDir = join(import.meta.dirname, '..', '.test262-fyi', 'deploy');

if (!fs.existsSync(deployDir)) {
  throw new Error(`Missing deploy directory: ${deployDir}`);
}

process.chdir(deployDir);

$(`git init`);
$(`git branch -m gh-pages`);
$(`git add .`);
$(`git commit -m "deploy"`, {
  GIT_AUTHOR_NAME: 'test262.fyi',
  GIT_AUTHOR_EMAIL: 'hello@test262.fyi',
  GIT_COMMITTER_NAME: 'test262.fyi',
  GIT_COMMITTER_EMAIL: 'hello@test262.fyi'
});
$(`git remote add origin https://github.com/test262-fyi/data.git`);
$(`git push -f origin gh-pages`);
