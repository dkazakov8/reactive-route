<script lang="ts" setup>
import Router from './Router.vue';
import { provideStore } from './useStore';

const props = defineProps<{ router: any }>();
provideStore({ router: props.router });
</script>

<template>
  <Router />
</template>
