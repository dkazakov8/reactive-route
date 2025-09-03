import { autorun, makeAutoObservable, runInAction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { getInitialRoute, history, InterfaceRouterStore, TypeRoute } from 'reactive-route';

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
    makeAutoObservable(
      this,
      { loadedComponent: false, setLoadedComponent: false, props: false },
      { autoBind: true }
    );
  }
  autorunDisposers: Array<() => void> = [];
  loadedComponentName?: keyof TRoutes = undefined;
  loadedComponentPage?: string = undefined;
  loadedComponent?: any;
  currentProps: Record<string, any> = {};

  beforeMount() {
    this.props.beforeMount?.();

    this.redirectOnHistoryPop();

    this.setLoadedComponent();

    this.autorunDisposers.push(autorun(this.setLoadedComponent));
  }

  redirectOnHistoryPop() {
    if (!history) return;

    history.listen((params) => {
      if (params.action !== 'POP') return;

      const previousRoutePathname =
        this.props.routerStore.routesHistory[this.props.routerStore.routesHistory.length - 2];

      if (previousRoutePathname === params.location.pathname) {
        runInAction(() => this.props.routerStore.routesHistory.pop());
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

  setLoadedComponent = () => {
    const { loadedComponentName, loadedComponentPage } = this;
    const { currentRoute, isRedirecting } = this.props.routerStore;

    const currentRouteName = currentRoute.name;
    const currentRoutePage = currentRoute.pageName;

    let preventRedirect = false;
    if (isRedirecting) preventRedirect = true;
    else if (loadedComponentName === currentRouteName) preventRedirect = true;
    else if (loadedComponentPage != null && currentRouteName != null) {
      if (loadedComponentPage === currentRoutePage) {
        const componentConfig = this.props.routes[currentRouteName];
        runInAction(() => {
          this.currentProps = 'props' in componentConfig ? componentConfig.props || {} : {};
        });
        preventRedirect = true;
      }
    }

    if (preventRedirect) return;

    runInAction(() => {
      if (!loadedComponentName) {
        this.setComponent(currentRouteName);
      } else {
        this.props.beforeUpdatePageComponent?.();

        this.setComponent(currentRouteName);
      }
    });
  };

  setComponent(currentRouteName: keyof TRoutes) {
    runInAction(() => {
      const componentConfig = this.props.routes[currentRouteName];
      const RouteComponent: any = componentConfig.component;

      this.props.beforeSetPageComponent?.(componentConfig);

      this.currentProps = 'props' in componentConfig ? componentConfig.props || {} : {};
      this.loadedComponentName = currentRouteName;
      this.loadedComponentPage = componentConfig.pageName;
      this.loadedComponent = RouteComponent;
    });
  }
}

export const Router = observer(
  <TRoutes extends Record<string, TypeRoute>>(props: TypeProps<TRoutes>) => {
    const vm: VM<TRoutes> = useStore(VM<TRoutes>, props);

    const LoadedComponent = vm.loadedComponentName ? vm.loadedComponent : null;

    if (LoadedComponent) return (<LoadedComponent {...vm.currentProps} />) as any;

    return null;
  }
);
