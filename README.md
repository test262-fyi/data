# test262.fyi
Independent daily [test262](https://github.com/tc39/test262) (standard test suite) runner for *many* JS engines (test262.report spiritual successor). WIP.

> [!WARNING]
> The new test262.fyi is built for specific hardware in mind (Linux aarch64, high CPU core count) and it is highly recommended *not* to run it yourself. Please use issues and PRs :)

## Engines
- [X] V8 <small>[site](https://v8.dev)</small> <small>[source](https://chromium.googlesource.com/v8/v8.git)</small>
- [X] SpiderMonkey <small>[site](https://spidermonkey.dev)</small> <small>[source](https://hg.mozilla.org/mozilla-central/file/tip/js)</small>
- [X] JavaScriptCore <small>[source](https://github.com/WebKit/WebKit/tree/main/Source/JavaScriptCore)</small>
- [ ] ChakraCore <small>[source](https://github.com/chakra-core/ChakraCore)</small>
- [ ] Hermes <small>[site](https://hermesengine.dev)</small> <small>[source](https://github.com/facebook/hermes)</small>
- [X] LibJS <small>[source](https://github.com/LadybirdBrowser/ladybird/tree/master/Libraries/LibJS)</small>
- [ ] engine262 <small>[site](https://engine262.js.org)</small> <small>[source](https://github.com/engine262/engine262)</small>
- [ ] GraalJS <small>[source](https://github.com/oracle/graaljs)</small>
- [X] QuickJS <small>[site](https://bellard.org/quickjs/)</small> <small>[source](https://github.com/bellard/quickjs)</small>
- [ ] XS <small>[site](https://www.moddable.com/)</small> <small>[source](https://github.com/Moddable-OpenSource/moddable)</small>
- [ ] Rhino <small>[site](https://mozilla.github.io/rhino/)</small> <small>[source](https://github.com/mozilla/rhino)</small>
- [X] Boa <small>[site](https://boajs.dev/)</small> <small>[source](https://github.com/boa-dev/boa)</small>
- [X] Kiesel <small>[site](https://kiesel.dev)</small> <small>[source](https://codeberg.org/kiesel-js/kiesel)</small>
- [X] Porffor <small>[site](https://porffor.dev)</small> <small>[source](https://github.com/CanadaHonk/porffor)</small>
- [x] Nova <small>[site](https://trynova.dev)</small> <small>[source](https://github.com/trynova/nova)</small>
- [ ] NJS <small>[site](https://nginx.org/en/docs/njs/)</small> <small>[source](https://github.com/nginx/njs)</small>
- [ ] Bali <small>[source](https://github.com/ferus-web/bali)</small>
- Request more in GitHub issues!

### Transpilers
- [ ] Babel (old Node and Babel + core-js)
- [ ] SWC (old Node and SWC + core-js)
- [ ] Sucrase (old Node and Sucrase + core-js)

### Engine variants
- [X] V8 with experimental opts
- [X] SM with experimental opts
- [X] JSC with experimental opts
- [ ] Stable versions of engines

## Features to do
- Preview test262 PRs (changes only)
- Data/graph over time
- Diff individual engines(/runs)
- Lookup JS runtime version -> JS engine version (Node, Deno, Bun, etc)
- Measure times for each test, have "result view" and "time view"
