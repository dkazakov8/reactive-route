::: code-group
```tsx [React]
export default function PageDashboard() {
  const { router } = useContext(RouterContext);

  const pageState = router.state.dashboard!;
  
  return (
    <Layout editMode={pageState.query.editMode || '0'}>
      {pageState.params.tab === 'table' && <Table />}
      {pageState.params.tab === 'widgets' && <Widgets />}
      {pageState.params.tab === 'charts' && <Charts />}
    </Layout>
  );
}
```
```tsx [Preact]
export default function PageDashboard() {
  const { router } = useContext(RouterContext);

  const pageState = router.state.dashboard!;
  
  return (
    <Layout editMode={pageState.query.editMode || '0'}>
      {pageState.params.tab === 'table' && <Table />}
      {pageState.params.tab === 'widgets' && <Widgets />}
      {pageState.params.tab === 'charts' && <Charts />}
    </Layout>
  );
}
```
```tsx [Solid]
export default function PageDashboard() {
  const { router } = useContext(RouterContext);
  
  const pageState = () => router.state.dashboard!;

  return (
    <Layout editMode={pageState().query.editMode || '0'}>
      <Switch>
        <Match when={pageState().params.tab === 'table'}><Table /></Match>
        <Match when={pageState().params.tab === 'widgets'}><Widgets /></Match>
        <Match when={pageState().params.tab === 'charts'}><Charts /></Match>
      </Switch>
    </Layout>
  );
}
```
```vue [Vue]
<script lang="ts" setup>
import { useRouterStore } from './router';

const { router } = useRouterStore();

const pageState = router.state.dashboard!;
</script>

<template>
  <Layout :edit-mode="pageState.query.editMode || '0'">
    <Table v-if="pageState.params.tab === 'table'" />
    <Widgets v-else-if="pageState.params.tab === 'widgets'" />
    <Charts v-else-if="pageState.params.tab === 'charts'" />
  </Layout>
</template>
```
:::