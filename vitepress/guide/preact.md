# Preact Integration

## MobX

Relevant imports:

```ts
import { Router } from 'reactive-route/preact';
import { adapters } from 'reactive-route/adapters/mobx-preact';
```

The `mobx` and `mobx-preact` packages must be installed.

Reactive Route is **reactive** — don't forget to wrap components that read its properties (such as
[router.state](/guide/router-api#router-state) or
[router.isRedirecting](/guide/router-api#router-isredirecting)) in `observer`.

## Observable

Relevant imports:

```ts
import { Router } from 'reactive-route/preact';
import { adapters } from 'reactive-route/adapters/kr-observable-preact';
```

The `kr-observable` package must be installed.

Reactive Route is **reactive** — don't forget to wrap components that read its properties (such as
[router.state](/guide/router-api#router-state) or
[router.isRedirecting](/guide/router-api#router-isredirecting)) in `observer`.

