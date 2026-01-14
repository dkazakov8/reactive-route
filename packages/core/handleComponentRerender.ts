import { PropsRouter, TypeRouteConfig, TypeRouterLocalObservable } from './types';

export function handleComponentRerender(
  props: PropsRouter<any>,
  localObservable: TypeRouterLocalObservable,
  setComponent: (component: any) => void
) {
  const { adapters, routes, beforeComponentChange } = props.router.getGlobalArguments();

  // 1. Wait until redirect is finished
  if (props.router.isRedirecting) return;

  const currentState = props.router.getActiveRouteState();

  // 2. Wait activeRouteState is present. It may not be there if the initial redirect is async
  // 3. If the cached route name is the same, that means only dynamic params or query
  // changed. No need to call router lifecycle or update props
  if (!currentState || localObservable.renderedRouteName === currentState.name) return;

  const currentConfig: TypeRouteConfig = routes[currentState.name];
  const prevConfig: TypeRouteConfig | undefined = routes[localObservable.renderedRouteName];
  const prevState = props.router.state[localObservable.renderedRouteName];

  adapters.batch(() => {
    localObservable.currentProps = currentConfig.props || {};
    localObservable.renderedRouteName = currentConfig.name;

    if (currentConfig.component !== prevConfig?.component) {
      beforeComponentChange?.({ prevState, prevConfig, currentState, currentConfig });

      setComponent(currentConfig.component);
    }
  });
}
