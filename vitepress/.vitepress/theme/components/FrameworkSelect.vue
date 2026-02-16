<script setup lang="ts">
import { useRoute } from 'vitepress';
import { onMounted, onUnmounted, ref, watch } from 'vue';

import {
  activeFramework,
  frameworks,
  initFrameworkPreference,
  isFramework,
  selectFramework,
  TypeFramework,
} from '../useFramework';

const route = useRoute();
const isOpen = ref(false);
const container = ref<HTMLElement | null>(null);

function isInputElement(element: Element | null): element is HTMLInputElement {
  return element instanceof HTMLInputElement;
}

function getFrameworkLabel(group: Element, framework: TypeFramework): HTMLLabelElement | undefined {
  return Array.from(group.querySelectorAll<HTMLLabelElement>('label')).find(
    (label) => label.textContent?.trim() === framework
  );
}

function getInputIndex(group: HTMLElement, input: HTMLInputElement): number {
  return Array.from(group.querySelectorAll('input')).indexOf(input);
}

function getActiveBlock(blocks: Element): Element | undefined {
  return Array.from(blocks.children).find((block) => block.classList.contains('active'));
}

function syncCodeGroupBlocks(group: HTMLElement, input: HTMLInputElement, index: number): void {
  const blocks = group.querySelector('.blocks');

  if (!blocks || blocks.children.length <= index) {
    return;
  }

  const current = getActiveBlock(blocks);
  const next = blocks.children[index];
  if (current === next) {
    return;
  }

  if (current) {
    current.classList.remove('active');
  }

  next.classList.add('active');
  window.dispatchEvent(new CustomEvent('vitepress:codeGroupTabActivate', { detail: next }));
}

function syncCodeGroupInput(group: HTMLElement, input: HTMLInputElement): void {
  if (input.checked) {
    return;
  }

  input.checked = true;
  const groupElement = input.parentElement?.parentElement;
  if (!groupElement) {
    return;
  }

  const inputIndex = getInputIndex(groupElement, input);
  if (inputIndex < 0) {
    return;
  }

  syncCodeGroupBlocks(groupElement, input, inputIndex);
}

function updateCodeGroups(framework: TypeFramework) {
  const codeGroups = Array.from(document.querySelectorAll<HTMLElement>('.vp-code-group'));

  for (const codeGroup of codeGroups) {
    if (codeGroup === container.value) {
      continue;
    }

    const targetLabel = getFrameworkLabel(codeGroup, framework);

    if (!targetLabel) {
      continue;
    }

    const inputId = targetLabel.getAttribute('for');
    if (!inputId) {
      continue;
    }

    const inputElement = document.getElementById(inputId);
    if (!isInputElement(inputElement)) {
      continue;
    }

    syncCodeGroupInput(codeGroup, inputElement);
  }
}

function select(framework: string) {
  if (!isFramework(framework)) return;

  selectFramework(framework);
  updateCodeGroups(framework);
}

function handleCodeGroupInputClick(targetElement: HTMLElement): void {
  if (!targetElement.matches('.vp-code-group input') || !isInputElement(targetElement)) {
    return;
  }

  const groupElement = targetElement.parentElement?.parentElement;

  if (!groupElement || container.value?.contains(groupElement)) return;

  const labelElement = groupElement.querySelector<HTMLLabelElement>(
    `label[for="${targetElement.id}"]`
  );
  const frameworkLabel = labelElement?.textContent?.trim();

  if (frameworkLabel) {
    select(frameworkLabel);
  }
}

function handleLabelClick(targetElement: HTMLElement): void {
  const labelElement = targetElement.closest<HTMLLabelElement>('.vp-code-group label');
  if (!labelElement) {
    return;
  }

  const frameworkLabel = labelElement.textContent?.trim();
  if (frameworkLabel) {
    select(frameworkLabel);
  }

  const dropdown = container.value?.querySelector('.dropdown');
  if (dropdown?.contains(labelElement)) {
    isOpen.value = false;
  }
}

function handleOutsideClick(targetElement: HTMLElement): void {
  if (container.value && !container.value.contains(targetElement)) {
    isOpen.value = false;
  }
}

function onClick(event: MouseEvent): void {
  const targetElement = event.target instanceof HTMLElement ? event.target : null;
  if (!targetElement) {
    return;
  }

  handleCodeGroupInputClick(targetElement);
  handleLabelClick(targetElement);
  handleOutsideClick(targetElement);
}

function syncActiveFramework(): void {
  setTimeout(() => updateCodeGroups(activeFramework.value), 1);
}

onMounted(() => {
  initFrameworkPreference();

  window.addEventListener('click', onClick, { capture: true });

  syncActiveFramework();
});

watch(() => route.path, syncActiveFramework);

watch(activeFramework, updateCodeGroups);

onUnmounted(() => {
  window.removeEventListener('click', onClick, { capture: true });
});
</script>

<template>
  <div class="wrapper vp-code-group" ref="container">
    <button class="value" @click="isOpen = !isOpen" :class="{ open: isOpen }">
      <label :data-title="activeFramework">{{ activeFramework }}</label>
      <span class="arrow"></span>
    </button>
    <div v-if="isOpen" class="dropdown">
      <div
        v-for="frameworkOption in frameworks"
        :key="frameworkOption"
        class="option"
        :class="{ active: frameworkOption === activeFramework }"
      >
        <label :data-title="frameworkOption">{{ frameworkOption }}</label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
  margin-top: 0 !important;
  display: flex;
  align-items: center;
  margin-right: 12px;

  & .value {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: var(--vp-c-bg-alt);
    border-radius: 6px;
    padding: 0 10px;
    color: var(--vp-c-text-1);
    cursor: pointer;
    width: 100px;
    height: 40px;

    & label {
      cursor: pointer;
      margin: 0;
      font-size: 13px;
      font-weight: 500;
    }

    &:hover,
    &.open {
      background-color: var(--vp-c-bg-soft);

      & .arrow {
        transform: rotate(180deg);
      }
    }

    & .arrow {
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
      border-top: 4px solid var(--vp-c-text-2);
      transition: transform 0.2s;
    }
  }

  & .dropdown {
    position: absolute;
    top: 50px;
    left: 0;
    right: 0;
    margin-top: 4px;
    border-radius: 6px;
    box-shadow: var(--vp-shadow-3);
    z-index: 100;
    overflow: hidden;

    & .option {
      padding: 5px 10px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      background-color: var(--vp-c-bg-alt);

      &:hover {
        background-color: var(--vp-c-bg-soft);
      }

      &.active {
        background-color: var(--vp-c-bg-soft) !important;
      }

      & label {
        cursor: pointer;
        display: block;
        width: 100%;
      }
    }
  }
}
</style>
