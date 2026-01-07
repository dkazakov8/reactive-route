import fs from 'node:fs';
import path from 'node:path';
import * as zlib from 'node:zlib';

import * as esbuild from 'esbuild';

import { saveBadge } from './saveBadge';

function bytesForHuman(bytes: number) {
  let unit = 'B';

  while (bytes > 1024) {
    // biome-ignore lint/style/noParameterAssign: false
    bytes /= 1024;

    if (unit === 'B') unit = 'KB';
    else if (unit === 'KB') unit = 'MB';
  }

  return `${bytes.toFixed(2)} ${unit}`;
}

export async function genSizeBadges(outFile: string, packageName: string) {
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

  const size = bytesForHuman(compressedBuffer.byteLength);

  saveBadge({
    fileName: `${packageName}.svg`,
    label: `compressed`,
    message: size,
  });

  let vitepressData = fs.readFileSync(path.resolve('./vitepress/dynamic.data.ts'), 'utf-8');

  vitepressData = vitepressData.replace(/size: '([^']?)+'/, `size: '${size}'`);

  fs.writeFileSync(path.resolve('./vitepress/dynamic.data.ts'), vitepressData, 'utf-8');
}
