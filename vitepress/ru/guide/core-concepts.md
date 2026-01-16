# Основные структуры

В Reactive Route их всего три - `Config`, `Payload` и `State`.

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
<!-- @include: @/snippets/payload.md -->
```

Обычно он пишется вручную (с подсказками от TS) и передается в [router.redirect](/ru/guide/router-api#router-redirect):

```tsx
button.onclick = () => router.redirect(<!-- @include: @/snippets/payload.md -->)
```

## State

Это объект, содержащий расширенную информацию по сравнению с `Payload`:

```ts
<!-- @include: @/snippets/state.md -->
```

Его можно сконструировать вручную из `Payload` с помощью [router.payloadToState](/ru/guide/router-api#router-payloadtostate), а также
он хранится в `router.state[name]` **реактивно** и доступен везде, где есть доступ к `router`:

<!-- @include: @/snippets/core-concepts/state-in-components.md -->

Оператор "non-null assertion" безопасен, если только один `Config` использует `loader`, загружающий 
этот компонент страницы. В противном случае нужно писать соответствующую логику, 
например `routeState = router.state.userView || router.state.userEdit`.

## Декодирование

Браузер работает с URL в [закодированном формате](https://developers.google.com/maps/url-encoding),
поэтому Reactive Route имеет встроенные механизмы кодирования и декодирования.

```ts
await router.hydrateFromURL(`/user/with%20space?phone=and%26symbols`);
// "под капотом" вызывается router.locationToPayload для создания 
// Payload с декодированными значениями
<!-- @include: @/snippets/core-concepts/payload-decoded.md -->

// дальше происходит установка State через router.payloadToState, 
// который создает закодированные свойства

console.log(router.state.user);
<!-- @include: @/snippets/core-concepts/state-decoded.md -->
```

Также при двустороннем процессе кодирования и декодирования вызываются валидаторы из `Config`.
Этот процесс обеспечивает безопасность, предотвращает передачу некорректных значений и создает 
корректные URL.