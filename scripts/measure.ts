import fs from 'node:fs';
import path from 'node:path';
import * as zlib from 'node:zlib';

import * as esbuild from 'esbuild';

import { libsMapper, saveMetrics, TypeLibData, TypeLibs } from './saveMetrics';

function format(size: number) {
  return Number((size / 1024).toFixed(2));
}

async function getCompressedSize(outFile: string) {
  const result = await esbuild.build({
    bundle: true,
    minify: true,
    write: false,
    metafile: false,
    sourcemap: false,
    treeShaking: false,
    target: 'chrome140',
    packages: 'bundle',
    external: ['react', 'mobx', 'mobx-react-lite', 'vue', 'zod', 'react-dom', 'solid-js'],
    entryPoints: [outFile],
    format: 'esm',
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
    tsconfig: path.resolve('./scripts/measureApps/tsconfig.json'),
  });

  const minified = result.outputFiles[0].contents;
  const compressed = zlib.brotliCompressSync(minified, {
    [zlib.constants.BROTLI_PARAM_MODE]: zlib.constants.BROTLI_MODE_TEXT,
    [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
    [zlib.constants.BROTLI_PARAM_SIZE_HINT]: minified.length,
  });

  return { minified: format(minified.byteLength), compressed: format(compressed.byteLength) };
}

export async function measure() {
  const measurePkgPath = path.resolve('./scripts/measureApps/package.json');
  const measurePkg = JSON.parse(fs.readFileSync(measurePkgPath, 'utf8'));

  const value: Record<TypeLibs, TypeLibData> = {} as any;

  for (const [libName, { entryPath, link }] of Object.entries(libsMapper)) {
    value[libName as TypeLibs] = {
      ...(await getCompressedSize(entryPath)),
      version: measurePkg.dependencies[libName],
      link,
    };
  }

  saveMetrics({ key: 'sizes', value });

  const localSize = (
    await getCompressedSize(path.resolve('./scripts/measureApps/reactive-route-local.ts'))
  ).compressed;

  saveMetrics({ key: 'localSize', value: `${localSize}kb` });

  const coreSize = (
    await getCompressedSize(path.resolve('./scripts/measureApps/reactive-route-core.ts'))
  ).compressed;

  saveMetrics({ key: 'coreSize', value: coreSize });
}
