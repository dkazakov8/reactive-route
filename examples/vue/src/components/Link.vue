<script setup lang="ts" generic="TName extends keyof TypeRoutesProject">
import { TypePayload } from 'reactive-route';
import { computed } from 'vue';

import { TypeRoutesProject, useRouter } from '../router';

const props = defineProps<{
  payload: TypePayload<TypeRoutesProject, TName>;
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
