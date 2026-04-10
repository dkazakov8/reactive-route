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

type TypeInferParams<TConfig> = TConfig extends { params: infer TValue }
  ? TValue
  : never;

type TypeInferQuery<TConfig> = TConfig extends { query: infer TValue }
  ? TValue
  : never;

type TypeParams<TConfig> = TypeInferParams<TConfig> extends never
  ? {}
  : { params: Record<keyof TypeInferParams<TConfig>, string> };

type TypeQuery<TConfig> = TypeInferQuery<TConfig> extends never
  ? {}
  : { query?: Partial<Record<keyof TypeInferQuery<TConfig>, string>> };

type TypePathHasParams<TPath extends string> = string extends TPath
  ? true
  : TPath extends `${string}:${string}` ? true : false;

type TypeConfigParams<TPath extends string> = [TypeExtractParams<TPath>] extends [never]
  ? TypePathHasParams<TPath> extends true ? never : {} | { params: never }
  : { params: { [TParam in keyof TypeExtractParams<TPath>]: TypeValidator } };

export type TypeConfigKeys<TConfigs extends TypeConfigsDefault> = string & keyof TConfigs;

/** Some static types as a basic structure */

type TypeValidator = (param: string) => boolean;
type TypeRedirectOptions = { skipLifecycle?: boolean, fromBrowserPopstate?: boolean };

export type TypeURL = string;
export type TypeReason = 'unmodified' | 'new_query' | 'new_params' | 'new_config';

export type TypeConfigsDefault = Record<string, TypeConfig> & { notFound: TypeErrorConfig; internalError: TypeErrorConfig; };

export type TypeBeforeEnter = (
  data: {
    reason: TypeReason;
    nextState: TypeStateUntyped;
    currentState?: TypeStateUntyped;
    redirect: (stateDynamic: TypeStateDynamicUntyped & { replace?: boolean; }) => void;
  }
) => Promise<void | (TypeStateDynamicUntyped & { replace?: boolean; })>;

export type TypeBeforeLeave = (
  data: {
    reason: TypeReason;
    nextState: TypeStateUntyped;
    currentState: TypeStateUntyped;
    preventRedirect: () => void;
  }
) => Promise<void>;

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

type TypeErrorConfig = Pick<TypeConfig, 'path' | 'loader'> & { props?: TypeConfig['props'] };

/** Config types */

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

export type TypeConfigurableConfigs<TConfigConfigurable> = {
  [TName in keyof TConfigConfigurable]: TName extends 'notFound' | 'internalError'
    ? TypeExact<TConfigConfigurable[TName], TypeErrorConfig>
    : TypeConfigBase<TypeInferPath<TConfigConfigurable[TName]>> &
      TypeConfigParams<TypeInferPath<TConfigConfigurable[TName]>>;
} & { notFound: TypeErrorConfig; internalError: TypeErrorConfig };

export type TypeConfigs<TConfigConfigurable extends Record<string, any>> = {
  [TName in string & keyof TConfigConfigurable]: TConfigConfigurable[TName] & {
    name: TName;
    props: TypeConfig['props'];
    component?: TypeConfig['component'];
    otherExports?: TypeConfig['otherExports'];
  };
};

/** State types */

export type TypeState<
  TConfigs extends TypeConfigsDefault,
  TNames extends TypeConfigKeys<TConfigs> = TypeConfigKeys<TConfigs>
> = {
  [TName in TNames]: {
    name: TName,
    params: [TypeInferParams<TConfigs[TName]>] extends [never]
      ? Record<never, string>
      : Record<keyof TypeInferParams<TConfigs[TName]>, string>,
    query: [TypeInferQuery<TConfigs[TName]>] extends [never]
      ? Record<never, string>
      : Partial<Record<keyof TypeInferQuery<TConfigs[TName]>, string>>
  }
}[TNames];

// non-generic runtime form of TypeState
// when TS starts to support recursive types, it can be removed
export type TypeStateUntyped = {
  name: string;
  query: Record<string, string>;
  params: Record<string, string>;
};

export type TypeStateDynamic<
  TConfigs extends TypeConfigsDefault,
  TNames extends TypeConfigKeys<TConfigs> = TypeConfigKeys<TConfigs>,
> = {
  [TName in TNames]: { name: TName } & TypeParams<TConfigs[TName]> & TypeQuery<TConfigs[TName]>;
}[TNames];

// non-generic runtime form of TypeStateDynamic
// when TS starts to support recursive types, it can be removed
export type TypeStateDynamicUntyped = {
  name: string;
  query?: Record<string, string>;
  params?: Record<string, string>;
};

// generic state accepted by stateToUrl()
// may be TypeState or TypeStateDynamic
// router normalizes it before serializing to URL
export type TypeStateDenormalized<
  TConfigs extends TypeConfigsDefault,
  TName extends TypeConfigKeys<TConfigs> = TypeConfigKeys<TConfigs>
> = {
  name: TName;
  params?: Record<string, string> | Record<never, string>;
  query?: Record<string, string> | Record<never, string>;
};

/** Router types */

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
  activeName?: TNames;
  isRedirecting: boolean;

  getGlobalArguments(): TypeGlobalArguments<TConfigs>;

  listener(): void;
  historySyncStart(): void;
  historySyncStop(): void;

  // alias for redirect(urlToState(url))
  init(url: TypeURL, options?: TypeRedirectOptions): Promise<TypeURL>;

  redirect<TName extends TNames>(
    stateDynamic: TypeStateDynamic<TConfigs, TName> & { replace?: boolean },
    options?: TypeRedirectOptions
  ): Promise<TypeURL>;

  urlToState(url: TypeURL): TypeState<TConfigs>;

  stateToUrl(state: TypeStateDenormalized<TConfigs>): TypeURL;

  preloadComponent(name: TNames): Promise<void>;
};

/** Types for adapters */

export type TypeAdapters = {
  batch: (cb: () => void) => void;
  autorun: (cb: () => void) => void | (() => void);
  replaceObject: <T extends Record<string, any>>(obj: T, newObj: T) => void;
  makeObservable: <T extends Record<string, any>>(obj: T) => T;
  observer?: (component: any) => any;
};

/** Types for a Router component */

export type PropsRouter<
  TConfigs extends TypeConfigsDefault,
  TNames extends TypeConfigKeys<TConfigs> = TypeConfigKeys<TConfigs>,
> = { router: TypeRouter<TConfigs, TNames> };

export type TypeRouterLocal = { renderedName?: any; };