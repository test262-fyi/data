import { $$ } from '../../util.js';

export default (file, module = false) => {
  const args = [ '-q', file ];
  if (module) args.unshift('-m');

  return $$('./njs', args);
};
