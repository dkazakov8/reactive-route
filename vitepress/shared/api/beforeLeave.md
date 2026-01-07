```ts obj
dashboard: {
  path: '/dashboard',
  loader: () => import('./pages/dashboard'),
  async beforeLeave({ preventRedirect, nextState }) {
    if (nextState.name === 'login') return preventRedirect();

    // Do not check for unsaved changes on the server
    if (typeof window === 'undefined') return;

    const hasUnsavedChanges = await api.checkForm();

    if (hasUnsavedChanges && !window.confirm(
      `You have unsaved changes. Are you sure you want to leave?`
    )) return preventRedirect();
  }
}
```