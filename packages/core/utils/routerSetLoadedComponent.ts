import { TypePropsRouter } from '../types';

export function routerSetLoadedComponent(
  props: TypePropsRouter<any>,
  config: {
    loadedComponentName?: any;
    loadedComponentPage?: string;
    currentProps: Record<string, any>;
  }
) {
  const { adapters, routes } = props.router.getGlobalArguments();

  const activeRoute = props.router.getActiveRouteState();

  const currentRouteName = activeRoute?.name;
  const currentRoutePage = activeRoute?.pageId;

  const componentConfig = routes[currentRouteName as any];

  let preventRedirect = false;
  if (props.router.isRedirecting) preventRedirect = true;
  else if (config.loadedComponentName === currentRouteName) preventRedirect = true;
  else if (config.loadedComponentPage != null && currentRouteName != null) {
    if (config.loadedComponentPage === currentRoutePage) {
      adapters.batch(() => {
        config.currentProps = 'props' in componentConfig ? componentConfig.props || {} : {};
      });
      preventRedirect = true;
    }
  }

  if (preventRedirect) return;

  adapters.batch(() => {
    if (config.loadedComponentName) props.beforeUpdatePageComponent?.();

    props.beforeSetPageComponent?.(componentConfig);

    config.currentProps = 'props' in componentConfig ? componentConfig.props! : {};
    config.loadedComponentName = currentRouteName;
    config.loadedComponentPage = componentConfig.pageId;
  });
}
