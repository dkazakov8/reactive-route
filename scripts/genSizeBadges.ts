import * as fs from 'node:fs';
import * as path from 'node:path';

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

function afterBuild(result: BuildResult, packageName: string) {
  const size = bytesForHuman(result.metafile!.outputs['index.js'].bytes);

  const assetsPath = path.resolve(process.cwd(), 'assets');
  const svgPath = path.resolve(assetsPath, `${packageName}.svg`);

  if (!fs.existsSync(assetsPath)) fs.mkdirSync(assetsPath);

  const prevSvg = fs.existsSync(svgPath) ? fs.readFileSync(svgPath, 'utf-8') : null;

  if (prevSvg) {
    const match = prevSvg.match(/>(\d+\.?(\d+)?\s\w+)</);
    const prevSize = match?.[1];

    if (size === prevSize) {
      console.log(`(unchanged) Size ${packageName} ${prevSize}`);

      return;
    }

    console.log(`(changed) Size ${packageName} changed from ${prevSize} to ${size}`);
  } else {
    console.log(`(new) Size ${packageName} ${size}`);
  }

  const svg = makeBadge({
    label: `${packageName} size${packageName === 'core' ? ' + deps' : ''}`,
    message: size,
    color: 'blue',
  });

  fs.writeFileSync(path.resolve(svgPath), svg, 'utf-8');
}

export function genSizeBadges(outFolder: string, packageName: string) {
  return esbuild
    .build({
      bundle: true,
      write: false,
      minify: true,
      metafile: true,
      sourcemap: false,
      target: 'es2022',
      packages: packageName === 'core' ? 'bundle' : 'external',
      entryPoints: [outFolder],
      format: 'esm',
    })
    .then((res) => afterBuild(res, packageName));
}
