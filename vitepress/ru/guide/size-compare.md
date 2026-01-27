<script setup>
import { data } from '../../dynamic.data';
import SizeComparisonChart from '../../.vitepress/components/SizeComparisonChart.vue';
</script>

# Сравнение размеров

::: info Как проводилось сравнение

```ts
esbuild.build({
  minify: true,
  target: 'es2022',
  packages: 'bundle',
  external: ['react', 'mobx', 'mobx-react-lite', 'vue', 'zod', 'react-dom'],
  treeShaking: false,
});
```

Таким образом, из размеров исключены все `peerDependencies` участвующих библиотек. При включении
tree shaking в реальных проектах размеры будут меньше (зависит от возможностей бандлера
и используемого функционала библиотек)
:::

<SizeComparisonChart :data="data" />

Файлы, которые использовались в качестве входных точек для сборки (Reactive Route с другими адаптерами
будет незначительно отличаться по размеру):

::: code-group
<<< ../../../scripts/sizeComparison/reactive-route.ts [reactive-route]
<<< ../../../scripts/sizeComparison/mobx-router.ts [mobx-router]
<<< ../../../scripts/sizeComparison/vue-router.ts [vue-router]
<<< ../../../scripts/sizeComparison/kitbag.ts [@kitbag/router]
<<< ../../../scripts/sizeComparison/tanstack.ts [@tanstack/react-router]
<<< ../../../scripts/sizeComparison/react-router.ts [react-router]
:::
