---
aside: false
outline: false
---

<script setup>
import examplesTree from '../../tree.json'
</script>

# Пример для Preact

Так как библиотека роутинга — сложный интеграционный пакет, требующий сервера для SSR и работы
с History API, Live Preview недоступно. Однако вы можете загрузить готовые примеры.

### Предпросмотр

<CodeView framework="preact" :tree="examplesTree" />

### Скачивание

```shell
npx degit dkazakov8/reactive-route/examples/preact preact-example
cd preact-example
npm install
```

Затем выберите режим и систему реактивности для запуска:

- `npm run mobx` — CSR (только клиентский рендеринг) для MobX
- `npm run observable` — CSR (только клиентский рендеринг) для Observable
- `npm run ssr-mobx` — SSR для MobX
- `npm run ssr-observable` — SSR для Observable

Обратите внимание, что в этом примере оборачивание компонентов в `observer` выполняется сборщиком ESBuild.
В собственных проектах не забудьте следовать соответствующему руководству по <Link to="guide/preact">интеграции</Link>.
