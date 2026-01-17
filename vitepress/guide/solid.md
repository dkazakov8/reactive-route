# Solid.js Integration

## Native Solid.js Reactivity

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

Since Solid.js doesn't have native MobX integration, you'll need to include something like this in your
entry file:

<!-- @include: @/snippets/integration/mobx.md -->

## Observable

Relevant imports:

```ts
import { Router } from 'reactive-route/solid';
import { adapters } from 'reactive-route/adapters/kr-observable-solid';
```

The `kr-observable` package must be installed.

Don't forget to enable the integration in your entry file:

```ts
import { enableObservable } from 'kr-observable/solidjs';

enableObservable();
```

