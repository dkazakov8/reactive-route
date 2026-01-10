<script lang="ts" setup>
import { Router as RouterVue } from 'reactive-route/vue';

import { useRouterStore } from './useRouterStore';

const { router } = useRouterStore();
</script>

<template>
  <RouterVue :router="router" />
</template>
