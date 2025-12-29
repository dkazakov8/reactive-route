export type TypeAdapters = {
  batch: (cb: () => void) => void;
  autorun: (cb: () => void) => any;
  replaceObject: <TObj extends Record<string, any>>(obj: TObj, newObj: TObj) => void;
  makeObservable: <TObj extends Record<string, any>>(obj: TObj) => TObj;
  observer?: (comp: any) => any;
  immediateSetComponent?: boolean;
};

// This is passed in the createRoutes function
export type TypeRouteRaw = {
  path: string;
  loader: () => Promise<{ default: any }>;
  props?: Record<string, any>;
  query?: Record<string, TypeValidator>;
  params?: Record<string, TypeValidator>;
  beforeEnter?: (config: TypeLifecycleConfig, ...args: Array<any>) => Promise<any>;
  beforeLeave?: (config: TypeLifecycleConfig, ...args: Array<any>) => Promise<any> | null;

  pageId?: string;
};

// This is returned from in the createRoutes function
// Just to ensure that "name", "component" and "otherExports" are not passed manually
export type TypeRoute = TypeRouteRaw & {
  name: string;
  component?: any;
  otherExports?: Record<string, any>;
};

// This is stored in a reactive store and made from TypeRoute + data from URL
export type TypeCurrentRoute<TRoute extends TypeRoute> = {
  name: TRoute['name'];
  path: TRoute['path'];
  props: TRoute['props'];
  query: Partial<Record<keyof TRoute['query'], string>>;
  params: Record<keyof TRoute['params'], string>;
  url: string;
  pathname: string;
  search?: string;
  isActive: boolean;

  pageId: TRoute['pageId'];
};

export type TypeDefaultRoutes = Record<'notFound' | 'internalError' | string, TypeRoute>;

export type TypeLifecycleConfig = {
  next: TypeCurrentRoute<any>;
  current?: TypeCurrentRoute<any>;

  redirect: (params: any) => void;
  preventRedirect: () => void;
};

export type TypePropsRouter<TRoutes extends TypeDefaultRoutes> = {
  router: TypeRouter<TRoutes>;
  beforeMount?: () => void;
  beforeSetPageComponent?: (componentConfig: TRoutes[keyof TRoutes]) => void;
  beforeUpdatePageComponent?: () => void;
};

export type TypeRedirectParams<
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

export type TypeRouter<TRoutes extends TypeDefaultRoutes> = {
  currentRoute: {
    [TRouteName in keyof TRoutes | 'notFound' | 'internalError']:
      | TypeCurrentRoute<TRoutes[TRouteName]>
      | undefined;
  };
  isRedirecting: boolean;
  destroy(): void;
  getConfig(): { adapters: TypeAdapters; routes: TRoutes; lifecycleParams?: Array<any> };
  getActiveCurrentRoute(): TypeCurrentRoute<any> | undefined;
  redirect<TRouteName extends keyof TRoutes>(
    config: TypeRedirectParams<TRoutes, TRouteName>
  ): Promise<string>;
  restoreFromURL(params: { pathname: string; replace?: boolean }): Promise<string>;
  restoreFromServer(obj: { currentRoute: TypeRouter<TRoutes>['currentRoute'] }): Promise<void>;
};

export type TypeValidator = (param: string) => boolean;
