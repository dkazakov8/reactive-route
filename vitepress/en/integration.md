// #region integration-react

# Integration with React

## MobX

Relevant imports:

```ts
import { Router } from 'reactive-route/react';
import { adapters } from 'reactive-route/adapters/mobx-react';
```

The `mobx` and `mobx-react-lite` packages must be installed.

If you use `mobx-react`, you can create an alias in the bundler or replace
`observer` in the adapters with the one from `mobx-react`.

Reactive Route is **reactive**, so do not forget to wrap components that read its
properties in `observer` (for example, <Link to="api#router-state">router.state</Link> or <Link to="api#router-isredirecting">router.isRedirecting</Link>).

## Observable

Relevant imports:

```ts
import { Router } from 'reactive-route/react';
import { adapters } from 'reactive-route/adapters/kr-observable-react';
```

The `kr-observable` package must be installed.

Reactive Route is **reactive**, so do not forget to wrap components that read its
properties in `observer` (for example, <Link to="api#router-state">router.state</Link> or <Link to="api#router-isredirecting">router.isRedirecting</Link>).

// #endregion integration-react

// #region integration-vue

# Integration with Vue

## Native Vue reactivity

Relevant imports:

```ts
import { Router } from 'reactive-route/vue';
import { adapters } from 'reactive-route/adapters/vue';
```

No additional packages or configuration are required.

// #endregion integration-vue

// #region integration-solid

# Integration with Solid.js

## Native Solid.js reactivity

Relevant imports:

```ts
import { Router } from 'reactive-route/solid';
import { adapters } from 'reactive-route/adapters/solid';
```

No additional packages or configuration are required.

## MobX

Relevant imports:

```ts
import { Router } from 'reactive-route/solid';
import { adapters } from 'reactive-route/adapters/mobx-solid';
```

The `mobx` package must be installed.

Solid.js has no native integration with MobX. Therefore, the relevant code must be included in the
entry file, for example:

<!-- @include: @shared/integration/mobx.md -->

## Observable

Relevant imports:

```ts
import { Router } from 'reactive-route/solid';
import { adapters } from 'reactive-route/adapters/kr-observable-solid';
```

The `kr-observable` package must be installed.

Do not forget to enable the integration in the entry file:

```ts
import { enableObservable } from 'kr-observable/solidjs';

enableObservable();
```

// #endregion integration-solid

// #region integration-preact

# Integration with Preact

## MobX

Relevant imports:

```ts
import { Router } from 'reactive-route/preact';
import { adapters } from 'reactive-route/adapters/mobx-preact';
```

The `mobx` and `mobx-preact` packages must be installed.

Reactive Route is **reactive**, so do not forget to wrap components that read its
properties in `observer` (for example, <Link to="api#router-state">router.state</Link> or <Link to="api#router-isredirecting">router.isRedirecting</Link>).

## Observable

Relevant imports:

```ts
import { Router } from 'reactive-route/preact';
import { adapters } from 'reactive-route/adapters/kr-observable-preact';
```

The `kr-observable` package must be installed.

Reactive Route is **reactive**, so do not forget to wrap components that read its
properties in `observer` (for example, <Link to="api#router-state">router.state</Link> or <Link to="api#router-isredirecting">router.isRedirecting</Link>).

// #endregion integration-preact
