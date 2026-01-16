type TypeExtractParams<T extends string> = string extends T
  ? Record<string, string>
  : T extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof TypeExtractParams<`/${Rest}`>]: string }
    : T extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : never;

export type TypeURL = string;
export type TypeValidator = (param: string) => boolean;

// #region type-adapters
export type TypeAdapters = {
  batch: (cb: () => void) => void;
  autorun: (cb: () => void) => any;
  replaceObject: <T extends Record<string, any>>(obj: T, newObj: T) => void;
  makeObservable: <T extends Record<string, any>>(obj: T) => T;
  observer?: (component: any) => any;
};
// #endregion type-adapters

export type TypePayloadDefault = {
  name: string;
  params?: Record<string, string>;
  query?: Record<string, string>;
  replace?: boolean;
};

export type TypeLifecycleFunction = (lifecycleConfig: {
  nextState: TypeState<TypeConfig>;
  currentState?: TypeState<TypeConfig>;
  redirect: (payload: TypePayloadDefault) => void;
  preventRedirect: () => void;
}) => Promise<any>;

export type TypeConfigConfigurable<TPath extends string> = {
  path: TPath;
  loader: () => Promise<{ default: any }>;

  props?: Record<string, any>;
  query?: Record<string, TypeValidator>;
  beforeEnter?: TypeLifecycleFunction;
  beforeLeave?: TypeLifecycleFunction;
} & (TypeExtractParams<TPath> extends never
  ? { params?: never }
  : { params: { [K in keyof TypeExtractParams<TPath>]: TypeValidator } });

export type TypeConfig = {
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

export type TypeState<TRoute extends TypeConfig> = {
  name: TRoute['name'];
  props: TRoute['props'];
  query: Partial<Record<keyof TRoute['query'], string>>;
  params: Record<keyof TRoute['params'], string>;
  url: TypeURL;
  search: string;
  pathname: string;
  isActive: boolean;
};

export type TypeRoutesDefault = Record<'notFound' | 'internalError' | string, TypeConfig>;

export type PropsRouter<TRoutes extends TypeRoutesDefault> = {
  router: TypeRouter<TRoutes>;
};

export type TypeRouterLocalObservable = {
  renderedRouteName?: any;
  currentProps: Record<string, any>;
};

export type TypePayload<
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
    prevState?: TypeState<TypeConfig>;
    prevConfig?: TRoutes[keyof TRoutes];
    currentState: TypeState<TypeConfig>;
    currentConfig: TRoutes[keyof TRoutes];
  }) => void;
};

export type TypeRouter<TRoutes extends TypeRoutesDefault> = {
  state: {
    [TRouteName in keyof TRoutes | 'notFound' | 'internalError']?: TypeState<TRoutes[TRouteName]>;
  };
  isRedirecting: boolean;

  // (internal) the arguments passed to createRouter
  getGlobalArguments(): TypeGlobalArguments<TRoutes>;

  // (internal) handle history back/forward events
  historyListener(): void;
  attachHistoryListener(): void;
  destroyHistoryListener(): void;

  locationToPayload(url: TypeURL): TypePayload<TRoutes, keyof TRoutes>;

  payloadToState<TRouteName extends keyof TRoutes>(
    payload: TypePayload<TRoutes, TRouteName>
  ): TypeState<TRoutes[TRouteName]>;

  redirect<TRouteName extends keyof TRoutes>(
    payload: TypePayload<TRoutes, TRouteName>
  ): Promise<TypeURL>;

  getActiveState(): TypeState<TRoutes[keyof TRoutes]> | undefined;

  hydrateFromURL(url: TypeURL): Promise<TypeURL>;

  hydrateFromState(routerState: Partial<Pick<TypeRouter<TRoutes>, 'state'>>): Promise<void>;

  preloadComponent(name: keyof TRoutes): Promise<void>;
};
