<script setup lang="ts">
import { useRoute } from 'vitepress';
import { onMounted, onUnmounted, ref, watch } from 'vue';

const frameworks = ['React', 'Preact', 'Solid', 'Vue'];
const activeFramework = ref('');
const route = useRoute();
const isOpen = ref(false);
const container = ref<HTMLElement | null>(null);

function updateCodeGroups(framework: string) {
  const codeGroups = document.querySelectorAll('.vp-code-group');

  codeGroups.forEach((group) => {
    if (group === container.value) return;

    const labels = Array.from(group.querySelectorAll('label'));
    const targetLabel = labels.find((l) => l.textContent.trim() === framework);

    if (targetLabel) {
      const inputId = targetLabel.getAttribute('for');

      if (inputId) {
        const input = document.getElementById(inputId) as HTMLInputElement;

        if (input && !input.checked) {
          input.checked = true;
          const group = input.parentElement?.parentElement;
          if (group) {
            const i = Array.from(group.querySelectorAll('input')).indexOf(input);
            if (i >= 0) {
              const blocks = group.querySelector('.blocks');
              if (blocks && blocks.children.length > i) {
                const current = Array.from(blocks.children).find((child) =>
                  child.classList.contains('active')
                );
                const next = blocks.children[i];
                if (next && current !== next) {
                  current?.classList.remove('active');
                  next.classList.add('active');
                  window.dispatchEvent(
                    new CustomEvent('vitepress:codeGroupTabActivate', { detail: next })
                  );
                }
              }
            }
          }
        }
      }
    }
  });
}

function select(framework: string, skipStorageEvent = false) {
  if (!frameworks.includes(framework)) return;

  activeFramework.value = framework;

  localStorage.setItem('vitepress-framework-preference', framework);

  if (!skipStorageEvent) {
    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'vitepress-framework-preference',
        newValue: framework,
      })
    );
  }

  updateCodeGroups(framework);
}

const onStorage = (e: StorageEvent) => {
  if (e.key === 'vitepress-framework-preference' && e.newValue && frameworks.includes(e.newValue)) {
    activeFramework.value = e.newValue;
    updateCodeGroups(e.newValue);
  }
};

const onClick = (e: MouseEvent) => {
  const target = e.target as HTMLElement;

  if (target.matches('.vp-code-group input')) {
    const group = target.parentElement?.parentElement;
    if (group && !container.value?.contains(group)) {
      const label = group.querySelector(`label[for="${target.id}"]`);
      if (label) {
        select(label.textContent?.trim() || '');
      }
    }
  }

  const labelElement = target.closest('.vp-code-group label');
  const dropdown = container.value?.querySelector('.dropdown');

  if (labelElement) {
    const framework = labelElement.textContent?.trim();

    select(framework);

    if (dropdown?.contains(labelElement)) {
      isOpen.value = false;
    }
  }

  if (container.value && !container.value.contains(target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  const savedFramework = localStorage.getItem('vitepress-framework-preference');

  if (savedFramework && frameworks.includes(savedFramework)) {
    activeFramework.value = savedFramework;
  } else {
    activeFramework.value = frameworks[0];
  }

  window.addEventListener('storage', onStorage);
  window.addEventListener('click', onClick, { capture: true });

  // Initial sync
  setTimeout(() => {
    updateCodeGroups(activeFramework.value);
  }, 1);
});

// Re-sync on route change
watch(
  () => route.path,
  () => {
    setTimeout(() => {
      updateCodeGroups(activeFramework.value);
    }, 1);
  }
);

onUnmounted(() => {
  window.removeEventListener('storage', onStorage);
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
        v-for="f in frameworks"
        :key="f"
        class="option"
        :class="{ active: f === activeFramework }"
      >
        <label :data-title="f">{{ f }}</label>
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
