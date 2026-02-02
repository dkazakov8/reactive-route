::: code-group
```tsx [routes.tsx]
<!-- @include: @shared/library.md#mobx-router -->

import { Home } from './Home';

export const routes = {
  home: new Route({ path: '/', component: <Home /> })
}
```
```tsx [Home.tsx]
<!-- @include: @shared/library.md#mobx-router -->

import { routes } from './routes';

export function Home() {
  const store = useContext(StoreContext);

  return <Link router={store.router} route={routes.home} />
});
```
:::
