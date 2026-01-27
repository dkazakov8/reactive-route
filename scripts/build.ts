import * as fs from 'node:fs';
import * as path from 'node:path';
import { parse } from 'node:path';

// @ts-expect-error no types
import { transformAsync } from '@babel/core';
import { pluginReplace } from '@espcom/esbuild-plugin-replace';
import esbuild, { BuildOptions, Plugin } from 'esbuild';
import pluginVue from 'unplugin-vue';

import { measureOtherLibs } from './measureOtherLibs';

function getPlugins(framework: 'vue' | 'solid') {
  const plugins: Array<Plugin> = [];

  if (framework === 'solid') {
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

  if (framework === 'vue') {
    plugins.push(pluginVue.esbuild({ include: [/\.vue$/] }));
  }

  return plugins;
}

async function generateBuild(folderName: string) {
  const fileName = folderName.split('/')[1] || 'index';

  const startTime = performance.now();

  const entryFile_path = path.resolve('packages', folderName);
  const entryFolder_path = path.resolve(
    'packages',
    folderName.includes('adapters') ? path.dirname(folderName) : folderName
  );
  const entryTsconfig = JSON.parse(
    fs.readFileSync(path.resolve(entryFolder_path, 'tsconfig.json'), 'utf8')
  );

  const outFolder_path = path.resolve(entryFolder_path, entryTsconfig.compilerOptions.outDir);
  const outFile_path = path.resolve(outFolder_path, fileName);

  const buildOptions: BuildOptions = {
    bundle: true,
    metafile: true,
    sourcemap: true,
    target: 'es2022',
    packages: 'external',
    write: true,
    minify: false,
    treeShaking: true,
    external: ['reactive-route'],
    entryPoints: [entryFile_path],
    plugins: getPlugins(folderName as any),
  };

  await Promise.all([
    esbuild.build({ ...buildOptions, format: 'esm', outfile: `${outFile_path}.mjs` }),
    esbuild.build({ ...buildOptions, format: 'cjs', outfile: `${outFile_path}.cjs` }),
  ]);

  fs.readdirSync(outFolder_path)
    .filter((file) => file.endsWith('.tsbuildinfo'))
    .forEach((file) => {
      fs.rmSync(path.resolve(outFolder_path, file), { force: true });
    });

  const endTime = performance.now();

  console.log(
    `\x1b[32m[${folderName}]\x1b[0m built in \x1b[33m${(endTime - startTime).toFixed(2)}ms\x1b[0m`
  );

  return {
    relativePath: `./${path.relative(path.resolve('dist'), outFile_path).replaceAll('\\', '/')}`,
  };
}

void Promise.all([
  generateBuild('core'),
  generateBuild('solid'),
  generateBuild('react'),
  generateBuild('preact'),
  generateBuild('vue'),
  generateBuild('adapters/mobx-react'),
  generateBuild('adapters/mobx-preact'),
  generateBuild('adapters/mobx-solid'),
  generateBuild('adapters/solid'),
  generateBuild('adapters/kr-observable-react'),
  generateBuild('adapters/kr-observable-preact'),
  generateBuild('adapters/kr-observable-solid'),
  generateBuild('adapters/vue'),
]).then(async (builtPackages) => {
  const globalPkg = JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf8'));

  const exports: Record<string, { types: string; require: string; import: string }> = {};

  builtPackages.forEach(({ relativePath }) => {
    exports[relativePath.replace('/index', '')] = {
      types: `${relativePath}.d.ts`,
      require: `${relativePath}.cjs`,
      import: `${relativePath}.mjs`,
    };
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

  const modulesMap = builtPackages
    .map((item) => {
      const importPath = `${globalPkg.name}${item.relativePath.replace('/index', '').replace('.', '')}`;

      if (importPath.includes('adapters')) return `import { adapters } from '${importPath}'`;
      if (importPath.includes('/')) return `import { Router } from '${importPath}'`;

      return `import { createRoutes, createRouter } from '${importPath}'`;
    })
    .join(';\n');

  fs.writeFileSync(path.resolve('vitepress/modulesMap.ts'), modulesMap, 'utf8');
  fs.cpSync(path.resolve('README.md'), path.resolve('dist/README.md'));

  await measureOtherLibs();
});
