import { getInitialRoute, history, TypePropsRouter, TypeRoute } from 'reactive-route';
import { Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export function Router<TRoutes extends Record<string, TypeRoute>>(props: TypePropsRouter<TRoutes>) {
  const config: {
    loadedComponentName?: keyof TRoutes;
    loadedComponentPage?: string;
    currentProps: Record<string, any>;
  } = props.routerStore.adapters.makeObservable({
    loadedComponentName: undefined,
    loadedComponentPage: undefined,
    currentProps: {},
  });

  function redirectOnHistoryPop() {
    if (!history) return;

    history.listen((params) => {
      if (params.action !== 'POP') return;

      const previousRoutePathname =
        props.routerStore.routesHistory[props.routerStore.routesHistory.length - 2];

      if (previousRoutePathname === params.location.pathname) {
        props.routerStore.routesHistory.pop();
      }

      void props.routerStore.redirectTo({
        noHistoryPush: true,
        ...getInitialRoute({
          routes: props.routes,
          pathname: history.location.pathname,
          fallback: 'error404',
        }),
      });
    });
  }

  function setLoadedComponent() {
    const currentRouteName = props.routerStore.currentRoute.name;
    const currentRoutePage = props.routerStore.currentRoute.pageName;

    const componentConfig = props.routes[currentRouteName];

    let preventRedirect = false;
    if (props.routerStore.isRedirecting) preventRedirect = true;
    else if (config.loadedComponentName === currentRouteName) {
      preventRedirect = true;
    } else if (config.loadedComponentPage != null && currentRouteName != null) {
      if (config.loadedComponentPage === currentRoutePage) {
        props.routerStore.adapters.replaceObject(
          config.currentProps,
          'props' in componentConfig ? componentConfig.props! : {}
        );
        preventRedirect = true;
      }
    }

    if (preventRedirect) return;

    props.routerStore.adapters.batch(() => {
      if (config.loadedComponentName) {
        props.beforeUpdatePageComponent?.();
      }

      props.beforeSetPageComponent?.(componentConfig);

      props.routerStore.adapters.batch(() => {
        props.routerStore.adapters.replaceObject(
          config.currentProps,
          'props' in componentConfig ? componentConfig.props! : {}
        );
        config.loadedComponentName = currentRouteName;
        config.loadedComponentPage = componentConfig.pageName;
        // @ts-ignore
        config[Symbol.for('$adm')]?.batch();
      });
    });
  }

  props.beforeMount?.();

  redirectOnHistoryPop();

  props.routerStore.adapters.autorun(() => setLoadedComponent());

  return (
    <Show when={config.loadedComponentName}>
      <Dynamic
        component={(props.routes[config.loadedComponentName!]?.component || undefined) as any}
        {...config.currentProps}
      />
    </Show>
  );
}
