type TypeExtractParams<T extends string> = string extends T
  ? Record<string, string>
  : T extends `${string}:${infer Param}/${infer Rest}`
    ? { [K in Param | keyof TypeExtractParams<`/${Rest}`>]: string }
    : T extends `${string}:${infer Param}`
      ? { [K in Param]: string }
      : never;

export type TypeExact<TTarget, TShape> = TTarget extends TShape
  ? Exclude<keyof TTarget, keyof TShape> extends never
    ? TTarget
    : never
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

export type TypeBeforeEnter = (data: {
  reason: TypeReason;
  nextState: TypeState<TypeConfig>;
  currentState?: TypeState<TypeConfig>;
  redirect: (payload: TypePayloadDefault) => void;
}) => Promise<any>;

export type TypeBeforeLeave = (data: {
  reason: TypeReason;
  nextState: TypeState<TypeConfig>;
  currentState?: TypeState<TypeConfig>;
  preventRedirect: () => void;
}) => Promise<any>;

// #region type-config-configurable
export type TypeConfigConfigurable<TPath extends string> = {
  path: TPath;
  loader: () => Promise<{ default: any }>;

  props?: Record<string, any>;
  query?: Record<string, TypeValidator>;
  beforeEnter?: TypeBeforeEnter;
  beforeLeave?: TypeBeforeLeave;
} & (TypeExtractParams<TPath> extends never
  ? { params?: never }
  : { params: { [K in keyof TypeExtractParams<TPath>]: TypeValidator } });
// #endregion type-config-configurable

// #region type-config
export type TypeConfig = {
  path: string;
  name: string;
  loader: () => Promise<{ default: any }>;
  props: Record<string, any>;

  query?: Record<string, TypeValidator>;
  params?: Record<string, TypeValidator>;
  beforeEnter?: TypeBeforeEnter;
  beforeLeave?: TypeBeforeLeave;
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

export type TypeErrorConfig = Pick<TypeConfig, 'path' | 'loader'> & { props?: TypeConfig['props'] };

export type TypeCreatedConfigs<TConfig extends Record<string, any>> = {
  [Key in Extract<keyof TConfig, string>]: TConfig[Key] & {
    name: Key;
    props: TypeConfig['props'];
    component?: TypeConfig['component'];
    otherExports?: TypeConfig['otherExports'];
  };
};

export type TypeConfigKeys<TConfigs> = Extract<keyof TConfigs, string>;

export type TypeConfigsDefault = Record<string, TypeConfig> & {
  notFound: TypeConfig;
  internalError: TypeConfig;
};

export type PropsRouter<TConfigs extends TypeConfigsDefault> = { router: TypeRouter<TConfigs> };

export type TypeRouterLocalObservable = { renderedName?: any; props: Record<string, any> };

type TypeConfigParams<TConfig> = TConfig extends { params?: infer TParams } ? TParams : never;

type TypeConfigQuery<TConfig> = TConfig extends { query?: infer TQuery } ? TQuery : never;

export type TypePayload<
  TConfigs extends Record<string, any>,
  TName extends TypeConfigKeys<TConfigs> = TypeConfigKeys<TConfigs>,
> = {
  [Key in TName]: TypeConfigParams<TConfigs[Key]> extends never
    ? TypeConfigQuery<TConfigs[Key]> extends never
      ? // no params, no query
        { name: Key; replace?: boolean }
      : // only query
        {
          name: Key;
          replace?: boolean;
          query?: Partial<Record<keyof TypeConfigQuery<TConfigs[Key]>, string>>;
        }
    : TypeConfigQuery<TConfigs[Key]> extends never
      ? // only params
        {
          name: Key;
          replace?: boolean;
          params: Record<keyof TypeConfigParams<TConfigs[Key]>, string>;
        }
      : // params and query
        {
          name: Key;
          replace?: boolean;
          params: Record<keyof TypeConfigParams<TConfigs[Key]>, string>;
          query?: Partial<Record<keyof TypeConfigQuery<TConfigs[Key]>, string>>;
        };
}[TName];

export type TypeGlobalArguments<TConfigs extends TypeConfigsDefault> = {
  adapters: TypeAdapters;
  configs: TConfigs;
  beforeComponentChange?: (params: {
    prevState?: TypeState<TypeConfig>;
    prevConfig?: TConfigs[TypeConfigKeys<TConfigs>];
    currentState: TypeState<TypeConfig>;
    currentConfig: TConfigs[TypeConfigKeys<TConfigs>];
  }) => void;
};

// #region type-router
export type TypeRouter<TConfigs extends TypeConfigsDefault> = {
  state: {
    [TName in TypeConfigKeys<TConfigs>]?: TypeState<TConfigs[TName]>;
  };
  isRedirecting: boolean;

  getGlobalArguments(): TypeGlobalArguments<TConfigs>;

  listener(): void;
  historySyncStart(): void;
  historySyncStop(): void;

  // The same `TypePayload<TConfigs>` type as for `redirect()` is intentional to keep typings small.
  //
  // Trade-off: `redirect()` must accept `query` as optional, therefore `urlToPayload()` also returns a
  // payload where `query` stays optional even after narrowing by `name` (use `payload.query?.x`).
  // At runtime `urlToPayload()` will definitely produce an empty `{}` query object
  urlToPayload(url: TypeURL): TypePayload<TConfigs>;

  payloadToState<TName extends TypeConfigKeys<TConfigs>>(
    payload: TypePayload<TConfigs, TName>
  ): TypeState<TConfigs[TName]>;

  redirect<TName extends TypeConfigKeys<TConfigs>>(
    payload: TypePayload<TConfigs, TName>,
    options?: TypeRedirectOptions
  ): Promise<TypeURL>;

  getActiveState(): TypeState<TConfigs[TypeConfigKeys<TConfigs>]> | undefined;

  init(url: TypeURL, options?: TypeRedirectOptions): Promise<TypeURL>;

  preloadComponent(name: TypeConfigKeys<TConfigs>): Promise<void>;
};
// #endregion type-router
