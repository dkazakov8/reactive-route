// #region integration-react

# Интеграция с React

## MobX

Соответствующие импорты:

```ts
import { Router } from 'reactive-route/react';
import { adapters } from 'reactive-route/adapters/mobx-react';
```

Пакеты `mobx` и `mobx-react-lite` должны быть установлены.

Если используется `mobx-react` можно создать alias в бандлере или заменить
`observer` в адаптерах на взятый из `mobx-react`.

Reactive Route — **реактивный**, не забывайте оборачивать в `observer` компоненты, читающие его
свойства (например, <Link to="api/router#router-state">router.state</Link> или <Link to="api/router#router-isredirecting">router.isRedirecting</Link>).

## Observable

Соответствующие импорты:

```ts
import { Router } from 'reactive-route/react';
import { adapters } from 'reactive-route/adapters/kr-observable-react';
```

Пакет `kr-observable` должен быть установлен.

Reactive Route — **реактивный**, не забывайте оборачивать в `observer` компоненты, читающие его
свойства (например, <Link to="api/router#router-state">router.state</Link> или <Link to="api/router#router-isredirecting">router.isRedirecting</Link>).

// #endregion integration-react

// #region integration-vue

# Интеграция с Vue

## Нативная реактивность Vue

Соответствующие импорты:

```ts
import { Router } from 'reactive-route/vue';
import { adapters } from 'reactive-route/adapters/vue';
```

Никаких дополнительных пакетов или конфигурации не требуется.

// #endregion integration-vue

// #region integration-solid

# Интеграция с Solid.js

## Нативная реактивность Solid.js

Соответствующие импорты:

```ts
import { Router } from 'reactive-route/solid';
import { adapters } from 'reactive-route/adapters/solid';
```

Никаких дополнительных пакетов или конфигурации не требуется.

## MobX

Соответствующие импорты:

```ts
import { Router } from 'reactive-route/solid';
import { adapters } from 'reactive-route/adapters/mobx-solid';
```

Пакет `mobx` должен быть установлен.

У Solid.js нет нативной интеграции с MobX. Поэтому соответствующий код должен быть включен в
entry file, например:

<!-- @include: @shared/integration/mobx.md -->

## Observable

Соответствующие импорты:

```ts
import { Router } from 'reactive-route/solid';
import { adapters } from 'reactive-route/adapters/kr-observable-solid';
```

Пакет `kr-observable` должен быть установлен.

Не забудьте включить интеграцию в entry file:

```ts
import { enableObservable } from 'kr-observable/solidjs';

enableObservable();
```

// #endregion integration-solid

// #region integration-preact

# Интеграция с Preact

## MobX

Соответствующие импорты:

```ts
import { Router } from 'reactive-route/preact';
import { adapters } from 'reactive-route/adapters/mobx-preact';
```

Пакеты `mobx` и `mobx-preact` должны быть установлены.

Reactive Route — **реактивный**, не забывайте оборачивать в `observer` компоненты, читающие его
свойства (например, <Link to="api/router#router-state">router.state</Link> или <Link to="api/router#router-isredirecting">router.isRedirecting</Link>).

## Observable

Соответствующие импорты:

```ts
import { Router } from 'reactive-route/preact';
import { adapters } from 'reactive-route/adapters/kr-observable-preact';
```

Пакет `kr-observable` должен быть установлен.

Reactive Route — **реактивный**, не забывайте оборачивать в `observer` компоненты, читающие его
свойства (например, <Link to="api/router#router-state">router.state</Link> или <Link to="api/router#router-isredirecting">router.isRedirecting</Link>).

// #endregion integration-preact
