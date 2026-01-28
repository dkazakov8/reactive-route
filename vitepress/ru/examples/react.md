---
aside: false
outline: false
---

<script setup>
import examplesTree from '../../tree.json'
</script>

# Пример для React

Так как библиотека роутинга — сложный интеграционный пакет, требующий сервера для SSR и работы
с History API, Live Preview недоступно. Однако вы можете загрузить готовые примеры.

### Предпросмотр

<CodeView framework="react" :tree="examplesTree" />

### Скачивание

```shell
npx degit dkazakov8/reactive-route/examples/react react-example
cd react-example
npm install
```

Затем выберите режим и систему реактивности для запуска:

- `npm run mobx` — CSR (только клиентский рендеринг) для MobX
- `npm run observable` — CSR (только клиентский рендеринг) для Observable
- `npm run ssr-mobx` — SSR для MobX
- `npm run ssr-observable` — SSR для Observable

Обратите внимание, что в этом примере оборачивание компонентов в `observer` выполняется сборщиком ESBuild. 
В собственных проектах не забудьте следовать соответствующему руководству по [интеграции](/ru/guide/react).
