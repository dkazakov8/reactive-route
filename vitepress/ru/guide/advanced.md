# Продвинутое использование

## Цепочка редиректов (Redirects chain)

Библиотека полностью поддерживает неограниченное количество редиректов как в SPA, так и в SSR.

```typescript [routes.ts]
const routes = createRoutes({
  one: {
    path: '/1',
    loader: () => import('./pages/one'),
  },
  two: {
    path: '/2',
    loader: () => import('./pages/two'),
    async beforeEnter({ redirect }) {
      return redirect({ name: 'one' });
    },
  },
  three: {
    path: '/3',
    loader: () => import('./pages/three'),
    async beforeEnter({ redirect }) {
      return redirect({ name: 'two' });
    },
  },
  four: {
    path: '/4',
    loader: () => import('./pages/four'),
    async beforeEnter({ redirect }) {
      return redirect({ name: 'three' });
    },
  },
  
  // Другие маршруты
});
```

В этом случае, если пользователь перейдет на `/4`, он будет перенаправлен на `/3`, затем на `/2` и, наконец, на `/1`. Промежуточные редиректы не отражаются в истории браузера. Кроме того, чанки для страниц four, three, two не будут загружены, если вы настроили асинхронные чанки в своем сборщике.

## Наблюдение за изменениями параметров (Watch)

Объект `router.state` является **реактивным**, поэтому вы можете использовать его внутри autorun / reaction / effect вашего технологического стека. Вот несколько примеров:

::: code-group
```tsx [React + MobX]
import { autorun } from 'mobx'

function PageUser() {
  const { router } = useContext(RouterContext);

  const routeState = router.state.user!;
  
  useEffect(() => {
    const disposer = autorun(() => {
      console.log(routeState.params.id, routeState.query.phone);
    })

    return () => disposer();
  }, []);
}
```
```tsx [Preact + Observable]
import { autorun } from 'kr-observable'

function PageUser() {
  const { router } = useContext(RouterContext);

  const routeState = router.state.user!;
  
  useEffect(() => {
    const disposer = autorun(() => {
      console.log(routeState.params.id, routeState.query.phone);
    })

    return () => disposer();
  }, []);
}
```
```tsx [Solid + Solid]
import { createRenderEffect } from 'solid-js'

function PageUser() {
  const { router } = useContext(RouterContext);

  const routeState = router.state.user!;

  createRenderEffect(() => {
    console.log(routeState.params.id, routeState.query.phone);
  })
}
```
```vue [Vue + Vue]
<script lang="ts" setup>
  import { watchEffect } from 'vue';

  const { router } = useRouterStore();

  const routeState = router.state.user!;

  watchEffect(() => {
    console.log(routeState.params.id, routeState.query.phone);
  });
</script>
```
:::

## Вложенные маршруты (Nested routes)

Reactive Route никогда не будет поддерживать вложенные маршруты. Он создан для того, чтобы быть типобезопасным и плоским, без сложностей, связанных с тем, как должны вести себя глубоко вложенные конфигурации. Представьте такую конфигурацию:

```ts
const routes = createRoutes({
  home: {
    path: '/',
    loader: () => import('./pages/home'),
  },
  user: {
    path: '/user/:id',
    params: {
      id: (value) => /^\d+$/.test(value)
    },
    loader: () => import('./pages/user'),
    
    children: {
      user: {
        path: 'view/:id',
        params: {
          id: (value) => /[a-z]/.test(value)
        },
        loader: () => import('./pages/user/view'),
      }
    }
  },
});
```

Для такой конфигурации невозможно написать типобезопасный роутер из-за коллизий имен и валидаторов, частичных состояний и неясного жизненного цикла.

У вложенных маршрутов много пограничных случаев:
- Вам нужно представлять, как будет рендериться дерево компонентов и как они связаны.
- Вы тратите много времени на чтение документации о том, как будут вести себя жизненные циклы. Будет ли вызван `beforeEnter` первого уровня при изменении параметров или query третьего уровня? Как написать стабильный поток загрузки данных? Множественные редиректы также становятся хрупкими.
- Рефакторинг превращается в кошмар — вам нужно переписывать структуру компонентов, менять способ загрузки данных и обновлять все внутренние ссылки. И всё это без помощи TypeScript.
- Плохой DX: отсутствие поддержки "Find Usages" или быстрой навигации в IDE, ограниченная поддержка автодополнения, нетипизированные редиректы по строкам путей и т.д.

Однако у вложенности есть и свои преимущества, такие как автоматическая генерация хлебных крошек (breadcrumbs) и область видимости макетов (layouts). Reactive Route плоский, поэтому он не помогает с хлебными крошками, но для работы с макетами есть несколько подходов.

## Макеты и динамические компоненты

Существует три основных способа работы с динамическими компонентами:

1. Вне компонента Router, как описано в [router.getActiveRouteState](/ru/guide/router-api#router-getactiveroutestate)

2. Внутри компонента страницы, реагируя на динамические параметры

```ts
const routes = createRoutes({
  dashboard: {
    path: '/dashboard/:tab',
    params: {
      tab: (value) => ['table', 'widgets', 'charts'].includes(value)
    },
    query: {
      editMode: (value) => ['0', '1', '2'].includes(value)
    },
    loader: () => import('./pages/dashboard'),
  }

  // Другие маршруты
});
```

::: code-group
```tsx [React]
export default function PageDashboard() {
  const { router } = useContext(RouterContext);

  const routeState = router.state.dashboard!;
  
  return (
    <Layout editMode={routeState.query.editMode || '0'}>
      {routeState.params.tab === 'table' && <Table />}
      {routeState.params.tab === 'widgets' && <Widgets />}
      {routeState.params.tab === 'charts' && <Charts />}
    </Layout>
  );
}
```
```tsx [Preact]
export default function PageDashboard() {
  const { router } = useContext(RouterContext);

  const routeState = router.state.dashboard!;
  
  return (
    <Layout editMode={routeState.query.editMode || '0'}>
      {routeState.params.tab === 'table' && <Table />}
      {routeState.params.tab === 'widgets' && <Widgets />}
      {routeState.params.tab === 'charts' && <Charts />}
    </Layout>
  );
}
```
```tsx [Solid]
export default function PageDashboard() {
  const { router } = useContext(RouterContext);
  
  const routeState = () => router.state.dashboard!;

  return (
    <Layout editMode={routeState().query.editMode || '0'}>
      <Switch>
        <Match when={routeState().params.tab === 'table'}><Table /></Match>
        <Match when={routeState().params.tab === 'widgets'}><Widgets /></Match>
        <Match when={routeState().params.tab === 'charts'}><Charts /></Match>
      </Switch>
    </Layout>
  );
}
```
```vue [Vue]
<script lang="ts" setup>
import { useRouterStore } from './router';

const { router } = useRouterStore();

const routeState = router.state.dashboard!;
</script>

<template>
  <Layout :edit-mode="routeState.query.editMode || '0'">
    <Table v-if="routeState.params.tab === 'table'" />
    <Widgets v-else-if="routeState.params.tab === 'widgets'" />
    <Charts v-else-if="routeState.params.tab === 'charts'" />
  </Layout>
</template>
```
:::

3. Вы также можете установить один и тот же `loader` для нескольких конфигураций `Configs`. В этом случае `beforeComponentChange` не будет вызываться, и компонент страницы **не** будет перерендериваться при переходе между этими маршрутами. Однако активное состояние (active state) изменится, что можно использовать для работы с макетами. Этот пример может быть похож на предыдущий, но давайте выберем подход с реактивной функцией:

```ts
const routes = createRoutes({
  dashboard: {
    path: '/dashboard',
    loader: () => import('./pages/dashboard'),
  },
  dashboardEdit: {
    path: '/dashboard/edit',
    loader: () => import('./pages/dashboard'),
  },
  dashboardAggregate: {
    path: '/dashboard/aggregate',
    loader: () => import('./pages/dashboard'),
  }

  // Другие маршруты
});
```

::: code-group
```tsx [React + MobX]
import { autorun } from 'mobx'

function PageUser() {
  const { router } = useContext(RouterContext);
  
  const [Layout, setLayout] = useState();
  
  useEffect(() => {
    const disposer = autorun(() => {
      const activeState = router.getActiveRouteState();
      
      if (activeState?.name === 'dashboard') {
        setLayout(View)
      } else if (activeState?.name === 'dashboardEdit') {
        setLayout(Edit)
      } else if (activeState?.name === 'dashboardAggregate') {
        setLayout(Aggregate)
      }
    })

    return () => disposer();
  }, []);
  
  if (!Layout) return null;
  
  return <Layout>Content</Layout>;
}
```
```tsx [Preact + Observable]
import { autorun } from 'kr-observable'

function PageUser() {
  const { router } = useContext(RouterContext);
  
  const [Layout, setLayout] = useState();
  
  useEffect(() => {
    const disposer = autorun(() => {
      const activeState = router.getActiveRouteState();
      
      if (activeState?.name === 'dashboard') {
        setLayout(View)
      } else if (activeState?.name === 'dashboardEdit') {
        setLayout(Edit)
      } else if (activeState?.name === 'dashboardAggregate') {
        setLayout(Aggregate)
      }
    })

    return () => disposer();
  }, []);
  
  if (!Layout) return null;
  
  return <Layout>Content</Layout>;
}
```
```tsx [Solid + Solid]
import { createMemo } from 'solid-js'

function PageUser() {
  const { router } = useContext(RouterContext);

  const Layout = createMemo(() => {
    const activeState = router.getActiveRouteState();

    if (activeState?.name === 'dashboard') return View;
    if (activeState?.name === 'dashboardEdit') return Edit;
    if (activeState?.name === 'dashboardAggregate') return Aggregate;
    
    return null;
  });

  return (
    <Show when={Layout()}>
      {(Component) => <Component>Content</Component>}
    </Show>
  );
}
```
```vue [Vue + Vue]
<script lang="ts" setup>
import { computed } from 'vue';
import { useRouterStore } from './router';

const { router } = useRouterStore();

const Layout = computed(() => {
  const activeState = router.getActiveRouteState();

  if (activeState?.name === 'dashboard') return View;
  if (activeState?.name === 'dashboardEdit') return Edit;
  if (activeState?.name === 'dashboardAggregate') return Aggregate;
  
  return null;
});
</script>

<template>
  <component :is="Layout" v-if="Layout">
    Контент
  </component>
</template>
```
:::

Вы можете заметить, что эти три подхода решают немного разные задачи, но это всего лишь пример того, как использовать Reactive Route в различных сценариях.