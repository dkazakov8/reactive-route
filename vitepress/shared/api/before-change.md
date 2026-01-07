```ts
// Some page exports "export class PageStore { data: {}, destroy() {} }"

const globalStore = { pages: {} };

createRouter({
  configs,
  adapters,
  beforeComponentChange({ prevConfig, currentConfig }) {
    // PageStore is accessible from the otherExports object
    const { PageStore } = currentConfig.otherExports;

    if (PageStore) globalStore.pages[currentConfig.name] = new PageStore();

    // destroy the obsolete PageStore from the previuos page
    globalStore.pages[prevConfig.name]?.destroy();
  }
})
```