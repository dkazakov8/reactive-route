<script setup lang="ts">
import { useData } from 'vitepress';
import { computed } from 'vue';

import type { TypeDocLinks } from '../../typedLinks';
import { activeFramework } from '../useFramework';

const props = defineProps<{
  to: TypeDocLinks;
}>();

const { localeIndex, site } = useData();

const href = computed(() => {
  const lang = localeIndex.value === 'root' ? 'en' : localeIndex.value;
  let target = props.to as string;

  if (target === 'examples' || target === 'integration') {
    target = `${target}/${activeFramework.value.toLowerCase()}`;
  }

  return `${site.value.base}${lang}/${target}`;
});
</script>

<template>
  <a :href="href"><slot /></a>
</template>
