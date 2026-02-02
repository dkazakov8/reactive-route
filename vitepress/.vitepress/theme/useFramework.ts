import { ref, watch } from 'vue';

const STORAGE_KEY = 'vitepress-framework-preference';
export const frameworks = ['React', 'Preact', 'Solid', 'Vue'] as const;
export type TypeFramework = (typeof frameworks)[number];

export const activeFramework = ref<string>('');

if (typeof window !== 'undefined') {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved && frameworks.includes(saved as TypeFramework)) {
    activeFramework.value = saved;
  } else {
    activeFramework.value = frameworks[0];
  }

  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY && e.newValue && frameworks.includes(e.newValue as TypeFramework)) {
      activeFramework.value = e.newValue;
    }
  });
}

watch(activeFramework, (newValue) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, newValue);
  }
});

export function selectFramework(framework: string) {
  if (frameworks.includes(framework as TypeFramework)) {
    activeFramework.value = framework;

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: STORAGE_KEY,
          newValue: framework,
        })
      );
    }
  }
}
