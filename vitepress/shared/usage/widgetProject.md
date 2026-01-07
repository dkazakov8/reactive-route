```ts
import { createRenderEffect } from 'solid-js';

router.historySyncStop();

await router.init(localStorage.getItem('WIDGET_URL') || '/');

// save to external storage
createRenderEffect(() => {
  const currentUrl = router.activeName
    ? router.stateToUrl(router.state[router.activeName])
    : '/';

  localStorage.setItem('WIDGET_URL', currentUrl);
});

// restore from external storage
window.addEventListener('storage', (event) => {
  if (event.key === 'WIDGET_URL') {
    router.redirect(router.urlToState(event.newValue || '/'));
  }
});
```