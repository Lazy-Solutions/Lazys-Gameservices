import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';


// rollup.config.js
export default {
    input: [`Cores/index.js`],
    output: {
        file: `bin/bundle.js`,
        format: 'esm',
    },
    plugins: [nodeResolve(), commonjs(), json(), ]
};