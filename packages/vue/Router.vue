<script lang="ts" setup generic="TRoutes extends TypeRoutesDefault">
import {
  handleComponentRerender,
  type PropsRouter,
  type TypeRouterLocalObservable,
  type TypeRoutesDefault,
} from 'reactive-route';

defineOptions({ name: 'ReactiveRouteRouter' });

const props = defineProps<PropsRouter<TRoutes>>();

const { adapters } = props.router.getGlobalArguments();

let Component: any;

const localObservable: TypeRouterLocalObservable = adapters.makeObservable({
  renderedName: undefined,
  props: {},
});

adapters.autorun(() =>
  handleComponentRerender(props, localObservable, (component) => {
    Component = component;
  })
);
</script>

<template>
  <component :is="Component" v-if="localObservable.renderedName" v-bind="localObservable.props" />
</template>
