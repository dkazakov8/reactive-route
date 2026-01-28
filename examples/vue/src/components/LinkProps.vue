<script setup lang="ts" generic="TName extends keyof TypeRoutesProject">
import { TypePayload } from 'reactive-route';
import { computed } from 'vue';

import { TypeRoutesProject, useRouter } from '../router';

const props = defineProps<TypePayload<TypeRoutesProject, TName>>();

const { router } = useRouter();

const payload = computed(() => {
  return {
    name: props.name,
    query: (props as any).query,
    params: (props as any).params,
  } as TypePayload<TypeRoutesProject, TName>;
});

const state = computed(() => router.payloadToState(payload.value));

const handleClick = (event: MouseEvent) => {
  event.preventDefault();

  void router.redirect(payload.value);
};
</script>

<template>
  <a :href="state.url" @click="handleClick">
    <slot />
  </a>
</template>
