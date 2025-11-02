import { $$ } from '../../util.js';

export default (file, module = false) => {
  const args = [ '--print-promise-rejection-warnings=no', file ];
  if (module) args.unshift('--module');

  return $$('./kiesel', args);
};