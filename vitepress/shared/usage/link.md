```ts
export type TypeRouterProject = ReturnType<typeof getRouter>;

export type TypeConfigsProject = ReturnType<
  TypeRouterProject['getGlobalArguments']
>['configs'];
```

<Tabs :frameworks="['React', 'Preact', 'Solid', 'Vue']">
<template #React>

::: code-group
```tsx [Link.tsx]
import { TypeStateDynamic } from 'reactive-route';

import { TypeConfigsProject, useRouter } from '../router';

export function Link<TName extends keyof TypeConfigsProject>(props: {
  to: TypeStateDynamic<TypeConfigsProject, TName> & { replace?: boolean };
  children?: any;
}) {
  const { router } = useRouter();

  const url = router.stateToUrl(props.to);

  return (
    <a
      href={url}
      onClick={(event) => {
        event.preventDefault();

        router.redirect(props.to);
      }}
    >
      {props.children}
    </a>
  );
}
```
```tsx [LinkProps.tsx]
import { TypeStateDynamic } from 'reactive-route';

import { TypeConfigsProject, useRouter } from '../router';

export function LinkProps<TName extends keyof TypeConfigsProject>(
  props: TypeStateDynamic<TypeConfigsProject, TName> & {
    children?: any;
    replace?: boolean;
  }
) {
  const { router } = useRouter();

  const stateDynamic = {
    name: props.name,
    query: 'query' in props ? props.query : undefined,
    params: 'params' in props ? props.params : undefined,
    replace: props.replace,
  } as TypeStateDynamic<TypeConfigsProject, TName> & { replace?: boolean };

  const url = router.stateToUrl(stateDynamic);

  return (
    <a
      href={url}
      onClick={(event) => {
        event.preventDefault();

        router.redirect(stateDynamic);
      }}
    >
      {props.children}
    </a>
  );
}
```
:::

</template>
<template #Preact>

::: code-group
```tsx [Link.tsx]
import { TypeStateDynamic } from 'reactive-route';

import { TypeConfigsProject, useRouter } from '../router';

export function Link<TName extends keyof TypeConfigsProject>(props: {
  to: TypeStateDynamic<TypeConfigsProject, TName> & { replace?: boolean };
  children?: any;
}) {
  const { router } = useRouter();

  const url = router.stateToUrl(props.to);

  return (
    <a
      href={url}
      onClick={(event) => {
        event.preventDefault();

        router.redirect(props.to);
      }}
    >
      {props.children}
    </a>
  );
}
```
```tsx [LinkProps.tsx]
import { TypeStateDynamic } from 'reactive-route';

import { TypeConfigsProject, useRouter } from '../router';

export function LinkProps<TName extends keyof TypeConfigsProject>(
  props: TypeStateDynamic<TypeConfigsProject, TName> & {
    children?: any;
    replace?: boolean;
  }
) {
  const { router } = useRouter();

  const stateDynamic = {
    name: props.name,
    query: 'query' in props ? props.query : undefined,
    params: 'params' in props ? props.params : undefined,
    replace: props.replace,
  } as TypeStateDynamic<TypeConfigsProject, TName> & { replace?: boolean };

  const url = router.stateToUrl(stateDynamic);

  return (
    <a
      href={url}
      onClick={(event) => {
        event.preventDefault();

        router.redirect(stateDynamic);
      }}
    >
      {props.children}
    </a>
  );
}
```
:::

</template>
<template #Solid>

::: code-group
```tsx [Link.tsx]
import { TypeStateDynamic } from 'reactive-route';
import { createMemo } from 'solid-js';

import { TypeConfigsProject, useRouter } from '../router';

export function Link<TName extends keyof TypeConfigsProject>(props: {
  to: TypeStateDynamic<TypeConfigsProject, TName> & { replace?: boolean };
  children?: any;
}) {
  const { router } = useRouter();

  const url = createMemo(() => router.stateToUrl(props.to));

  return (
    <a
      href={url()}
      onClick={(event) => {
        event.preventDefault();

        router.redirect(props.to);
      }}
    >
      {props.children}
    </a>
  );
}
```
```tsx [LinkProps.tsx]
import { TypeStateDynamic } from 'reactive-route';
import { createMemo } from 'solid-js';

import { TypeConfigsProject, useRouter } from '../router';

export function LinkProps<TName extends keyof TypeConfigsProject>(
  props: TypeStateDynamic<TypeConfigsProject, TName> & {
    children?: any;
    replace?: boolean;
  }
) {
  const { router } = useRouter();

  const stateDynamic = createMemo(() => {
    return {
      name: props.name,
      query: 'query' in props ? props.query : undefined,
      params: 'params' in props ? props.params : undefined,
      replace: props.replace,
    } as TypeStateDynamic<TypeConfigsProject, TName> & { replace?: boolean };
  });

  const url = createMemo(() => router.stateToUrl(stateDynamic()));

  return (
    <a
      href={url()}
      onClick={(event) => {
        event.preventDefault();

        router.redirect(stateDynamic());
      }}
    >
      {props.children}
    </a>
  );
}
```
:::

</template>
<template #Vue>

::: code-group
```vue [Link.vue]
<script setup lang="ts" generic="TName extends keyof TypeConfigsProject">
  import { TypeStateDynamic } from 'reactive-route';
  import { computed } from 'vue';

  import { TypeConfigsProject, useRouter } from '../router';

  const props = defineProps<{
    to: TypeStateDynamic<TypeConfigsProject, TName> & { replace?: boolean };
  }>();

  const { router } = useRouter();

  const url = computed(() => router.stateToUrl(props.to));
</script>

<template>
  <a :href="url" @click.prevent="router.redirect(props.to)">
    <slot />
  </a>
</template>

```
```vue [LinkProps.vue]
<script setup lang="ts" generic="TName extends keyof TypeConfigsProject">
  import { TypeStateDynamic } from 'reactive-route';
  import { computed } from 'vue';

  import { TypeConfigsProject, useRouter } from '../router';

  const props = defineProps<TypeStateDynamic<TypeConfigsProject, TName> & { replace?: boolean }>();

  const { router } = useRouter();

  const stateDynamic = computed(() => {
    return {
      name: props.name,
      query: (props as any).query,
      params: (props as any).params,
      replace: props.replace,
    } as TypeStateDynamic<TypeConfigsProject, TName> & { replace?: boolean };
  });

  const url = computed(() => router.stateToUrl(stateDynamic.value));
</script>

<template>
  <a :href="url" @click.prevent="router.redirect(stateDynamic)">
    <slot />
  </a>
</template>
```
:::
</template>
</Tabs>