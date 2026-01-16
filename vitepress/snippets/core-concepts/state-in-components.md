::: code-group
```tsx [React]
// pages/user/index.tsx

import { useRouter } from '../../router';

export default function PageUser() {
  const { router } = useRouter();

  const routeState = router.state.user!;
  
  return (
    <>
      ID: {routeState.params.id}
      Phone: {routeState.query.phone}
    </>
  )
}
```
```tsx [Preact]
// pages/user/index.tsx

import { useRouter } from '../../router';

export default function PageUser() {
  const { router } = useRouter();

  const routeState = router.state.user!;

  return (
    <>
      ID: {routeState.params.id}
      Phone: {routeState.query.phone}
    </>
  )
}
```
```tsx [Solid]
// pages/user/index.tsx

import { useRouter } from '../../router';

export default function PageUser() {
  const { router } = useRouter();

  return (
    <>
      ID: {router.state.user!.params.id}
      Phone: {router.state.user!.query.phone}
    </>
  )
}
```
```vue [Vue]
// pages/user/User.vue

<script lang="ts" setup>
  import { useRouter } from '../../router';

  const { router } = useRouter();

  const routeState = router.state.user!;
</script>

<template>
  ID: {routeState.params.id}
  Phone: {routeState.query.phone}
</template>
```
:::