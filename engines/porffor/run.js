import { $$ } from '../../util.js';

export default (file, module = false) => {
  const args = [ '--compiler=tcc', file ];
  if (module) args.push('--module');

  return $$('./porf', args);
};
