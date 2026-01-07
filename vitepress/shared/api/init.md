```ts
// browser usage example:
await router.init(location.href)

// browser usage with SSR example:
await router.init(location.href, { skipLifecycle: true })

// Express.js server usage example:
const newUrl = await router.init(req.originalUrl)

// Optional step if you want to clear irrelevant query
if (req.originalUrl !== newUrl) res.redirect(newUrl)
```