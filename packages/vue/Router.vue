<script lang="ts" setup>
import {
  handleComponentRerender,
  type PropsRouter,
  type TypeRouterLocalObservable,
  type TypeRoutesDefault,
} from 'reactive-route';

defineOptions({ name: 'ReactiveRouteRouter' });

const props = defineProps<PropsRouter<TypeRoutesDefault>>();

const { adapters } = props.router.getGlobalArguments();

let Component: any;

const localObservable: TypeRouterLocalObservable = adapters.makeObservable({
  renderedRouteName: undefined,
  currentProps: {},
});

adapters.autorun(() =>
  handleComponentRerender(props, localObservable, (component) => {
    Component = component;
  })
);
</script>

<template>
  <component :is="Component" v-if="localObservable.renderedRouteName" v-bind="localObservable.currentProps" />
</template>
