<script lang="ts" setup>
import { history, TypePropsRouter, TypeRoute } from 'reactive-route';
import { computed, markRaw, onBeforeUnmount, reactive, ref, toRaw } from 'vue';

defineOptions({ name: 'ReactiveRouteRouter' });

const props = defineProps<TypePropsRouter<Record<string, TypeRoute>>>();

const disposerRef = ref<null | (() => void)>(null);

const config: {
  loadedComponentName?: string;
  loadedComponentPage?: string;
  currentProps: Record<string, any>;
} = props.router.adapters.makeObservable({
  loadedComponentName: undefined,
  loadedComponentPage: undefined,
  currentProps: {},
});

function redirectOnHistoryPop() {
  if (!history) return;

  history.listen((params) => {
    if (params.action !== 'POP') return;

    const previousRoutePathname = props.router.routesHistory[props.router.routesHistory.length - 2];

    if (previousRoutePathname === params.location.pathname) {
      props.router.routesHistory.pop();
    }

    void props.router.restoreFromURL({ pathname: history.location.pathname, replace: true });
  });
}

function setLoadedComponent() {
  const currentRouteName = props.router.currentRoute.name;
  const currentRoutePage = props.router.currentRoute.pageId;

  const componentConfig = props.router.routes[currentRouteName];

  let preventRedirect = false;
  if (props.router.isRedirecting) preventRedirect = true;
  else if (config.loadedComponentName === currentRouteName) {
    preventRedirect = true;
  } else if (config.loadedComponentPage != null && currentRouteName != null) {
    if (config.loadedComponentPage === currentRoutePage) {
      props.router.adapters.replaceObject(
        config.currentProps,
        'props' in componentConfig ? componentConfig.props! : {}
      );
      preventRedirect = true;
    }
  }

  if (preventRedirect) return;

  props.router.adapters.batch(() => {
    if (config.loadedComponentName) {
      props.beforeUpdatePageComponent?.();
    }

    props.beforeSetPageComponent?.(componentConfig);

    props.router.adapters.batch(() => {
      props.router.adapters.replaceObject(
        config.currentProps,
        'props' in componentConfig ? componentConfig.props! : {}
      );
      config.loadedComponentName = currentRouteName;
      config.loadedComponentPage = componentConfig.pageId;
    });
  });
}

if (props.router.adapters.immediateSetComponent) {
  setLoadedComponent();
}

const disposer = props.router.adapters.autorun(() => setLoadedComponent());

props.beforeMount?.();

redirectOnHistoryPop();

if (typeof disposer === 'function') disposerRef.value = disposer;

onBeforeUnmount(() => {
  disposerRef.value?.();
});

// biome-ignore lint/correctness/noUnusedVariables: false
const LoadedComponent = computed(() => {
  const comp = props.router.routes[config.loadedComponentName as any]?.component;

  return comp ? markRaw(toRaw(comp)) : null;
});
</script>

<template>
  <component :is="LoadedComponent" v-if="LoadedComponent" v-bind="config.currentProps" :router="props.router"  />
</template>
