const platforms = {
  'darwin-arm64': {
    boa: 'boa-aarch64-apple-darwin',
    jsc: 'tahoe-x86_64-arm64',
    kiesel: 'kiesel-macos-aarch64',
    libjs: 'ladybird-js-macOS-arm64',
    nova: 'nova-macos-arm64',
    porffor: 'porf-aarch64-apple-darwin',
    sm: 'jsshell-mac.zip',
    v8: 'v8-mac-arm64-rel'
  },
  'linux-x64': {
    boa: 'boa-x86_64-unknown-linux-gnu',
    jsc: 'x86_64',
    kiesel: 'kiesel-linux-x86_64',
    libjs: 'ladybird-js-Linux-x86_64',
    nova: 'nova-linux-amd64',
    porffor: 'porf-x86_64-unknown-linux-gnu',
    sm: 'jsshell-linux-x86_64.zip',
    v8: 'v8-linux64-rel'
  }
};

const key = `${process.platform}-${process.arch}`;
const platform = platforms[key];
if (!platform) throw new Error(`Unsupported platform ${key} (expected ${Object.keys(platforms).join('/')})`);

export default platform;
