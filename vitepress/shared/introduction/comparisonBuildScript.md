```ts
esbuild.build({
  minify: true,
  target: 'chrome140',
  packages: 'bundle',
  external: ['react', 'mobx', 'mobx-react-lite', 'vue', 'zod', 'react-dom'],
  treeShaking: false,
});
```