import fs from 'node:fs';
import child_process from 'node:child_process';
import process from 'node:process';
import { join } from 'node:path';
import { $ } from '../util.js';
import generate from './generate.js';

const beganAt = Date.now();

// setup working directory
const workingDir = '/tmp/test262.fyi';
fs.rmSync(workingDir, { recursive: true, force: true });
if (!fs.existsSync(workingDir)) fs.mkdirSync(workingDir);
process.chdir(workingDir);

// clone test262
console.log('cloning test262...');
fs.rmSync('test262', { recursive: true, force: true });
$(`git clone https://github.com/tc39/test262.git --depth=1`);
const test262Rev = $(`git -C test262 rev-parse HEAD`).trim().slice(0, 7);

const run = engine => new Promise((res, rej) => {
  console.log(`running ${engine}...`);
  console.time(engine);
  child_process.exec(`node ${join(import.meta.dirname, '..', 'runner', 'index.js')} ${engine}`, {}, (err, stdout, stderr) => {
    console.timeEnd(engine);
    if (err) console.error(err);
    res();
  });
});

// queue where order does not matter
const queue = [
  'qjs',
  'qjs_ng',
  'porffor',
  'boa',
  'libjs',
  'kiesel',
  'nova'
];

const thread = async first => {
  await first();
  while (queue.length > 0) await run(queue.shift());
};

await Promise.all([
  thread(async () => {
    await run('jsc');
    await run('jsc_exp');
  }),
  thread(async () => {
    await run('v8');
    await run('v8_exp');
  }),
  thread(async () => {
    await run('sm');
    await run('sm_exp');
  })
]);

// kill any runaway engine processes, ignore errors
try {
  $(`pkill -9 -f test262/test`);
} catch {
}

await generate({ beganAt, test262Rev });

process.chdir('/tmp/test262.fyi/deploy');
$(`git init`);
$(`git branch -m gh-pages`);
$(`git add .`);
$(`git commit -m "deploy"`, {
  GIT_AUTHOR_NAME: 'test262.fyi',
  GIT_AUTHOR_EMAIL: 'hello@test262.fyi',
  GIT_COMMITTER_NAME: 'test262.fyi',
  GIT_COMMITTER_EMAIL: 'hello@test262.fyi'
});
$(`git remote add origin git@github.com:test262-fyi/data.git`)
$(`git push -f origin gh-pages`);

fs.rmSync(workingDir, { recursive: true, force: true });
