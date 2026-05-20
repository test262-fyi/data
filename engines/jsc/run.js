import { $$ } from '../../util.js';

const env = process.platform === 'linux'
  ? { LD_LIBRARY_PATH: '/tmp/test262.fyi/jsc/lib' }
  : {
      DYLD_FRAMEWORK_PATH: '/tmp/test262.fyi/jsc',
      DYLD_LIBRARY_PATH: '/tmp/test262.fyi/jsc'
    };

const bin = process.platform === 'linux' ? './jsc/bin/jsc' : './jsc/jsc';

let experimentalArgs = null;
const getExperimentalArgs = () => {
  experimentalArgs = [];

  const help = $$(bin, [ '--options' ], env).stderr.split('\n');
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

  return $$(bin, args, env);
};
