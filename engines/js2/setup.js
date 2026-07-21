import child_process from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const PACKAGE = '@loopdive/js2';
const PINNED_NODE = '25.9.0';

const run = (command, args, options = {}) => child_process.execFileSync(command, args, {
  cwd: options.cwd,
  encoding: 'utf8',
  stdio: options.capture ? ['ignore', 'pipe', 'inherit'] : 'inherit',
  env: { ...process.env, NO_COLOR: '1', ...options.env }
});

export default async () => {
  const installRoot = path.resolve('js2-package');
  const packageRoot = process.env.JS2_FYI_PACKAGE_ROOT
    ? path.resolve(process.env.JS2_FYI_PACKAGE_ROOT)
    : path.join(installRoot, 'node_modules', '@loopdive', 'js2');

  if (!process.env.JS2_FYI_PACKAGE_ROOT && !fs.existsSync(path.join(packageRoot, 'dist', 'test262-fyi-cli.js'))) {
    run('npm', [
      'install', '--prefix', installRoot, '--no-save', '--omit=dev', '--no-audit', '--no-fund',
      `${PACKAGE}@latest`, `node@${PINNED_NODE}`
    ]);
  }

  const executable = process.env.JS2_FYI_NODE || path.join(installRoot, 'node_modules', 'node', 'bin', 'node');
  const cli = path.join(packageRoot, 'dist', 'test262-fyi-cli.js');
  if (!fs.existsSync(executable)) throw new Error(`js2 Node runtime is missing: ${executable}`);
  if (!fs.existsSync(cli)) throw new Error(`installed ${PACKAGE} does not provide js2-test262: ${cli}`);

  run(executable, [cli, '--check-runtime'], { capture: true });
  const metadata = JSON.parse(fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'));
  const nodeVersion = run(executable, ['--version'], { capture: true }).trim();

  process.env.JS2_FYI_CLI = cli;
  process.env.JS2_FYI_NODE = executable;
  process.env.JS2_FYI_TEST262_ROOT = path.resolve('test262');
  process.env.TEST262_TZ = 'UTC';

  return { version: `${metadata.version} (${nodeVersion})` };
};
