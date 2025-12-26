<script lang="ts" setup>
import { Router as RouterVue } from 'reactive-route/vue';

import { useStore } from './useStore';

const { router } = useStore();
</script>

<template>
  <RouterVue :router="router" />
</template>
