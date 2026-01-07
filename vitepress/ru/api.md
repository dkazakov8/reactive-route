# API

## Config

Содержит всю логику работы со страницей

<Accordion title="Настраиваемые свойства">

<!-- @include: ./accordion/configConfigurable.md -->

</Accordion>

<Accordion title="Системные свойства">

<!-- @include: ./accordion/configSystem.md -->

</Accordion>

### config.params

В **Reactive Route** нет явного разделения статичных и динамических `Config`, просто сегменты
пути с префиксом `:` контролируются валидаторами, разрешающими открывать страницу со значением из URL,
и это отражается в типизации.

<!-- @include: @shared/api/withValidators.md -->

<Accordion title="Тесты типизации Config">

<<< @/../units/tsCheck/createConfigs.test.ts

</Accordion>

:::tip Важно
В валидаторы приходят **декодированные** значения для удобства работы с не-английскими URL:

`id: (value) => console.log(value)` покажет не `with%20space` а `with space`
:::

Таким образом, **Reactive Route** гарантирует, что все параметры в `router.state.userDetails.params`
прошли валидаторы и их можно безопасно использовать.

В рантайме `path` всегда источник истины, и даже при отключенном
TS стабильный матчинг гарантирован. Порядок объявления `Config` не важен, в алгоритме роутера только 
одно правило — при полном совпадении URL и `path` эта конфигурация обладает наивысшим приоритетом, 
даже если она объявлена в конце. В остальных сценариях выигрывает первый `Config`, у которого прошли все валидаторы.

### config.query

Описываются в том же формате, что и `params`, в виде валидаторов:

<!-- @include: @shared/api/queryValidators.md -->

:::tip Важно
В валидаторы попадают **декодированные** значения:

`userPrompt: (value) => console.log(value)` покажет не `with%20space` а `with space`
:::

Все `query` параметры являются опциональными, и их отсутствие не приводит к редиректу на `notFound`.

<!-- @include: @shared/api/queryFromState.md -->

При необходимости наличия определенных `query` можно их проверять в `beforeEnter` 
и редиректить на `notFound` если они не пришли в `nextState.query`.

### config.beforeEnter

Эту асинхронную функцию можно использовать для перенаправления на другой `Config`, выполнения 
проверок аутентификации и загрузки данных. Необработанные ошибки приведут к
рендеру `internalError` без изменения URL в браузере.

<Accordion title="Аргументы">

<!-- @include: ./accordion/beforeEnterApi.md -->

</Accordion>

<!-- @include: @shared/api/beforeEnter.md -->

<Accordion title="Тесты типизации beforeEnter / beforeLeave">

<<< @/../units/tsCheck/lifecycle.test.ts

</Accordion>

::: info Ограничения
Только в функциях жизненного цикла `redirect`, `currentState` и `nextState` имеют неполную типизацию
(`name` - просто `string`) из-за ограничений TypeScript 5, поэтому при рефакторинге TS не выведет ошибок.
:::

:::tip
Всегда используйте `return` с `redirect` и `preventRedirect` для стабильной логики редиректов.
:::

### config.beforeLeave

Эту асинхронную функцию можно использовать для прерывания редиректа. Необработанные ошибки приведут к 
рендеру `internalError` без изменения URL в браузере.

<Accordion title="Аргументы">

<!-- @include: ./accordion/beforeLeaveApi.md -->

</Accordion>

<!-- @include: @shared/api/beforeLeave.md -->

<Accordion title="Тесты типизации beforeEnter / beforeLeave">

<<< @/../units/tsCheck/lifecycle.test.ts

</Accordion>

::: info Ограничения
Только в функциях жизненного цикла `redirect`, `currentState` и `nextState` имеют неполную типизацию
(`name` - просто `string`) из-за ограничений TypeScript 5, поэтому при рефакторинге TS не выведет ошибок.
:::

:::tip
Всегда используйте `return` с `redirect` и `preventRedirect` для стабильной логики редиректов.
:::

## State

Реактивный объект, хранящийся в <Link to="api#router-state">router.state</Link>.

<Accordion title="Свойства">

<!-- @include: ./accordion/stateApi.md -->

</Accordion>

<Accordion title="Тесты типизации State">

<<< @/../units/tsCheck/state.test.ts

</Accordion>

<Accordion title="Type Narrowing для State">

<<< @/../units/tsCheck/stateNarrowing.test.ts

</Accordion>

## Router

### createRouter

Эта функция создает `router`.

<Accordion title="Аргументы">

<!-- @include: ./accordion/createRouterApi.md -->

</Accordion>

### beforeComponentChange

Эта функция вызывается только при изменении отрендеренного компонента и предназначена для 
использования в модульных архитектурах.

<!-- @include: @shared/api/before-change.md -->

<Accordion title="Тесты типизации beforeComponentChange">

<<< @/../units/tsCheck/beforeComponentChange.test.ts

</Accordion>

Таким образом страница `user` может получать доступ к своему PageStore через `globalStore.pages.user`.
Это позволяет более эффективно использовать code-splitting и сериализовывать только `globalStore`
при SSR - в нем уже будут данные для необходимой страницы.

Также эту функцию можно использовать для прерывания асинхронных операций и подписок.

### router.redirect

Выполняет полный цикл редиректа, подробнее описано в <Link to="introduction/how-works#redirect-flow">принципах работы</Link>.
Если передать дополнительное свойство `replace: true`, то последний элемент истории браузера будет 
заменен. Возвращает строку с новым URL.

Вторым аргументом принимает `skipLifecycle?: boolean` если нужно пропустить вызовы `beforeEnter` и `beforeLeave`.

```ts
const newUrl = await router.redirect(<!-- @include: @shared/state.md -->)
// '/user/9999?phone=123456'
```

<Accordion title="Тесты типизации StateDynamic">

<<< @/../units/tsCheck/redirect.test.ts

</Accordion>

### router.urlToState

Принимает URL и возвращает `State` с фолбэком на `notFound`.

<!-- @include: @shared/api/urlToState.md -->

::: info
Сохраняются только описанные `query`, прошедшие валидацию, в данном случае `gtm` не попал в `State`.
:::

### router.init

Сокращенная форма `router.redirect(router.urlToState(url))`. Вторым аргументом принимает 
`skipLifecycle?: boolean` если нужно пропустить вызовы `beforeEnter` и `beforeLeave`.

<!-- @include: @shared/api/init.md -->

### router.state

**Реактивный** объект, ключами которого являются `name`, а значениями — `State`, например:

<!-- @include: @shared/api/routerState.md -->

Предназначен для отображения значений в UI и для описания логики в autoruns/effects. При редиректе
с новыми `params` или `query` эти значения соответственно изменятся в `router.state.user`.

Роутер **не уничтожает** старый `State` при переходе на другой `Config`. В данном примере если
перейти на `router.redirect({ name: 'home' })`, все равно будет присутствовать `router.state.user`. 
Это помогает решить проблему с неочищенными подписками на старое состояние в рантайме.

Если бы **Reactive Route** использовал хранение только одного активного `router.getActiveState()` 
(_это несуществующий метод!_), как многие нереактивные роутеры, то подписка запустилась бы до 
unmount компонента с некорректным `State`, в котором может не быть этих параметров.

<!-- @include: @shared/usage/reactions.md -->

### router.isRedirecting

**Реактивный** `boolean` для отображения индикаторов загрузки при редиректах. Ниже показаны примеры
глобального и локального отображения:

<!-- @include: @shared/api/loaders.md -->

### router.activeName

**Реактивный** `name` активного `State` (`undefined` до самого первого редиректа).

### router.preloadComponent

**Reactive Route** загружает чанки страниц (выполняет `loader`) только во время редиректов. 
Эта функция может использоваться для предварительной загрузки и принимает `name`

<!-- @include: @shared/api/preload.md -->

### router.getGlobalArguments

Позволяет получить конфигурацию, переданную в `createRouter`.
