import { $, $$ } from '../../cli.js';

export default (file, module = false) => {
  const args = [ './porffor/runtime/index.js', file ];
  if (module) args.push('--module');

  return $$('node', args);
};
