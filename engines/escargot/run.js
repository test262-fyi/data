import { $$ } from '../../util.js';

export default (file, module = false) => {
  const args = [ file ];
  if (module) args.unshift('--module');

  return $$('./escargot', args);
};
