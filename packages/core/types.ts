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

export type TypeLifecycleFunction = (data: {
  nextState: TypeState<TypeConfig>;
  currentState?: TypeState<TypeConfig>;
  redirect: (payload: TypePayloadDefault) => void;
  preventRedirect: () => void;
}) => Promise<any>;

// #region type-config-configurable
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
// #endregion type-config-configurable

// #region type-config
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
// #endregion type-config

// #region type-state
export type TypeState<TConfig extends TypeConfig> = {
  name: TConfig['name'];
  query: Partial<Record<keyof TConfig['query'], string>>;
  params: Record<keyof TConfig['params'], string>;

  url: TypeURL;
  search: string;
  pathname: string;

  props: TConfig['props'];
  isActive: boolean;
};
// #endregion type-state

export type TypeRoutesDefault = Record<'notFound' | 'internalError' | string, TypeConfig>;

export type PropsRouter<TRoutes extends TypeRoutesDefault> = {
  router: TypeRouter<TRoutes>;
};

export type TypeRouterLocalObservable = {
  renderedName?: any;
  props: Record<string, any>;
};

export type TypePayload<
  TRoutes extends TypeRoutesDefault,
  TName extends keyof TRoutes,
> = TRoutes[TName]['params'] extends Record<string, TypeValidator>
  ? TRoutes[TName]['query'] extends Record<string, TypeValidator>
    ? {
        name: TName;
        params: Record<keyof TRoutes[TName]['params'], string>;
        query?: Partial<Record<keyof TRoutes[TName]['query'], string>>;
        replace?: boolean;
      }
    : {
        name: TName;
        params: Record<keyof TRoutes[TName]['params'], string>;
        replace?: boolean;
      }
  : TRoutes[TName]['query'] extends Record<string, TypeValidator>
    ? {
        name: TName;
        query?: Partial<Record<keyof TRoutes[TName]['query'], string>>;
        replace?: boolean;
      }
    : { name: TName; replace?: boolean };

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

// #region type-router
export type TypeRouter<TRoutes extends TypeRoutesDefault> = {
  state: {
    [TName in keyof TRoutes | 'notFound' | 'internalError']?: TypeState<TRoutes[TName]>;
  };
  isRedirecting: boolean;

  getGlobalArguments(): TypeGlobalArguments<TRoutes>;

  historyListener(): void;
  attachHistoryListener(): void;
  destroyHistoryListener(): void;

  urlToPayload(url: TypeURL): TypePayload<TRoutes, keyof TRoutes>;

  payloadToState<TName extends keyof TRoutes>(
    payload: TypePayload<TRoutes, TName>
  ): TypeState<TRoutes[TName]>;

  redirect<TName extends keyof TRoutes>(payload: TypePayload<TRoutes, TName>): Promise<TypeURL>;

  getActiveState(): TypeState<TRoutes[keyof TRoutes]> | undefined;

  hydrateFromURL(url: TypeURL): Promise<TypeURL>;

  hydrateFromState(state: Partial<Pick<TypeRouter<TRoutes>, 'state'>>): Promise<void>;

  preloadComponent(name: keyof TRoutes): Promise<void>;
};
// #endregion type-router
