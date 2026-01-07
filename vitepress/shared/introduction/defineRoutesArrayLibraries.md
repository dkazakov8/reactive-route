```ts
<!-- @include: @shared/_library.md#vue-router -->

const routes = [
  { name: 'home', path: '/', component: Home }
]
  
<!-- @include: @shared/_library.md#@kitbag/router -->

const routes = [
  createRoute({ name: 'home', path: '/', component: Home })
]
```