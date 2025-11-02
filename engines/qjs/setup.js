import { $ } from '../../util.js';

const buildDir = process.env.HOME + '/quickjs';
export default async () => {
  console.log('building quickjs... (this will take a while)');
  $(`rm -rf ${buildDir}`);
  $(`git clone https://github.com/bellard/quickjs.git ${buildDir} --depth=1`);
  const version = $(`git -C ${buildDir} rev-parse HEAD`).trim().slice(0, 7);

  $(`make -C ${buildDir}`);
  $(`cp -rf ${buildDir}/run-test262 ./qjs`);
  $(`rm -rf ${buildDir}`);

  return { version };
};