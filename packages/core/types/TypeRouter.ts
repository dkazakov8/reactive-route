import { TypeAdapters } from './TypeAdapters';
import { TypeCurrentRoute } from './TypeCurrentRoute';
import { TypeRedirectParams } from './TypeRedirectParams';
import { TypeRoute } from './TypeRoute';

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
