<script setup lang="ts" generic="TName extends keyof TypeConfigsProject">
import { TypeStateDynamic } from 'reactive-route';
import { computed } from 'vue';

import { TypeConfigsProject, useRouter } from '../router';

const props = defineProps<TypeStateDynamic<TypeConfigsProject, TName> & { replace?: boolean }>();

const { router } = useRouter();

const stateDynamic = computed(() => {
  return {
    name: props.name,
    query: (props as any).query,
    params: (props as any).params,
    replace: props.replace,
  } as TypeStateDynamic<TypeConfigsProject, TName> & { replace?: boolean };
});

const url = computed(() => router.stateToUrl(stateDynamic.value));
</script>

<template>
  <a :href="url" @click.prevent="router.redirect(stateDynamic)">
    <slot />
  </a>
</template>