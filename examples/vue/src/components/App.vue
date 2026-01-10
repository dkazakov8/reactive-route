<script lang="ts" setup>
import { Router } from 'reactive-route/vue';

import { useRouterStore } from '../router';

const { router } = useRouterStore();
</script>

<template>
  <Router :router="router" />
</template>
