import { ref, watch } from 'vue';

const STORAGE_KEY = 'vitepress-framework-preference';
export const frameworks = ['React', 'Preact', 'Solid', 'Vue'] as const;
export type TypeFramework = (typeof frameworks)[number];

export const activeFramework = ref<TypeFramework>(frameworks[0]);

let isInitialized = false;

export function isFramework(framework: unknown): framework is TypeFramework {
  return frameworks.includes(framework as TypeFramework);
}

export function initFrameworkPreference() {
  if (isInitialized || typeof window === 'undefined') return;

  isInitialized = true;

  const storedFramework = localStorage.getItem(STORAGE_KEY);

  if (isFramework(storedFramework)) {
    activeFramework.value = storedFramework;
  }

  window.addEventListener('storage', ({ key, newValue }) => {
    if (key !== STORAGE_KEY || !isFramework(newValue)) return;

    if (activeFramework.value !== newValue) activeFramework.value = newValue;
  });

  watch(activeFramework, (newValue) => {
    const storedValue = localStorage.getItem(STORAGE_KEY);

    if (storedValue !== newValue) localStorage.setItem(STORAGE_KEY, newValue);
  });
}

export function selectFramework(framework: TypeFramework) {
  if (typeof window === 'undefined' || activeFramework.value === framework) return;

  activeFramework.value = framework;
}
