# Основные концепции

В библиотеке есть всего три основные структуры: `Config` (Конфигурация), `Payload` (Полезная нагрузка) и `State` (Состояние):

## Config (Конфигурация)

Это объект конфигурации, который вы передаете в функцию `createRoutes`.
Обычно он выглядит так:

```tsx
{
  path: '/user/:id',
  params: {
    id: (value) => /^\d+$/.test(value)
  },
  query: {
    phone: (value) => value.length < 15
  },
  loader: () => import('./pages/user'),
  async beforeEnter({ redirect }) {
    await api.loadUser();

    if (store.isAuthenticated()) return redirect({ name: 'dashboard' });
  },
  async beforeLeave({ nextRoute, preventRedirect }) {
    if (nextRoute.name === 'home') return preventRedirect();
  }
}
```

Когда вы переходите на другой маршрут, библиотека выполняет `loader` и дополняет эту конфигурацию другими полями, такими как `name`, `component` и `otherExports`, чтобы их можно было использовать в методах жизненного цикла и для внутреннего кэширования.

## Payload (Полезная нагрузка)

Это объект, содержащий всю необходимую информацию для определения `Config` и заполнения его значениями. Обычно он выглядит так:

```tsx
<!-- @include: ../../snippets/payload.md -->
```

Его можно создать из строки с помощью [router.createRoutePayload](/ru/guide/router-api#router-createroutepayload), но обычно вы будете передавать его вручную в функцию [router.redirect](/ru/guide/router-api#router-redirect) императивно:

```tsx
button.onclick = () => router.redirect(<!-- @include: ../../snippets/payload.md -->)
```

## State (Состояние)

Это объект, содержащий дополнительную информацию по сравнению с `Payload`.

```ts
<!-- @include: ../../snippets/state.md -->
```

Оно хранится в `router.state` **реактивным** способом и может быть доступно из любого UI-компонента следующим образом:

::: code-group
```tsx [React]
// pages/user/index.tsx
import { useContext } from 'react';
import { RouterContext } from '../../../router';

export default function PageUser() {
  const { router } = useContext(RouterContext);

  const routeState = router.state.user!;
  
  return (
    <>
      ID: {routeState.params.id}
      Phone: {routeState.query.phone}
    </>
  )
}
```
```tsx [Preact]
// pages/user/index.tsx
import { useContext } from 'preact';
import { RouterContext } from '../../../router';

export default function PageUser() {
  const { router } = useContext(RouterContext);

  const routeState = router.state.user!;

  return (
    <>
      ID: {routeState.params.id}
      Phone: {routeState.query.phone}
    </>
  )
}
```
```tsx [Solid]
// pages/user/index.tsx
import { useContext } from 'solid-js';
import { RouterContext } from '../../../router';

export default function PageUser() {
  const { router } = useContext(RouterContext);

  return (
    <>
      ID: {router.state.user!.params.id}
      Phone: {router.state.user!.query.phone}
    </>
  )
}
```
```vue [Vue]
// pages/user/User.vue
<script lang="ts" setup>
  import { useRouterStore } from '../../../router';

  const { router } = useRouterStore();

  const routeState = router.state.user!;
</script>

<template>
  ID: {routeState.params.id}
  Phone: {routeState.query.phone}
</template>
```
:::

Не беспокойтесь об операторе "non-null assertion" `!` — состояние соответствующего маршрута точно будет существовать, если только один маршрут использует этот компонент страницы. В противном случае выберите подходящее, например `routeState = router.state.userView || router.state.userEdit`, но для этого есть лучшие альтернативы.

Этот объект также можно сконструировать вручную из `Payload` с помощью [router.createRouteState](/ru/guide/router-api#router-createroutestate).

Это полезно для создания компонентов `Link`, где вы можете использовать `<a href={routeState.url} />` для лучшего UX и SEO или на случай, если JS отключен в браузере.

## Кодирование (Encoding)

В Reactive Route роутер обрабатывает процесс кодирования и декодирования следующим образом (представьте, что мы отключили числовую валидацию для `id`):

```ts
await router.hydrateFromURL(`/user/with%20space?phone=and%26symbols`);

// "под капотом" вызывается router.createRoutePayload для создания Payload
// с декодированными значениями
// {
//   name: 'user', 
//   params: { id: 'with space' },
//   query: { phone: 'and&symbols' }
// }

// во время редиректа вызывается router.createRouteState,
// который кодирует параметры обратно в URL
console.log(router.state.user)
// {
//   name: 'test',
//   params: { id: 'with space' },
//   query: { phone: 'and&symbols' },
//
//   pathname: '/user/with%20space',
//   search: 'phone=and%26symbols',
//   url: '/user/with%20space?phone=and%26symbols',
//
//   props: undefined,
//   isActive: true,
// }
```

Таким образом, процесс является двусторонним. `createRoutePayload` проверяет и декодирует, а `createRouteState` проверяет и кодирует для обеспечения безопасности, предотвращения некорректных значений и создания правильных URL-адресов.