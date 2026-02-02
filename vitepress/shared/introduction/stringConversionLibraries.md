```ts
<!-- @include: @shared/library.md#@kitbag/router -->

import { createRoute, withParams } from '@kitbag/router'

const routes = [
  createRoute({
    name: 'user',

    // [!code error]
    // Validation is optional and unreliable
    path: withParams('/user/[id]', { id: Number })
  })
]

// [!code error]
// valid in both TS and runtime
router.push('user', { id: NaN || Infinity || -0 })
```