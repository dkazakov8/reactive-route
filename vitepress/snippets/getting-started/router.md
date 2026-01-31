::: code-group
```tsx [React]
import { createContext, useContext } from 'react';
<!-- @include: @snippets/get-router.md -->

export const RouterContext = createContext<{
  router: ReturnType<typeof getRouter>
}>(undefined);

export function useRouter() {
  return useContext(RouterContext);
}
```
```tsx [Preact]
import { createContext } from 'preact';
import { useContext } from 'preact/hooks';
<!-- @include: @snippets/get-router.md -->

export const RouterContext = createContext<{
  router: ReturnType<typeof getRouter>
}>(undefined);

export function useRouter() {
  return useContext(RouterContext);
}
```
```tsx [Solid]
import { createContext, useContext } from 'solid-js';
<!-- @include: @snippets/get-router.md -->

export const RouterContext = createContext<{
  router: ReturnType<typeof getRouter>
}>(undefined);

export function useRouter() {
  return useContext(RouterContext);
}
```
```ts [Vue]
import { InjectionKey, inject } from 'vue';
<!-- @include: @snippets/get-router.md -->

export const routerStoreKey: InjectionKey<{
  router: ReturnType<typeof getRouter>
}> = Symbol();

export function useRouter() {
  return inject(routerStoreKey)!;
}
```
:::