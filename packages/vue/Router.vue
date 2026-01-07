<script lang="ts" setup generic="TConfigs extends TypeConfigsDefault">
import {
  handleComponentRerender,
  type PropsRouter,
  type TypeConfigsDefault,
  type TypeRouterLocal,
} from 'reactive-route';

defineOptions({ name: 'ReactiveRouteRouter' });

const props = defineProps<PropsRouter<TConfigs>>();

const { adapters } = props.router.getGlobalArguments();

let ComponentRef: any;
let componentPropsRef: Record<string, any> = {};

const localState: TypeRouterLocal = { renderedName: undefined };

adapters.autorun(() =>
  handleComponentRerender(props, localState, (component, componentProps) => {
    if (ComponentRef !== component) {
      ComponentRef = component;
    }

    componentPropsRef = componentProps;
  })
);
</script>

<template>
  <component :is="ComponentRef" v-if="props.router.activeName" v-bind="componentPropsRef" />
</template>
