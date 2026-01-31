# React Integration

## MobX

Relevant imports:

```ts
import { Router } from 'reactive-route/react';
import { adapters } from 'reactive-route/adapters/mobx-react';
```

The `mobx` and `mobx-react-lite` packages must be installed.

If you are using `mobx-react`, you can either create a bundler alias or replace the `observer` in the
adapters with the one from `mobx-react`.

Reactive Route is **reactive** — don't forget to wrap components that read its properties (such as
[router.state](/en/guide/router-api#router-state) or
[router.isRedirecting](/en/guide/router-api#router-isredirecting)) in `observer`.

## Observable

Relevant imports:

```ts
import { Router } from 'reactive-route/react';
import { adapters } from 'reactive-route/adapters/kr-observable-react';
```

The `kr-observable` package must be installed.

Reactive Route is **reactive** — don't forget to wrap components that read its properties (such as
[router.state](/en/guide/router-api#router-state) or
[router.isRedirecting](/en/guide/router-api#router-isredirecting)) in `observer`.

