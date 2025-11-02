import { $$ } from '../../util.js';

let experimentalArgs = null;
const getExperimentalArgs = () => {
  experimentalArgs = [];

  const help = $$('./jsc/bin/jsc', [ '--options' ]).stderr.split('\n');
  let ignore = true;
  for (const x of help) {
    if (ignore) {
      if (x.includes('useAllocationProfiling')) ignore = false;
      continue;
    }

    if (x.startsWith('   use') && x.includes('=false') && x.includes(' ... ')) {
      if (x.includes('Wasm')) continue;
      experimentalArgs.push(`--${x.split(' ')[3].replace('=false', '=true')}`);
    }
  }

  return experimentalArgs;
};

export default (file, module = false, experimental = false) => {
  const args = [ file ];
  if (module) args.unshift('-m');
  if (experimental) args.unshift(...(experimentalArgs ?? getExperimentalArgs()));

  return $$('./jsc/bin/jsc', args, {
    LD_LIBRARY_PATH: '/tmp/test262.fyi/jsc/lib'
  });
};