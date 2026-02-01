<script setup lang="ts">
defineProps<{
  title?: string;
}>();
</script>

<template>
  <details class="accordion">
    <summary class="summary">
      <span class="title">
        <slot name="title">{{ title }}</slot>
      </span>
      <span class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </span>
    </summary>
    <div class="content">
      <slot />
    </div>
  </details>
</template>

<style scoped>
.accordion {
  margin: 16px 0;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  transition: border-color 0.25s;

  & .summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    margin: 0;
    cursor: pointer;
    list-style: none;
    user-select: none;
    font-weight: 600;
    color: var(--vp-c-text-1);
    transition: background-color 0.25s;

    &::-webkit-details-marker {
      display: none;
    }

    &:hover {
      background-color: var(--vp-c-default-soft);
    }

    & .title {
      flex: 1;
    }

    & .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.25s;
      color: var(--vp-c-text-2);
    }
  }

  &[open] .icon {
    transform: rotate(180deg);
  }

  & .content {
    padding: 16px;
    border-top: 1px solid var(--vp-c-divider);
    background-color: var(--vp-c-bg-soft);

    & :deep(p) {
      margin: 0;

      & + :deep(p) {
        margin-top: 16px;
      }
    }
  }
}
</style>
