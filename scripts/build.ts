import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse } from 'node:path';

// @ts-expect-error no types
import { transformAsync } from '@babel/core';
import { pluginReplace } from '@espcom/esbuild-plugin-replace';
import esbuild, { BuildOptions, Plugin } from 'esbuild';
import pluginVue from 'unplugin-vue';

import { getCompressedSize } from './getCompressedSize';
import { saveMetrics } from './saveMetrics';

async function generateBuild(folderName: string) {
  const [, packageName, fileName] = folderName.split('/');
  const startTime = performance.now();

  const outFolder = path.resolve(packageName === 'core' ? `./dist` : `./dist/${packageName}`);
  const outfile = path.resolve(outFolder, `${fileName || 'index'}`);

  const plugins: Array<Plugin> = [];

  if (packageName === 'solid') {
    plugins.push(
      pluginReplace([
        {
          filter: /\.tsx?$/,
          replace: /.*/gs,
          replacer: (onLoadArgs) => async (source) => {
            const result = await transformAsync(source, {
              presets: ['@babel/preset-typescript', 'babel-preset-solid'],
              filename: parse(onLoadArgs.path).base,
              sourceMaps: false,
            });

            if (result?.code == null) throw new Error('No result was provided from Babel');

            return result.code;
          },
        },
      ])
    );
  }

  if (packageName === 'vue') {
    plugins.push(pluginVue.esbuild({ include: [/\.vue$/] }));
  }

  const buildOptions: BuildOptions = {
    bundle: true,
    metafile: true,
    sourcemap: false,
    target: 'es2022',
    packages: 'external',
    write: true,
    minify: false,
    treeShaking: true,
    external: ['reactive-route'],
    format: 'esm',
    entryPoints: [path.resolve(process.cwd(), folderName)],
    outfile: `${outfile}.mjs`,
    plugins,
  };

  await Promise.all([
    esbuild.build(buildOptions),
    esbuild.build({ ...buildOptions, format: 'cjs', outfile: `${outfile}.cjs` }),
  ]);

  const endTime = performance.now();

  console.log(
    `\x1b[32m[${packageName}${fileName ? `/${fileName}` : ''}]\x1b[0m built in \x1b[33m${(endTime - startTime).toFixed(2)}ms\x1b[0m`
  );

  return {
    fileName,
    packageName,
    compressedSize: packageName === 'core' ? await getCompressedSize(`${outfile}.mjs`) : null,
  };
}

void Promise.all([
  generateBuild('packages/core'),
  generateBuild('packages/solid'),
  generateBuild('packages/react'),
  generateBuild('packages/preact'),
  generateBuild('packages/vue'),
  generateBuild('packages/adapters/mobx-react'),
  generateBuild('packages/adapters/mobx-preact'),
  generateBuild('packages/adapters/mobx-solid'),
  generateBuild('packages/adapters/solid'),
  generateBuild('packages/adapters/kr-observable-react'),
  generateBuild('packages/adapters/kr-observable-preact'),
  generateBuild('packages/adapters/kr-observable-solid'),
  generateBuild('packages/adapters/vue'),
]).then(async (builtPackages) => {
  const globalPkg = JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf8'));

  const exports: Record<string, { types: string; require: string; import: string }> = {};

  builtPackages.forEach(({ packageName, fileName, compressedSize }) => {
    if (compressedSize) saveMetrics({ key: 'size', value: compressedSize });

    if (packageName === 'core') {
      exports[`.`] = {
        types: `./${packageName}/${fileName || 'index'}.d.ts`,
        require: `./${fileName || 'index'}.cjs`,
        import: `./${fileName || 'index'}.mjs`,
      };
    } else {
      exports[`./${packageName}${fileName ? `/${fileName}` : ''}`] = {
        types: `./${packageName}/${fileName || 'index'}.d.ts`,
        require: `./${packageName}/${fileName || 'index'}.cjs`,
        import: `./${packageName}/${fileName || 'index'}.mjs`,
      };
    }
  });

  const releasePkg = {
    name: globalPkg.name,
    author: globalPkg.author,
    license: globalPkg.license,
    version: globalPkg.version,
    description: globalPkg.description,
    repository: globalPkg.repository,
    peerDependencies: globalPkg.peerDependencies,
    exports: exports,
    main: exports[`.`].require,
    module: exports[`.`].import,
    types: exports[`.`].types,
  };

  fs.writeFileSync(
    path.resolve('./dist/package.json'),
    `${JSON.stringify(releasePkg, null, 2)}\n`,
    'utf8'
  );

  fs.writeFileSync(path.resolve('./dist/.npmignore'), `*.tsbuildinfo\n`, 'utf8');

  const modulesMap = builtPackages
    .map((item) => {
      if (item.packageName === 'core')
        return `import { createRoutes, createRouter } from '${globalPkg.name}'`;

      if (!item.fileName) return `import { Router } from '${globalPkg.name}/${item.packageName}'`;

      return `import { adapters } from '${globalPkg.name}/${item.packageName}/${item.fileName}'`;
    })
    .join('\n');

  fs.writeFileSync(path.resolve('./vitepress/modulesMap.ts'), modulesMap, 'utf8');
});
