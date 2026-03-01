// #region api-config

# Config

Содержит всю логику работы со страницей.

<Accordion title="Настраиваемые свойства">

<!-- @include: ./accordion/configConfigurable.md -->

</Accordion>

<Accordion title="Системные свойства">

<!-- @include: ./accordion/configSystem.md -->

</Accordion>

В **Reactive Route** нет явного разделения статичных и динамических `Config`. Сегменты
пути с префиксом `:` контролируются валидаторами, разрешающими открывать страницу со значением из URL.

<!-- @include: @shared/api/withValidators.md -->

<Accordion title="TypeScript 5 автоматически выводит необходимые валидаторы из path">

<!-- @include: @shared/introduction/tsConfigValidation.md -->

</Accordion>

:::tip Важно
В валидаторы попадают **декодированные** значения:

`id: (value) => console.log(value)` покажет не `with%20space` а `with space`
:::

Таким образом, **Reactive Route** гарантирует, что все параметры в `router.state.userDetails.params`
прошли валидаторы и их можно безопасно использовать.

## Query

Описываются в том же формате, что и `params`, в виде валидаторов:

<!-- @include: @shared/api/queryValidators.md -->

Все `query` параметры являются опциональными, и их отсутствие не приводит к редиректу на `notFound`.

```ts
const routeState = router.state['search'];

await router.redirect({ name: 'search', query: { userPrompt: 'asd' }})

console.log(routeState.query.userPrompt) // undefined

await router.redirect({ name: 'search', query: { userPrompt: 'mammoth' }})

console.log(routeState.query.userPrompt) // 'mammoth'
```

Если логика приложения требует, чтобы не только динамические части `path` были обязательными, но и
определенные query параметры, то можно их проверять в `beforeEnter` и редиректить императивно на `notFound`
или другой подходящий `Config`.

## Функции жизненного цикла

::: warning
Обе функции жизненного цикла вызываются при редиректе на новый `Config` или изменении динамических
параметров в текущем. При изменении query в рамках текущего `Config` они вызваны не будут!

Таким образом, в настоящее время не поддерживается схема загрузки данных роутером, основываясь на query.
Если такой механизм нужен — загружайте данные, реагируя на изменение `router.state[name].query`.
:::

async `beforeEnter` можно использовать для 
перенаправления на другой `Config`, выполнения проверок аутентификации и загрузки данных.

async `beforeLeave` можно использовать для прерывания редиректа.

В обе функции первым аргументом передается объект со свойствами:

<table>
  <thead><tr><th>Свойство</th><th>Тип</th><th>Описание</th></tr></thead>
  <tbody><tr>
<td><code>nextState</code></td>
<td class="table-td">

```ts
TypeState
```

</td>
<td>Следующий предполагаемый <code>State</code></td>
</tr><tr>
<td><code>currentState?</code></td>
<td class="table-td">

```ts
TypeState
```

</td>
<td>Текущий активный <code>State</code> (<code>undefined</code> при самом первом редиректе)</td>
</tr><tr>
</tr><tr>
<td><code>preventRedirect</code></td>
<td class="table-td">

```ts
() => void
```

</td>
<td>Метод для остановки редиректа</td>
</tr><tr>
<td><code>redirect</code></td>
<td class="table-td">

```ts
(payload: TypePayload) => 
  void
```

</td>
<td>Метод для редиректа внутри жизненного цикла. Так как <code>createConfigs</code> вызывается до создания роутера, здесь не получится использовать <code>router.redirect</code></td>
  </tr></tbody>
</table>

Пример использования:

<!-- @include: @shared/config/lifecycle.md -->

Всегда используйте `return` с `redirect` и `preventRedirect` для стабильной логики редиректов.

::: warning
`redirect` в жизненном цикле не имеет полной TS-типизации, поэтому при рефакторинге
TS не выведет ошибок. Используйте с осторожностью.
:::

Необработанные ошибки в функциях жизненного цикла приведут к рендерингу `internalError`, 
поэтому важно правильно обрабатывать логику, используя `try-catch` или `Promise.catch()`.

## Типы

### TypeConfigConfigurable 

Объект, передаваемый в `createConfigs`

<<< @/../packages/core/types.ts#type-config-configurable{typescript}

### TypeConfig

Базовый обогащенный объект, с которым работает роутер

<<< @/../packages/core/types.ts#type-config{typescript}

// #endregion api-config

// #region api-router

# Router API

## createRouter

Эта функция создает `router` и принимает объект со свойствами:

<table>
  <thead><tr><th>Свойство</th><th>Тип</th><th>Описание</th></tr></thead>
  <tbody><tr>
<td><code>configs</code></td>
<td class="table-td">

```ts
ReturnType<typeof createConfigs>
```

</td>
<td>Объект с <code>Configs</code></td>
</tr><tr>
<td><code>adapters</code></td>
<td class="table-td">

<Link to="api/router#typeadapters">TypeAdapters</Link>

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

<!-- @include: @shared/router-api/sample-configs.md -->

## router.redirect

Находит `Config`, соответствующий переданному `Payload` и возвращает `State.url`. Если редирект 
выполняется в браузере, записывает новый url в `window.history` для возможности перехода вперед-назад.

Также можно передать в `Payload` свойство `replace: true`, чтобы заблокировать переход назад в браузере.

```ts
const clearedUrl = await router.redirect(<!-- @include: @shared/payload.md -->)
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
  
<!--@include: @shared/payload-commented.md -->

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
router.payloadToState(<!-- @include: @shared/payload.md -->);

<!--@include: @shared/state-commented.md -->
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

<!-- @include: @shared/state-commented.md -->
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

<!-- @include: @shared/router-api/loaders.md -->

## router.getActiveState

Возвращает активный `State`, если он есть. Функция может быть полезна для переключения layouts

<!-- @include: @shared/router-api/active-state.md -->

Или для дебага, чтобы видеть все изменения (используя аналог autorun выбранной системы реактивности)

```ts
autorun(() => console.log(JSON.stringify(router.getActiveState())))
```

## router.preloadComponent

По умолчанию роутер выполняет `loader` только во время редиректов. Но иногда может понадобиться
предварительно загрузить js-чанки, когда приложение полностью отрендерено. Принимает `Config.name`

<!-- @include: @shared/router-api/preload.md -->

## router.getGlobalArguments

Функция, позволяющая получить read-only конфигурацию, переданную в `createRouter`. Нужна для синхронизации
всех модулей Reactive Route и не имеет практического применения.

## beforeComponentChange

Эта функция вызывается только при изменении отрендеренного компонента (не
маршрута!) и предназначена для использования в модульных архитектурах. Например, если страницы
экспортируют модульные сторы: `export class PageStore { data: {}, destroy() {} }`

<!-- @include: @shared/router-api/before-change.md -->

Остается передать `globalStore` компонентам через Context API и получить code-splitting 
не только для компонентов страниц, но и их сторов (или любых других данных) с поддержкой SSR. 
Также эту функцию можно использовать для прерывания асинхронных операций и подписок.

::: tip
Destroy в большинстве случаев следует откладывать до завершения всей асинхронной
логики, иначе может возникнуть попытка обращения к несуществующему
`globalStore.pages[prevConfig.name]`.
:::

## Типы

### TypeAdapters

Reactive Route можно использовать с альтернативными системами реактивности, передав соответствующие
адаптеры.

<<< @/../packages/core/types.ts#type-adapters{typescript}

// #endregion api-router

// #region api-state

# State

Общее назначение изложено в разделе <Link to="guide/core-concepts">Основные структуры</Link>.

## Свойства

<table>
  <thead><tr><th>Свойство</th><th>Тип</th><th>Описание</th></tr></thead>
  <tbody><tr>
<td><code>name</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>Соответствует ключу объекта</td>
</tr><tr>
<td><code>params</code></td>
<td class="table-td">

```ts
Record<
  keyof TConfig['params'], 
  string
>
```

</td>
<td>Проверенные и декодированные значения params. Все ключи, которые описаны в валидаторах <code>Config</code> будут присутствовать</td>
</tr><tr>
<td><code>query</code></td>
<td class="table-td">

```ts
Partial<Record<
  keyof TConfig['query'], 
  string
>>
```

</td>
<td>Проверенные и декодированные значения query. Все опциональны</td>
</tr><tr>
<td><code>pathname</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>Закодированный pathname</td>
</tr><tr>
<td><code>search</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>Закодированный search</td>
</tr><tr>
<td><code>url</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>Закодированный <code>${pathname}?${search}</code></td>
</tr><tr>
<td><code>isActive</code></td>
<td class="table-td">

```ts
boolean
```

</td>
<td>Указывает, что компонент страницы этого <code>State</code> отрендерен или будет отрендерен в следующем тике</td>
</tr><tr>
<td><code>props?</code></td>
<td class="table-td">

```ts
TConfig['props']
```

</td>
<td>Статичный объект из <code>Config</code></td>
</tr></tbody>
</table>

## Типы

### TypeState

<<< @/../packages/core/types.ts#type-state{typescript}

// #endregion api-state