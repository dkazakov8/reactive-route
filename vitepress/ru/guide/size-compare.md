<script setup>
import { data } from '../../dynamic.data';

const libs = [
  { name: 'Reactive Route', key: 'size_reactive_route_full', keyBr: 'size_reactive_route_full_br', color: 'var(--vp-c-brand-1)', isMe: true },
  { name: 'MobX Router', key: 'size_mobx_router_full', keyBr: 'size_mobx_router_full_br', color: '#ffac12' },
  { name: 'Vue Router', key: 'size_vue_router_full', keyBr: 'size_vue_router_full_br', color: '#42b883' },
  { name: 'Kitbag Router', key: 'size_kitbag_full', keyBr: 'size_kitbag_full_br', color: '#ff4d4d' },
  { name: 'TanStack Router', key: 'size_tanstack_router_full', keyBr: 'size_tanstack_router_full_br', color: '#ffb300' },
  { name: 'React Router', key: 'size_react_router_full', keyBr: 'size_react_router_full_br', color: '#ca4245' },
].map(lib => ({
  ...lib,
  size: data.metrics[lib.key],
  sizeBr: data.metrics[lib.keyBr],
  val: parseFloat(data.metrics[lib.key]),
  valBr: parseFloat(data.metrics[lib.keyBr])
})).sort((a, b) => a.val - b.val);

const maxVal = Math.max(...libs.map(l => l.val));
</script>

# Сравнение размеров

Reactive Route спроектирован как максимально легкое решение для маршрутизации. Ниже приведено сравнение размеров бандлов популярных роутеров.

::: info Как проводились замеры
Замеры производились путем создания минимального входного файла для каждого роутера и его сборки с помощью `esbuild`. 

- Все пакеты, указанные в `peerDependencies` каждого роутера (например, `react`, `vue`, `mobx`), исключались из бандла (`external`).
- Tree shaking был принудительно отключен (`treeShaking: false`), чтобы показать полный размер, включая зависимости. 
При использовании tree shaking в реальных приложениях итоговый размер может быть меньше.
- Использовалась минификация и сжатие Brotli (уровень 11).
:::

<div class="comparison-container">
  <div v-for="lib in libs" :key="lib.name" class="lib-row" :class="{ 'is-me': lib.isMe }">
    <div class="lib-info">
      <span class="lib-name">
        {{ lib.name }}
      </span>
      <span class="lib-size">
        <strong>{{ lib.size }}</strong> <span class="br-size">/ {{ lib.sizeBr }} (Brotli)</span>
      </span>
    </div>
    <div class="bar-container">
      <div 
        class="bar full" 
        :style="{ width: (lib.val / maxVal * 100) + '%', backgroundColor: lib.color }"
      >
        <div 
          class="bar br" 
          :style="{ width: (lib.valBr / lib.val * 100) + '%' }"
        ></div>
      </div>
    </div>
  </div>
</div>

## Входные точки для замеров

Ниже приведены файлы, которые использовались в качестве входных точек для сборки бандлов.

::: code-group
<<< ../../../scripts/sizeComparison/reactive-route.ts [Reactive Route]
<<< ../../../scripts/sizeComparison/mobx-router.ts [MobX Router]
<<< ../../../scripts/sizeComparison/vue-router.ts [Vue Router]
<<< ../../../scripts/sizeComparison/kitbag.ts [Kitbag Router]
<<< ../../../scripts/sizeComparison/tanstack.ts [TanStack Router]
<<< ../../../scripts/sizeComparison/react-router.ts [React Router]
:::

<style scoped>
.comparison-container {
  margin-top: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.lib-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.is-me .lib-name {
  color: var(--vp-c-brand-1);
}
.lib-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95em;
}
.lib-name {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}
.lib-size {
  font-family: var(--vp-font-family-mono);
}
.br-size {
  color: var(--vp-c-text-2);
  font-size: 0.9em;
}
.bar-container {
  height: 12px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}
.bar {
  height: 100%;
  border-radius: 6px;
  transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.bar.br {
  background-color: rgba(255, 255, 255, 0.35);
}

@media (max-width: 640px) {
  .lib-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>

