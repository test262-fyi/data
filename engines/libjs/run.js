import { $$ } from '../../util.js';

export default (file, module = false) => {
  const args = [ '--disable-ansi-colors', '--no-syntax-highlight', '--disable-source-location-hints', '--disable-debug-output', '--use-test262-global', '--raw-strings', file ];
  if (module) args.unshift('-m');

  return $$(`./libjs`, args);
};