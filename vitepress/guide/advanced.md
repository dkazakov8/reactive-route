# Advanced

## Redirects chain

This library fully supports unlimited redirects in SPA / SSR.

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
  
  // Other routes
});
```

In this case if user goes to `/4` he will be redirected to `/3` then `/2` then `/1`. The intermediate
redirects are not reflected in Browser's history. Also, chunks for pages four, three, two will not 
be loaded if you configured async chunks in your bundler.

## Watch and react to params / query changes

`router.state` is **reactive**, so you can use it inside autorun / reaction / effect of your stack.
Here are some examples:

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

## Nested routes

Reactive Route will never support nested routes. It is built to be type-safe and plain, without
the pain of imagining how deep nested `Configs` should behave. Imagine this config:

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

It is impossible to write a type-safe router for such `Config` because of naming and validators 
collisions, partial `States` and unclear lifecycle.

Nested routes have a lot of edge cases:
- You have to figure out how the Components tree will be rendered and how they are linked and keep it in mind
- You spend a lot of time reading docs about how lifecycles will behave. Will 1st level `beforeEnter`
be called when 3rd level params or query changes? How to write a stable data-fetching flow?
Multiple redirects become brittle, too
- Refactoring is a nightmare – you have to rewrite the component structure, change how data is fetched, 
and update all internal links. Without the help from TS.
- Poor DX: no support for Find Usages or fast navigation in IDEs, limited support for autocomplete,
untyped redirects by partial pathname strings, etc.

But nesting also has its advantages, like automatic breadcrumbs generation and layouts scoping.
Reactive Route is plain, so it can't help with breadcrumbs, but for layouting there are several approaches.

## Layouts and dynamic components

There are three major ways to work with dynamic components:

1. Outside of the Router component as described in [router.getActiveRouteState](/guide/router-api#router-getactiveroutestate)

2. Inside the page component by reacting to dynamic params


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

  // Other routes
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

3. You may also set the same loader for several `Configs`. `beforeComponentChange` will not be 
called and the page component will **not** rerender when you go between these routes. But the active state will,
so it may be used for layouting. This example may look like the previous one, but let's choose
an approach with a reactive function

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

  // Other routes
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
    Content
  </component>
</template>
```
:::

You may notice that these three approaches solve a bit different problems, but it's just an example
of how to use Reactive Route in different scenarios.