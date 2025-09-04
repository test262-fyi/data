import fs from 'node:fs';
import { $ } from '../../cli.js';

export default async () => {
  $(`git clone https://github.com/CanadaHonk/porffor.git porffor --depth=1`);

  return {
    version: $('node ./porffor/runtime/index.js --version').trim(),
    preludes: fs.readFileSync('./porffor/test262/harness.js', 'utf8').split('///').reduce((acc, x) => {
      const [ k, ...content ] = x.split('\n');
      acc[k.trim()] = content.join('\n').trim() + '\n';
      return acc;
    }, {})
  };
};
