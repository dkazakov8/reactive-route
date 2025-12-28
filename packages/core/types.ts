export type TypeAdapters = {
  batch: (cb: () => void) => void;
  autorun: (cb: () => void) => any;
  replaceObject: <TObj extends Record<string, any>>(obj: TObj, newObj: TObj) => void;
  makeObservable: <TObj extends Record<string, any>>(obj: TObj) => TObj;
  observer?: (comp: any) => any;
  immediateSetComponent?: boolean;
};

export type TypeCurrentRoute<TRoute extends TypeRoute> = {
  name: TRoute['name'];
  path: TRoute['path'];
  props: TRoute['props'];
  query: Partial<Record<keyof TRoute['query'], string>>;
  params: Record<keyof TRoute['params'], string>;
  pageId: TRoute['pageId'];
  isActive: boolean;
};

export type TypeLifecycleConfig = {
  nextUrl: string;
  nextRoute: any;
  nextPathname: string;
  nextQuery?: any;
  nextSearch?: string;

  currentUrl?: string;
  currentQuery?: any;
  currentRoute?: any;
  currentSearch?: string;
  currentPathname?: string;

  redirect: (params: any) => void;
  preventRedirect: () => void;
};

export type TypePropsRouter<TRoutes extends Record<string, TypeRoute>> = {
  router: TypeRouter<TRoutes>;
  beforeMount?: () => void;
  beforeSetPageComponent?: (componentConfig: TRoutes[keyof TRoutes]) => void;
  beforeUpdatePageComponent?: () => void;
};

export type TypeRedirectParams<
  TRoutes extends Record<string, TypeRoute>,
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
    : {
        route: TRouteName;
        replace?: boolean;
      };

export type TypeRoute = TypeRouteRaw & {
  name: string;
  component?: any;
  otherExports?: Record<string, any>;
};

export type TypeRouter<TRoutes extends Record<string | 'notFound' | 'internalError', TypeRoute>> = {
  currentRoute: {
    [TRouteName in keyof TRoutes | 'notFound' | 'internalError']:
      | TypeCurrentRoute<TRoutes[TRouteName]>
      | undefined;
  };
  isRedirecting: boolean;
  redirect<TRouteName extends keyof TRoutes>(
    config: TypeRedirectParams<TRoutes, TRouteName>
  ): Promise<string>;
  restoreFromURL(params: { pathname: string; replace?: boolean }): Promise<string>;
  restoreFromServer(obj: {
    currentRoute: {
      [TRouteName in keyof TRoutes]: TypeCurrentRoute<TRoutes[TRouteName]> | undefined;
    };
  }): Promise<void>;
  destroy(): void;
  getConfig(): { adapters: TypeAdapters; routes: TRoutes; lifecycleParams?: Array<any> };
};

export type TypeRouteRaw = {
  path: string;
  loader: () => Promise<{ default: any }>;
  pageId?: string;
  props?: Record<string, any>;
  query?: Record<string, TypeValidator>;
  params?: Record<string, TypeValidator>;
  beforeEnter?: (config: TypeLifecycleConfig, ...args: Array<any>) => Promise<any>;
  beforeLeave?: (config: TypeLifecycleConfig, ...args: Array<any>) => Promise<any> | null;
};

export type TypeValidator = (param: string) => boolean;
