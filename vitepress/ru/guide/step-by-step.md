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

<details>
  <summary>Карта модулей</summary>

<<< @/modulesMap.ts

</details>

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


<details>
  <summary>Почему именно объект, а не массив?</summary>


Во многих роутерах используется похожий подход, однако часто конфигурация передается
массивом:

```ts
// vue-router
const routes = [
  { name: 'home', path: '/', component: Home }
]

// @kitbag/router
const routes = [
  createRoute({ name: 'home', path: '/', component: Home })
]
```

В этом случае могут быть коллизии имен, когда несколько имеют одинаковый `name`,
и TypeScript не подскажет об ошибке. Reactive Route использует более типобезопасный
подход, когда `name: 'home'` добавляется автоматически и равен ключу в объекте.

Также в библиотеке минимизировано количество бойлерплейта - не нужно на каждый
`Config` вызывать отдельную функцию или конструктор

```tsx
// mobx-router
const routes = {
  home: new Route({ path: '/', component: <Home /> })
}

// @tanstack/react-router
const rootRoute = createRootRoute()
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})
const routeTree = rootRoute.addChildren([indexRoute])
```

Достаточно верхнеуровнево обернуть в `createRoutes` - это самый минималистичный
и при этом типобезопасный подход среди всех библиотек для роутинга.

</details>


<details>
  <summary>Почему loader принимает нативный асинхронный импорт
вместо тела компонента?</summary>

- Это позволяет использовать встроенный в любой современный бандлер
  code-splitting
- Добавляется мощный механизм для управления модульной архитектурой, ведь
  `loader` может возвращать не только компонент, но и любые данные. Например,
  постраничные сторы или апи, и для них тоже будет работать code-splitting
- Решается проблема циклических зависимостей, характерная для многих
  роутеров, когда конфигурация импортирует компонент, а компонент в свою
  очередь импортирует конфигурацию. При изменении порядка импортов все может
  легко сломаться

```tsx
// mobx-router

// imports component in routes
import { Home } from 'components/Home';

export const routes = {
  home: new Route<RootStore>({
    path: '/',
    component: <Home />
  })
}

// imports routes in component
import { routes } from '../routes';

export const Home = observer(() => {
  const store = useContext(StoreContext);
  const { router: { goTo } } = store;

  return <Link router={store.router} route={routes.gallery} />
});
```

- Файлы загружаются только 1 раз, при последующем переходе на этот `Config`
  все берется из кеша
- При необходимости можно вручную предзагрузить чанки через `router.preloadComponent`

</details>

При необходимости можно объявлять `path` с переменными, в этом случае для каждой
переменной необходим валидатор.

<details>
  <summary>TypeScript 5 умеет автоматически выводить типы из строк</summary>

```ts
/** Для динамических Config необходимы валидаторы */

// TS2322: Type is not assignable to type 
// TypeConfigConfigurable<"/user/:id/:tab">
// Property "params" is missing but required in type 
// { params: { id: TypeValidator; tab: TypeValidator }; }
const routes = createRoutes({
  user: {
    path: '/user/:id/:tab',
    loader: () => import('./pages/user'),
  }
})

// No errors
const routes = createRoutes({
  user: {
    path: '/user/:id/:tab',
    params: {
      id: (value) => /^\d+$/.test(value),
      tab: (value) => ['settings', 'payments', 'general'].includes(value)
    },
    loader: () => import('./pages/user'),
  }
})

/** Для статических Config - наоборот, запрещены */

// TS2322: Type { foo: (value: string) => boolean; } 
// is not assignable to type "never"
const routes = createRoutes({
  home: {
    path: '/',
    params: {
      foo: (value) => value.length > 2,
    },
    loader: () => import('./pages/home'),
  }
})

// No errors
const routes = createRoutes({
  home: {
    path: '/',
    loader: () => import('./pages/home'),
  }
})
```

</details>

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

<details>
  <summary>Наличие <code>notFound</code> и <code>internalError</code> обязательно</summary>

В библиотеках для роутинга используются очень разные способы показа страниц ошибок:

```tsx
// vue-router
const routes = [
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]

// mobx-router
startRouter(
  routes,
  store,
  { notfound: () => store.router.goTo(YOUR_NOT_FOUND_ROUTE), }
);

// @kitbag/router
export const router = createRouter(routes, {
  rejections: [createRejection({
    type: 'NotFound',
    component: NotFoundPage,
  })]
})
```

Как правило, синтаксис их определения довольно сильно отличается от "обычных страниц",
хотя они ими и являются. Кроме того, роутеры не заставляют их описывать, что может
привести к отображению пустых страниц в браузере либо дефолтным "заглушкам". 

Философия Reactive Route подразумевает, что роутер должен помогать разработчику
не забывать о важных частях приложения, и в данном случае хорошая практика -
потратить 5 минут на создание страницы ошибок (или взять готовую из секции "Примеры").
На них можно переходить стандартно `router.redirect({ name: 'notFound' })` в целях
тестирования или при написании логики приложения.

А `internalError` будет отображена без замены URL в строке браузера, если допущены
синтаксические ошибки при описании жизненного цикла, и в ряде случаев пользователю
достаточно будет перезагрузить страницу. Например, в `beforeEnter` вы описали логику
подключения по Websocket к бэкенду, но в данный момент сервер был перегружен. Пользователь
перезагружает страницу - и подключение успешно, целевая страница отображена.

Но, разумеется, лучше не слишком полагаться на этот механизм - роутер здесь
представляет "последнюю линию обороны", чтобы не был отображен пустой экран, и
обеспечивая дополнительную консистентность приложению.

</details>

## Запуск

Роутер готов к работе, осталось найти первоначальный `Config`,
который соответствует URL браузера и отобразить компонент страницы.

<!-- @include: @snippets/getting-started/render.md -->