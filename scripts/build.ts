import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse } from 'node:path';

// @ts-expect-error no types
import { transformAsync } from '@babel/core';
import { pluginReplace } from '@espcom/esbuild-plugin-replace';
import esbuild, { Plugin } from 'esbuild';
import pluginVue from 'unplugin-vue';

import { genSizeBadges } from './genSizeBadges';

async function generateBuild(type: 'cjs' | 'esm', folderName: string) {
  const [, packageName, fileName] = folderName.split('/');

  const outFolder = path.resolve(packageName === 'core' ? `./dist` : `./dist/${packageName}`);

  const outFile = path.resolve(
    outFolder,
    `${fileName || 'index'}.${type === 'esm' ? 'mjs' : 'cjs'}`
  );

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

  await esbuild.build({
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
  });

  if (type === 'esm' && packageName === 'core') {
    await genSizeBadges(outFile, packageName);
  }

  return { packageName, fileName };
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
]).then((genData) => {
  const globalPkg = JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf8'));

  const exports: Record<string, { types: string; require: string; import: string }> = {};

  genData.forEach(({ packageName, fileName }) => {
    if (packageName === 'core') {
      exports[`.`] = {
        types: `./${packageName}/${fileName || 'index'}.d.ts`,
        require: `./${fileName || 'index'}.cjs`,
        import: `./${fileName || 'index'}.mjs`,
      };

      return;
    }

    exports[`./${packageName}${fileName ? `/${fileName}` : ''}`] = {
      types: `./${packageName}/${fileName || 'index'}.d.ts`,
      require: `./${packageName}/${fileName || 'index'}.cjs`,
      import: `./${packageName}/${fileName || 'index'}.mjs`,
    };
  });

  const releasePkg = {
    name: globalPkg.name,
    author: globalPkg.author,
    license: globalPkg.license,
    version: globalPkg.version,
    description: globalPkg.description,
    repository: globalPkg.repository,
    dependencies: globalPkg.dependencies,
    engines: globalPkg.engines,
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
});
