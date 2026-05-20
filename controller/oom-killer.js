import { execFile } from 'node:child_process';

const limit  = 1 * 1024 * 1024 * 1024, // 2G
      filter = 'test262/test';

let interval, running = false;
export const start = () => {
  interval = setInterval(() => {
    if (running) return;
    running = true;

    execFile('ps', ['-axo', 'pid=,rss=,command='], { maxBuffer: 16 * 1024 * 1024 }, (err, stdout) => {
      running = false;
      if (err || !stdout) return;

      for (const line of stdout.split('\n')) {
        const match = line.match(/^\s*(\d+)\s+(\d+)\s+(.+)$/);
        if (!match) continue;

        const [, pid, _rss, cmdline] = match;
        if (!cmdline.includes(filter)) continue;

        const rss = parseInt(_rss, 10) * 1024;
        if (rss < limit) continue;

        try {
          process.kill(parseInt(pid, 10), 9);
          console.error(`OOM killer: rip! ${pid} | ${cmdline} | rss: ${(rss / 1024 / 1024 / 1024).toFixed(2)}G`);
        } catch {
        }
      }
    });
  }, 500);
};

export const stop = () => {
  clearInterval(interval);
};