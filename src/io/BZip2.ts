import BZ2Wasm from '../3rdparty/bzip2-wasm.js';

const BZip2 = new BZ2Wasm();
await BZip2.init();

export default BZip2;
