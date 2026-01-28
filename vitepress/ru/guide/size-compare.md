<script setup>
import { data } from '../../dynamic.data';
import SizeComparisonChart from '../../.vitepress/components/SizeComparisonChart.vue';
import ComparisonTable from '../../.vitepress/components/ComparisonTable.vue';
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

&nbsp;

# Сравнение функционала

::: info Disclaimer
Невозможно поддерживать актуальное сравнение с каждой библиотекой роутинга отдельно, поэтому
сравнение обобщено. Используемый вами роутер может быть лучше или хуже того, что описано в третьей колонке
:::

<ComparisonTable 
  :headers="['', 'Reactive Route', 'Большинство других библиотек']"
  :rows="[
    ['**Типизация**', 'Полная', 'Частичная / бесполезная (из-за динамического объявления и вложенности TS не знает актуальное дерево роутов)'],
    ['**Реактивность**', 'Любая с Proxy', 'Только для одной библиотеки / отсутствует'],
    ['**Фреймворк**', 'Любой', 'Один, в редких исключениях - адаптеры для похожих фреймворков (React + Solid.js)'],
    ['**Жизненный цикл**', 'Асинхронный', 'Синхронный'],
    ['**Валидация параметров**', 'Обязательна', 'Опциональна / отсутствует'],
    ['**SSR**', 'Простая настройка в несколько строк', 'Сложная настройка / отсутствует'],
    ['**Удобство DX**', 'Быстрые переходы, простой авто-рефакторинг, чистая структура', 'Сложный ручной рефакторинг, нужно читать весь проект и строить в уме карту роутов'],
    ['**Файловая структура**', 'Любая', 'Ограничена при file-based подходе'],
    ['**Code splitting**', 'Нативный (для компонентов страниц и других экспортов)', 'Частичный / через специфичные утилиты'],
    ['**Набор готовых компонентов**', 'Только Router', 'Есть'],
    ['**Dev tools**', 'Нет (но легко логировать активный State)', 'Есть'],
    ['**Nested routes**', 'Нет', 'Есть'],
    ['**Wildcards**', 'Нет', 'Есть'],
    ['**Динамические роуты**', 'Нет', 'Есть'],
    ['**Опциональные части path**', 'Нет', 'Есть'],
    ['**File-based**', 'Нет', 'Есть'],
    ['**Поддержка hash и URL state**', 'Нет', 'Частичная'],
  ]"
/>


