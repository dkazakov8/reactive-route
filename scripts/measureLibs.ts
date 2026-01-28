import fs from 'node:fs';
import path from 'node:path';
import * as zlib from 'node:zlib';

import * as esbuild from 'esbuild';

import { libsMapper, saveMetrics, TypeLibData } from './saveMetrics';

async function getCompressedSize(outFile: string) {
  const result = await esbuild.build({
    bundle: true,
    minify: true,
    write: false,
    metafile: false,
    sourcemap: false,
    treeShaking: false,
    target: 'es2022',
    packages: 'bundle',
    external: ['react', 'mobx', 'mobx-react-lite', 'vue', 'zod', 'react-dom'],
    entryPoints: [outFile],
    format: 'esm',
    define: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
    tsconfig: path.resolve('./scripts/sizeComparison/tsconfig.json'),
  });

  const contentBuffer = result.outputFiles[0].contents;
  const compressedBuffer = zlib.brotliCompressSync(contentBuffer, {
    [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
    [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
    [zlib.constants.BROTLI_PARAM_SIZE_HINT]: contentBuffer.length,
  });

  return {
    minified: Number((contentBuffer.byteLength / 1024).toFixed(2)),
    compressed: Number((compressedBuffer.byteLength / 1024).toFixed(2)),
  };
}

export async function measureLibs() {
  const versions: Record<keyof typeof libsMapper, string> = JSON.parse(
    fs.readFileSync(path.resolve('./scripts/sizeComparison/package.json'), 'utf8')
  ).dependencies;

  const entries = Object.entries(libsMapper) as Array<
    [keyof typeof libsMapper, (typeof libsMapper)[keyof typeof libsMapper]]
  >;

  const pairs = await Promise.all(
    entries.map(async ([libName, { entryPath, link }]) => {
      return [
        libName,
        { ...(await getCompressedSize(entryPath)), version: versions[libName] || '?', link },
      ] as const;
    })
  );

  saveMetrics({
    key: 'sizes',
    value: Object.fromEntries(pairs) as Record<keyof typeof libsMapper, TypeLibData>,
  });
}
