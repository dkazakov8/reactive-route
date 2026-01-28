```ts
export type TypeRouterProject = ReturnType<typeof getRouter>;

export type TypeRoutesProject = ReturnType<
  TypeRouterProject['getGlobalArguments']
>['routes'];
```

<Tabs :frameworks="['React', 'Preact', 'Solid', 'Vue']">
<template #React>

::: code-group
```tsx [Link.tsx]
import { TypePayload } from 'reactive-route';

import { TypeRoutesProject, useRouter } from '../router';

export function Link<TName extends keyof TypeRoutesProject>(props: {
  payload: TypePayload<TypeRoutesProject, TName>;
  className?: string;
  children?: any;
}) {
  const { router } = useRouter();

  const state = router.payloadToState(props.payload);

  return (
    <a
      href={state.url}
      className={props.className}
      onClick={(event) => {
        event.preventDefault();

        router.redirect(props.payload);
      }}
    >
      {props.children}
    </a>
  );
}
```
```tsx [LinkProps.tsx]
import { TypePayload } from 'reactive-route';

import { TypeRoutesProject, useRouter } from '../router';

export function LinkProps<TName extends keyof TypeRoutesProject>(
  props: TypePayload<TypeRoutesProject, TName> & {
    className?: string;
    children?: any;
  }
) {
  const { router } = useRouter();

  const payload = {
    name: props.name,
    query: 'query' in props ? props.query : undefined,
    params: 'params' in props ? props.params : undefined,
  } as TypePayload<TypeRoutesProject, TName>;

  const state = router.payloadToState(payload);

  return (
    <a
      href={state.url}
      className={props.className}
      onClick={(event) => {
        event.preventDefault();

        router.redirect(payload);
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
import { TypePayload } from 'reactive-route';

import { TypeRoutesProject, useRouter } from '../router';

export function Link<TName extends keyof TypeRoutesProject>(props: {
  payload: TypePayload<TypeRoutesProject, TName>;
  className?: string;
  children?: any;
}) {
  const { router } = useRouter();

  const state = router.payloadToState(props.payload);

  return (
    <a
      href={state.url}
      className={props.className}
      onClick={(event) => {
        event.preventDefault();

        router.redirect(props.payload);
      }}
    >
      {props.children}
    </a>
  );
}
```
```tsx [LinkProps.tsx]
import { TypePayload } from 'reactive-route';

import { TypeRoutesProject, useRouter } from '../router';

export function LinkProps<TName extends keyof TypeRoutesProject>(
  props: TypePayload<TypeRoutesProject, TName> & {
    className?: string;
    children?: any;
  }
) {
  const { router } = useRouter();

  const payload = {
    name: props.name,
    query: 'query' in props ? props.query : undefined,
    params: 'params' in props ? props.params : undefined,
  } as TypePayload<TypeRoutesProject, TName>;

  const state = router.payloadToState(payload);

  return (
    <a
      href={state.url}
      className={props.className}
      onClick={(event) => {
        event.preventDefault();

        router.redirect(payload);
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
import { TypePayload } from 'reactive-route';
import { createMemo } from 'solid-js';

import { TypeRoutesProject, useRouter } from '../router';

export function Link<TName extends keyof TypeRoutesProject>(props: {
  payload: TypePayload<TypeRoutesProject, TName>;
  class?: string;
  children?: any;
}) {
  const { router } = useRouter();

  const state = createMemo(() => router.payloadToState(props.payload));

  return (
    <a
      href={state().url}
      class={props.class}
      onClick={(event) => {
        event.preventDefault();

        router.redirect(props.payload);
      }}
    >
      {props.children}
    </a>
  );
}
```
```tsx [LinkProps.tsx]
import { TypePayload } from 'reactive-route';
import { createMemo } from 'solid-js';

import { TypeRoutesProject, useRouter } from '../router';

export function LinkProps<TName extends keyof TypeRoutesProject>(
  props: TypePayload<TypeRoutesProject, TName> & {
    class?: string;
    children?: any;
  }
) {
  const { router } = useRouter();

  const payload = createMemo(() => {
    return {
      name: props.name,
      query: 'query' in props ? props.query : undefined,
      params: 'params' in props ? props.params : undefined,
    } as TypePayload<TypeRoutesProject, TName>;
  });

  const state = createMemo(() => router.payloadToState(payload()));

  return (
    <a
      href={state().url}
      class={props.class}
      onClick={(event) => {
        event.preventDefault();

        router.redirect(payload());
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
<script setup lang="ts" generic="TName extends keyof TypeRoutesProject">
import { TypePayload } from 'reactive-route';
import { computed } from 'vue';

import { TypeRoutesProject, useRouter } from '../router';

const props = defineProps<{
  payload: TypePayload<TypeRoutesProject, TName>;
}>();

const { router } = useRouter();

const state = computed(() => router.payloadToState(props.payload));

const handleClick = (event: MouseEvent) => {
  event.preventDefault();
  
  void router.redirect(props.payload);
};
</script>

<template>
  <a :href="state.url" @click="handleClick">
    <slot />
  </a>
</template>
```
```vue [LinkProps.vue]
<script setup lang="ts" generic="TName extends keyof TypeRoutesProject">
import { TypePayload } from 'reactive-route';
import { computed } from 'vue';

import { TypeRoutesProject, useRouter } from '../router';

const props = defineProps<TypePayload<TypeRoutesProject, TName>>();

const { router } = useRouter();

const payload = computed(() => {
  return {
    name: props.name,
    query: (props as any).query,
    params: (props as any).params,
  } as TypePayload<TypeRoutesProject, TName>;
});

const state = computed(() => router.payloadToState(payload.value));

const handleClick = (event: MouseEvent) => {
  event.preventDefault();
  
  void router.redirect(payload.value);
};
</script>

<template>
  <a :href="state.url" @click="handleClick">
    <slot />
  </a>
</template>
```
:::
</template>
</Tabs>