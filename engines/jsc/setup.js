import fs from 'node:fs';
import { $ } from '../../util.js';

const buildDir = process.env.HOME + '/webkit';
export default async () => {
  if (fs.existsSync('./jsc')) {
    const version = $(`git -C ${buildDir} rev-parse HEAD`).trim().slice(0, 7);
    return { version };
  }

  console.log('building webkit... (this will take a while)');
  $(`rm -rf ${buildDir}`);
  $(`git clone https://github.com/WebKit/WebKit.git ${buildDir} --depth=1`);
  const version = $(`git -C ${buildDir} rev-parse HEAD`).trim().slice(0, 7);

  // *deep sigh* https://bugs.webkit.org/show_bug.cgi?id=298057
  $(`cd ${buildDir}; git fetch --depth 1 origin 952e58054d0fd2b45264d09bf2ef391d1ddb1f3b; git checkout 952e58054d0fd2b45264d09bf2ef391d1ddb1f3b`);

  $(`${buildDir}/Tools/Scripts/build-jsc --jsc-only --cmakeargs="-DUSE_64KB_PAGE_BLOCK=1" --makeargs="-j32"`);
  $(`cp -rf ${buildDir}/WebKitBuild/JSCOnly/Release ./jsc`);

  return { version };
};
