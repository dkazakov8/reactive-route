
::: code-group
```tsx [React]
import { LayoutLogin } from 'layouts/LayoutLogin'
import { LayoutAuthZone } from 'layouts/LayoutAuthZone'

function App() {
  const { router } = useRouter();
  
  const activeStateName = router.getActiveState()?.name;
  
  const Layout = ['login', 'restore', 'checkSms'].includes(activeStateName) 
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
  
  const activeStateName = router.getActiveState()?.name;
  
  const Layout = ['login', 'restore', 'checkSms'].includes(activeStateName) 
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

  const activeStateName = () => router.getActiveState()?.name;

  return (
    <Dynamic 
      component={['login', 'restore', 'checkSms'].includes(activeStateName()) 
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

  const activeStateName = computed(() => router.getActiveState()?.name);
  
  const Layout = computed(() => 
    ['login', 'restore', 'checkSms'].includes(activeStateName.value) 
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