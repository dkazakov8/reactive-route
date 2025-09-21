import { getInitialRoute, history, TypePropsRouter, TypeRoute } from 'reactive-route';
import { Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export function Router<TRoutes extends Record<string, TypeRoute>>(props: TypePropsRouter<TRoutes>) {
  const config: {
    loadedComponentName?: keyof TRoutes;
    loadedComponentPage?: string;
    currentProps: Record<string, any>;
  } = props.router.adapters.makeObservable({
    loadedComponentName: undefined,
    loadedComponentPage: undefined,
    currentProps: {},
  });

  function redirectOnHistoryPop() {
    if (!history) return;

    history.listen((params) => {
      if (params.action !== 'POP') return;

      const previousRoutePathname =
        props.router.routesHistory[props.router.routesHistory.length - 2];

      if (previousRoutePathname === params.location.pathname) {
        props.router.routesHistory.pop();
      }

      void props.router.redirectTo({
        noHistoryPush: true,
        ...getInitialRoute({
          routes: props.routes,
          pathname: history.location.pathname,
        }),
      });
    });
  }

  function setLoadedComponent() {
    const currentRouteName = props.router.currentRoute.name;
    const currentRoutePage = props.router.currentRoute.pageName;

    const componentConfig = props.routes[currentRouteName];

    let preventRedirect = false;
    if (props.router.isRedirecting) preventRedirect = true;
    else if (config.loadedComponentName === currentRouteName) {
      preventRedirect = true;
    } else if (config.loadedComponentPage != null && currentRouteName != null) {
      if (config.loadedComponentPage === currentRoutePage) {
        props.router.adapters.replaceObject(
          config.currentProps,
          'props' in componentConfig ? componentConfig.props! : {}
        );
        preventRedirect = true;
      }
    }

    if (preventRedirect) return;

    props.router.adapters.batch(() => {
      if (config.loadedComponentName) {
        props.beforeUpdatePageComponent?.();
      }

      props.beforeSetPageComponent?.(componentConfig);

      props.router.adapters.batch(() => {
        props.router.adapters.replaceObject(
          config.currentProps,
          'props' in componentConfig ? componentConfig.props! : {}
        );
        config.loadedComponentName = currentRouteName;
        config.loadedComponentPage = componentConfig.pageName;
      });
    });
  }

  props.beforeMount?.();

  redirectOnHistoryPop();

  if (props.router.adapters.immediateSetComponent) {
    props.router.adapters.batch(() => {
      setLoadedComponent();
    });
  }

  props.router.adapters.autorun(() => setLoadedComponent());

  return (
    // @ts-ignore
    <Show when={config.loadedComponentName}>
      {/* @ts-ignore */}
      <Dynamic
        component={(props.routes[config.loadedComponentName!]?.component || undefined) as any}
        {...config.currentProps}
      />
    </Show>
  );
}
