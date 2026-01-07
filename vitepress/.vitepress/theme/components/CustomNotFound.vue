<script setup lang="ts">
import { useData } from 'vitepress';
import { VPButton } from 'vitepress/theme';
import { computed } from 'vue';

const { lang, site } = useData();

const isRu = computed(() => lang.value === 'ru');

const homeHref = computed(() => {
  const base = site.value.base.endsWith('/') ? site.value.base : `${site.value.base}/`;

  return isRu.value ? `${base}ru/` : base;
});

const title = computed(() => (isRu.value ? '404' : '404'));
const quote = computed(() =>
  isRu.value
    ? 'Страница, которую вы ищете, не существует.'
    : 'The page you are looking for does not exist.'
);
const linkText = computed(() => (isRu.value ? 'На главную' : 'Take me home'));
</script>

<template>
  <div class="vp-doc">
    <div class="container">
      <p class="code">{{ title }}</p>
      <h1 class="title">{{ quote }}</h1>
      <div class="action">
        <VPButton theme="brand" :text="linkText" :href="homeHref" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  padding: 96px 24px 128px;
  text-align: center;
}

.code {
  line-height: 64px;
  font-size: 64px;
  font-weight: 600;
}

.title {
  padding-top: 12px;
  letter-spacing: 2px;
  line-height: 20px;
  font-size: 20px;
  font-weight: 700;
}

.action {
  padding-top: 20px;
}
</style>
