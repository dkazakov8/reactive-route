<template>StaticAutorun</template>

<script setup lang="ts">
import type { TypeRouter } from 'reactive-route';

const props = defineProps<{
  spy_pageRender: () => void;
  spy_pageAutorun: (arg: any) => void;
  router: TypeRouter<any>;
}>();

const { router } = props;
const { adapters } = router.getConfig();

const currentRoute = router.currentRoute.staticRouteAutorun!;

props.spy_pageRender();

adapters.autorun(() => {
  props.spy_pageAutorun(currentRoute.name);
});
</script>
