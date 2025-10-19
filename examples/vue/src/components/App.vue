<script lang="ts" setup>
import { provideStore } from './useStore';
import Router from './Router.vue';

const props = defineProps<{ router: any }>();
provideStore({ router: props.router });
</script>

<template>
  <Router />
</template>
