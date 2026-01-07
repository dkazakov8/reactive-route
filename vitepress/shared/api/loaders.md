::: code-group
```tsx [React]
function GlobalLoader() {
  const { router } = useContext(RouterContext);

  return router.isRedirecting ? <Loader/> : null;
}

function SomeComponent() {
  const { router } = useContext(RouterContext);

  return <Button isLoading={router.isRedirecting}>Send</Button>;
}
```
```tsx [Preact]
function GlobalLoader() {
  const { router } = useContext(RouterContext);

  return router.isRedirecting ? <Loader/> : null;
}

function SomeComponent() {
  const { router } = useContext(RouterContext);

  return <Button isLoading={router.isRedirecting}>Send</Button>;
}
```
```tsx [Solid]
function GlobalLoader() {
  const { router } = useContext(RouterContext);

  return <Show when={router.isRedirecting}><Loader/></Show>;
}

function SomeComponent() {
  const { router } = useContext(RouterContext);

  return <Button isLoading={router.isRedirecting}>Send</Button>;
}
```
```vue [Vue]
<script lang="ts" setup>
  import { useRouter } from '../../router';

  const { router } = useRouter();
</script>

<template>
  <Loader v-if="router.isRedirecting"/>

  <Button :is-loading="router.isRedirecting">Send</Button>
</template>
```
:::