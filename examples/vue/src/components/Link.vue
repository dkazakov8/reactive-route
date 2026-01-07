<script setup lang="ts" generic="TName extends keyof TypeConfigsProject">
import { TypeStateDynamic } from 'reactive-route';
import { computed } from 'vue';

import { TypeConfigsProject, useRouter } from '../router';

const props = defineProps<{
  to: TypeStateDynamic<TypeConfigsProject, TName> & { replace?: boolean };
}>();

const { router } = useRouter();

const url = computed(() => router.stateToUrl(props.to));
</script>

<template>
  <a :href="url" @click.prevent="router.redirect(props.to)">
    <slot />
  </a>
</template>
