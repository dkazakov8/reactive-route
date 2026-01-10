# Router Component Configuration

The router is the central piece that manages the state of the router and provides methods for navigation. It's created using the `createRouter` function.

## Creating a Router Component

```tsx [components/Router.tsx]
import { useContext } from '{ui-library}';
import { Router as RouterLib } from 'reactive-route/{ui-library}';

import { RouterContext } from './RouterContext';

export function Router() {
  const { router } = useContext(RouterContext);

  return <RouterLib router={router} />;
}
```

The `Router` accepts these props:

| Property                    | Type                                   | Description                                                                                                      |
|-----------------------------|----------------------------------------|------------------------------------------------------------------------------------------------------------------|
| `router`                    | `ReturnType<typeof createRouter>`      | The router configuration                                                                                         |
| `beforeMount`               | `() => void`                           | This function is called once on Router Component initiation, before any rendering (optional)                     |
| `beforeUpdatePageComponent` | `() => void`                           | This function is called when page component is changed, before `beforeSetPageComponent` and rendering (optional) |
| `beforeSetPageComponent`    | `(componentConfig: TypeRoute) => void` | This function is called when page component is loaded, before rendering (optional)                               |

```tsx [components/Router.tsx]
import { useContext } from '{ui-library}';
import { Router as RouterLib } from 'reactive-route/{ui-library}';

import { routes } from '../routes';
import { RouterContext } from './RouterContext';

export function Router() {
  const { router } = useContext(RouterContext);

  return (
    <RouterLib
      routes={routes}
      router={router}
      beforeMount={() => {
        // Router just mounted
      }}
      beforeUpdatePageComponent={() => {
        // some new page will be rendered soon (not called on first render!)
        // You may stop async actions and clear modular stores here
  
        cancelExecutingApi();
        cancelExecutingActions();
        someStore.reset();
      }}
      beforeSetPageComponent={(route) => {
        // some page will be rendered soon
        // You may initiate modular stores here
        
        console.log(route); // shows which page will be loaded
        
        const myPageStore = route.otherExports?.myPageStore;
      }}
    />
  );
}
```

There are more examples of Router Component lifecycle in the [Advanced](/guide/advanced) section.
