<script setup lang="ts">
import { computed } from 'vue';

import { TypeTreeNode } from '../../../../scripts/createExamplesTree';

const props = defineProps<{
  node: TypeTreeNode;
  level: number;
  parentPath: string;
  selectedFile: TypeTreeNode | null;
  expandedDirs: Set<string>;
}>();

const emit = defineEmits<{
  (e: 'select', node: TypeTreeNode): void;
  (e: 'toggle', path: string): void;
}>();

const currentPath = computed(() =>
  props.parentPath ? `${props.parentPath}/${props.node.name}` : props.node.name
);

const isExpanded = computed(() => props.expandedDirs.has(currentPath.value));
const hasChildren = computed(() => (props.node.children?.length ?? 0) > 0);
const icon = computed(() =>
  hasChildren.value ? (isExpanded.value ? '.folder-open' : '.folder') : props.node.name
);

const isSelected = computed(
  () =>
    props.selectedFile?.name === props.node.name &&
    props.selectedFile?.content === props.node.content
);

const handleClick = () => {
  if (hasChildren.value) {
    emit('toggle', currentPath.value);
  } else {
    emit('select', props.node);
  }
};
</script>

<template>
  <div class="tree-item"  >
    <div 
      class="lineFile"
      :class="{
        'is-dir': hasChildren,
        'is-file': !hasChildren,
        'is-selected': isSelected
      }"
      :style="{ paddingLeft: `${12 * level}px` }"
      @click="handleClick"
    >
      <span class="name" :data-title="icon">{{ node.name }}</span>
    </div>
    <div v-if="hasChildren" v-show="isExpanded" class="children">
      <FileTreeItem
        v-for="child in node.children"
        :key="child.name"
        :node="child"
        :level="level + 1"
        :parent-path="currentPath"
        :selected-file="selectedFile"
        :expanded-dirs="expandedDirs"
        @select="$emit('select', $event)"
        @toggle="$emit('toggle', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.lineFile {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  cursor: pointer;
  border-radius: 4px;
  font-size: 13px;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  gap: 6px;

  &:hover {
    background-color: var(--vp-c-bg-soft);
  }

  &.is-selected {
    background-color: var(--vp-c-bg-soft);
    color: var(--vp-c-brand);
  }
}
</style>
