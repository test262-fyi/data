import { readdir, readFile } from 'node:fs';
import { $ } from '../util.js';

const limit  = 2 * 1024 * 1024 * 1024, // 2G
      filter = 'test262/test';

let interval;
export const start = () => {
  interval = setInterval(() => {
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