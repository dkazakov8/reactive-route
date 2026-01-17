# React Integration

## Mobx

The relevant imports are as follows

```ts
import { Router } from 'reactive-route/react';
import { adapters } from 'reactive-route/adapters/mobx-react';
```

You should ensure that packages `mobx`, `mobx-react-lite` are installed.

If you use `mobx-react` instead of `mobx-react-lite` you may create an alias in your bundler or
pass your own adapters with similar implementation but `observer` taken from `mobx-react`.

Be sure to wrap your components which read observable router parameters into `observer` (if you use
MobX this is presumably already done).

## Observable

The relevant imports are as follows

```ts
import { Router } from 'reactive-route/react';
import { adapters } from 'reactive-route/adapters/kr-observable-react';
```

You should ensure that package `kr-observable` is installed.

Be sure to wrap your components which read observable router parameters into `observer` (if you use
Observable this is presumably already done).

