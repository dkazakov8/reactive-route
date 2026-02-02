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