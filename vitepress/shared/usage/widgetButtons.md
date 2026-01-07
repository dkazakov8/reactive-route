```ts
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
```