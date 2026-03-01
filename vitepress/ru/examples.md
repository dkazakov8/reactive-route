// #region examples-react

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
В собственных проектах не забудьте следовать соответствующему руководству по <Link to="guide/react">интеграции</Link>.

// #endregion examples-react

// #region examples-vue

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

// #endregion examples-vue

// #region examples-solid

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

// #endregion examples-solid

// #region examples-preact

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

// #endregion examples-preact