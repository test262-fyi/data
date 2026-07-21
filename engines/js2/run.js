import { $$ } from '../../util.js';

export default (file, module = false) => {
  const cli = process.env.JS2_FYI_CLI;
  const test262Root = process.env.JS2_FYI_TEST262_ROOT;
  const executable = process.env.JS2_FYI_NODE;
  if (!cli || !test262Root || !executable) {
    throw new Error('js2 setup did not publish its CLI paths');
  }

  const args = [
    cli,
    '--target', 'standalone',
    '--test262-root', test262Root,
    '--engine-suffix', 'js2'
  ];
  if (module) args.push('--module');
  args.push(file);
  return $$(executable, args, {
    TEST262_TZ: 'UTC',
    // util.$$ enforces the repository-wide ten-second engine timeout. Let the
    // inner compiler worker stop first so it cannot survive a timed-out CLI.
    TEST262_FYI_SOURCE_TIMEOUT_MS: '8000'
  });
};
