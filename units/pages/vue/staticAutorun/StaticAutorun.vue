<template>StaticAutorun</template>

<script setup lang="ts">
import { useRouterStore } from '../useRouterStore';

const props = defineProps<{
  spy_pageRender: () => void;
  spy_pageAutorun: (arg: any) => void;
}>();

const { router } = useRouterStore();
const { adapters } = router.getGlobalArguments();

const currentState = router.state.autorun!;

props.spy_pageRender();

adapters.autorun(() => {
  props.spy_pageAutorun(currentState.name);
});
</script>
