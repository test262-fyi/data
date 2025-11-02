import { $ } from '../../util.js';

const buildDir = process.env.HOME + '/quickjs-ng';
export default async () => {
  console.log('building quickjs-ng... (this will take a while)');
  $(`rm -rf ${buildDir}`);
  $(`git clone https://github.com/quickjs-ng/quickjs.git ${buildDir} --depth=1`);
  const version = $(`git -C ${buildDir} rev-parse HEAD`).trim().slice(0, 7);

  $(`make -C ${buildDir}`);
  $(`cp -rf ${buildDir}/build/run-test262 ./qjs_ng`);
  $(`rm -rf ${buildDir}`);

  return { version };
};