// #region usage-dynamic-components

# Layout

## Реакции на изменения

Объект <Link to="api/router#router-state">router.state</Link> является **реактивным**, поэтому за изменениями
можно следить в реакциях, например:

<!-- @include: @shared/advanced/reactions.md -->


Существует три основных способа работы с динамическими компонентами:

1. Вне компонента Router, как описано в <Link to="api/router#router-getactivestate">router.getActiveState</Link>

2. Внутри компонента страницы, реагируя на динамические параметры

<!-- @include: @shared/advanced/dashboard.md -->

<!-- @include: @shared/advanced/dashboard-example.md -->

3. Также можно установить один и тот же `loader` для нескольких `Config`. В этом случае `beforeComponentChange` 
не будет вызываться, и компонент страницы **не** будет перерендериваться при редиректе между ними. 
Однако активный `State` будет меняться. Этот пример мог бы выглядеть как предыдущий, но выберем подход с реактивной функцией:

<!-- @include: @shared/advanced/dashboard-multi.md -->

<!-- @include: @shared/advanced/dashboard-multi-example.md -->

Эти три подхода решают немного разные задачи, но служат хорошим примером, как использовать Reactive Route в различных сценариях.

// #endregion usage-dynamic-components

// #region usage-link

# Компонент Link

В Reactive Route нет готового компонента `Link` для каждого фреймворка, так как он значительно
ограничивал бы кастомизацию. Вы можете создать свой компонент, используя подходящий для
проекта подход и получая полную типизацию, как у <Link to="api/router#router-redirect">router.redirect</Link>.

Для удобства написания компонента можно создать в файле `router.ts` выведение типа переданных аргументов.

<!-- @include: @shared/advanced/link.md -->

::: warning
Эти примеры не являются официальной реализацией, скорее всего потребуется улучшить
мемоизацию, обработать ошибки и привести в соответствие с используемой реактивной системой.
:::

В примерах выше было создано 2 компонента - `Link` и `LinkProps`. Первый принимает props в виде объекта `payload`, 
а второй — в виде плоской структуры, но оба полностью типизированы и легко
расширяются.

<!-- @include: @shared/advanced/link-usage.md -->

// #endregion usage-link

// #region usage-redirects-chain

# Цепочки редиректов

Reactive Route поддерживает неограниченное количество редиректов в CSR и SSR.

<!-- @include: @shared/redirect-chain.md -->

В этом случае, если пользователь перейдет на `/4`, он будет перенаправлен `/4` → `/3` → `/2` → `/1`. 
Промежуточные редиректы не отражаются в истории браузера, а чанки для них не будут загружены.


// #endregion usage-redirects-chain

// #region usage-ssr

# Серверный рендеринг

Для серверного рендеринга необходимо инициализировать роутер на сервере и передать сформированный
`router.state` браузеру. Утилиты `escapeAllStrings` и `unescapeAllStrings` не включены в библиотеку.

### Сервер

<!-- @include: @shared/ssr/server.md -->

В данном коде в итоговый html не вставляются ссылки на js и css файлы, обычно это делается
бандлером. Полный код с настройкой бандлера можно посмотреть в <Link to="examples">Примерах</Link>.

Для цепочек редиректов на сервере используется `if (error instanceof RedirectError) return res.redirect(error.message)`. 
Эта ошибка выбрасывается, когда в `beforeEnter` вернулся редирект на другой `Config`, например, 
если пользователь не прошел авторизацию и пытается зайти в авторизованную зону.

::: tip
Способ сериализации `JSON.parse(JSON.stringify(router.state))` достаточен, так как `router.state` -
простая структура. Однако если в `Config.props` переданы сложные данные (классы, объекты с методами, Date и т.п.),
то лучше перед сериализацией на сервере их удалять. На клиенте они проставятся автоматически при вызове 
<Link to="api/router#router-hydratefromstate">router.hydrateFromState</Link>
:::

### Клиент

<!-- @include: @shared/ssr/client.md -->

// #endregion usage-ssr