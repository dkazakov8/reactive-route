import * as zlib from 'node:zlib';

import * as esbuild from 'esbuild';

export async function getCompressedSize(outFile: string) {
  const result = await esbuild.build({
    bundle: true,
    minify: true,
    write: false,
    metafile: false,
    sourcemap: false,
    target: 'es2022',
    packages: 'bundle',
    entryPoints: [outFile],
    format: 'esm',
  });

  const contentBuffer = result.outputFiles[0].contents;
  const compressedBuffer = zlib.brotliCompressSync(contentBuffer, {
    [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
    [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
    [zlib.constants.BROTLI_PARAM_SIZE_HINT]: contentBuffer.length,
  });

  return `${(compressedBuffer.byteLength / 1024).toFixed(2)} KB`;
}
