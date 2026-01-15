# Config

The basic idea is covered in the [Core Concepts](/guide/core-concepts) section.

## Properties Configurable

<table>
  <thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead>
  <tbody><tr>
<td><code>path</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>The pathname, should start with <code>/</code> and can include dynamic segments</td>
</tr><tr>
<td><code>loader</code></td>
<td class="table-td">

```ts
() => Promise<{
  default,
  ...otherExports
}>
```

</td>
<td>A function that returns a Promise resolving to the component (it should be in the <strong>default</strong> export)</td>
</tr><tr>
<td><code>props?</code></td>
<td class="table-td">

```ts
Record<string, any>
```

</td>
<td>Static props to pass to the component</td>
</tr><tr>
<td><code>params?</code></td>
<td class="table-td">

```ts
Record<
  TypeExtractRouteParams<TPath>,
  (value: string) => boolean
>
```

</td>
<td>Validation functions for path segments (required when the route variant is <em>Dynamic</em> and restricted when <em>Static</em>)</td>
</tr><tr>
<td><code>query?</code></td>
<td class="table-td">

```ts
Record<
  string,
  (value: string) => boolean
>
```

</td>
<td>Validation functions for query parameters</td>
</tr><tr>
<td><code>beforeEnter?</code></td>
<td class="table-td">

```ts
(lifecycleConfig: TypeLifecycleConfig) => 
  Promise<void>
```

</td>
<td>A lifecycle function, called before entering the route</td>
</tr><tr>
<td><code>beforeLeave?</code></td>
<td class="table-td">

```ts
(lifecycleConfig: TypeLifecycleConfig) => 
  Promise<void>
```

</td>
<td>A lifecycle function, called before leaving the route</td>
  </tr></tbody>
</table>


## Properties Internal

These arguments are auto-added by the library and can't be specified manually.

<table>
  <thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead>
  <tbody><tr>
<td><code>name</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>Equal to the object key</td>
</tr><tr>
<td><code>component?</code></td>
<td class="table-td">

```ts
any
```

</td>
<td>This is a <code>default</code> export returned from the <code>loader</code> function</td>
</tr><tr>
<td><code>otherExports?</code></td>
<td class="table-td">

```ts
Record<string, any>
```

</td>
<td>This is all the exports returned from the <code>loader</code> function except <code>default</code></td>
  </tr></tbody>
</table>

## Static / Dynamic

There are only two variants - `Static` and `Dynamic`.
Dynamic routes have parameters in their paths, indicated by a colon prefix:

```typescript
home: { // Static
  path: '/',
  loader: () => import('./pages/home')
},
user: { // Dynamic
  path: '/user/:id', 
  params: {
    id: (value) => /^\d+$/.test(value) // Validation function
  },
  loader: () => import('./pages/user')
}
```

A validation function is required, and if it's not satisfied in any route, the user will be redirected to the `notFound` route.
If the page component is rendered, you can be sure that all the params are validated and present in `router.state[routeName].params`.

## Query

Both types may have query parameters:

```typescript
search: {
  path: '/search',
  query: {
    text: (value) => value.length > 1
  },
  loader: () => import('./pages/search')
}
```

A validation function is required, and if it's not satisfied, the parameter will be inaccessible from the
`State`. This means that all query parameters are optional and may be `undefined` in `router.state[routeName].query`.

## Lifecycle Functions

There are two powerful lifecycle functions that allow you to control the navigation flow and 
perform data loading.

`beforeEnter` is called before entering a route. It can be used to redirect to another route, 
perform authentication checks, and load data.

`beforeLeave` is called before leaving a route. It can be used to prevent navigation or 
show a confirmation dialog.

Both have a first argument with API:

<table>
  <thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead>
  <tbody><tr>
<td><code>nextState</code></td>
<td class="table-td">

```ts
TypeRouteState
```

</td>
<td>Where the router is redirecting</td>
</tr><tr>
<td><code>currentState?</code></td>
<td class="table-td">

```ts
TypeRouteState
```

</td>
<td>Current route state (is <code>undefined</code> until the first redirect)</td>
</tr><tr>
</tr><tr>
<td><code>preventRedirect</code></td>
<td class="table-td">

```ts
() => void
```

</td>
<td>A method to stop the redirecting process</td>
</tr><tr>
<td><code>redirect</code></td>
<td class="table-td">

```ts
(routePayload: TypeRoutePayload) => 
  void
```

</td>
<td>A method to redirect inside the lifecycle. We can't use <code>router.redirect</code> here
because routes are defined before the router</td>
  </tr></tbody>
</table>

Here is a simple demonstration:

```typescript
// to support SSR the arguments should be passed here
function getRouter(api: Api, store: Store) {
  const routes = createRoutes({
    dashboard: {
      path: '/dashboard',
      loader: () => import('./pages/dashboard'),
      async beforeEnter({ redirect }) {
        await api.loadUser();

        if (!store.isAuthenticated()) {
          // pass a Payload like in a regular route.redirect
          return redirect({
            name: 'login',
            query: { returnTo: 'dashboard' }
          });
        }

        await api.loadDashboard();
      },
      async beforeLeave({ preventRedirect, nextState }) {
        const hasUnsavedChanges = await api.checkForm();

        if (hasUnsavedChanges) {
          const confirmed = window.confirm(
            `You have unsaved changes. Are you sure you want to leave?`
          );

          if (!confirmed) return preventRedirect();
        }

        if (nextState.name === 'user') return preventRedirect();
      },
    }
    
    // other Route Configs
  });
}
```

Always remember to use `return` with `redirect` and `preventRedirect` to ensure proper flow control.
And be careful with `redirect` function in lifecycle - it has no detailed TS types to avoid circular dependency.
So, if you refactor your routes, TS errors will not be shown here which may lead to
incorrect redirects.

Uncaught errors in lifecycle functions will lead to the rendering of the `internalError` route,
so it's important to handle errors properly using `try-catch` blocks or `Promise.catch()` methods.

Note that `beforeEnter` is called on dynamic parameter changes, but not called on query changes.
This behavior may become configurable in future versions.
