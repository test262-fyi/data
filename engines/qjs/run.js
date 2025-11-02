import { $$ } from '../../util.js';

export default (file, module = false) => {
  const args = [ '-N', file ];
  if (module) args.unshift('--module');

  return $$('./qjs', args);
};