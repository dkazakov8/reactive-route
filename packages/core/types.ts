import { s } from 'vitest/dist/chunks/reporters.d.Rsi0PyxX';

export type TypeAdapters = {
  batch: (cb: () => void) => void;
  autorun: (cb: () => void) => any;
  replaceObject: <TObj extends Record<string, any>>(obj: TObj, newObj: TObj) => void;
  makeObservable: <TObj extends Record<string, any>>(obj: TObj) => TObj;

  observer?: (component: any) => any;
  immediateSetComponent?: boolean;
};

export type TypeRoutePayloadDefault = {
  route: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
  replace?: boolean;
};

export type TypeLifecycleFunction = (lifecycleConfig: {
  nextState: TypeRouteState<TypeRouteConfig>;
  currentState?: TypeRouteState<TypeRouteConfig>;
  redirect: (routePayload: TypeRoutePayloadDefault) => void;
  preventRedirect: () => void;
}) => Promise<any>;

export type TypeRouteConfig = {
  path: string;
  name: string;
  loader: () => Promise<{ default: any }>;

  props?: Record<string, any>;
  query?: Record<string, TypeValidator>;
  params?: Record<string, TypeValidator>;
  beforeEnter?: TypeLifecycleFunction;
  beforeLeave?: TypeLifecycleFunction;
  component?: any;
  otherExports?: Record<string, any>;
};

export type TypeRouteState<TRoute extends TypeRouteConfig> = {
  name: TRoute['name'];
  props: TRoute['props'];
  query: Partial<Record<keyof TRoute['query'], string>>;
  params: Record<keyof TRoute['params'], string>;
  url: string;
  search: string;
  pathname: string;
  isActive: boolean;
};

export type TypeRoutesDefault = Record<'notFound' | 'internalError' | string, TypeRouteConfig>;

export type PropsRouter<TRoutes extends TypeRoutesDefault> = {
  router: TypeRouter<TRoutes>;
};

export type TypeRouterLocalObservable = {
  renderedRouteName?: any;
  currentProps: Record<string, any>;
};

export type TypeRoutePayload<
  TRoutes extends TypeRoutesDefault,
  TRouteName extends keyof TRoutes,
> = TRoutes[TRouteName]['params'] extends Record<string, TypeValidator>
  ? TRoutes[TRouteName]['query'] extends Record<string, TypeValidator>
    ? {
        route: TRouteName;
        params: Record<keyof TRoutes[TRouteName]['params'], string>;
        query?: Partial<Record<keyof TRoutes[TRouteName]['query'], string>>;
        replace?: boolean;
      }
    : {
        route: TRouteName;
        params: Record<keyof TRoutes[TRouteName]['params'], string>;
        replace?: boolean;
      }
  : TRoutes[TRouteName]['query'] extends Record<string, TypeValidator>
    ? {
        route: TRouteName;
        query?: Partial<Record<keyof TRoutes[TRouteName]['query'], string>>;
        replace?: boolean;
      }
    : { route: TRouteName; replace?: boolean };

export type TypeGlobalArguments<TRoutes extends TypeRoutesDefault> = {
  adapters: TypeAdapters;
  routes: TRoutes;
  beforeComponentChange?: (params: {
    prevState?: TypeRouteState<TypeRouteConfig>;
    prevConfig?: TRoutes[keyof TRoutes];
    currentState: TypeRouteState<TypeRouteConfig>;
    currentConfig: TRoutes[keyof TRoutes];
  }) => void;
};

export type TypeRouter<TRoutes extends TypeRoutesDefault> = {
  state: {
    [TRouteName in keyof TRoutes | 'notFound' | 'internalError']?: TypeRouteState<
      TRoutes[TRouteName]
    >;
  };
  isRedirecting: boolean;

  // (internal) the arguments passed to createRouter
  getGlobalArguments(): TypeGlobalArguments<TRoutes>;

  // (internal) handle history back/forward events
  historyListener(): void;
  attachHistoryListener(): void;
  destroyHistoryListener(): void;

  // (internal) takes just { pathname: location.pathname + location.search } and creates TypeRoutePayload
  createRoutePayload(locationInput: string): TypeRoutePayload<TRoutes, keyof TRoutes>;

  // (public) may be used for creating Link components because it produces URL
  createRouteState<TRouteName extends keyof TRoutes>(
    routePayload: TypeRoutePayload<TRoutes, TRouteName>
  ): TypeRouteState<TRoutes[TRouteName]>;

  // (public) used for redirects and returns URL of the next route
  redirect<TRouteName extends keyof TRoutes>(
    routePayload: TypeRoutePayload<TRoutes, TRouteName>
  ): Promise<string>;

  // (public) may be used for layouts change above the Router component
  getActiveRouteState(): TypeRouteState<TRoutes[keyof TRoutes]> | undefined;

  // (public) prepares the router for work. Must be called before Router component's rendering
  hydrateFromURL(locationInput: string): Promise<string>;
  hydrateFromState(routerState: Partial<Pick<TypeRouter<TRoutes>, 'state'>>): Promise<void>;

  preloadComponent(routeName: keyof TRoutes): Promise<void>;
};

export type TypeValidator = (param: string) => boolean;
