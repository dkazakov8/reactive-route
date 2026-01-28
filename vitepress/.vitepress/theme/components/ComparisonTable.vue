<script setup>
import { computed } from 'vue';

const props = defineProps({
  headers: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    required: true,
  },
});

// Simple markdown-like bold and inline code processing
const processContent = (content) => {
  if (typeof content !== 'string') return content;

  return content
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code>$1</code>');
};

const processedRows = computed(() => {
  return props.rows.map((row) => row.map((cell) => processContent(cell)));
});
</script>

<template>
  <div class="comparison-container">
    <table>
      <thead>
        <tr>
          <th v-for="header in headers" :key="header">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in processedRows" :key="index">
          <td v-for="(cell, cellIndex) in row" :key="cellIndex">
            <span v-html="cell"></span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.comparison-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}

th, td {
  padding: 12px 16px;
  border: 1px solid var(--vp-c-divider);

  &:nth-child(2) {
    width: 40%;
  }

  &:nth-child(3) {
    width: 40%;
  }
}

th:nth-child(2) {
  color: var(--vp-c-brand-1);
}


:deep(code) {
  padding: 3px 6px;
  border-radius: 4px;
  background-color: var(--vp-c-bg-soft);
  font-size: 0.9em;
}

th {
  background-color: var(--vp-c-bg-soft);
  font-weight: 600;
}

tr:nth-child(even) {
  background-color: var(--vp-c-bg-soft);
}

@media (max-width: 640px) {
  th, td {
    padding: 8px 12px;
    font-size: 14px;
  }
}
</style>
