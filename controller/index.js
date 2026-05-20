import fs from 'node:fs';
import child_process from 'node:child_process';
import process from 'node:process';
import { join } from 'node:path';
import { $ } from '../util.js';
import generate from './generate.js';
import * as OOMKiller from './oom-killer.js';

// setup working directory
const workingDir = join(import.meta.dirname, '..', '.test262-fyi');
if (!fs.existsSync(workingDir)) fs.mkdirSync(workingDir);
process.chdir(workingDir);

const engines = [
  'jsc',
  'jsc_exp',
  'v8',
  'v8_exp',
  'sm',
  'sm_exp',
  'qjs',
  'qjs_ng',
  'porffor',
  'boa',
  'libjs',
  'kiesel',
  'nova'
];

let queue = process.argv[2]?.split(',').map(x => x.trim()).filter(x => x);
if (queue == null || queue.length === 0) queue = engines;

if (queue.length === engines.length) fs.rmSync('results', { recursive: true, force: true });
fs.rmSync('deploy', { recursive: true, force: true });

// clone test262
console.log('cloning test262...');
fs.rmSync('test262', { recursive: true, force: true });
$(`git clone https://github.com/tc39/test262.git --depth=1`);
const test262Rev = $(`git -C test262 rev-parse HEAD`).trim().slice(0, 7);

OOMKiller.start(workingDir);

const run = engine => new Promise((res, rej) => {
  console.log(`running ${engine}...`);
  console.time(engine);
  child_process.exec(`node ${join(import.meta.dirname, '..', 'runner', 'index.js')} ${engine}`, {}, (err, stdout, stderr) => {
    console.timeEnd(engine);
    $(`pkill -9 -f "\\\\.${engine}$" || true`); // clean up any still running engine processes
    if (err) console.error(err);
    res();
  });
});

while (queue.length > 0) await run(queue.shift());

OOMKiller.stop();

// kill any runaway engine processes, ignore errors
try {
  $(`pkill -9 -f test262/test`);
} catch {
}

await generate({ test262Rev });
