// biome-ignore-all format: Complex TS types are unreadable with auto-formatting

/** Just helpers, you may skip reading them */

type TypePrettify<TObj> = { [TKey in keyof TObj]: TObj[TKey] };

type TypeExtractParams<TPath extends string, TSeen extends string = never> = string extends TPath
  ? Record<string, string>
  : TPath extends `${string}:${infer TParam}/${infer TPathRest}`
    ? TParam extends TSeen ? never : TypePrettify<Record<TParam, string> & TypeExtractParams<`/${TPathRest}`, TSeen | TParam>>
    : TPath extends `${string}:${infer TParam}` ? TParam extends TSeen ? never : Record<TParam, string> : never;

type TypeExact<TTarget, TShape> = TTarget extends TShape
  ? Exclude<keyof TTarget, keyof TShape> extends never ? TTarget : never
  : never;

type TypeInferPath<TConfig> = TConfig extends { path: infer TPath extends string }
  ? TPath
  : string;

type TypeInferParams<TConfig> = TConfig extends { params?: infer TValue }
  ? Exclude<TValue, undefined>
  : never;

type TypeInferQuery<TConfig> = TConfig extends { query?: infer TValue }
  ? Exclude<TValue, undefined>
  : never;

type TypeParams<TConfig> = TypeInferParams<TConfig> extends never
  ? {}
  : { params: Record<keyof TypeInferParams<TConfig>, string> };

type TypeQuery<TConfig> = TypeInferQuery<TConfig> extends never
  ? {}
  : { query: Partial<Record<keyof TypeInferQuery<TConfig>, string>> };

type TypeQueryOptional<TConfig> = TypeInferQuery<TConfig> extends never
  ? {}
  : { query?: Partial<Record<keyof TypeInferQuery<TConfig>, string>> };

/** Types for adapters */

// #region type-adapters
export type TypeAdapters = {
  batch: (cb: () => void) => void;
  autorun: (cb: () => void) => any;
  replaceObject: <T extends Record<string, any>>(obj: T, newObj: T) => void;
  makeObservable: <T extends Record<string, any>>(obj: T) => T;
  observer?: (component: any) => any;
};
// #endregion type-adapters

/** Types for a Router component */

export type PropsRouter<
  TConfigs extends TypeConfigsDefault,
  TNames extends TypeConfigKeys<TConfigs> = TypeConfigKeys<TConfigs>,
> = { router: TypeRouter<TConfigs, TNames> };

export type TypeRouterLocal = { renderedName?: any; props: Record<string, any> };

/** Some static types as a basic structure */

type TypeValidator = (param: string) => boolean;
type TypeRedirectOptions = { skipLifecycle?: boolean };

export type TypeURL = string;
export type TypeReason = 'unmodified' | 'new_query' | 'new_params' | 'new_config';

export type TypeConfigsDefault = Record<string, TypeConfig> & {
  notFound: TypeErrorConfig;
  internalError: TypeErrorConfig;
};

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

export type TypeBeforeEnter = (
  data: TypeLifecycleData & { redirect: (payload: TypePayloadDefault) => void; }
) => Promise<void | TypePayloadDefault>;

export type TypeBeforeLeave = (
  data: TypeLifecycleData & { preventRedirect: () => void; }
) => Promise<void>;

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

type TypeErrorConfig = Pick<TypeConfig, 'path' | 'loader'> & { props?: TypeConfig['props'] };

/** Dynamic types which are really used for the router */

export type TypeConfigKeys<TConfigs extends TypeConfigsDefault> = string & keyof TConfigs;

type TypePathHasParams<TPath extends string> = string extends TPath
  ? true
  : TPath extends `${string}:${string}` ? true : false;

type TypeConfigParams<TPath extends string> = [TypeExtractParams<TPath>] extends [never]
  ? TypePathHasParams<TPath> extends true ? never : {} | { params: never }
  : { params: { [TParam in keyof TypeExtractParams<TPath>]: TypeValidator } };

type TypeConfigBase<TPath extends string> = {
  path: TPath;
  loader: () => Promise<{ default: any }>;
  props?: Record<string, any>;
  query?: Record<string, TypeValidator>;

  // It is impossible for TS 5 to make a double self-inference, so these functions are loosely-typed
  // I tried tens of approaches and hacks
  beforeEnter?: TypeBeforeEnter;
  beforeLeave?: TypeBeforeLeave;
};

// #region type-state
export type TypeState<
  TConfigs extends TypeConfigsDefault,
  TNames extends TypeConfigKeys<TConfigs> = TypeConfigKeys<TConfigs>,
> = {
  [TName in TNames]: TypePrettify<
    {
      name: TName;
      url: TypeURL;
      search: string;
      pathname: string;
      props: TConfigs[TName]['props'];
      isActive: boolean;
    } & TypeQuery<TConfigs[TName]> & TypeParams<TConfigs[TName]>
  >;
}[TNames];
// #endregion type-state

export type TypeConfigurableConfigs<TConfigConfigurable> = {
  [TName in keyof TConfigConfigurable]: TName extends 'notFound' | 'internalError'
    ? TypeExact<TConfigConfigurable[TName], TypeErrorConfig>
    : TypeConfigBase<TypeInferPath<TConfigConfigurable[TName]>> & TypeConfigParams<TypeInferPath<TConfigConfigurable[TName]>>;
} & { notFound: TypeErrorConfig; internalError: TypeErrorConfig };

export type TypeConfigs<TConfigConfigurable extends Record<string, any>> = {
  [TName in string & keyof TConfigConfigurable]: TConfigConfigurable[TName] & {
    name: TName;
    props: TypeConfig['props'];
    component?: TypeConfig['component'];
    otherExports?: TypeConfig['otherExports'];
  };
};

export type TypePayload<
  TConfigs extends TypeConfigsDefault,
  TNames extends TypeConfigKeys<TConfigs> = TypeConfigKeys<TConfigs>,
  TQueryRequired extends boolean = false,
> = {
  [TName in TNames]: TypePrettify<
    { name: TName; replace?: boolean }
    & TypeParams<TConfigs[TName]>
    & (TQueryRequired extends true ? TypeQuery<TConfigs[TName]> : TypeQueryOptional<TConfigs[TName]>)
  >;
}[TNames];

export type TypePayloadParsed<
  TConfigs extends TypeConfigsDefault,
  TNames extends TypeConfigKeys<TConfigs> = TypeConfigKeys<TConfigs>,
> = TypePayload<TConfigs, TNames, true>;

export type TypeGlobalArguments<
  TConfigs extends TypeConfigsDefault,
  TNames extends TypeConfigKeys<TConfigs> = TypeConfigKeys<TConfigs>,
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