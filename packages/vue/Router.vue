<script lang="ts" setup generic="TConfigs extends TypeConfigsDefault">
import {
  handleComponentRerender,
  type PropsRouter,
  type TypeConfigsDefault,
  type TypeRouterLocalObservable,
} from 'reactive-route';

defineOptions({ name: 'ReactiveRouteRouter' });

const props = defineProps<PropsRouter<TConfigs>>();

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
