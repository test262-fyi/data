import child_process from 'node:child_process';

export const $ = (str, env = {}) => child_process.execSync(str, {
  encoding: 'utf8',
  env: {
    ...process.env,
    NO_COLOR: 1,
    ...env
  }
});

export const $$ = (cmd, args, env = {}) => {
  const out = child_process.spawnSync(cmd, args, {
    encoding: 'utf8',
    env: {
      ...process.env,
      NO_COLOR: 1,
      ...env
    }
  });

  return {
    stdout: (out.stdout ?? '').toString('utf8'),
    stderr: (out.stderr ?? '').toString('utf8'),
    error: out.signal !== null || !!out.error || out.status !== 0
  };
};