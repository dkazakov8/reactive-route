# Advanced

## Redirects chain

This library fully supports unlimited redirects in SPA / SSR.

```typescript [routes.ts]
const routes = createRoutes({
  one: {
    path: '/1',
    oader: () => import('./pages/one'),
  },
  two: {
    path: '/2',
    loader: () => import('./pages/two'),
    async beforeEnter(config) {
      return config.redirect({ route: 'one' });
    },
  },
  three: {
    path: '/3',
    loader: () => import('./pages/three'),
    async beforeEnter(config) {
      return config.redirect({ route: 'two' });
    },
  },
  four: {
    path: '/4',
    loader: () => import('./pages/four'),
    async beforeEnter(config) {
      return config.redirect({ route: 'three' });
    },
  },
  
  // Other routes
});
```

In this case if user goes to `/4` he will be redirected to `/3` then `/2` then `/1`. 
Browser's history and `router.routesHistory` will only have `['/1']`. 
Also, chunks for pages four, three, two will not be loaded if you configured async chunks in your Bundler.

## Watch and react to params / query changes

`router.currentRoute` is an observable, so you can use it inside autorun / reaction / effect of your stack.

```tsx
import { TypeCurrentRoute } from 'reactive-route';
import { routes } from 'routes';

function MyComponent() {
  const { router } = useContext(RouterContext);
  
  const currentRoute = router.currentRoute as TypeCurrentRoute<typeof routes.tabs>;

  // React + MobX way
  useEffect(() => {
    const disposer = autorun(() => {
      // Always check the name. Because after redirecting the currentRoute 
      // will change, but this reaction is still alive, and the next route 
      // may not have params and query at all!
      if (currentRoute.name !== 'tabs') return;
      
      console.log(currentRoute.params.tab, currentRoute.query.foo);
    })

    return () => disposer();
  }, []);
  
  if (router.currentRoute.name !== 'tabs') return null;

  if (router.currentRoute.params.tab === 'dashboard') {
    return <Dashboard />
  }

  if (router.currentRoute.params.tab === 'table') {
    return <Table />
  }

  return <ModeNotFound />;
}
```

## Prevent rerendering if pageId is the same

To Do

## Modular exports

All the exports from your pages are written to the route config. You may read them in 
`beforeSetPageComponent` prop of the `Router`. For example, when you use code-splitting and SSR 
it's a good practice to extend some global RootStore or IoC container with page's stores:

```tsx [pages/Home.tsx]
export const homeStore = {
  foo: 'bar'
}

export default function Home() {
  const { modularStores } = useContext(RouterContext);

  return `Home ${modularStores.homeStore.foo}`;
}
```

```tsx [components/Router.tsx]
export function Router() {
  const { router, modularStores } = useContext(RouterContext);

  return (
    <RouterLib
      routes={routes}
      router={router}
      beforeSetPageComponent={(route) => {
        if (route.otherExports?.homeStore) {
          modularStores.homeStore = route.otherExports.homeStore;
        }
      }}
      beforeUpdatePageComponent={() => {
        if (modularStores.homeStore) {
          modularStores.homeStore.destroy();
          modularStores.homeStore = null;
        }
      }}
    />
  );
}
```

This way on hydration server can serialize `modularStores.homeStore` and the client can easily
hydrate it on the first render. This mechanism can also be used in other useful scenarios.
