type TypeExtractRouteParams<T extends string> = string extends T
  ? Record<string, string>
  : T extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof TypeExtractRouteParams<`/${Rest}`>]: string }
    : T extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : never;

// #region type-adapters
export type TypeAdapters = {
  batch: (cb: () => void) => void;
  autorun: (cb: () => void) => any;
  replaceObject: <T extends Record<string, any>>(obj: T, newObj: T) => void;
  makeObservable: <T extends Record<string, any>>(obj: T) => T;
  observer?: (component: any) => any;
};
// #endregion type-adapters

export type TypeRoutePayloadDefault = {
  name: string;
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

export type TypeRouteConfigInput<TPath extends string> = {
  path: TPath;
  loader: () => Promise<{ default: any }>;

  props?: Record<string, any>;
  query?: Record<string, TypeValidator>;
  beforeEnter?: TypeLifecycleFunction;
  beforeLeave?: TypeLifecycleFunction;
} & (TypeExtractRouteParams<TPath> extends never
  ? { params?: never }
  : { params: { [K in keyof TypeExtractRouteParams<TPath>]: TypeValidator } });

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
        name: TRouteName;
        params: Record<keyof TRoutes[TRouteName]['params'], string>;
        query?: Partial<Record<keyof TRoutes[TRouteName]['query'], string>>;
        replace?: boolean;
      }
    : {
        name: TRouteName;
        params: Record<keyof TRoutes[TRouteName]['params'], string>;
        replace?: boolean;
      }
  : TRoutes[TRouteName]['query'] extends Record<string, TypeValidator>
    ? {
        name: TRouteName;
        query?: Partial<Record<keyof TRoutes[TRouteName]['query'], string>>;
        replace?: boolean;
      }
    : { name: TRouteName; replace?: boolean };

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

  locationToPayload(locationInput: string): TypeRoutePayload<TRoutes, keyof TRoutes>;

  payloadToState<TRouteName extends keyof TRoutes>(
    routePayload: TypeRoutePayload<TRoutes, TRouteName>
  ): TypeRouteState<TRoutes[TRouteName]>;

  redirect<TRouteName extends keyof TRoutes>(
    routePayload: TypeRoutePayload<TRoutes, TRouteName>
  ): Promise<string>;

  getActiveState(): TypeRouteState<TRoutes[keyof TRoutes]> | undefined;

  hydrateFromURL(locationInput: string): Promise<string>;

  hydrateFromState(routerState: Partial<Pick<TypeRouter<TRoutes>, 'state'>>): Promise<void>;

  preloadComponent(routeName: keyof TRoutes): Promise<void>;
};

export type TypeValidator = (param: string) => boolean;
