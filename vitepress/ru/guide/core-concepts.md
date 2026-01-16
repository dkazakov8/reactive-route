# Основные структуры

В Reactive Route их всего три - `Config`, `Payload` и `State`:

## Config

Это объект, который передается в функцию `createRoutes` с определенным ключом:

<!-- @include: @/snippets/core-concepts/config-example.md -->

При инициализации роутера этот объект дополняется свойством `name: 'user'` (значение равно ключу), вручную его указывать
не нужно. Это сделано для защиты от опечаток и синхронизации имен между всеми структурами.

При редиректе выполняется `loader` и дополняет этот объект еще двумя свойствами - `component` 
(это то, что пришло в экспорте `default`) и `otherExports` (все остальные экспорты). Их можно использовать в
[beforeComponentChange](/ru/guide/router-api.html#beforecomponentchange).

## Payload

Это объект, содержащий всю необходимую информацию для определения `Config` и заполнения его
значениями:

```ts
<!-- @include: ../../snippets/payload.md -->
```

Его можно создать из строки с
помощью [router.locationToPayload](/ru/guide/router-api#router-locationtopayload), но обычно вы
будете передавать его вручную в функцию [router.redirect](/ru/guide/router-api#router-redirect)
императивно:

```tsx
button.onclick = () => router.redirect(<!-- @include: ../../snippets/payload.md -->)
```

## State (Состояние)

Это объект, содержащий дополнительную информацию по сравнению с `Payload`.

```ts
<!-- @include: ../../snippets/state.md -->
```

Оно хранится в `router.state` **реактивным** способом и может быть доступно из любого UI-компонента
следующим образом:

::: code-group

```tsx [React]
// pages/user/index.tsx
import {useContext} from 'react';
import {RouterContext} from '../../../router';

export default function PageUser() {
  const {router} = useContext(RouterContext);

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
import {useContext} from 'preact';
import {RouterContext} from '../../../router';

export default function PageUser() {
  const {router} = useContext(RouterContext);

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
import {useContext} from 'solid-js';
import {RouterContext} from '../../../router';

export default function PageUser() {
  const {router} = useContext(RouterContext);

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
  import {useRouterStore} from '../../../router';

  const {router} = useRouterStore();

  const routeState = router.state.user!;
</script>

<template>
  ID: {routeState.params.id}
  Phone: {routeState.query.phone}
</template>
```

:::

Не беспокойтесь об операторе "non-null assertion" `!` — состояние соответствующего маршрута точно
будет существовать, если только один маршрут использует этот компонент страницы. В противном случае
выберите подходящее, например `routeState = router.state.userView || router.state.userEdit`, но для
этого есть лучшие альтернативы.

Этот объект также можно сконструировать вручную из `Payload` с
помощью [router.payloadToState](/ru/guide/router-api#router-payloadtostate).

Это полезно для создания компонентов `Link`, где вы можете использовать
`<a href={routeState.url} />` для лучшего UX и SEO или на случай, если JS отключен в браузере.

## Кодирование (Encoding)

В Reactive Route роутер обрабатывает процесс кодирования и декодирования следующим образом (
представьте, что мы отключили числовую валидацию для `id`):

```ts
await router.hydrateFromURL(`/user/with%20space?phone=and%26symbols`);

// "под капотом" вызывается router.locationToPayload для создания Payload
// с декодированными значениями
// {
//   name: 'user', 
//   params: { id: 'with space' },
//   query: { phone: 'and&symbols' }
// }

// во время редиректа вызывается router.payloadToState,
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

Таким образом, процесс является двусторонним. `locationToPayload` проверяет и декодирует, а
`payloadToState` проверяет и кодирует для обеспечения безопасности, предотвращения некорректных
значений и создания правильных URL-адресов.