import { TypePropsRouter } from '../types/TypePropsRouter';

export function routerSetLoadedComponent(
  props: TypePropsRouter<any>,
  config: {
    loadedComponentName?: any;
    loadedComponentPage?: string;
    currentProps: Record<string, any>;
  }
) {
  const activeRoute = Object.values(props.router.currentRoute).find(
    (currentRoute) => currentRoute?.isActive
  );

  //if (!activeRoute) return;

  const currentRouteName = activeRoute?.name;
  const currentRoutePage = activeRoute?.pageId;

  const componentConfig = props.router.routes[currentRouteName];

  let preventRedirect = false;
  if (props.router.isRedirecting) preventRedirect = true;
  else if (config.loadedComponentName === currentRouteName) preventRedirect = true;
  else if (config.loadedComponentPage != null && currentRouteName != null) {
    if (config.loadedComponentPage === currentRoutePage) {
      props.router.adapters.batch(() => {
        config.currentProps = 'props' in componentConfig ? componentConfig.props || {} : {};
      });
      preventRedirect = true;
    }
  }

  if (preventRedirect) return;

  props.router.adapters.batch(() => {
    if (config.loadedComponentName) props.beforeUpdatePageComponent?.();

    props.beforeSetPageComponent?.(componentConfig);

    config.currentProps = 'props' in componentConfig ? componentConfig.props! : {};
    config.loadedComponentName = currentRouteName;
    config.loadedComponentPage = componentConfig.pageId;
  });
}
