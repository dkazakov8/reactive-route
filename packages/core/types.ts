type TypeExtractParams<T extends string> = string extends T
  ? Record<string, string>
  : T extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof TypeExtractParams<`/${Rest}`>]: string }
    : T extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : never;

export type TypeURL = string;
export type TypeValidator = (param: string) => boolean;
export type TypeReason = 'unmodified' | 'new_query' | 'new_params' | 'new_config';
export type TypeRedirectOptions = {
  skipLifecycle?: boolean;
};

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
  reason: TypeReason;
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

export type TypeConfigsDefault = Record<'notFound' | 'internalError' | string, TypeConfig>;

export type PropsRouter<TConfigs extends TypeConfigsDefault> = {
  router: TypeRouter<TConfigs>;
};

export type TypeRouterLocalObservable = {
  renderedName?: any;
  props: Record<string, any>;
};

export type TypePayload<
  TConfigs extends TypeConfigsDefault,
  TName extends keyof TConfigs,
> = TConfigs[TName]['params'] extends Record<string, TypeValidator>
  ? TConfigs[TName]['query'] extends Record<string, TypeValidator>
    ? {
        name: TName;
        params: Record<keyof TConfigs[TName]['params'], string>;
        query?: Partial<Record<keyof TConfigs[TName]['query'], string>>;
        replace?: boolean;
      }
    : {
        name: TName;
        params: Record<keyof TConfigs[TName]['params'], string>;
        replace?: boolean;
      }
  : TConfigs[TName]['query'] extends Record<string, TypeValidator>
    ? {
        name: TName;
        query?: Partial<Record<keyof TConfigs[TName]['query'], string>>;
        replace?: boolean;
      }
    : { name: TName; replace?: boolean };

export type TypeGlobalArguments<TConfigs extends TypeConfigsDefault> = {
  adapters: TypeAdapters;
  configs: TConfigs;
  beforeComponentChange?: (params: {
    prevState?: TypeState<TypeConfig>;
    prevConfig?: TConfigs[keyof TConfigs];
    currentState: TypeState<TypeConfig>;
    currentConfig: TConfigs[keyof TConfigs];
  }) => void;
};

// #region type-router
export type TypeRouter<TConfigs extends TypeConfigsDefault> = {
  state: {
    [TName in keyof TConfigs | 'notFound' | 'internalError']?: TypeState<TConfigs[TName]>;
  };
  isRedirecting: boolean;

  getGlobalArguments(): TypeGlobalArguments<TConfigs>;

  listener(): void;
  historySyncStart(): void;
  historySyncStop(): void;

  urlToPayload(url: TypeURL): TypePayload<TConfigs, keyof TConfigs>;

  payloadToState<TName extends keyof TConfigs>(
    payload: TypePayload<TConfigs, TName>
  ): TypeState<TConfigs[TName]>;

  redirect<TName extends keyof TConfigs>(
    payload: TypePayload<TConfigs, TName>,
    options?: TypeRedirectOptions
  ): Promise<TypeURL>;

  getActiveState(): TypeState<TConfigs[keyof TConfigs]> | undefined;

  init(url: TypeURL, options?: TypeRedirectOptions): Promise<TypeURL>;

  preloadComponent(name: keyof TConfigs): Promise<void>;
};
// #endregion type-router
