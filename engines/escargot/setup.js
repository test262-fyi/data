import { $, $$ } from '../../util.js';

const buildDir = 'escargot-src';

// escargot needs icu, which is keg-only in homebrew so pkg-config can't find it by default
const icuEnv = () => {
  if (process.platform !== 'darwin') return {};

  const { stdout, error } = $$('brew', ['--prefix', 'icu4c']);
  if (error) {
    console.error('escargot: could not locate icu4c via homebrew, build will likely fail (install with `brew install icu4c`, or set PKG_CONFIG_PATH yourself)');
    return {};
  }

  return {
    PKG_CONFIG_PATH: [`${stdout.trim()}/lib/pkgconfig`, process.env.PKG_CONFIG_PATH].filter(Boolean).join(':')
  };
};

export default async () => {
  const env = icuEnv();

  $(`rm -rf ${buildDir}`);
  $(`git clone https://github.com/Samsung/escargot.git ${buildDir} --depth=1 --recurse-submodules --shallow-submodules`);
  const version = $(`git -C ${buildDir} rev-parse HEAD`).trim().slice(0, 7);

  $(`cmake -S ${buildDir} -B ${buildDir}/build -GNinja -DESCARGOT_MODE=release -DESCARGOT_OUTPUT=shell -DESCARGOT_TEST=ON -DESCARGOT_TEMPORAL=ON -DESCARGOT_SHADOWREALM=ON`, env);
  $(`cmake --build ${buildDir}/build`, env);
  $(`cp -rf ${buildDir}/build/escargot ./escargot`);
  $(`rm -rf ${buildDir}`);

  return { version };
};
