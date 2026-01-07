<script setup>
import { data } from '@/dynamic.data';
</script>

// #region introduction-overview

# Обзор и назначение

<br>
<Badge type="warning">{{ data.version }}</Badge>
<Badge type="info">Размер (core + integration): <span style="color:var(--docsearch-focus-color)">{{ data.sizeForLabel }}</span></Badge>
<Badge type="info">Покрытие: <span style="color:var(--docsearch-focus-color)">{{ data.metrics.coverage }}</span> в <span style="color:var(--docsearch-focus-color)">{{ data.passedTests }}</span> тестах</Badge>

При использовании MobX, реактивности Vue, сигналов Solid.js и других реактивных систем
сложно поддерживать синхронизацию с нереактивными роутерами, которые часто привязаны к UI 
или структуре файлов.

Для решения этой проблемы был создан **Reactive Route**, работающий с любыми
реактивными библиотеками и фреймворками, что значительно облегчает работу с разными стеками. 

Доступны готовые интеграции для:

- React + [MobX](https://mobx.js.org/)
- React + [Observable](https://observable.ru/)
- Preact (без compat) + MobX
- Preact (без compat) + Observable
- Solid.js + [реактивность Solid.js](https://docs.solidjs.com/concepts/intro-to-reactivity)
- Solid.js + MobX
- Solid.js + Observable
- Vue + [реактивность Vue](https://vuejs.org/guide/extras/reactivity-in-depth)

## Преимущества

Библиотека следует строгой философии — минимальный размер, максимальная типизация,
обязательная валидация URL-параметров, отказоустойчивость и поддержка SSR / Widget / MPA режимов.

**Reactive Route** — это отдельный слой роутинга, побуждающий не разбрасывать конфигурацию
по файлам и компонентам. В нем нет редиректов по частичным путям и вложенности роутов,
что позволяет использовать статический анализ TypeScript (а значит — автоматический рефакторинг, 
быстрые переходы и автодополнение + стабильную генерацию с помощью ИИ моделей).

Дерево компонентов в проекте остается чистым, а на структуру папок и
имена файлов не накладывается ограничений.

Асинхронные методы `beforeEnter` и `beforeLeave` позволяют контролировать доступ
и загружать данные в сторы, а `beforeComponentChange` - проектировать модульные архитектуры
с поддержкой code-splitting не только для компонентов страниц, но и для других сущностей (и 
"разрушать" их при переходе на другие страницы), с бесшовной поддержкой SSR.

Тщательно спроектированная поддержка реактивности позволяет писать приложения с гранулярными ререндерами, 
не сталкиваясь с неконсистентностью вызова реакций и механизмов mount / unmount UI
фреймворков при изменении состояния маршрута.

## Поддержка браузеров

**Reactive Route** использует Dual Packaging (CJS и ESM автоматически выбираются исходя из 
конфигурации проекта) для максимальной совместимости. Для работы без полифиллов необходимы
как минимум **Chrome 49**, **Firefox 29**, **Safari 10.1** и **Node.js 10** если используется SSR,
из-за необходимости наличия [URLSearchParams](https://caniuse.com/mdn-api_urlsearchparams).

Вы можете сразу перейти к <Link to="examples">Примерам</Link> для вашего стека или следующей секции 
документации для ознакомления со схемой работы библиотеки.

// #endregion introduction-overview

// #region introduction-first-setup

# Установка и настройка

<!-- @include: @shared/introduction/installPackage.md -->

**Reactive Route** — это npm-пакет без каких-либо зависимостей с отдельными
импортами модулей для бесшовного подключения к имеющейся системе реактивности
на любом фреймворке (React, Preact, Solid, Vue). Настраивать tree-shaking не требуется.

:::info Peer dependencies
Если используется не "коробочная" реактивность фреймворка, должны быть установлены подходящие
реактивные библиотеки (см. <Link to="integration">Интеграции</Link>).
:::

<Accordion title="Карта модулей">

<<< @/modulesMap.ts

</Accordion>

## Создание конфигурации

В терминологии **Reactive Route** описание роута / маршрута и его поведения называется `Config`
и передается в `createConfigs`:

<!-- @include: @shared/introduction/createRouterSingleton.md -->

`loader` ожидает, что компонент страницы будет в экспорте `default`.

При необходимости можно объявлять `path` с переменными `/:id/:name`, в этом случае для каждой
переменной необходим валидатор. Никогда не доверяйте пришедшим в URL данным, особенно если есть SSR.

:::info Не рекомендуется
сразу передавать компонент `loader: () => Promise.resolve({ default: HomePage })`
для исключения циклических импортов
:::

<Accordion title="Передача конфигурации объектом более типобезопасна">

<!-- @include: ./accordion/objectConfigBetter.md -->

</Accordion>

<Accordion title="Использование асинхронного импорта расширяет возможности">

<!-- @include: ./accordion/asyncLoaderBetter.md -->

</Accordion>

## Экспорт

Рекомендуется использовать Context API для передачи роутера в компоненты.

:::info Но вы можете сами выбрать схему
Экспорт с помощью Singleton-паттерна (как в предыдущем примере) проще
и подходит для CSR-проектов.

В SSR же несколько пользователей могут одновременно зайти на разные страницы,
и Singlton отрендерит html-разметку из последнего текущего состояния, а не нужного конкретному
пользователю, поэтому требуется изоляция в виде контекстов или другого DI.
:::

<!-- @include: @shared/introduction/createRouterContext.md -->

<Accordion title="Наличие `notFound` и `internalError` обязательно">

<!-- @include: ./accordion/errorPages.md -->

</Accordion>

## Запуск

Роутер готов к работе, осталось найти первоначальный `Config`,
который соответствует URL браузера и отобразить компонент страницы.

<!-- @include: @shared/introduction/renderApp.md -->

// #endregion introduction-first-setup

// #region introduction-how-works

# Принцип работы

**Reactive Route** обладает мощной типизацией, продуманной логикой редиректов и отказоустойчивостью, 
которые крайне сложно "сломать". Для большинства сценариев достаточно определить конфигурации
и использовать `router.redirect`, остальное подскажет TS.

При взаимодействии с роутером есть всего две основные структуры:

## Config

Содержит всю логику работы со страницей

<!-- @include: @shared/introduction/extendedUserConfig.md -->

<Accordion title="Тесты типизации Config">

<<< @/../units/tsCheck/createConfigs.test.ts

</Accordion>

## State

Содержит текущие значения определенного `Config`

<!-- @include: @shared/introduction/stateInComponents.md -->

:::info
Оператор "non-null assertion" безопасен, если только один `Config` использует этот компонент страницы.
:::

<Accordion title="Тесты типизации State">

<<< @/../units/tsCheck/state.test.ts

</Accordion>

<Accordion title="Type Narrowing для State">

<<< @/../units/tsCheck/stateNarrowing.test.ts

</Accordion>

Это нормализованная структура, в которой всегда будут объекты `params` и `query`. Однако
если они не описаны в соответствующей конфигурации, то их тип будет `Record<never, string>`.
Это сделано для защиты runtime, так как разработчик может где-то поставить ts-ignore и без
дефолтных значений код упадет с ошибкой `Cannot read property of undefined`.

Однако для механизма редиректа удобнее работать с максимально строгими типами, и для этой цели
создан `StateDynamic`, который полностью запрещает передачу `params` и `query`, если их не было
в конфигурации страницы.

<Accordion title="Тесты типизации StateDynamic">

<<< @/../units/tsCheck/redirect.test.ts

</Accordion>

## Декодирование

Браузер работает с URL в [закодированном формате](https://developers.google.com/maps/url-encoding),
поэтому **Reactive Route** имеет встроенные механизмы кодирования и декодирования.
Рассмотрим процесс инициализации первого редиректа (если заменили все валидаторы на
`() => true`):

<!-- @include: @shared/introduction/initEncoded.md -->

Роутер не понимает строковый формат, так как его нет в описанных выше структурах.

Для конвертации существует метод <Link to="api#router-urltostate">router.urlToState</Link>,
который очищает URL от лишнего, декодирует значения, запускает валидаторы и возвращает понятный 
роутеру `State`, на который вызывается редирект:

<!-- @include: @shared/introduction/initDecodedRedirect.md -->

:::tip Важно
В валидаторы приходят **декодированные** значения для удобства работы с не-английскими URL:

`id: (value) => console.log(value)` покажет не `with%20space` а `with space`

`phone: (value) => console.log(value)` покажет не `and%26symbols` а `and&symbols`
:::

## Redirect flow

- выполняется исследование причины редиректа. В данном случае `reason = 'new_config'`
- выполняется `beforeLeave` предыдущего `Config` (в данном случае его не было, поэтому пропускается)
- выполняется `beforeEnter` следующего `Config` с прохождением цепочки редиректов
- загружается js-чанк (если включен code-splitting) с компонентом и другими экспортами
- нормализованный `State` записывается в соответствующий `router.state[config.name]`, в данном случае `router.state.user`
- если включена синхронизация с History API (по умолчанию — включена для браузерного окружения),
  то вызываются нативные `pushState / replaceState`

// #endregion introduction-how-works

// #region introduction-comparison

# Сравнение

<SizeComparisonChart :data="data" />

:::info Конфигурация
Используется `esbuild` с минификацией и исключением `peerDependencies` участвующих библиотек.
При включении tree shaking в реальных проектах размеры могут быть меньше.

<!-- @include: @shared/introduction/comparisonBuildScript.md -->
:::

<Accordion title="Входные файлы">

<<< @/../scripts/measureApps/reactive-route.ts
<<< @/../scripts/measureApps/mobx-router.ts
<<< @/../scripts/measureApps/vue-router.ts
<<< @/../scripts/measureApps/kitbag.ts
<<< @/../scripts/measureApps/tanstack.ts
<<< @/../scripts/measureApps/react-router.ts
<<< @/../scripts/measureApps/solid-router.ts

</Accordion>

## Функционал

<ComparisonTable
:headers="['', 'Reactive Route', 'Большинство других библиотек']"
:rows="[
['**Типизация**', 'Полная (кроме beforeEnter / beforeLeave)', 'Частичная (из-за динамического объявления и вложенности TS не знает актуальное дерево роутов)'],
['**Реактивность**', 'Любая с Proxy', 'Только для одной библиотеки / отсутствует'],
['**Фреймворк**', 'Любой', 'Один, в редких исключениях - адаптеры для похожих фреймворков (React + Solid.js)'],
['**Жизненный цикл**', 'Асинхронный', 'Синхронный'],
['**Валидация параметров**', 'Обязательна', 'Опциональна / отсутствует'],
['**SSR**', 'Простая настройка', 'Сложная настройка'],
['**Удобство DX**', 'Быстрые переходы, простой авто-рефакторинг, чистая структура', 'Полная структура есть только в рантайме, ручной контроль редиректов по строкам'],
['**Файловая структура**', 'Любая', 'Ограничена при file-based подходе'],
['**Code splitting**', 'Нативный (для компонентов страниц и других экспортов)', 'Частичный / через специфичные утилиты'],
['**Набор готовых компонентов**', 'Только Router', 'Есть'],
['**Dev tools**', 'Нет (но легко логировать активный State)', 'Есть'],
['**Nested configs**', 'Нет', 'Есть'],
['**Wildcards**', 'Нет', 'Есть'],
['**Динамические роуты**', 'Нет', 'Есть'],
['**Опциональные части path**', 'Нет', 'Есть'],
['**File-based**', 'Нет', 'Есть'],
['**Поддержка hash и URL state**', 'Нет', 'Частичная'],
['**Конвертация типов params и query**', 'Нет', 'Частичная'],
]"
/>

// #endregion introduction-comparison
