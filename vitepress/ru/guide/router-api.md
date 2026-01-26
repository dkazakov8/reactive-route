# Router API

## createRouter

Эта функция создает `router` и принимает объект со свойствами:

<table>
  <thead><tr><th>Свойство</th><th>Тип</th><th>Описание</th></tr></thead>
  <tbody><tr>
<td><code>routes</code></td>
<td class="table-td">

```ts
ReturnType<typeof createRoutes>
```

</td>
<td>Объект с <code>Configs</code></td>
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
  prevState?: TypeState;
  prevConfig?: TypeConfig;
  
  currentState: TypeState;
  currentConfig: TypeConfig;
}) => void
```

</td>
<td>Глобальная функция жизненного цикла, которая выполняется только при изменении компонента (не маршрута!)</td>
  </tr></tbody>
</table>

Для всех примеров будет использоваться следующая конфигурация:

<!-- @include: @/snippets/router-api/sample-routes.md -->

## router.redirect

Находит `Config`, соответствующий переданному `Payload` и возвращает `State.url`. Если редирект 
выполняется в браузере, записывает новый url в `window.history` для возможности перехода вперед-назад.

Также можно передать в `Payload` свойство `replace: true`, чтобы заблокировать переход назад в браузере.

```ts
const clearedUrl = await router.redirect(<!-- @include: @/snippets/payload.md -->)
// был создан router.state.user и возвращен его url
// '/user/9999?phone=123456'
```

Эта функция полностью типизирована, и TypeScript будет предлагать подсказки для автодополнения.

```ts
// Ошибок нет
redirect({ name: 'home' })
redirect({ name: 'user', params: { id: '123' }})
redirect({ name: 'user', params: { id: '123'}, query: { phone: '321' }})

// TS выводит ошибки

// отсутствует "name"
redirect({});
// нет Config с таким "name"
redirect({ name: 'nonExisting' });
// home — это статичный Config, params не должны передаваться
redirect({ name: 'home', params: {} });
// user — это динамический Config, params должны присутствовать
redirect({ name: 'user' });
// params.id должен присутствовать
redirect({ name: 'user', params: {} });
// передан несуществующий параметр params.foo
redirect({ name: 'user', params: { id: '123', foo: 'bar' } });
// передан несуществующий параметр query.foo
redirect({ name: 'user', params: { id: '123'}, query: { foo: 'bar' } });
```

## router.urlToPayload

Принимает строку pathname+search и возвращает `Payload`. Если подходящий `Config` не
найден, будет возвращен `Payload` для `notFound` с пустыми `params` и `query`.

::: info
Все неописанные или не соответствующие валидатору query убираются, также очищаются `protocol`,
`host`, `port` и `hash`, если они переданы
:::

```ts
router.urlToPayload(`/user/9999?phone=123456&gtm=value`);
  
<!--@include: @/snippets/payload-commented.md -->

router.urlToPayload(`/not-existing/admin?hacker=sql-inject`);

// { 
//  name: 'notFound', 
//  params: {}, 
//  query: {}
// }
```

## router.payloadToState

Принимает `Payload` и возвращает `State`. Эта функция полностью типизирована, как
`router.redirect`.

```ts
router.payloadToState(<!-- @include: @/snippets/payload.md -->);

<!--@include: @/snippets/state-commented.md -->
```

## router.init

Alias для `router.redirect(router.urlToPayload(url))`.
Принимает строку pathname+search и возвращает `State.url`.

::: info
Все неописанные или не соответствующие валидатору query убираются, также очищаются `protocol`,
`host`, `port` и `hash`, если они переданы
:::

```ts
const clearedUrl = await router.init(
  `/user/9999?phone=123456&gtm=value`
)
// был создан router.state.user и возвращен его url
// '/user/9999?phone=123456'

// в CSR обычно используется так:
await router.init(`${location.pathname}${location.search}`)

// в SSR обычно используется так (с Express.js):
const clearedURL = await router.init(req.originalUrl)

// если вы хотите удалить на сервере нерелевантные query и перенаправить
// браузер на унифицированный URL
if (req.originalUrl !== clearedURL) res.redirect(clearedURL)
```

## router.state

**Реактивный** объект, ключами которого являются `Config.name`, а значениями — `State`, например:

```ts
console.log(router.state.user);

<!-- @include: @/snippets/state-commented.md -->
```

Предназначен для отображения значений в UI и для описания логики в autoruns/effects. При редиректе
на текущий `Config` с новыми `params` или `query` эти значения соответственно изменятся в `router.state.user`.

::: tip
Роутер **не** уничтожает старый `State` при переходе на другой `Config`. В данном примере если
перейти на `router.redirect({ name: 'home' })`, все равно будет присутствовать `router.state.user`,
но с параметром `isActive: false`. Это помогает решить проблему, когда остались непрерванные асинхронные функции 
или autorun, привязанные к старому состоянию.
:::

## router.isRedirecting

Реактивный `boolean` для отображения индикаторов загрузки при редиректах. Ниже показаны примеры
глобального и локального отображения:

<!-- @include: @/snippets/router-api/loaders.md -->

## router.getActiveState

Возвращает активный `State`, если он есть. Функция может быть полезна для переключения layouts

<!-- @include: @/snippets/router-api/active-state.md -->

Или для дебага, чтобы видеть все изменения (используя аналог autorun выбранной системы реактивности)

```ts
autorun(() => console.log(JSON.stringify(router.getActiveState())))
```

## router.preloadComponent

По умолчанию роутер выполняет `loader` только во время редиректов. Но иногда может понадобиться
предварительно загрузить js-чанки, когда приложение полностью отрендерено. Принимает `Config.name`

<!-- @include: @/snippets/router-api/preload.md -->

## router.getGlobalArguments

Функция, позволяющая получить read-only конфигурацию, переданную в `createRouter`. Нужна для синхронизации
всех модулей Reactive Route и не имеет практического применения.

## beforeComponentChange

Эта функция вызывается только при изменении отрендеренного компонента (не
маршрута!) и предназначена для использования в модульных архитектурах. Например, если страницы
экспортируют модульные сторы: `export class PageStore { data: {}, destroy() {} }`

<!-- @include: @/snippets/router-api/before-change.md -->

Остается передать `globalStore` компонентам через Context API и получить code-splitting 
не только для компонентов страниц, но и их сторов (или любых других данных) с поддержкой SSR. 
Также эту функцию можно использовать для прерывания асинхронных операций и подписок.

::: tip
Destroy в большинстве случаев следует откладывать до завершения всей асинхронной
логики, иначе может возникнуть попытка обращения к несуществующему
`globalStore.pages[prevConfig.name]`.
:::

## Типы

### TypeRouter

<<< @/../packages/core/types.ts#type-router{typescript}

### TypeAdapters

Reactive Route можно использовать с альтернативными системами реактивности, передав соответствующие
адаптеры.

<<< @/../packages/core/types.ts#type-adapters{typescript}