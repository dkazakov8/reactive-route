// biome-ignore-all format: Complex TS types are unreadable with auto-formatting

type TypePrettify<T> = { [K in keyof T]: T[K] };

type TypeExtractParams<TPath extends string> = string extends TPath
  ? Record<string, string>
  : TPath extends `${string}:${infer TParam}/${infer TPathRest}`
    ? TypePrettify<Record<TParam, string> & TypeExtractParams<`/${TPathRest}`>>
    : TPath extends `${string}:${infer TParam}`
      ? Record<TParam, string>
      : never;

type TypeExact<TTarget, TShape> = TTarget extends TShape
  ? Exclude<keyof TTarget, keyof TShape> extends never ? TTarget : never
  : never;

type TypeErrorConfig = Pick<TypeConfig, 'path' | 'loader'> & { props?: TypeConfig['props'] };

type TypeConfigParams<TPath extends string> =
  TypeExtractParams<TPath> extends never
    ? { params?: never }
    : { params: { [TParam in keyof TypeExtractParams<TPath>]: TypeValidator } };

type TypeInferPath<TConfig> = TConfig extends { path: infer TPath extends string } ? TPath : string;

type TypeInferField<TConfig, TField extends 'params' | 'query'> =
  TConfig extends { [_ in TField]?: infer TValue } ? Exclude<TValue, undefined> : never;

type TypeValidator = (param: string) => boolean;
type TypeRedirectOptions = { skipLifecycle?: boolean; };

export type TypeURL = string;
export type TypeReason = 'unmodified' | 'new_query' | 'new_params' | 'new_config';

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
  query?: Record<string, string>;
  params?: Record<string, string>;
  replace?: boolean;
};

export type TypeLifecycleData = {
  reason: TypeReason;
  nextState: TypeState<TypeConfigsDefault, any>;
  currentState?: TypeState<TypeConfigsDefault, any>;
};

export type TypeBeforeEnter = (data: TypeLifecycleData & {
  redirect: (payload: TypePayloadDefault) => void;
}) => Promise<any>;

export type TypeBeforeLeave = (data: TypeLifecycleData & {
  preventRedirect: () => void;
}) => Promise<any>;

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
export type TypeState<
  TConfigs extends TypeConfigsDefault,
  TNames extends TypeConfigKeys<TConfigs> = TypeConfigKeys<TConfigs>
> = {
  [TName in TNames]: TypePrettify<{
    name: TName;
    url: TypeURL;
    search: string;
    pathname: string;
    props: TConfigs[TName]['props'];
    isActive: boolean;
  } & (
    TypeInferField<TConfigs[TName], 'query'> extends never
      ? {}
      : { query: Partial<Record<keyof TypeInferField<TConfigs[TName], 'query'>, string>> }
  ) & (
    TypeInferField<TConfigs[TName], 'params'> extends never
      ? {}
      : { params: Record<keyof TypeInferField<TConfigs[TName], 'params'>, string> }
  )>;
}[TNames];
// #endregion type-state

export type TypeConfigurableConfigs<TConfigConfigurable> = {
  [TName in keyof TConfigConfigurable]: TName extends 'notFound' | 'internalError'
    ? TypeExact<TConfigConfigurable[TName], TypeErrorConfig>
    : {
      path: TypeInferPath<TConfigConfigurable[TName]>;
      loader: () => Promise<{ default: any }>;
      props?: Record<string, any>;
      query?: Record<string, TypeValidator>;
      beforeEnter?: TypeBeforeEnter;
      beforeLeave?: TypeBeforeLeave;
    } & TypeConfigParams<TypeInferPath<TConfigConfigurable[TName]>>;
} & { notFound: TypeErrorConfig; internalError: TypeErrorConfig };

export type TypeConfigsExtended<TConfigConfigurable extends Record<string, any>> = {
  [TName in string & keyof TConfigConfigurable]: TConfigConfigurable[TName] & {
    name: TName;
    props: TypeConfig['props'];
    component?: TypeConfig['component'];
    otherExports?: TypeConfig['otherExports'];
  };
};

export type TypeConfigKeys<TConfigs extends TypeConfigsDefault> = string & keyof TConfigs;

export type TypeConfigsDefault = Record<string, TypeConfig> & {
  notFound: TypeConfig;
  internalError: TypeConfig;
};

export type PropsRouter<TConfigs extends TypeConfigsDefault> = {
  router: TypeRouter<TConfigs, any>;
};

export type TypeRouterLocalObservable = { renderedName?: any; props: Record<string, any> };

export type TypePayload<
  TConfigs extends TypeConfigsDefault,
  TNames extends TypeConfigKeys<TConfigs> = TypeConfigKeys<TConfigs>,
  TQueryRequired extends boolean = false,
> = {
  [TName in TNames]: TypePrettify<
    { name: TName; replace?: boolean }
    & (
      TypeInferField<TConfigs[TName], 'params'> extends never
        ? {}
        : { params: Record<keyof TypeInferField<TConfigs[TName], 'params'>, string> }
    )
    & (
      TypeInferField<TConfigs[TName], 'query'> extends never
        ? {}
        : TQueryRequired extends true
          ? { query: Partial<Record<keyof TypeInferField<TConfigs[TName], 'query'>, string>> }
          : { query?: Partial<Record<keyof TypeInferField<TConfigs[TName], 'query'>, string>> })
  >;
}[TNames];

export type TypePayloadParsed<
  TConfigs extends TypeConfigsDefault,
  TNames extends TypeConfigKeys<TConfigs> = TypeConfigKeys<TConfigs>,
> = TypePayload<TConfigs, TNames, true>;

export type TypeGlobalArguments<
  TConfigs extends TypeConfigsDefault,
  TNames extends TypeConfigKeys<TConfigs> = TypeConfigKeys<TConfigs>
> = {
  adapters: TypeAdapters;
  configs: TConfigs;
  beforeComponentChange?: (params: {
    prevState?: TypeState<TConfigs, TNames>;
    prevConfig?: TConfigs[TNames];
    currentState: TypeState<TConfigs, TNames>;
    currentConfig: TConfigs[TNames];
  }) => void;
};

// #region type-router
export type TypeRouter<
  TConfigs extends TypeConfigsDefault,
  TNames extends TypeConfigKeys<TConfigs> = TypeConfigKeys<TConfigs>,
> = {
  state: { [TName in TNames]?: TypeState<TConfigs, TName> };
  isRedirecting: boolean;

  getGlobalArguments(): TypeGlobalArguments<TConfigs>;

  listener(): void;
  historySyncStart(): void;
  historySyncStop(): void;

  init(url: TypeURL, options?: TypeRedirectOptions): Promise<TypeURL>;

  redirect<TName extends TNames>(payload: TypePayload<TConfigs, TName>, options?: TypeRedirectOptions): Promise<TypeURL>;

  urlToPayload(url: TypeURL): TypePayloadParsed<TConfigs>;

  payloadToState<TName extends TNames>(payload: TypePayload<TConfigs, TName> & { name: TName }): TypeState<TConfigs, TName>;

  getActiveState(): TypeState<TConfigs, TNames> | undefined;

  preloadComponent(name: TNames): Promise<void>;
};