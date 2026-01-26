import * as zlib from 'node:zlib';

import * as esbuild from 'esbuild';

export async function getCompressedSize(outFile: string) {
  const result = await esbuild.build({
    bundle: true,
    minify: true,
    write: false,
    metafile: false,
    sourcemap: false,
    treeShaking: false,
    target: 'es2022',
    packages: 'bundle',
    external: ['react', 'mobx', 'mobx-react-lite', 'vue', 'zod', 'reactive-route', 'react-dom'],
    entryPoints: [outFile],
    format: 'esm',
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
  });

  const contentBuffer = result.outputFiles[0].contents;
  const compressedBuffer = zlib.brotliCompressSync(contentBuffer, {
    [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
    [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
    [zlib.constants.BROTLI_PARAM_SIZE_HINT]: contentBuffer.length,
  });

  return {
    minified: `${(contentBuffer.byteLength / 1024).toFixed(2)} KB`,
    compressed: `${(compressedBuffer.byteLength / 1024).toFixed(2)} KB`,
  };
}
