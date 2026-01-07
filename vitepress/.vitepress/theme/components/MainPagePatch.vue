<script setup lang="ts">
import { useData, useRoute } from 'vitepress';
import { nextTick, onMounted, watch } from 'vue';

const route = useRoute();
const { site } = useData();

function normalizeBase(base: string) {
  if (!base.endsWith('/')) return `${base}/`;

  return base;
}

function patchLocaleLinks() {
  if (typeof document === 'undefined') return;

  const base = normalizeBase(site.value.base ?? '/');
  const path = window.location.pathname;
  const englishBase = `${window.location.origin}${base}`;

  const isEnglishHome = path === base || path === `${base}index.html`;
  const isRussianHome = path === `${base}ru/` || path === `${base}ru/index.html`;

  const logoLink = document.querySelector<HTMLAnchorElement>('.VPNavBarTitle a');

  if (logoLink) {
    const href = logoLink.getAttribute('href') ?? '';
    const normalizedHref = new URL(href || '/', window.location.origin).href;

    if (
      href === `${base}en/` ||
      href === `${base}en` ||
      normalizedHref === `${window.location.origin}${base}en/`
    ) {
      logoLink.href = englishBase;
    }
  }

  if (!isEnglishHome && !isRussianHome) return;

  const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[lang]'));

  for (const link of links) {
    const lang = link.getAttribute('lang');

    if (isEnglishHome && lang === 'ru') {
      link.href = `${window.location.origin}${base}ru/`;
    }

    if (isRussianHome && lang === 'en') {
      link.href = `${window.location.origin}${base}`;
    }
  }
}

onMounted(async () => {
  await nextTick();

  patchLocaleLinks();
});

watch(
  () => route.path,
  async () => {
    await nextTick();

    patchLocaleLinks();
  }
);
</script>

<template>
  <div style="display: none" />
</template>
