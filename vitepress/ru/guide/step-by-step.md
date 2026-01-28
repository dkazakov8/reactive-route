# Пошаговая настройка

## Установка

<!-- @include: @/snippets/getting-started/install.md -->

Reactive Route - это единый npm-пакет без каких-либо dependencies с независимыми
интеграционными модулями. Ядро для всех вариантов интеграций одинаковое с 
единым синтаксисом.

Для интеграции в ваш стек нужно импортировать соответствующие модули - например,
если используется React + MobX, то необходимо импортировать компонент роутера
из `reactive-route/react`, а адаптер реактивности из `reactive-route/adapters/mobx-react`.
Подразумевается, что в проекте уже установлены необходимые peer dependencies 
(они уникальны для каждого стека и описаны в секции "Интеграции").

Таким образом, Reactive Route бесшовно подстраивается под каждый стек, и можно
писать приложения на любом фреймворке (React, Preact, Solid, Vue и т.п.) 
с единым синтаксисом, лишь используя разные импорты для модулей. В бандл приложения
попадет только то, что соответствует стеку, без необходимости настраивать tree
shaking в бандлере.

Полная карта модулей:

<<< @/../vitepress/modulesMap.ts

## Создание Configs

Один из базовых концептов Reactive Route - это `Config`, объект с
определенным ключом, передаваемый в `createRoutes`:

```ts
import { createRoutes, createRouter } from 'reactive-route'
import { adapters } from 'reactive-route/adapters/{reactive-system}'

const routes = createRoutes({
  home: { // Config
    path: '/',
    loader: () => import('./pages/home'),
  }
})

const router = createRouter({ routes, adapters })

// если нужно сделать редирект на этот Config
await router.redirect({ name: 'home' })
```
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

`loader` ожидает, что компонент страницы будет в экспорте `default`. При необходимости можно
использовать и именованные экспорты или сразу передавать компоненты `loader: () => Promise.resolve({ default: MyComponent })`,
если code splitting не планируется использовать. Однако это добавляет риск возникновения циклических импортов,
поэтому лучше использовать рекомендованный подход.

При необходимости можно объявлять `path` с переменными, в этом случае для каждой
переменной необходим валидатор. TypeScript > 5 умеет автоматически выводить необходимые
типы:

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

Таким образом уже на этапе конфигурации заметны преимущества современной типизации.
Практически ни один из роутеров, декларирующих "100% type safety", не предоставляет
таких возможностей из-за динамического функционала (Nested Routes, wildcard path, 
filename-based routing `src/pages/posts/$postId/$/$.tsx`, 
UI-driven routes `<Route path="untyped[?-partial]-string/:id/:id/:id" />`).

Разработчиков библиотек роутеров можно понять - эти практики бывают полезны, когда
не используются реактивные библиотеки (MobX, Solid signals, vue-reactive), а
сама библиотека пишется только для 1 стека с предгенерацией типов
из AST дерева компонентов или структуры файлов. Но в реактивных мутабельных 
подходах есть более эффективные подходы достичь того же самого без потери типов.

Reactive Route имеет плоскую статичную структуру конфигурации, что позволяет
обеспечить **реальную** типобезопасность и стабильность
работы с внешними данными благодаря обязательной валидации
(в URL браузера пользователь может ввести любые значения и использовать 
уязвимости, поэтому хорошая практика - никогда им не доверять, особенно с SSR).


## Рекомендованный способ подключения

Рекомендуется использовать Context API для передачи роутера в компоненты. Это
позволяет избежать циклических зависимостей, создания нескольких экземпляров и добавляет возможность
SSR.

Пример файла `router.ts` (при необходимости можно объединить с другими контекстами, если они используются):

<!-- @include: @/snippets/getting-started/router.md -->

`notFound` и `internalError` обязательны для обработки ошибок в библиотеке, 
в их конфигурации не допускаются `params` и `query`.

<details>
  <summary>Зачем эти 2 страницы сделаны обязательными?</summary>

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

Роутер готов к работе и передаче в компоненты, однако необходимо синхронизировать
его с URL браузера (найти подходящий `Config` и загрузить компонент) и отрендерить
страницу внутри вашего App. 

Как обычно для Reactive Route - для этого нужно всего
несколько строк кода без лишнего бойлерплейта (ограничение по размеру < 2 КБ
заставляет оптимизировать код библиотеки).

## Рендеринг и проброс контекста

Для примера используется CSR (client-only rendering) как наиболее
распространенный, хотя версия для [SSR](/ru/guide/ssr) отличается только способом
рендеринга в DOM (`hydrate` вместо `render`). 

<!-- @include: @/snippets/getting-started/render.md -->

Всё настроено и готово к использованию. В дальнейшем потребуется только добавлять или редактировать
конфигурацию маршрутов.