import { $$ } from '../../util.js';

export default (file, module = false) => {
  const args = [ './engine262/lib/node/bin.mjs', '--no-inspect', file ];
  if (module) args.splice(2, 0, '--module');

  return $$('node', args);
};
