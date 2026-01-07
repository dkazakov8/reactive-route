```ts
router.urlToState(`/user/9999?phone=123456&gtm=value`);

<!--@include: @shared/state-commented.md -->

router.urlToState(`/not-existing/admin?hacker=sql-inject`);

// { 
//  name: 'notFound', 
//  params: {}, 
//  query: {}
// }
```