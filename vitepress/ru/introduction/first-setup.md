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

<Accordion title="TypeScript 5 автоматически выводит необходимые валидаторы из path">

<!-- @include: @shared/introduction/tsConfigValidation.md -->

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

:::info
Вместо `location.pathname + location.search` можно передавать и `location.href`, то есть полный
URL. Все лишние для работы роутера данные (protocol, domain, port, hash) очищаются автоматически.
:::
