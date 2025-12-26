<script lang="ts" setup>
import type { PropsRouter, TypeRouteConfig, TypeRouterLocalObservable } from 'reactive-route';
import { handleComponentRerender } from 'reactive-route';
import { computed, markRaw, onBeforeUnmount, ref, toRaw } from 'vue';

defineOptions({ name: 'ReactiveRouteRouter' });

const props = defineProps<PropsRouter<Record<string, TypeRouteConfig>>>();

const { adapters, routes } = props.router.getGlobalArguments();

const disposerRef = ref<null | (() => void)>(null);

const localObservable: TypeRouterLocalObservable = adapters.makeObservable({
  renderedRouteName: undefined,
  currentProps: {},
});

if (adapters.immediateSetComponent) {
  handleComponentRerender(props, localObservable);
}

const disposer = adapters.autorun(() => handleComponentRerender(props, localObservable));

/* v8 ignore if -- @preserve */
if (typeof disposer === 'function') disposerRef.value = disposer;

onBeforeUnmount(() => {
  disposerRef.value?.();
});

const LoadedComponent = computed(() => {
  const comp = routes[localObservable.renderedRouteName as any]?.component;

  return comp ? markRaw(toRaw(comp)) : null;
});
</script>

<template>
  <component :is="LoadedComponent" v-if="LoadedComponent" v-bind="localObservable.currentProps" :router="props.router"  />
</template>
