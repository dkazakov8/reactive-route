import { TypeRedirectParams, TypeRoute } from '../types';
import { findRouteByPathname } from './findRouteByPathname';
import { getDynamicValues } from './getDynamicValues';
import { getQueryValues } from './getQueryValues';

export function getInitialRoute<
  TRoutes extends Record<string | 'notFound' | 'internalError', TypeRoute>,
>(params: {
  routes: TRoutes;
  pathname: string;
  replace?: boolean;
}): TypeRedirectParams<TRoutes, keyof TRoutes> {
  const { routes, pathname, replace } = params;

  const route = findRouteByPathname({ pathname, routes }) || params.routes.notFound;

  return {
    route: route.name as keyof TRoutes,
    query: getQueryValues({ route, pathname }),
    params: getDynamicValues({ route, pathname }),
    replace,
  } as any;
}
