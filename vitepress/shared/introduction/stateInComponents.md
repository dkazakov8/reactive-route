::: code-group
```tsx [React]
// pages/user/index.tsx

import { useRouter } from 'router';

export default function PageUser() {
  const { router } = useRouter();

  const routeState = router.state.user!;
  
  console.log(routeState);
  
  return (
    <>
      ID: {routeState.params.id}
      Phone: {routeState.query.phone}
    </>
  )
}

// console output (Observable object)
<!-- @include: @shared/state.md -->
```
```tsx [Preact]
// pages/user/index.tsx

import { useRouter } from 'router';

export default function PageUser() {
  const { router } = useRouter();

  const routeState = router.state.user!;

  console.log(routeState);

  return (
    <>
      ID: {routeState.params.id}
      Phone: {routeState.query.phone}
    </>
  )
}

// console output (Observable object)
<!-- @include: @shared/state.md -->
```
```tsx [Solid]
// pages/user/index.tsx

import { useRouter } from 'router';

export default function PageUser() {
  const { router } = useRouter();

  console.log(router.state.user);

  return (
    <>
      ID: {router.state.user!.params.id}
      Phone: {router.state.user!.query.phone}
    </>
  )
}

// console output (Observable object)
<!-- @include: @shared/state.md -->
```
```vue [Vue]
// pages/user/User.vue

<script lang="ts" setup>
  import { useRouter } from 'router';

  const { router } = useRouter();

  const routeState = router.state.user!;

  console.log(routeState);
</script>

<template>
  ID: {routeState.params.id}
  Phone: {routeState.query.phone}
</template>

<script lang="ts">
// console output (Observable object)
<!-- @include: @shared/state.md -->
</script>
```
:::