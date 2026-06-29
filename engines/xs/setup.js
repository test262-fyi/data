import { $ } from '../../util.js';

const buildDir = process.env.HOME + '/moddable';
const platform = process.platform === 'darwin' ? 'mac' : 'lin';
export default async () => {
  console.log('building xs... (this will take a while)');
  $(`rm -rf ${buildDir}`);
  $(`git clone https://github.com/Moddable-OpenSource/moddable.git ${buildDir} --depth=1`);
  const version = $(`git -C ${buildDir} rev-parse HEAD`).trim().slice(0, 7);

  $(`make -C ${buildDir}/xs/makefiles/${platform} release MODDABLE=${buildDir}`);
  $(`cp -rf ${buildDir}/build/bin/${platform}/release/xst ./xs`);
  $(`rm -rf ${buildDir}`);

  return { version };
};
