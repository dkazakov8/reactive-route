```ts
<!-- @include: @shared/library.md#vue-router -->

const routes = [
  { name: 'home', path: '/', component: Home }
]
  
<!-- @include: @shared/library.md#@kitbag/router -->

const routes = [
  createRoute({ name: 'home', path: '/', component: Home })
]
```