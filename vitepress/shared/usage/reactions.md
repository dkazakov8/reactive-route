::: code-group
```tsx [React]
// with mobx adapter

import { autorun } from 'mobx'

function PageUser() {
  const { router } = useContext(RouterContext);

  const pageState = router.state.user!;
  
  useEffect(() => autorun(() => {
    console.log(pageState.params.id, pageState.query.phone);
  }), []);
}
```
```tsx [Preact]
// with kr-observable adapter

import { autorun } from 'kr-observable'

function PageUser() {
  const { router } = useContext(RouterContext);

  const pageState = router.state.user!;
  
  useEffect(() => autorun(() => {
    console.log(pageState.params.id, pageState.query.phone);
  }), []);
}
```
```tsx [Solid]
// with solid adapter

import { createRenderEffect } from 'solid-js'

function PageUser() {
  const { router } = useContext(RouterContext);

  const pageState = router.state.user!;

  createRenderEffect(() => {
    console.log(pageState.params.id, pageState.query.phone);
  })
}
```
```vue [Vue]
<script lang="ts" setup>
  // with vue adapter
  
  import { watchEffect } from 'vue';

  const { router } = useRouterStore();

  const pageState = router.state.user!;

  watchEffect(() => {
    console.log(pageState.params.id, pageState.query.phone);
  });
</script>
```
:::