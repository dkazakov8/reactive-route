# Конфигурация (Config)

Основная идея изложена в разделе [Основные концепции](/ru/guide/core-concepts).

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
  default,
  ...otherExports
}>
```

</td>
<td>Функция, возвращающая Promise, который разрешается в компонент (он должен быть в экспорте <strong>default</strong>)</td>
</tr><tr>
<td><code>props?</code></td>
<td class="table-td">

```ts
Record<string, any>
```

</td>
<td>Статические пропсы для передачи в компонент</td>
</tr><tr>
<td><code>params?</code></td>
<td class="table-td">

```ts
Record<
  TypeExtractRouteParams<TPath>,
  (value: string) => boolean
>
```

</td>
<td>Функции валидации для сегментов пути (обязательны, когда вариант маршрута — <em>Dynamic</em>, и ограничены, когда <em>Static</em>)</td>
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
<td>Функции валидации для параметров запроса (query parameters)</td>
</tr><tr>
<td><code>beforeEnter?</code></td>
<td class="table-td">

```ts
(lifecycleConfig: TypeLifecycleConfig) => 
  Promise<void>
```

</td>
<td>Функция жизненного цикла, вызываемая перед входом на маршрут</td>
</tr><tr>
<td><code>beforeLeave?</code></td>
<td class="table-td">

```ts
(lifecycleConfig: TypeLifecycleConfig) => 
  Promise<void>
```

</td>
<td>Функция жизненного цикла, вызываемая перед уходом с маршрута</td>
  </tr></tbody>
</table>


## Внутренние свойства

Эти аргументы автоматически добавляются библиотекой и не могут быть указаны вручную.

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
<td>Это экспорт <code>default</code>, возвращаемый функцией <code>loader</code></td>
</tr><tr>
<td><code>otherExports?</code></td>
<td class="table-td">

```ts
Record<string, any>
```

</td>
<td>Это все экспорты, возвращаемые функцией <code>loader</code>, кроме <code>default</code></td>
  </tr></tbody>
</table>

## Статические / Динамические (Static / Dynamic)

Существует всего два варианта — `Static` и `Dynamic`.
Динамические маршруты имеют параметры в своих путях, которые обозначаются префиксом в виде двоеточия:

```typescript
home: { // Static (Статический)
  path: '/',
  loader: () => import('./pages/home')
},
user: { // Dynamic (Динамический)
  path: '/user/:id', 
  params: {
    id: (value) => /^\d+$/.test(value) // Функция валидации
  },
  loader: () => import('./pages/user')
}
```

Функция валидации обязательна, и если она не будет удовлетворена в каком-либо маршруте, пользователь будет перенаправлен на маршрут `notFound`.
Если компонент страницы отрендерен, вы можете быть уверены, что все параметры проверены и присутствуют в `router.state[routeName].params`.

## Параметры запроса (Query)

Оба типа маршрутов могут иметь параметры запроса:

```typescript
search: {
  path: '/search',
  query: {
    text: (value) => value.length > 1
  },
  loader: () => import('./pages/search')
}
```

Функция валидации обязательна, и если она не будет удовлетворена, параметр будет недоступен из `State`. Это означает, что все параметры запроса необязательны и могут иметь значение `undefined` в `router.state[routeName].query`.

## Функции жизненного цикла

Существуют две мощные функции жизненного цикла, которые позволяют вам контролировать поток навигации и выполнять загрузку данных.

`beforeEnter` вызывается перед входом на маршрут. Ее можно использовать для перенаправления на другой маршрут, выполнения проверок аутентификации и загрузки данных.

`beforeLeave` вызывается перед уходом с маршрута. Ее можно использовать для предотвращения навигации или показа диалогового окна подтверждения.

Обе функции получают первым аргументом объект API:

<table>
  <thead><tr><th>Свойство</th><th>Тип</th><th>Описание</th></tr></thead>
  <tbody><tr>
<td><code>nextState</code></td>
<td class="table-td">

```ts
TypeRouteState
```

</td>
<td>Куда роутер перенаправляет пользователя</td>
</tr><tr>
<td><code>currentState?</code></td>
<td class="table-td">

```ts
TypeRouteState
```

</td>
<td>Текущее состояние маршрута (имеет значение <code>undefined</code> до первого редиректа)</td>
</tr><tr>
</tr><tr>
<td><code>preventRedirect</code></td>
<td class="table-td">

```ts
() => void
```

</td>
<td>Метод для остановки процесса перенаправления</td>
</tr><tr>
<td><code>redirect</code></td>
<td class="table-td">

```ts
(routePayload: TypeRoutePayload) => 
  void
```

</td>
<td>Метод для перенаправления внутри жизненного цикла. Мы не можем использовать здесь <code>router.redirect</code>, так как маршруты определяются до роутера</td>
  </tr></tbody>
</table>

Простой пример:

```typescript
// для поддержки SSR аргументы должны передаваться здесь
function getRouter(api: Api, store: Store) {
  const routes = createRoutes({
    dashboard: {
      path: '/dashboard',
      loader: () => import('./pages/dashboard'),
      async beforeEnter({ redirect }) {
        await api.loadUser();

        if (!store.isAuthenticated()) {
          // передаем Payload как в обычном роутере.redirect
          return redirect({
            name: 'login',
            query: { returnTo: 'dashboard' }
          });
        }

        await api.loadDashboard();
      },
      async beforeLeave({ preventRedirect, nextState }) {
        const hasUnsavedChanges = await api.checkForm();

        if (hasUnsavedChanges) {
          const confirmed = window.confirm(
            `У вас есть несохраненные изменения. Вы уверены, что хотите уйти?`
          );

          if (!confirmed) return preventRedirect();
        }

        if (nextState.name === 'user') return preventRedirect();
      },
    }
    
    // другие конфигурации маршрутов
  });
}
```

Всегда не забывайте использовать `return` вместе с `redirect` и `preventRedirect` для обеспечения правильного контроля потока.
И будьте осторожны с функцией `redirect` в жизненном цикле — у нее нет детальных типов TS, чтобы избежать циклической зависимости. Таким образом, если вы проведете рефакторинг своих маршрутов, ошибки TS здесь не будут показаны, что может привести к неправильным редиректам.

Необработанные ошибки в функциях жизненного цикла приведут к рендерингу маршрута `internalError`, поэтому важно правильно обрабатывать ошибки, используя блоки `try-catch` или методы `Promise.catch()`.

Обратите внимание, что `beforeEnter` вызывается при изменении динамических параметров, но не вызывается при изменении параметров запроса (query). Это поведение может стать настраиваемым в будущих версиях.
