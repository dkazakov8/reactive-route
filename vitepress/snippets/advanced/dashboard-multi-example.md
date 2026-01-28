::: code-group
```tsx [React]
// with mobx adapter

import { autorun } from 'mobx'

function PageUser() {
  const { router } = useContext(RouterContext);
  
  const [ Layout, setLayout ] = useState();
  
  useEffect(() => {
    const disposer = autorun(() => {
      const activeState = router.getActiveState();
      
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
```tsx [Preact]
// with kr-observable adapter

import { autorun } from 'kr-observable'

function PageUser() {
  const { router } = useContext(RouterContext);
  
  const [ Layout, setLayout ] = useState();
  
  useEffect(() => {
    const disposer = autorun(() => {
      const activeState = router.getActiveState();
      
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
```tsx [Solid]
// with solid adapter

import { createMemo } from 'solid-js'

function PageUser() {
  const { router } = useContext(RouterContext);

  const Layout = createMemo(() => {
    const activeState = router.getActiveState();

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
```vue [Vue]
<script lang="ts" setup>
// with vue adapter
  
import { computed } from 'vue';
import { useRouterStore } from './router';

const { router } = useRouterStore();

const Layout = computed(() => {
  const activeState = router.getActiveState();

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