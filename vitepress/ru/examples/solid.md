---
aside: false
outline: false
---

<script setup>
import examplesTree from '../../tree.json'
</script>

# Пример для Solid.js

Так как библиотека роутинга — сложный интеграционный пакет, требующий сервера для SSR и работы
с History API, Live Preview недоступно. Однако вы можете загрузить готовые примеры.

### Предпросмотр

<CodeView framework="solid" :tree="examplesTree" />

### Скачивание

```shell
npx degit dkazakov8/reactive-route/examples/solid solid-example
cd solid-example
npm install
```

Затем выберите режим и систему реактивности для запуска:

- `npm run solid` — CSR (только клиентский рендеринг) для реактивности Solid.js
- `npm run mobx` — CSR (только клиентский рендеринг) для MobX
- `npm run observable` — CSR (только клиентский рендеринг) для Observable
- `npm run ssr-solid` — SSR для реактивности Solid.js
- `npm run ssr-mobx` — SSR для MobX
- `npm run ssr-observable` — SSR для Observable
