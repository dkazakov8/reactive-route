<template>StaticAutorun</template>

<script setup lang="ts">
import { useRouterStore } from '../useRouterStore';

const props = defineProps<{
  spy_pageRender: (props?: any) => void;
  spy_pageAutorun: (arg: any) => void;
  date?: any;
  dateInst?: any;
  someClass?: any;
  someInst?: any;
}>();

const { router } = useRouterStore();
const { adapters } = router.getGlobalArguments();

const currentState = router.state.autorun!;

props.spy_pageRender(props);

adapters.autorun(() => {
  props.spy_pageAutorun(currentState.name);
});
</script>
