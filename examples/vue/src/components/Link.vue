<script setup lang="ts" generic="TName extends keyof TypeConfigsProject">
import { TypePayload } from 'reactive-route';
import { computed } from 'vue';

import { TypeConfigsProject, useRouter } from '../router';

const props = defineProps<{
  payload: TypePayload<TypeConfigsProject, TName>;
}>();

const { router } = useRouter();

const state = computed(() => router.payloadToState(props.payload));

const handleClick = (event: MouseEvent) => {
  event.preventDefault();

  void router.redirect(props.payload);
};
</script>

<template>
  <a :href="state.url" @click="handleClick">
    <slot />
  </a>
</template>
