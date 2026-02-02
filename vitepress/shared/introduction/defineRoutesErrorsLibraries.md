```tsx
<!-- @include: @shared/library.md#vue-router -->

const routes = [
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
]

<!-- @include: @shared/library.md#mobx-router -->

startRouter(
  configs,
  store,
  { notfound: () => store.router.goTo(YOUR_NOT_FOUND_ROUTE), }
);

<!-- @include: @shared/library.md#@kitbag/router -->

export const router = createRouter(routes, {
  rejections: [
    createRejection({ type: 'NotFound', component: NotFoundPage })
  ]
})
```