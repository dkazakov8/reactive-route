# Установка и настройка

<!-- @include: @snippets/getting-started/install.md -->

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

```ts
import { createConfigs, createRouter } from 'reactive-route';
import { adapters } from 'reactive-route/adapters/{reactive-system}';

const configs = createConfigs({
  home: { // Config
    path: '/',
    loader: () => import('./pages/home'),
  }
});

export const router = createRouter({ configs, adapters });

// somewhere
await router.redirect({ name: 'home' });
```


`loader` ожидает, что компонент страницы будет в экспорте `default`. 

:::info Не рекомендуется
сразу передавать компонент `loader: () => Promise.resolve({ default: HomePage })`,
так как создает риск возникновения циклических импортов.
:::


<Accordion title="Почему именно объект, а не массив?">

<!-- @include: ./includes/why-object.md -->

</Accordion>


<Accordion title="Почему loader принимает нативный асинхронный импорт вместо тела компонента?">

<!-- @include: ./includes/why-loader.md -->

</Accordion>

При необходимости можно объявлять `path` с переменными, в этом случае для каждой
переменной необходим валидатор.

<Accordion title="TypeScript 5 умеет автоматически выводить типы из строк">

<!-- @include: ./includes/ts5-types.md -->

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

<!-- @include: ./includes/errors.md -->

</Accordion>

## Запуск

Роутер готов к работе, осталось найти первоначальный `Config`,
который соответствует URL браузера и отобразить компонент страницы.

<!-- @include: @snippets/getting-started/render.md -->