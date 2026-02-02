import { PropsRouter, TypeConfig, TypeRouterLocalObservable } from './types';

export function handleComponentRerender(
  props: PropsRouter<any>,
  localObservable: TypeRouterLocalObservable,
  setComponent: (component: any) => void
) {
  const { adapters, configs, beforeComponentChange } = props.router.getGlobalArguments();

  // 1. Wait until redirect is finished
  if (props.router.isRedirecting) return;

  const currentState = props.router.getActiveState();

  // 2. Wait activeRouteState is present. It may not be there if the initial redirect is async
  // 3. If the cached route name is the same, that means only dynamic params or query
  // changed. No need to call router lifecycle or update props
  if (!currentState || localObservable.renderedName === currentState.name) return;

  const currentConfig: TypeConfig = configs[currentState.name];
  const prevConfig: TypeConfig | undefined = configs[localObservable.renderedName];
  const prevState = props.router.state[localObservable.renderedName];

  adapters.batch(() => {
    localObservable.props = currentConfig.props || {};
    localObservable.renderedName = currentConfig.name;

    if (currentConfig.component !== prevConfig?.component) {
      beforeComponentChange?.({ prevState, prevConfig, currentState, currentConfig });

      setComponent(currentConfig.component);
    }
  });
}
