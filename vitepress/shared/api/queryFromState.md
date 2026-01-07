```ts
const pageState = router.state.search;

await router.redirect({ name: 'search', query: { userPrompt: 'short' }})

console.log(pageState.query.userPrompt) // undefined

await router.redirect({ name: 'search', query: { userPrompt: 'enough' }})

console.log(pageState.query.userPrompt) // 'enough'
```