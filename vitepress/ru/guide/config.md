# Config

Общее назначение изложено в разделе [Основные структуры](/ru/guide/core-concepts).

## Настраиваемые свойства

<table>
  <thead><tr><th>Свойство</th><th>Тип</th><th>Описание</th></tr></thead>
  <tbody><tr>
<td><code>path</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>Путь маршрута, должен начинаться с <code>/</code> и может включать динамические сегменты</td>
</tr><tr>
<td><code>loader</code></td>
<td class="table-td">

```ts
() => Promise<{
  default: PageComponent,
  ...otherExports
}>
```

</td>
<td>Функция, возвращающая Promise с компонентом в параметре <strong>default</strong></td>
</tr><tr>
<td><code>props?</code></td>
<td class="table-td">

```ts
Record<string, any>
```

</td>
<td>Статичные props, передаваемые в компонент страницы</td>
</tr><tr>
<td><code>params?</code></td>
<td class="table-td">

```ts
Record<
  TypeExtractParams<TPath>,
  (value: string) => boolean
>
```

</td>
<td>Валидаторы для динамических сегментов path</td>
</tr><tr>
<td><code>query?</code></td>
<td class="table-td">

```ts
Record<
  string,
  (value: string) => boolean
>
```

</td>
<td>Валидаторы для query параметров</td>
</tr><tr>
<td><code>beforeEnter?</code></td>
<td class="table-td">

```ts
(data: TypeLifecycleConfig) => 
  Promise<void>
```

</td>
<td>Функция жизненного цикла, вызываемая перед редиректом на страницу</td>
</tr><tr>
<td><code>beforeLeave?</code></td>
<td class="table-td">

```ts
(data: TypeLifecycleConfig) => 
  Promise<void>
```

</td>
<td>Функция жизненного цикла, вызываемая перед уходом со страницы</td>
  </tr></tbody>
</table>

## Внутренние свойства

Автоматически добавляются библиотекой и не могут быть указаны вручную.

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
<td><code>component?</code></td>
<td class="table-td">

```ts
any
```

</td>
<td>Поле <code>default</code>, возвращенное <code>loader</code></td>
</tr><tr>
<td><code>otherExports?</code></td>
<td class="table-td">

```ts
Record<string, any>
```

</td>
<td>Все экспорты, возвращенные <code>loader</code>, кроме <code>default</code></td>
  </tr></tbody>
</table>

## Static / Dynamic

Существует всего два варианта `Config` - `Static` и `Dynamic` (имеют части в `path` с префиксом в виде двоеточия):

<!-- @include: @/snippets/config/static-dynamic.md -->

Валидаторы для динамических частей `path` обязательны, TS автоматически их извлекает из строки и подсказывает,
как описать в `params`.

Если какой-либо валидатор вернул `false` (в данном примере — если id в URL не числовой `/user/not-numeric`)
и не найдено других подходящих `Config`, пользователь будет перенаправлен на `notFound`.

Если компонент страницы отрендерен, вы можете быть уверены, что все параметры 
провалидированы и находятся в `router.state[name].params`.

## Query

Оба варианта `Config` могут иметь query параметры:

<!-- @include: @/snippets/config/query.md -->

Если валидатор вернет `false`, данный параметр будет `undefined` в `router.state[name].query`. Таким образом, все
query параметры являются необязательными, и их отсутствие не приводит к редиректу на `notFound`.

Если логика приложения требует, чтобы не только динамические части `path` были обязательными, но и
определенные query параметры, то можно их проверять в `beforeEnter` и редиректить императивно на `notFound`
или другой подходящий `Config`.

## Функции жизненного цикла

> [!IMPORTANT]
> Функции жизненного цикла вызываются при редиректе на новый `Config` или изменении динамических
> параметров в текущем. При изменении query в рамках текущего `Config` они вызваны не будут!
> 
> Таким образом, в настоящее время не поддерживается схема загрузки данных роутером, основываясь на query.
> Если такой механизм нужен — загружайте данные, реагируя на изменение `router.state[name].query`.

async `beforeEnter` вызывается перед редиректом на страницу. Ее можно использовать для 
перенаправления на другой `Config`, выполнения проверок аутентификации и загрузки данных.

async `beforeLeave` вызывается перед уходом со страницы. Ее можно использовать для прерывания редиректа.

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
(routePayload: TypeRoutePayload) => 
  void
```

</td>
<td>Метод для редиректа внутри жизненного цикла. Так как <code>createRoutes</code> вызывается до создания роутера, здесь не получится использовать <code>router.redirect</code></td>
  </tr></tbody>
</table>

Пример использования:

<!-- @include: @/snippets/config/lifecycle.md -->

Всегда используйте `return` с `redirect` и `preventRedirect` для стабильной логики редиректов.

> [!WARNING]
> `redirect` в жизненном цикле не имеет полной TS-типизации, поэтому при рефакторинге
TS не выведет ошибок. Используйте с осторожностью.

Необработанные ошибки в функциях жизненного цикла приведут к рендерингу `internalError`, 
поэтому важно правильно обрабатывать логику, используя `try-catch` или `Promise.catch()`.
