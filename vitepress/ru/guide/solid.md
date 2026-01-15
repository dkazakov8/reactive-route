# Интеграция с Solid.js

## Нативная реактивность Solid.js

Соответствующие импорты:

```typescript
import { Router } from 'reactive-route/solid';
import { adapters } from 'reactive-route/adapters/solid';
```

Никаких дополнительных пакетов или конфигураций не требуется.

## MobX

Соответствующие импорты:

```typescript
import { Router } from 'reactive-route/solid';
import { adapters } from 'reactive-route/adapters/mobx-solid';
```

Убедитесь, что пакет `mobx` установлен.

На самом деле, у Solid.js нет нативной интеграции с MobX. Поэтому, если вы используете MobX с Solid.js, вы, вероятно, используете что-то вроде этого:

```typescript
import { Reaction } from 'mobx';
import { enableExternalSource } from 'solid-js';

let id = 0;

enableExternalSource((fn, trigger) => {
  const reaction = new Reaction(`mobx@${++id}`, trigger);

  return {
    track: (x) => {
      let next;
      reaction.track(() => (next = fn(x)));
      return next;
    },
    dispose: () => reaction.dispose(),
  };
});
```

... или у вас есть лучшие альтернативы. В любом случае, что-то подобное должно быть включено в ваш входной файл (entry file).

## Observable

Соответствующие импорты:

```typescript
import { Router } from 'reactive-route/solid';
import { adapters } from 'reactive-route/adapters/kr-observable-solid';
```

Убедитесь, что пакет `kr-observable` установлен.

Не забудьте включить интеграцию в вашем входном файле (entry file):

```typescript
import { enableObservable } from 'kr-observable/solidjs';

enableObservable();
```

