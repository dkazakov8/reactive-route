
::: code-group
```tsx [React]
import { LayoutLogin } from 'layouts/LayoutLogin'
import { LayoutAuthZone } from 'layouts/LayoutAuthZone'

function App() {
  const { router } = useRouter();
  
  const Layout = ['login', 'restore'].includes(router.activeName!) 
    ? LayoutLogin 
    : LayoutAuthZone;
  
  return (
    <Layout>
      <Router router={router} />
    </Layout>
  );
}
```
```tsx [Preact]
import { LayoutLogin } from 'layouts/LayoutLogin'
import { LayoutAuthZone } from 'layouts/LayoutAuthZone'

function App() {
  const { router } = useRouter();

  const Layout = ['login', 'restore'].includes(router.activeName!)
    ? LayoutLogin
    : LayoutAuthZone;
  
  return (
    <Layout>
      <Router router={router} />
    </Layout>
  );
}
```
```tsx [Solid]
import { LayoutLogin } from 'layouts/LayoutLogin'
import { LayoutAuthZone } from 'layouts/LayoutAuthZone'

function App() {
  const { router } = useRouter();

  return (
    <Dynamic 
      component={['login', 'restore'].includes(router.activeName!) 
        ? LayoutLogin 
        : LayoutAuthZone
      }
    >
      <Router router={router} />
    </Dynamic>
  );
}
```
```vue [Vue]
<script lang="ts" setup>
  import { computed } from 'vue';
  import { useRouter } from '../../router';
  
  import LayoutLogin from 'layouts/LayoutLogin.vue'
  import LayoutAuthZone from 'layouts/LayoutAuthZone.vue'

  const { router } = useRouter();

  const Layout = computed(() => 
    ['login', 'restore'].includes(router.activeName!) 
      ? LayoutLogin 
      : LayoutAuthZone
  );
</script>

<template>
  <component :is="Layout">
    <Router :router="router" />
  </component>
</template>
```
:::