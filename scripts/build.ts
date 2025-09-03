import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse } from 'node:path';

import { transformAsync } from '@babel/core';
// @ts-expect-error no types
import ts from '@babel/preset-typescript';
import { pluginReplace } from '@espcom/esbuild-plugin-replace';
// @ts-expect-error no types
import solid from 'babel-preset-solid';
import * as esbuild from 'esbuild';

import { genSizeBadges } from './genSizeBadges';

const pkg = JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf8'));

function generateBuild(type: 'cjs' | 'esm', folderName: string) {
  const packageName = folderName.split('/')[1]!;
  const outFolder = path.resolve(
    process.cwd(),
    packageName === 'core' ? `./dist/${type}` : `./dist/${type}/${packageName}`
  );
  const outFile = path.resolve(outFolder, `index.js`);

  return esbuild
    .build({
      bundle: true,
      metafile: true,
      sourcemap: false,
      target: 'es2022',
      packages: 'external',
      write: true,
      minify: false,
      treeShaking: true,
      external: Object.keys(pkg.peerDependencies || {}).concat(['reactive-route']),
      format: type,
      entryPoints: [path.resolve(process.cwd(), folderName)],
      outfile: outFile,
      plugins:
        packageName === 'solid'
          ? [
              pluginReplace([
                {
                  filter: /\.tsx?$/,
                  replace: /.*/gs,
                  replacer(onLoadArgs) {
                    return async (source) => {
                      const result = await transformAsync(source, {
                        presets: [[solid], [ts]],
                        filename: parse(onLoadArgs.path).base,
                        sourceMaps: 'inline',
                      });

                      if (result?.code == null) {
                        throw new Error('No result was provided from Babel');
                      }

                      return result.code;
                    };
                  },
                },
              ]),
            ]
          : undefined,
    })
    .then(() => {
      fs.writeFileSync(
        path.resolve(outFolder, 'package.json'),
        type === 'esm' ? '{"type": "module"}' : '{"type": "commonjs"}',
        'utf-8'
      );

      if (type === 'esm') {
        return genSizeBadges(outFile, packageName);
      }
    });
}

void Promise.all([
  generateBuild('esm', 'packages/core'),
  generateBuild('cjs', 'packages/core'),
  generateBuild('esm', 'packages/solid'),
  generateBuild('cjs', 'packages/solid'),
  generateBuild('esm', 'packages/react'),
  generateBuild('cjs', 'packages/react'),
]);
