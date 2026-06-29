import { $$ } from '../../util.js';

export default (file) => {
  return $$('./hermes', [ '-enable-hermes-internal', '-Xhermes-internal-test-methods', file ]);
};
