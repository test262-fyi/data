// Globals compiled into js2's standalone WebAssembly GC Test262 module.
var print = function (value) {
  console.log(value);
};

var $262 = {
  global: globalThis,
  IsHTMLDDA: function () {},
  createRealm: function () {
    return $262;
  },
  evalScript: function (sourceText) {
    return eval(sourceText);
  },
  gc: function () {},
  detachArrayBuffer: function (buffer) {
    if (typeof structuredClone !== 'function') {
      throw new Error('$262.detachArrayBuffer is unsupported by this host');
    }
    structuredClone(buffer, { transfer: [buffer] });
  }
};
