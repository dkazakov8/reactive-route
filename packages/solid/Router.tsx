import { getInitialRoute, history, InterfaceRouterStore, TypeRoute } from 'reactive-route';
import { batch, createRenderEffect, Show } from 'solid-js';
import { createMutable } from 'solid-js/store';
import { Dynamic } from 'solid-js/web';

import { replaceObject } from './replaceObject';
import { useStore, ViewModelConstructor } from './useStore';

type TypeProps<TRoutes extends Record<string, TypeRoute>> = {
  routes: TRoutes;
  routerStore: InterfaceRouterStore<TRoutes>;
  beforeMount?: () => void;
  beforeSetPageComponent?: (componentConfig: TRoutes[keyof TRoutes]) => void;
  beforeUpdatePageComponent?: () => void;
};

class VM<TRoutes extends Record<string, TypeRoute>> implements ViewModelConstructor {
  constructor(public props: TypeProps<TRoutes>) {
    return createMutable(this);
  }
  loadedComponentName?: keyof TRoutes = undefined;
  loadedComponentPage?: string = undefined;
  currentProps: Record<string, any> = {};

  beforeMount() {
    this.props.beforeMount?.();

    this.redirectOnHistoryPop();

    createRenderEffect(() => this.setLoadedComponent());
  }

  redirectOnHistoryPop() {
    if (!history) return;

    history.listen((params) => {
      if (params.action !== 'POP') return;

      const previousRoutePathname =
        this.props.routerStore.routesHistory[this.props.routerStore.routesHistory.length - 2];

      if (previousRoutePathname === params.location.pathname) {
        this.props.routerStore.routesHistory.pop();
      }

      void this.props.routerStore.redirectTo({
        noHistoryPush: true,
        ...getInitialRoute({
          routes: this.props.routes,
          pathname: history.location.pathname,
          fallback: 'error404',
        }),
      });
    });
  }

  setLoadedComponent() {
    const currentRouteName = this.props.routerStore.currentRoute.name;
    const currentRoutePage = this.props.routerStore.currentRoute.pageName;

    let preventRedirect = false;
    if (this.props.routerStore.isRedirecting) preventRedirect = true;
    else if (this.loadedComponentName === currentRouteName) {
      preventRedirect = true;
    } else if (this.loadedComponentPage != null && currentRouteName != null) {
      if (this.loadedComponentPage === currentRoutePage) {
        const componentConfig = this.props.routes[currentRouteName];
        replaceObject(this.currentProps, 'props' in componentConfig ? componentConfig.props! : {});
        preventRedirect = true;
      }
    }

    if (preventRedirect) return;

    batch(() => {
      if (!this.loadedComponentName) {
        this.setComponent();
      } else {
        this.props.beforeUpdatePageComponent?.();

        this.setComponent();
      }
    });
  }

  setComponent() {
    const currentRouteName = this.props.routerStore.currentRoute.name;
    const componentConfig = this.props.routes[currentRouteName];

    this.props.beforeSetPageComponent?.(componentConfig);

    batch(() => {
      replaceObject(this.currentProps, 'props' in componentConfig ? componentConfig.props! : {});
      this.loadedComponentName = currentRouteName;
      this.loadedComponentPage = componentConfig.pageName;
    });
  }
}

export function Router<TRoutes extends Record<string, TypeRoute>>(props: TypeProps<TRoutes>) {
  const vm: VM<TRoutes> = useStore(VM<TRoutes>, props);

  return (
    <Show when={vm.loadedComponentName}>
      <Dynamic
        component={(props.routes[vm.loadedComponentName!]?.component || undefined) as any}
        {...vm.currentProps}
      />
    </Show>
  );
}
