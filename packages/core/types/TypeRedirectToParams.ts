import { TypeRoute } from './TypeRoute';
import { TypeValidator } from './TypeValidator';

export type TypeRedirectToParams<
  TRoutes extends Record<string, TypeRoute>,
  TRouteName extends keyof TRoutes,
> = TRoutes[TRouteName]['params'] extends Record<string, TypeValidator>
  ? TRoutes[TRouteName]['query'] extends Record<string, TypeValidator>
    ? {
        route: TRouteName;
        params: Record<keyof TRoutes[TRouteName]['params'], string>;
        query?: Partial<Record<keyof TRoutes[TRouteName]['query'], string>>;
        noHistoryPush?: boolean;
      }
    : {
        route: TRouteName;
        params: Record<keyof TRoutes[TRouteName]['params'], string>;
        noHistoryPush?: boolean;
      }
  : TRoutes[TRouteName]['query'] extends Record<string, TypeValidator>
    ? {
        route: TRouteName;
        query?: Partial<Record<keyof TRoutes[TRouteName]['query'], string>>;
        noHistoryPush?: boolean;
      }
    : {
        route: TRouteName;
        noHistoryPush?: boolean;
      };
