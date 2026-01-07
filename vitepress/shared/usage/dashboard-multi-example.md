::: code-group
```tsx [React]
// with mobx adapter

import { autorun } from 'mobx'

function PageUser() {
  const { router } = useContext(RouterContext);
  
  const [ Layout, setLayout ] = useState();
  
  useEffect(() => autorun(() => {
    if (router.activeName === 'dashboard') {
      setLayout(View)
    } else if (router.activeName === 'dashboardEdit') {
      setLayout(Edit)
    } else if (router.activeName === 'dashboardAggregate') {
      setLayout(Aggregate)
    }
  }), []);
  
  if (!Layout) return null;
  
  return <Layout>Content</Layout>;
}
```
```tsx [Preact]
// with kr-observable adapter

import { autorun } from 'kr-observable'

function PageUser() {
  const { router } = useContext(RouterContext);
  
  const [ Layout, setLayout ] = useState();
  
  useEffect(() => autorun(() => {
    if (router.activeName === 'dashboard') {
      setLayout(View)
    } else if (router.activeName === 'dashboardEdit') {
      setLayout(Edit)
    } else if (router.activeName === 'dashboardAggregate') {
      setLayout(Aggregate)
    }
  }), []);
  
  if (!Layout) return null;
  
  return <Layout>Content</Layout>;
}
```
```tsx [Solid]
// with solid adapter

import { createMemo } from 'solid-js'

function PageUser() {
  const { router } = useContext(RouterContext);

  const Layout = createMemo(() => {
    if (router.activeName === 'dashboard') return View;
    if (router.activeName === 'dashboardEdit') return Edit;
    if (router.activeName === 'dashboardAggregate') return Aggregate;
    
    return null;
  });

  return (
    <Show when={Layout()}>
      {(Component) => <Component>Content</Component>}
    </Show>
  );
}
```
```vue [Vue]
<script lang="ts" setup>
// with vue adapter
  
import { computed } from 'vue';
import { useRouterStore } from './router';

const { router } = useRouterStore();

const Layout = computed(() => {
  if (router.activeName === 'dashboard') return View;
  if (router.activeName === 'dashboardEdit') return Edit;
  if (router.activeName === 'dashboardAggregate') return Aggregate;
  
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