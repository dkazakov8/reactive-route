```ts
const globalStore = { pages: {} };

createRouter({
  configs,
  adapters,
  beforeComponentChange({ prevConfig, currentConfig }) {
    const ExportedPageStore = currentConfig.otherExports.PageStore;

    if (ExportedPageStore) {
      globalStore.pages[currentConfig.name] = new ExportedPageStore();
    }

    // now check the previous page store and destroy it if needed
    globalStore.pages[prevConfig.name]?.destroy();

    delete globalStore.pages[prevConfig.name];
  }
})
```