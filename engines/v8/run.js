import { $, $$ } from '../../util.js';

let experimentalArgs = null;
const getExperimentalArgs = () => {
  experimentalArgs = [];

  const help = $('./v8/d8 --help').split('\n');
  for (const x of help) {
    if (x.includes('--no-js') || x.includes('--no-harmony')) {
      experimentalArgs.push(`--${x.split('-').slice(3).join('-')}`);
    }
  }

  return experimentalArgs;
};

export default (file, module = false, experimental = false) => {
  const args = [ '--expose-gc', file ];
  if (module) args.unshift('--module');
  if (experimental) args.unshift(...(experimentalArgs ?? getExperimentalArgs()));

  return $$('./v8/d8', args);
};