```ts
const configs = createConfigs({
  user: {
    path: '/user/:id',
    loader: () => import('./pages/user'),
    
    // [!code warning]
    // validation is required and stable
    params: { id: validators.numeric },
    query: { phone: validators.numeric.length(6, 15) },
  },
});

// [!code warning]
// 100% safe casts

const { params, query } = router.state.user!;

const id = computed(() => Number(params.id));
const phone = computed(() => query.phone ? Number(query.phone) : null);

// [!code warning]
// URL can't have numbers, only strings. [!code warning]
// No hidden magic of type conversion

router.redirect(<!-- @include: @shared/state.md -->)
```