# Начало работы

## Установка

Пакет "all-in-one" включает всё необходимое для использования Reactive Route. Обратитесь к разделам "Интеграция с фреймворками" для получения информации о необходимых зависимостях (peer dependencies).

::: code-group
```sh [npm]
npm i reactive-route
```

```sh [yarn]
yarn add reactive-route
```

```sh [pnpm]
pnpm add reactive-route
```
:::

## Карта модулей

<<< @/modulesMap.ts

## Стор роутера и маршруты

Сначала создайте стор роутера с помощью функции `createRouter` и конфигурацию маршрутов с помощью функции `createRoutes`.

Маршруты `notFound` (не найдено) и `internalError` (внутренняя ошибка) обязательны для обработки ошибок в библиотеке, их конфигурация частично настраиваема (параметры `params` и `query` не допускаются).

Рекомендуемый способ — использовать Context (контекст) для передачи стора в UI-компоненты. Это позволяет избежать циклических зависимостей, создания нескольких экземпляров и добавляет возможность SSR.

::: code-group
```tsx [React]
// router.tsx
import { createContext } from 'react';
<!-- @include: ../../snippets/get-router.md -->

export const RouterContext = createContext<{ 
  router: ReturnType<typeof getRouter> 
}>(undefined);
```

```tsx [Preact]
// router.tsx
import { createContext } from 'preact';
<!-- @include: ../../snippets/get-router.md -->

export const RouterContext = createContext<{
  router: ReturnType<typeof getRouter>
}>(undefined);
```

```tsx [Solid]
// router.tsx
import { createContext } from 'solid-js';
<!-- @include: ../../snippets/get-router.md -->

export const RouterContext = createContext<{
  router: ReturnType<typeof getRouter>
}>(undefined);
```

```ts [Vue]
// router.ts
import { InjectionKey, inject } from 'vue';
<!-- @include: ../../snippets/get-router.md -->

export const routerStoreKey: InjectionKey<{ 
  router: ReturnType<typeof getRouter> 
}> = Symbol();

export const useRouterStore = () => inject(routerStoreKey)!;
```
:::

## Компонент Router и предоставление контекста

В этом руководстве мы будем использовать CSR (client-only rendering) с помощью функции `router.hydrateFromURL`. Версия для [SSR](/ru/guide/ssr) очень похожа, но использует `router.hydrateFromServer` и соответствующие функции `hydrate` из UI-фреймворков.

<Tabs :frameworks="['react', 'preact', 'solid', 'vue']">
<template #react>

::: code-group
```tsx [App.tsx]
import { useContext } from 'react';
import { Router } from 'reactive-route/react';
import { RouterContext } from './router';

export function App() {
  const { router } = useContext(RouterContext);

  return <Router router={router} />;
}
```
```tsx [entry.tsx]
import { createRoot } from 'react-dom/client';

import { App } from './App';
import { getRouter, RouterContext } from './router';

const router = getRouter();

await router.hydrateFromURL(location.pathname + location.search);

createRoot(document.getElementById('app')!).render(
  <RouterContext.Provider value={{ router }}>
    <App />
  </RouterContext.Provider>
);
```
:::

</template>
<template #preact>

::: code-group
```tsx [App.tsx]
import { useContext } from 'preact';
import { Router } from 'reactive-route/preact';
import { RouterContext } from './router';

export function App() {
  const { router } = useContext(RouterContext);

  return <Router router={router} />;
}
```
```tsx [entry.tsx]
import { render } from 'preact';

import { App } from './App';
import { getRouter, RouterContext } from './router';

const router = getRouter();

await router.hydrateFromURL(location.pathname + location.search);

render(
  <RouterContext.Provider value={{ router }}>
    <App />
  </RouterContext.Provider>,
  document.getElementById('app')!
);
```
:::

</template>
<template #solid>

::: code-group
```tsx [App.tsx]
import { useContext } from 'solid-js';
import { Router } from 'reactive-route/solid';
import { RouterContext } from './router';

export function App() {
  const { router } = useContext(RouterContext);

  return <Router router={router} />;
}
```
```tsx [entry.tsx]
import { render } from 'solid-js/web';

import { App } from './App';
import { getRouter, RouterContext } from './router';

const router = getRouter();

await router.hydrateFromURL(location.pathname + location.search);

render(
  () => (
    <RouterContext.Provider value={{ router }}>
      <App />
    </RouterContext.Provider>
  ),
  document.getElementById('app')!
);
```
:::

</template>
<template #vue>

::: code-group
```vue [App.vue]
<script lang="ts" setup>
  import { Router } from 'reactive-route/vue';

  import { useRouterStore } from './router';

  const { router } = useRouterStore();
</script>

<template>
  <Router :router="router" />
</template>
```
```ts [entry.ts]
import { createApp } from 'vue';

import App from './App.vue';
import { getRouter, routerStoreKey } from './router';

const router = getRouter();

await router.hydrateFromURL(location.pathname + location.search);

createApp(App, { router })
  .provide(routerStoreKey, { router })
  .mount('#app');
```
:::

</template>
</Tabs>

Все настроено и готово к использованию. В дальнейшем вы будете редактировать только конфигурацию маршрутов, чтобы добавлять новые страницы или изменять существующие.