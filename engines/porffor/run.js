import { $$ } from '../../util.js';

export default (file, module = false) => {
  const args = [ file ];
  if (module) args.push('--module');

  return $$('./porffor', args);
};
