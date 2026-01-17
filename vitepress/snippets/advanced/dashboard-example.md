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