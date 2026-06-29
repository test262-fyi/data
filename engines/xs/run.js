import { $$ } from '../../util.js';

export default (file, module = false) => {
  const args = [ file ];
  args.unshift(module ? '-m' : '-s');

  return $$('./xs', args);
};
