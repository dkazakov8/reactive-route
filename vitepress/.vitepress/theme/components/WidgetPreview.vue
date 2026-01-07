<script setup lang="ts">
import { useData } from 'vitepress';
import { VPButton } from 'vitepress/theme';
import { computed, onBeforeUnmount, onMounted } from 'vue';

const props = defineProps<{
  widgetUrls: Array<string>;
}>();

const { site } = useData();
const cssUrl = computed(() => {
  const url = props.widgetUrls.find((item) => item.endsWith('.css'));

  return url ? withBase(url) : undefined;
});

const scriptUrl = computed(() => {
  const url = props.widgetUrls.find((item) => item.endsWith('.js'));

  return url ? withBase(url) : undefined;
});

let styleElement: HTMLLinkElement | undefined;
let scriptElement: HTMLScriptElement | undefined;

function setWidgetUrl(url: string) {
  localStorage.setItem('WIDGET_URL', url);

  window.dispatchEvent(
    new StorageEvent('storage', {
      key: 'WIDGET_URL',
      newValue: url,
      storageArea: localStorage,
    })
  );
}

function withBase(url: string) {
  const base = site.value.base.endsWith('/') ? site.value.base : `${site.value.base}/`;

  return `${base}${url.replace(/^\/+/, '')}`;
}

onMounted(() => {
  if (cssUrl.value) {
    styleElement = document.createElement('link');
    styleElement.rel = 'stylesheet';
    styleElement.href = `${cssUrl.value}?date=${Date.now()}`;
    document.head.append(styleElement);
  }

  if (scriptUrl.value) {
    scriptElement = document.createElement('script');
    scriptElement.type = 'module';
    scriptElement.src = `${scriptUrl.value}?date=${Date.now()}`;
    document.body.append(scriptElement);
  }
});

onBeforeUnmount(() => {
  styleElement?.remove();
  scriptElement?.remove();
});
</script>

<template>
  <div class="widgetDemo vp-raw">
    <div class="externalControls">
      <VPButton theme="alt" text="/query?foo=89245213" @click="setWidgetUrl('/query?foo=89245213')" />
      <VPButton theme="alt" text="/page/77853418" @click="setWidgetUrl('/page/77853418')" />
    </div>
    <div class="widgetFrame">
      <div id="example-app" class="widgetMount" />
    </div>
  </div>
</template>

<style scoped>
.widgetDemo {
  margin: 24px 0;

  .externalControls {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;
  }

  .widgetFrame {
    overflow: hidden;
    border: 1px solid var(--vp-c-divider);
    border-radius: 20px;
    background:
      radial-gradient(circle at top, rgba(98, 49, 182, 0.14), transparent 35%),
      var(--vp-c-bg-soft);
  }
}
</style>
