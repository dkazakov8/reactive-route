<script lang="ts" setup>
import Router from './Router.vue';
import { provideRouterStore } from './useRouterStore';

const props = defineProps<{ router: any }>();

provideRouterStore({ router: props.router });
</script>

<template>
  <Router />
</template>
