<script lang="ts" setup>
import { Router } from 'reactive-route/vue';

import { useRouter } from '../router';

const { router } = useRouter();
</script>

<template>
  <Router :router="router" />
</template>
