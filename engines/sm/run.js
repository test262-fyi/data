import { $, $$ } from '../../util.js';

let experimentalArgs = null;
const getExperimentalArgs = () => {
  experimentalArgs = [];
  const help = $('./sm/js --help').split('\n');
  for (const x of help) {
    if (x.includes('--enable-') && x.includes('  Enable ')) {
      const flag = x.split(' ')[2];
      if (flag === '--enable-parallel-marking') continue;

      experimentalArgs.push(flag);
    }
  }

  return experimentalArgs;
};

export default (file, module = false, experimental = false) => {
  const args = [ file ];
  if (module) args.unshift('--module');
  if (experimental) args.unshift(...(experimentalArgs ?? getExperimentalArgs()));

  return $$('./sm/js', args);
};