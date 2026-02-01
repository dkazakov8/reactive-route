# Пошаговая настройка

## Установка

<!-- @include: @snippets/getting-started/install.md -->

Reactive Route - это npm-пакет без каких-либо dependencies с независимыми
модулями для фреймворков. В проекте должны быть установлены необходимые 
peer dependencies, уникальные для каждого стека, 
как описано в [Интеграции](/ru/guide/react).

С помощью модулей Reactive Route бесшовно подстраивается под каждый стек, работая
на переданной реактивности и на любом фреймворке (React, Preact, Solid, Vue и т.п.), 
без необходимости настраивать tree-shaking при сборке.

<Accordion title="Карта модулей">

<<< @/modulesMap.ts

</Accordion>

## Создание конфигурации

Набор `Config` (в терминологии Reactive Route) передается в `createRoutes`:

```ts
import { createRoutes, createRouter } from 'reactive-route';
import { adapters } from 'reactive-route/adapters/{reactive-system}';

const routes = createRoutes({
  home: { // Config
    path: '/',
    loader: () => import('./pages/home'),
  }
});

export const router = createRouter({ routes, adapters });

// somewhere
await router.redirect({ name: 'home' });
```


`loader` ожидает, что компонент страницы будет в экспорте `default`. 

:::info Не рекомендуется
вместо асинхронного импорта сразу передавать компонент `loader: () => Promise.resolve({ default: HomePage })`. 
Это создает риск возникновения циклических импортов.
:::


<Accordion title="Почему именно объект, а не массив?">

<!-- @include: ./../hidden/step-by-step/why-object.md -->

</Accordion>


<Accordion title="Почему loader принимает нативный асинхронный импорт вместо тела компонента?">

<!-- @include: ./../hidden/step-by-step/why-loader.md -->

</Accordion>

При необходимости можно объявлять `path` с переменными, в этом случае для каждой
переменной необходим валидатор.

<Accordion title="TypeScript 5 умеет автоматически выводить типы из строк">

<!-- @include: ./../hidden/step-by-step/ts5-types.md -->

</Accordion>

Исходя из философии роутера, не поддерживаются все нетипизируемые
паттерны - такие как файловый роутинг `posts/$postId/$/$.tsx` или 
в объявленный внутри UI `<Route path="untyped[?-partial]-string/:id/:id/:id">`.
Коллизии имен и опциональность полностью ломают статический анализ.

Reactive Route имеет плоскую структуру конфигурации, что позволяет
обеспечить **реальную** типобезопасность и побудить валидировать данные
(в URL браузера пользователь может ввести любые значения и использовать 
уязвимости, поэтому хорошая практика - никогда им не доверять, особенно с SSR).


## Экспорт

Рекомендуется использовать Context API для передачи роутера в компоненты. 

:::info Но вы можете сами выбрать схему
Экспорт с помощью Singleton-паттерна (как в предыдущем примере) проще
и подходит для CSR-проектов, но в определенных архитектурах может
привести к циклическим зависимостям. Также для SSR необходимо изолировать
данные пользователей, пересоздавая сущности на каждый запрос, 
поэтому Singleton неприменим.
:::

<!-- @include: @snippets/getting-started/router.md -->

<Accordion title="Наличие `notFound` и `internalError` обязательно">

<!-- @include: ./../hidden/step-by-step/errors.md -->

</Accordion>

## Запуск

Роутер готов к работе, осталось найти первоначальный `Config`,
который соответствует URL браузера и отобразить компонент страницы.

<!-- @include: @snippets/getting-started/render.md -->