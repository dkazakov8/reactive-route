<script setup>
defineProps({
  data: { type: Object, required: true },
});
</script>

<template>
  <div class="container">
    <div class="rowInfo">
      <span class="name"></span>
      <span class="sizeTitle">
        <strong>Minified</strong> <span class="compressedSize">/ + Brotli</span>
      </span>
    </div>
    <div v-for="lib in data.libs" :key="lib.name" class="row" :class="{ isPrimary: lib.name === 'reactive-route' }">
      <div class="rowInfo">
        <span class="name">
          {{ lib.name }} <span class="version" v-if="lib.version">v{{ lib.version }}</span>
        </span>
        <span class="size">
          <span class="multiplier" v-if="lib.multiplier > 0" :style="{ color: lib.color }">x{{ lib.multiplier }}</span>
          <strong>{{ lib.minified.toFixed(2) }} KB</strong>
          <span class="compressedSize">/ {{ lib.compressed.toFixed(2) }} KB</span>
        </span>
      </div>
      <div class="barContainer">
        <div 
          class="bar" 
          :style="{ width: (lib.minified / data.biggestLibMinified * 100) + '%', backgroundColor: lib.color }"
        >
          <div 
            class="compressedBar" 
            :style="{ width: (lib.compressed / lib.minified * 100) + '%' }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  margin-top: 32px;
  margin-bottom: 50px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.isPrimary .name {
  color: var(--vp-c-brand-1);
}
.rowInfo {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95em;
}
.name {
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}
.version {
  font-weight: 400;
  font-size: 0.85em;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
}
.size {
  font-family: var(--vp-font-family-mono);
  display: flex;
  align-items: center;
  gap: 8px;
}
.sizeTitle {
  display: flex;
  align-items: center;
  gap: 8px;
}
.multiplier {
  font-size: 0.85em;
  font-weight: 600;
}
.compressedSize {
  color: var(--vp-c-text-2);
  font-size: 0.9em;
}
.barContainer {
  height: 12px;
  background-color: var(--vp-c-bg-soft);
  border-radius: 6px;
  overflow: hidden;
  position: relative;
}
.bar, .compressedBar {
  height: 100%;
  border-radius: 6px;
  transition: width 1s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.compressedBar {
  background-color: rgba(255, 255, 255, 0.35);
}

@media (max-width: 640px) {
  .rowInfo {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
}
</style>
