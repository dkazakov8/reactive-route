<template>StaticAutorun</template>

<script setup lang="ts">
import type { TypeRouter } from 'reactive-route';

const props = defineProps<{
  renderSpy: () => void;
  autorunSpy: (arg: any) => void;
  router: TypeRouter<any>;
}>();

props.renderSpy();

props.router.adapters.autorun(() => {
  props.autorunSpy(props.router.currentRoute.name);
});
</script>
