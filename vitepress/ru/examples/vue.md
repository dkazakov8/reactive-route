---
aside: false
outline: false
---

<script setup>
import examplesTree from '../../tree.json'
</script>

# Пример для Vue

Так как библиотека роутинга — сложный интеграционный пакет, требующий сервера для SSR и работы
с History API, Live Preview недоступно. Однако вы можете загрузить готовые примеры.

### Предпросмотр

<CodeView framework="vue" :tree="examplesTree" />

### Скачивание

```shell
npx degit dkazakov8/reactive-route/examples/vue vue-example
cd vue-example
npm install
```

Затем выберите режим и систему реактивности для запуска:

- `npm run vue` — CSR (только клиентский рендеринг) для реактивности Vue
- `npm run ssr-vue` — SSR для реактивности Vue
