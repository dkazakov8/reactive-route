import { TypeRoute } from '../types';

export function findRouteByPathname<TRoutes extends Record<string, TypeRoute>>({
  pathname,
  routes,
}: {
  pathname: string;
  routes: TRoutes;
}): TRoutes[keyof TRoutes] | undefined {
  /**
   * route /test/edit should take precedence over /test/:edit
   *
   */

  let dynamicRouteMatch: TRoutes[keyof TRoutes] | undefined;

  const pathnameArray = pathname.replace(/\?.+$/, '').split('/').filter(Boolean);

  for (const routeName in routes) {
    if (!Object.hasOwn(routes, routeName)) continue;

    const route = routes[routeName];

    // return static match instantly
    if (!route.path.includes(':') && (pathname === route.path || pathname === `${route.path}/`))
      return route;

    // if dynamic has been already found, no need to search for another
    if (dynamicRouteMatch) continue;

    const routePathnameArray = (route.path as string).split('/').filter(Boolean);

    if (routePathnameArray.length !== pathnameArray.length) continue;

    /**
     * Dynamic params must have functional validators
     * and static params should match
     *
     */

    const someParamInvalid = routePathnameArray.some((paramName, i) => {
      const paramFromUrl = pathnameArray[i];

      if (paramName[0] !== ':') return paramName !== paramFromUrl;

      const validator = route.params?.[paramName.slice(1)];

      if (typeof validator !== 'function') {
        throw new Error(`findRoute: missing validator for param "${paramName}"`);
      }

      return !validator(paramFromUrl);
    });

    // remember matching dynamic route, no return instantly because next routes may have static match
    if (!someParamInvalid) dynamicRouteMatch = route;
  }

  return dynamicRouteMatch;
}
