import { readdir, readFile } from 'node:fs';
import { $ } from '../util.js';

const limit  = 2 * 1024 * 1024 * 1024, // 2G
      filter = 'test262/test';

let interval;
export const start = () => {
  interval = setInterval(() => {
    // const pids = $(`pgrep -f ${filter}`).trim().split('\n');
    // const processes = $(`ps -o pid=,rss= -p ${pids.join(',')} || true`).trim().split('\n');
    // for (const raw of processes) {
    //   const [ pid, rss ] = raw.trim().split(' ');
    //   if (parseInt(rss) > limit) {
    //     process.kill(parseInt(pid), 9);
    //     console.error(`OOM killer: rip ${pid} (rss: ${rss}, limit: ${limit})`);
    //   }
    // }

    readdir('/proc', (err, files) => {
      if (err) return;
      for (let i = 0; i < files.length; i++) {
        const pid = files[i];
        if (!/^\d+$/.test(pid)) continue;

        readFile(`/proc/${pid}/cmdline`, 'utf8', (err, cmdline) => {
          if (err || !cmdline || !cmdline.includes(filter)) return;

          readFile(`/proc/${pid}/status`, 'utf8', (err, status) => {
            if (err || !status) return;

            const _rss = status.match(/^VmRSS:\s+(\d+)\s+kB/m)?.[1];
            if (!_rss) return;

            const rss = parseInt(_rss, 10) * 1024;
            if (rss < limit) return;

            process.kill(parseInt(pid, 10), 9);
            console.error(`OOM killer: rip! ${pid} | ${cmdline.replaceAll('\x00', ' ')} | rss: ${(rss / 1024 / 1024 / 1024).toFixed(2)}G`);
          });
        });
      }
    });
  }, 500);
};

export const stop = () => {
  clearInterval(interval);
};