```ts
await router.init(location.pathname + location.search);

setTimeout(async () => {
  try {
    await router.preloadComponent('login')
    await router.preloadComponent('dashboard')
  } catch (e) {
    console.error('Seems like the user lost connection')
  }
}, 5000)
```