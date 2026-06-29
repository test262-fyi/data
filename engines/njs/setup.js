import { $ } from '../../util.js';

const buildDir = process.env.HOME + '/njs';
export default async () => {
  console.log('building njs... (this will take a while)');
  $(`rm -rf ${buildDir}`);
  $(`git clone https://github.com/nginx/njs.git ${buildDir} --depth=1`);
  const version = $(`git -C ${buildDir} rev-parse HEAD`).trim().slice(0, 7);

  $(`cd ${buildDir}; ./configure`);
  $(`make -C ${buildDir}`);
  $(`cp -rf ${buildDir}/build/njs ./njs`);
  $(`rm -rf ${buildDir}`);

  return { version };
};
