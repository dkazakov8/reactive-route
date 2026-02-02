<script setup lang="ts">
import { ref, useId } from 'vue';

const props = defineProps<{
  frameworks: Array<string>;
}>();

const id = useId();
const activeTab = ref(props.frameworks[0]);

function select(framework: string) {
  activeTab.value = framework;
}
</script>

<template>
  <div class="vp-code-group">
    <div class="tabs">
      <template v-for="(f, index) in frameworks" :key="f">
        <input
          type="radio"
          :name="`group-${id}`"
          :id="`tab-${id}-${index}`"
          :checked="activeTab === f"
          @change="select(f)"
        />
        <label :for="`tab-${id}-${index}`" :data-title="f">
          {{ f }}
        </label>
      </template>
    </div>
    <div class="blocks">
      <div
        v-for="f in frameworks"
        :key="f"
        class="block"
        :class="{ active: activeTab === f }"
      >
        <slot :name="f" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.vp-code-group {
  & :deep(.vp-code-group) {
    margin-top: 0 !important;
  }

  & :deep(.blocks) {
    border: none !important;
  }

  & .block {
    display: none;

    &.active {
      display: block;
    }
  }
}
</style>