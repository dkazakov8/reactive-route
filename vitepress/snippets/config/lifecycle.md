```ts
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
        if (nextState.name === 'login') return preventRedirect();
        
        // Do not check for unsaved changes on the server
        if (typeof window === 'undefined') return;
        
        const hasUnsavedChanges = await api.checkForm();
        
        if (hasUnsavedChanges && !window.confirm(
          `You have unsaved changes. Are you sure you want to leave?`
        )) return preventRedirect();
      },
    }

    // other Configs
  });
}
```