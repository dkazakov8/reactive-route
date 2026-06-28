```ts obj
dashboard: {
  path: '/dashboard',
  loader: () => import('./pages/dashboard'),
  async beforeLeave({ currentState, nextState, reason }) {
    // beforeLeave is for side effects, not cancelling navigation.
    await analytics.trackRouteLeave({
      from: currentState.name,
      to: nextState.name,
      reason,
    });
  }
}
```
