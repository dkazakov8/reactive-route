<script lang="ts" setup>
import { routerSetLoadedComponent, TypePropsRouter, TypeRouteConfig } from 'reactive-route';
import { computed, markRaw, onBeforeUnmount, ref, toRaw } from 'vue';

defineOptions({ name: 'ReactiveRouteRouter' });

const props = defineProps<TypePropsRouter<Record<string, TypeRouteConfig>>>();

const { adapters, routes } = props.router.getGlobalArguments();

const disposerRef = ref<null | (() => void)>(null);

const config: {
  loadedComponentName?: string;
  loadedComponentPage?: string;
  currentProps: Record<string, any>;
} = adapters.makeObservable({
  loadedComponentName: undefined,
  loadedComponentPage: undefined,
  currentProps: {},
});

if (adapters.immediateSetComponent) {
  routerSetLoadedComponent(props, config);
}

const disposer = adapters.autorun(() => routerSetLoadedComponent(props, config));

props.beforeMount?.();

/* v8 ignore if -- @preserve */
if (typeof disposer === 'function') disposerRef.value = disposer;

onBeforeUnmount(() => {
  disposerRef.value?.();
});

const LoadedComponent = computed(() => {
  const comp = routes[config.loadedComponentName as any]?.component;

  return comp ? markRaw(toRaw(comp)) : null;
});
</script>

<template>
  <component :is="LoadedComponent" v-if="LoadedComponent" v-bind="config.currentProps" :router="props.router"  />
</template>
