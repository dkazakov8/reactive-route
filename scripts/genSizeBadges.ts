import * as fs from 'node:fs';
import * as path from 'node:path';

import { pluginCompress } from '@espcom/esbuild-plugin-compress';
import { makeBadge } from 'badge-maker';
import * as esbuild from 'esbuild';
import { BuildResult } from 'esbuild';

function bytesForHuman(bytes: number, decimals = 2) {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  let bytesDivided = bytes;

  let i = 0;

  for (i; bytesDivided > 1024; i++) bytesDivided /= 1024;

  return `${parseFloat(bytesDivided.toFixed(decimals))} ${units[i]}`;
}

function afterBuild(result: BuildResult, packageName: string, fileName?: string) {
  const sizeBr = fs.statSync(path.resolve(process.cwd(), `tmp/${packageName}/index.js.br`)).size;

  const size = bytesForHuman(sizeBr);

  const fullName = packageName + (fileName ? `-${fileName}` : '');
  const assetsPath = path.resolve(process.cwd(), 'assets');
  const svgPath = path.resolve(assetsPath, `${fullName}.svg`);

  if (!fs.existsSync(assetsPath)) fs.mkdirSync(assetsPath);

  const prevSvg = fs.existsSync(svgPath) ? fs.readFileSync(svgPath, 'utf-8') : null;

  if (prevSvg) {
    const match = prevSvg.match(/>(\d+\.?(\d+)?\s\w+)</);
    const prevSize = match?.[1];

    if (size === prevSize) {
      console.log(`(unchanged) Size ${fullName} ${prevSize}`);

      return;
    }

    console.log(`(changed) Size ${fullName} changed from ${prevSize} to ${size}`);
  } else {
    console.log(`(new) Size ${fullName} ${size}`);
  }

  const svg = makeBadge({
    label: `${fullName} br${fullName === 'core' ? ' + deps' : ''}`,
    message: size,
    color: 'blue',
  });

  fs.writeFileSync(path.resolve(svgPath), svg, 'utf-8');
}

export async function genSizeBadges(outFolder: string, packageName: string, fileName?: string) {
  const result = await esbuild.build({
    bundle: true,
    write: false,
    minify: true,
    metafile: true,
    sourcemap: false,
    target: 'es2022',
    packages: packageName === 'core' ? 'bundle' : 'external',
    external: ['reactive-route'],
    entryPoints: [outFolder],
    outdir: path.resolve(process.cwd(), `tmp/${packageName}`),
    format: 'esm',
    plugins: [
      pluginCompress({
        gzip: false,
        brotli: true,
        zstd: false,
        level: 'max',
        extensions: ['.js'],
      }),
    ],
  });

  afterBuild(result, packageName, fileName);
}
