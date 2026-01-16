# Router API

## createRouter

<table>
  <thead><tr><th>Свойство</th><th>Тип</th><th>Описание</th></tr></thead>
  <tbody><tr>
<td><code>routes</code></td>
<td class="table-td">

```ts
ReturnType<typeof createRoutes>
```

</td>
<td>Объект с конфигурациями (<code>Configs</code>)</td>
</tr><tr>
<td><code>adapters</code></td>
<td class="table-td">

[TypeAdapters](#typeadapters)

</td>
<td>Адаптеры для системы реактивности</td>
</tr><tr>
<td><code>beforeComponentChange?</code></td>
<td class="table-td">

```ts
(params: {
  prevState?: TypeRouteState;
  prevConfig?: TypeRouteConfig;
  currentState: TypeRouteState;
  currentConfig: TypeRouteConfig;
}) => void
```

</td>
<td>Глобальная функция жизненного цикла, которая выполняется только при изменении отрендеренного компонента (не маршрута!)</td>
  </tr></tbody>
</table>

Для всех последующих примеров мы будем использовать следующую конфигурацию:

```ts
createRoutes({
  home: {
    path: '/',
    loader: () => import('./pages/home'),
  },
  user: {
    path: '/user/:id',
    params: {
      id: (value) => value.length > 0,
    },
    query: {
      phone: (value) => value.length > 0,
    },
    loader: () => import('./pages/user'),
  },
  
  // другие конфигурации
});
```

## router.redirect

Выполняет навигацию к указанному `Payload` и возвращает `url` из вновь созданного `State`:

```typescript
const clearedURL = await router.redirect(<!-- @include: ../../snippets/payload.md -->)
// был создан router.state.user и возвращен его url
// clearedURL === '/user/9999?phone=123456'
```

Эта функция полностью типизирована, и TypeScript будет предлагать подсказки для автодополнения.

```typescript
// Правильно
redirect({ name: 'home' })
redirect({ name: 'user', params: { id: '123' } })
redirect({ name: 'user', params: { id: '123' }, query: { phone: '321' } })

// Ошибки TS

// отсутствует ключ "name"
redirect({});
// нет конфигурации с таким именем
redirect({ name: 'nonExisting' });
// home — это статический маршрут, параметры params не должны передаваться
redirect({ name: 'home', params: {} });
// user — это динамический маршрут, параметры params должны присутствовать
redirect({ name: 'user' });
// params.id должен присутствовать
redirect({ name: 'user', params: {} });
// передан несуществующий параметр params.a
redirect({ name: 'user', params: { id: '123', a: 'b' } });
// передан несуществующий параметр query.a
redirect({ name: 'user', params: { id: '123' }, query: { a: 'b' } });
```

## router.locationToPayload

Принимает строку pathname+search и возвращает `Payload`. Если подходящая конфигурация `Config` не найдена, будет возвращен `Payload` для `notFound` с пустыми `params` и `query`.

Обратите внимание, что все нерелевантные или невалидные параметры запроса (query) отсекаются.

```ts
router.locationToPayload(`/user/9999?phone=123456&gtm=value`)
<!-- @include: ../../snippets/payload-commented.md -->

router.locationToPayload(`/not-existing/admin?hacker=sql-inject`)
// { 
//  name: 'notFound', 
//  params: {}, 
//  query: {}
// }
```

## router.payloadToState

Принимает `Payload` и возвращает `State`. Она отлично типизирована в TS, так же как и `router.redirect`.

```ts
router.payloadToState(<!-- @include: ../../snippets/payload.md -->)
<!-- @include: ../../snippets/state-commented.md -->
```


## router.hydrateFromURL

Просто псевдоним для `router.redirect(router.locationToPayload(locationString))`.
Таким образом, она принимает строку pathname+search и возвращает `url` из вновь созданного `State`.

Обратите внимание, что все нерелевантные или невалидные параметры запроса (query) отсекаются.

```ts
const clearedURL = await router.hydrateFromURL(
  `/user/9999?phone=123456&gtm=value`
)
// был создан router.state.user и возвращен его url
// clearedURL === '/user/9999?phone=123456'

// в CSR обычно используется так:
await router.hydrateFromURL(`${location.pathname}${location.search}`)

// в SSR обычно используется так (с Express.js):
const clearedURL = await router.hydrateFromURL(req.originalUrl)
// если вы хотите удалить нерелевантные параметры запроса
// и унифицировать формат слешей:
if (req.originalUrl !== clearedURL) res.redirect(clearedURL)
```

## router.hydrateFromState

Принимает `router.state` из объекта и выполняет все необходимые подготовки для рендеринга.

```ts
const stateFromServer = window.__ROUTER_STATE__;

// то, что ожидается от сервера:
stateFromServer.user = <!-- @include: ../../snippets/state.md -->

await router.hydrateFromState({ state: stateFromServer })
```

Эта функция предназначена для использования с SSR, поэтому она не вызывает никаких функций жизненного цикла, так как они уже были вызваны на сервере. Используйте ее только для восстановления состояния с сервера.

## router.state

**Реактивный** объект, ключами которого являются имена маршрутов, а значениями — `State`, например:

```ts
console.log(router.state.user)
<!-- @include: ../../snippets/state-commented.md -->
```

Предназначен для отображения значений в UI или для написания логики в autoruns/effects. Когда вы переходите на тот же маршрут с другими параметрами (params или query), обновляются только значения в `router.state.user`, и компонент страницы не перерендеривается.

::: tip
Роутер **не** уничтожает старое состояние `State` автоматически при переходе на другой маршрут. Оно всегда будет там, но с параметром `isActive: false`. Если вы хотите сэкономить немного памяти, вы можете уничтожить старое состояние вручную в [beforeComponentChange](#beforecomponentchange). Это сделано для стабильности, когда у вас есть асинхронные функции или автозапуски, привязанные к какому-либо неактивному состоянию.
:::

## router.isRedirecting

Реактивный булев параметр, который помогает отображать лоадеры (индикаторы загрузки) во время редиректов.

::: code-group
```tsx [React]
// Если вам нужна глобальная "полоса загрузки" вверху страницы
// или оверлей на всю страницу
function GlobalLoader() {
  const { router } = useContext(RouterContext);
  
  return router.isRedirecting ? <Loader /> : null;
}

// Если вам нужен локальный спиннер в какой-то кнопке
function SomeComponent() {
  const { router } = useContext(RouterContext);

  return <Button isLoading={router.isRedirecting} />;
}
```
```tsx [Preact]
// Если вам нужна глобальная "полоса загрузки" вверху страницы
// или оверлей на всю страницу
function GlobalLoader() {
  const { router } = useContext(RouterContext);
  
  return router.isRedirecting ? <Loader /> : null;
}

// Если вам нужен локальный спиннер в какой-то кнопке
function SomeComponent() {
  const { router } = useContext(RouterContext);

  return <Button isLoading={router.isRedirecting} />;
}
```
```tsx [Solid]
// Если вам нужна глобальная "полоса загрузки" вверху страницы
// или оверлей на всю страницу
function GlobalLoader() {
  const { router } = useContext(RouterContext);
  
  return <Show when={router.isRedirecting}><Loader/></Show>;
}

// Если вам нужен локальный спиннер в какой-то кнопке
function SomeComponent() {
  const { router } = useContext(RouterContext);

  return <Button isLoading={router.isRedirecting} />;
}
```
```vue [Vue]
<script lang="ts" setup>
  import { useRouterStore } from '../../../router';

  const { router } = useRouterStore();
</script>

<template>
  <!-- 
    Если вам нужна глобальная "полоса загрузки" вверху страницы
    или оверлей на всю страницу 
  -->
  <Loader v-if="router.isRedirecting" />
  
  <!-- Если вам нужен локальный спиннер в какой-то кнопке -->
  <Button :is-loading="router.isRedirecting">
    Отправить
  </Button>
</template>
```
:::

## router.getActiveState

Возвращает текущее состояние `State` активного маршрута, если оно есть. Может быть полезно, когда у вас есть несколько глобальных макетов (layouts) над компонентом Router.

::: code-group
```tsx [React]
import { LayoutLogin } from 'layouts/LayoutLogin'
import { LayoutAuthZone } from 'layouts/LayoutAuthZone'

function App() {
  const { router } = useContext(RouterContext);
  
  const activeStateName = router.getActiveState()?.name;
  
  const Layout = ['login', 'restore', 'checkSms'].includes(activeStateName) 
    ? LayoutLogin 
    : LayoutAuthZone;
  
  return (
    <Layout>
      <Router router={router} />
    </Layout>
  );
}
```
```tsx [Preact]
import { LayoutLogin } from 'layouts/LayoutLogin'
import { LayoutAuthZone } from 'layouts/LayoutAuthZone'

function App() {
  const { router } = useContext(RouterContext);
  
  const activeStateName = router.getActiveState()?.name;
  
  const Layout = ['login', 'restore', 'checkSms'].includes(activeStateName) 
    ? LayoutLogin 
    : LayoutAuthZone;
  
  return (
    <Layout>
      <Router router={router} />
    </Layout>
  );
}
```
```tsx [Solid]
import { LayoutLogin } from 'layouts/LayoutLogin'
import { LayoutAuthZone } from 'layouts/LayoutAuthZone'

function App() {
  const { router } = useContext(RouterContext);

  const activeStateName = () => router.getActiveState()?.name;

  return (
    <Dynamic 
      component={['login', 'restore', 'checkSms'].includes(activeStateName()) 
        ? LayoutLogin 
        : LayoutAuthZone
      }
    >
      <Router router={router} />
    </Dynamic>
  );
}
```
```vue [Vue]
<script lang="ts" setup>
  import { computed } from 'vue';
  import { useRouterStore } from '../../../router';
  
  import LayoutLogin from 'layouts/LayoutLogin.vue'
  import LayoutAuthZone from 'layouts/LayoutAuthZone.vue'

  const { router } = useRouterStore();

  const activeStateName = computed(() => router.getActiveState()?.name);
  
  const Layout = computed(() => 
    ['login', 'restore', 'checkSms'].includes(activeStateName.value) 
      ? LayoutLogin 
      : LayoutAuthZone
  );
</script>

<template>
  <component :is="Layout">
    <Router :router="router" />
  </component>
</template>
```
:::

Или для подключения Dev Tools к роутеру, чтобы видеть все изменения. В настоящее время встроенные Dev Tools не предоставляются, но вы можете легко отлаживать с помощью:

```ts
// используйте аналог autorun в вашей системе реактивности
autorun(() => console.log(JSON.stringify(router.getActiveState())))
```

## router.preloadComponent

По умолчанию роутер загружает компонент только во время редиректов. Но иногда вам может понадобиться предварительно загрузить компонент программно. Это полезно только тогда, когда в вашем сборщике включено разделение кода (code splitting).

```ts
// инициализация как обычно
await router.hydrateFromURL(location.pathname + location.search);

// предзагрузка, когда сеть свободна и страница полностью отрендерена
setTimeout(async () => {
  try {
    await router.preloadComponent('login')
    await router.preloadComponent('dashboard')
  } catch(e) {
    console.error('Похоже, пользователь потерял соединение')
  }
}, 5000)
```

## beforeComponentChange

Эта функция жизненного цикла вызывается только при изменении отрендеренного компонента (не маршрута!) и предназначена для использования в модульных архитектурах. Например, если какая-то страница экспортирует модульный стор: `export class PageStore { data: {}, destroy() {} }`

```ts
const globalStore = { pages: {} };

createRouter({
  routes,
  adapters,
  beforeComponentChange({ prevConfig, currentConfig }) {
    const ExportedPageStore = currentConfig.otherExports.PageStore;
    
    if (ExportedPageStore) {
      globalStore.pages[currentConfig.name] = new ExportedPageStore();
    }
    
    // теперь проверяем стор предыдущей страницы и уничтожаем его при необходимости
    globalStore.pages[prevConfig.name]?.destroy();
      
    delete globalStore.pages[prevConfig.name];
  }
})
```

Затем вы просто передаете `globalStore` на свои страницы через Context и получаете разделение кода для модульных сторов. Также эту функцию можно использовать для отмены асинхронных функций и вызовов API.

::: tip
Уничтожение (destroy) в большинстве случаев следует откладывать до завершения всей асинхронной логики, иначе может возникнуть попытка обращения к несуществующему `globalStore.pages[prevConfig.name]`.
:::

## Типы (Types)

### TypeAdapters

Вы можете передать свои собственные адаптеры, если они соответствуют экспортируемому типу. Это может быть полезно для интеграции вашей собственной системы реактивности.

<<< @/../packages/core/types.ts#type-adapters{typescript}