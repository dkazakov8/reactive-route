<script setup lang="ts">
import { computed, reactive, ref } from 'vue';

import { TypeTreeNode } from '../../../../scripts/createExamplesTree';
import FileTreeItem from './FileTreeItem.vue';

const props = defineProps<{
  framework: string;
  tree: Record<string, Array<TypeTreeNode>>;
}>();

const files = computed(() => props.tree[props.framework] ?? []);

const highlightedContent = computed(() => {
  const content = selectedFile.value?.content;
  if (!content) return '';

  if (content.startsWith('linked:')) {
    const link = content.replace('linked:', '');
    const [framework, ...pathParts] = link.split('/');
    const frameworkTree = props.tree[framework];

    if (!frameworkTree) return '';

    let currentNodes: Array<TypeTreeNode> | undefined = frameworkTree;
    let foundNode: TypeTreeNode | undefined;

    for (let i = 0; i < pathParts.length; i++) {
      const part = pathParts[i];
      const isLast = i === pathParts.length - 1;

      const node: TypeTreeNode | undefined = currentNodes?.find((n) => n.name === part);

      if (!node) break;

      if (isLast) {
        foundNode = node;
      } else {
        currentNodes = node.children;
      }
    }

    return foundNode?.content ?? '';
  }

  return content;
});

const expandedDirs = reactive(new Set<string>());

const findDefaultFile = (nodes: Array<TypeTreeNode>): TypeTreeNode | null => {
  for (const node of nodes) {
    if (node.isDefault) return node;

    if (node.children) {
      const found = findDefaultFile(node.children);

      if (found) return found;
    }
  }

  return null;
};

const selectedFile = ref<TypeTreeNode | null>(findDefaultFile(files.value));

function toggleDir(path: string) {
  if (expandedDirs.has(path)) expandedDirs.delete(path);
  else expandedDirs.add(path);
}

function selectFile(file: TypeTreeNode) {
  if (file.content != null) selectedFile.value = file;
}

const getPath = (name: string, parentPath = ''): string =>
  parentPath ? `${parentPath}/${name}` : name;

const expandToSelected = (nodes: Array<TypeTreeNode>, parentPath = ''): boolean => {
  for (const node of nodes) {
    const currentPath = getPath(node.name, parentPath);
    if (node.name === selectedFile.value?.name && node.content === selectedFile.value?.content) {
      return true;
    }
    if (node.children) {
      if (expandToSelected(node.children, currentPath)) {
        expandedDirs.add(currentPath);
        return true;
      }
    }
  }
  return false;
};

if (selectedFile.value) {
  expandToSelected(files.value);
}
</script>

<template>
  <div class="code-view-container">
    <div class="file-tree">
      <FileTreeItem
        v-for="node in files"
        :key="node.name"
        :node="node"
        :level="0"
        :parent-path="''"
        :selected-file="selectedFile"
        :expanded-dirs="expandedDirs"
        @select="selectFile"
        @toggle="toggleDir"
      />
    </div>
    <div class="file-content">
      <div v-if="selectedFile" class="content-wrapper">
        <div class="code-block" v-html="highlightedContent"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.code-view-container {
  display: flex;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  margin: 16px 0;
  height: 600px;
  background-color: var(--vp-c-bg-soft);

  & .file-tree {
    width: 220px;
    border-right: 1px solid var(--vp-c-divider);
    overflow-y: auto;
    padding: 12px 8px;
    user-select: none;
    background-color: var(--vp-c-bg-alt);
  }

  & .file-content {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    background-color: var(--vp-c-bg);

    & .content-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;

      & .code-block {
        flex: 1;
        overflow: auto;
        padding: 0;
        margin: 0;
        font-size: 15px;

        & :deep(> div[class*="language-"]) {
          margin: 0 !important;
          border-radius: 0 !important;
          height: 100%;
        }

        & :deep(pre) {
          margin: 0 !important;
          background-color: transparent !important;
        }
      }
    }
  }
}
</style>
