export type TypeAdapters = {
  batch: (cb: () => void) => void;
  autorun: (cb: () => void) => any;
  replaceObject: <TObj extends Record<string, any>>(obj: TObj, newObj: TObj) => void;
  makeObservable: <TObj extends Record<string, any>>(obj: TObj) => TObj;

  observer?: (comp: any) => any;
  immediateSetComponent?: boolean;
};

export type TypeLifecycleFunction = (
  lifecycleConfig: {
    next: TypeRouteState<TypeRouteConfig>;
    current?: TypeRouteState<TypeRouteConfig>;
    redirect: (redirectConfig: any) => void;
    preventRedirect: () => void;
  },
  ...args: Array<any>
) => Promise<any>;

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

  pageId?: string;
};

export type TypeRouteState<TRoute extends TypeRouteConfig> = {
  name: TRoute['name'];
  path: TRoute['path'];
  props: TRoute['props'];
  query: Partial<Record<keyof TRoute['query'], string>>;
  params: Record<keyof TRoute['params'], string>;
  url: string;
  search: string;
  pathname: string;
  isActive: boolean;

  pageId: TRoute['pageId'];
};

export type TypeDefaultRoutes = Record<'notFound' | 'internalError' | string, TypeRouteConfig>;

export type TypeLocationInput = { pathname: string; replace?: boolean };

export type TypePropsRouter<TRoutes extends TypeDefaultRoutes> = {
  router: TypeRouter<TRoutes>;
  beforeMount?: () => void;
  beforeSetPageComponent?: (componentConfig: TRoutes[keyof TRoutes]) => void;
  beforeUpdatePageComponent?: () => void;
};

export type TypeRoutePayload<
  TRoutes extends TypeDefaultRoutes,
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

export type TypeGlobalArguments<TRoutes extends TypeDefaultRoutes> = {
  adapters: TypeAdapters;
  routes: TRoutes;
  lifecycleParams?: Array<any>;
};

export type TypeRouter<TRoutes extends TypeDefaultRoutes> = {
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
  createRoutePayload(locationInput: TypeLocationInput): TypeRoutePayload<TRoutes, keyof TRoutes>;

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
  hydrateFromURL(locationInput: TypeLocationInput): Promise<string>;
  hydrateFromState(routerState: Partial<Pick<TypeRouter<TRoutes>, 'state'>>): Promise<void>;
};

export type TypeValidator = (param: string) => boolean;
