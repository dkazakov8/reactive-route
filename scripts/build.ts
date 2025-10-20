import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse } from 'node:path';

import { transformAsync } from '@babel/core';
// @ts-expect-error no types
import ts from '@babel/preset-typescript';
import { pluginReplace } from '@espcom/esbuild-plugin-replace';
// @ts-expect-error no types
import solid from 'babel-preset-solid';
import esbuild, { Plugin } from 'esbuild';
import pluginVue from 'unplugin-vue';

import { genSizeBadges } from './genSizeBadges';

function generateBuild(type: 'cjs' | 'esm', folderName: string) {
  const packageName = folderName.split('/')[1]!;
  const fileName = folderName.split('/')[2];
  let outFolder = path.resolve(
    process.cwd(),
    packageName === 'core' ? `./dist/${type}` : `./dist/${type}/${packageName}`
  );
  if (fileName) {
    outFolder = path.resolve(outFolder, fileName);
  }

  const outFile = path.resolve(outFolder, `index.js`);

  const plugins: Array<Plugin> = [];

  if (packageName === 'solid') {
    plugins.push(
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
      ])
    );
  }

  if (packageName === 'vue') {
    plugins.push(pluginVue.esbuild({ include: [/\.vue$/] }));
  }

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
      external: ['reactive-route'],
      format: type,
      entryPoints: [path.resolve(process.cwd(), folderName)],
      outfile: outFile,
      plugins,
    })
    .then(() => {
      fs.writeFileSync(
        path.resolve(outFolder, 'package.json'),
        type === 'esm' ? '{"type": "module"}' : '{"type": "commonjs"}',
        'utf-8'
      );

      if (type === 'esm' && packageName !== 'adapters') {
        return genSizeBadges(outFile, packageName, fileName);
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
  generateBuild('esm', 'packages/preact'),
  generateBuild('cjs', 'packages/preact'),
  generateBuild('esm', 'packages/vue'),
  generateBuild('cjs', 'packages/vue'),
  generateBuild('esm', 'packages/adapters/mobx-react'),
  generateBuild('cjs', 'packages/adapters/mobx-react'),
  generateBuild('esm', 'packages/adapters/mobx-preact'),
  generateBuild('cjs', 'packages/adapters/mobx-preact'),
  generateBuild('esm', 'packages/adapters/mobx-solid'),
  generateBuild('cjs', 'packages/adapters/mobx-solid'),
  generateBuild('esm', 'packages/adapters/solid'),
  generateBuild('cjs', 'packages/adapters/solid'),
  generateBuild('esm', 'packages/adapters/kr-observable-react'),
  generateBuild('cjs', 'packages/adapters/kr-observable-react'),
  generateBuild('esm', 'packages/adapters/kr-observable-preact'),
  generateBuild('cjs', 'packages/adapters/kr-observable-preact'),
  generateBuild('esm', 'packages/adapters/kr-observable-solid'),
  generateBuild('cjs', 'packages/adapters/kr-observable-solid'),
  generateBuild('esm', 'packages/adapters/vue'),
  generateBuild('cjs', 'packages/adapters/vue'),
]);
