import { PropsRouter, TypeConfig, TypeRouterLocal } from './types';

export function handleComponentRerender(
  props: PropsRouter<any>,
  localState: TypeRouterLocal,
  setComponent: (component: any, componentProps: Record<string, any>) => void
) {
  const { router } = props;
  const { adapters, configs, beforeComponentChange } = router.getGlobalArguments();

  if (router.isRedirecting || !router.activeName || localState.renderedName === router.activeName)
    return;

  const currentConfig: TypeConfig = configs[router.activeName];
  const currentState = router.state[router.activeName]!;

  const prevConfig: TypeConfig | undefined = configs[localState.renderedName];
  const prevState = router.state[localState.renderedName];

  adapters.batch(() => {
    localState.renderedName = currentConfig.name;

    setComponent(currentConfig.component, currentConfig.props || {});

    if (currentConfig.component !== prevConfig?.component) {
      beforeComponentChange?.({ prevState, prevConfig, currentState, currentConfig });
    }
  });
}
