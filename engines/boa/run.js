import { $$ } from '../../util.js';

export default (file, module = false) => {
  const args = [ '--debug-object', file ];
  if (module) args.unshift('--module');

  return $$('./boa', args);
};