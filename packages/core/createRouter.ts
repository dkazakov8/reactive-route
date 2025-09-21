import { InterfaceRouterStore, TypeCreateRouterStore } from './types/InterfaceRouterStore';
import { TypeLifecycleConfig } from './types/TypeLifecycleConfig';
import { TypeRedirectToParams } from './types/TypeRedirectToParams';
import { TypeRoute } from './types/TypeRoute';
import { constants } from './utils/constants';
import { getDynamicValues } from './utils/getDynamicValues';
import { getInitialRoute } from './utils/getInitialRoute';
import { getQueryValues } from './utils/getQueryValues';
import { history } from './utils/history';
import { loadComponentToConfig } from './utils/loadComponentToConfig';
import { PreventError } from './utils/PreventError';
import { queryString } from './utils/queryString';
import { RedirectError } from './utils/RedirectError';
import { replaceDynamicValues } from './utils/replaceDynamicValues';

export function createRouter<
  TRoutes extends Record<string | 'notFound' | 'internalError', TypeRoute>,
>({
  adapters,
  routes,
  lifecycleParams,
}: TypeCreateRouterStore<TRoutes>): InterfaceRouterStore<TRoutes> {
  const router: InterfaceRouterStore<TRoutes> = adapters.makeObservable({
    routesHistory: [],
    currentRoute: {} as any,
    isRedirecting: false,
    redirectTo: undefined as any,
    restoreFromURL: undefined as any,
    restoreFromServer: undefined as any,
    get adapters() {
      return adapters;
    },
  });

  router.restoreFromServer = function restoreFromServer(obj) {
    adapters.batch(() => {
      router.routesHistory.push(...(obj.routesHistory || []));
      Object.assign(router.currentRoute, obj.currentRoute);
    });

    const preloadedRouteName = Object.keys(routes).find(
      (routeName) => router.currentRoute.name === routeName
    ) as keyof typeof routes;

    return loadComponentToConfig({ route: routes[preloadedRouteName] });
  };

  router.restoreFromURL = function restoreFromURL(params) {
    return router.redirectTo(getInitialRoute({ routes, pathname: params.pathname }));
  };

  router.redirectTo = async function redirectTo<TRouteName extends keyof TRoutes>(
    config: TypeRedirectToParams<TRoutes, TRouteName>
  ) {
    const { route: routeName, noHistoryPush } = config;

    /**
     * Construct current route data
     *
     */

    let currentRoute: undefined | TRoutes[keyof TRoutes];
    let currentPathname: undefined | string;
    let currentUrl: undefined | string;
    let currentSearch: undefined | string;
    let currentQuery: Partial<Record<keyof TRoutes[TRouteName]['query'], string>> | undefined;

    if (router.currentRoute?.name) {
      currentRoute = routes[router.currentRoute.name];
      currentPathname = replaceDynamicValues({
        route: currentRoute,
        params: router.currentRoute.params,
      });
      currentQuery = router.currentRoute.query;
      currentSearch = queryString.stringify(router.currentRoute.query as any);
      currentUrl = `${currentPathname}${currentSearch ? `?${currentSearch}` : ''}`;
    }

    /**
     * Construct next route data
     *
     */

    const nextRoute = routes[routeName];
    const nextPathname = replaceDynamicValues({
      route: nextRoute,
      params: 'params' in config ? config.params : undefined,
    });
    let nextQuery: Partial<Record<keyof TRoutes[TRouteName]['query'], string>> | undefined;
    let nextUrl = nextPathname;
    let nextSearch: undefined | string;

    if ('query' in config && config.query) {
      const clearedQuery = getQueryValues({
        route: nextRoute,
        pathname: `${nextPathname}?${queryString.stringify(config.query as any)}`,
      });

      if (Object.keys(clearedQuery).length > 0) {
        nextQuery = clearedQuery;
        nextSearch = queryString.stringify(clearedQuery);
        nextUrl = `${nextPathname}?${nextSearch}`;
      }
    }

    /**
     * Prevent redirect to the same url
     *
     */

    if (currentUrl === nextUrl) return Promise.resolve();

    /**
     * If pathname is the same, but query changed (no lifecycle)
     *
     */

    if (currentPathname === nextPathname) {
      if (currentSearch !== nextSearch) {
        adapters.batch(() => {
          adapters.replaceObject(router.currentRoute, {
            ...router.currentRoute,
            query: nextQuery || {},
          });
          router.routesHistory.push(nextUrl);
        });

        if (history && !noHistoryPush) {
          history.push({
            hash: history.location.hash,
            search: nextSearch,
            pathname: nextPathname,
          });
        }
      }

      return Promise.resolve();
    }

    adapters.batch(() => {
      router.isRedirecting = true;
    });

    try {
      /**
       * Lifecycle
       *
       */

      const config: TypeLifecycleConfig = {
        nextUrl,
        nextRoute,
        nextQuery,
        nextSearch,
        nextPathname,
        currentUrl,
        currentQuery,
        currentRoute,
        currentSearch,
        currentPathname,
        redirect: (redirectConfig: TypeRedirectToParams<TRoutes, keyof TRoutes>) => {
          if (constants.isClient) return redirectConfig;

          const redirectRoute = routes[redirectConfig.route];
          const redirectParams =
            'params' in redirectConfig && redirectConfig.params ? redirectConfig.params : undefined;

          let redirectUrl = replaceDynamicValues({
            params: redirectParams,
            route: redirectRoute,
          });

          if ('query' in redirectConfig && redirectConfig.query) {
            const clearedQuery = getQueryValues({
              route: nextRoute,
              pathname: `${nextPathname}?${queryString.stringify(redirectConfig.query as any)}`,
            });

            if (Object.keys(clearedQuery).length > 0) {
              redirectUrl = `${redirectUrl}?${queryString.stringify(clearedQuery)}`;
            }
          }

          throw new RedirectError(redirectUrl);
        },
        preventRedirect: () => {
          throw new PreventError(`Redirect to ${nextUrl} was prevented`);
        },
      };

      await currentRoute?.beforeLeave?.(config, ...(lifecycleParams || []));
      const redirectConfig: TypeRedirectToParams<TRoutes, keyof TRoutes> =
        await nextRoute.beforeEnter?.(config, ...(lifecycleParams || []));

      /**
       * Handle redirect returned from beforeEnter
       *
       */

      if (redirectConfig) return redirectTo(redirectConfig);

      await loadComponentToConfig({ route: routes[nextRoute.name] });
    } catch (error: any) {
      if (error instanceof PreventError) {
        return Promise.resolve();
      }

      if (error instanceof RedirectError) {
        throw error;
      }

      console.error(error);

      await loadComponentToConfig({ route: routes.internalError });

      adapters.batch(() => {
        adapters.replaceObject(router.currentRoute, {
          name: routes.internalError.name,
          path: routes.internalError.path,
          props: routes[routes.internalError.name].props,
          query: adapters.makeObservable({}) as any,
          params: adapters.makeObservable({}) as any,
          pageName: routes[routes.internalError.name].pageName,
        });

        router.isRedirecting = false;
      });

      return Promise.resolve();
    }

    adapters.batch(() => {
      adapters.replaceObject(router.currentRoute, {
        name: nextRoute.name,
        path: nextRoute.path,
        props: routes[nextRoute.name].props,
        query: getQueryValues({ route: nextRoute, pathname: nextUrl }),
        params: getDynamicValues({ route: nextRoute, pathname: nextUrl }),
        pageName: routes[nextRoute.name].pageName,
      });

      const lastUrl = router.routesHistory[router.routesHistory.length - 1];

      if (lastUrl !== nextUrl) {
        router.routesHistory.push(nextUrl);
      }

      if (history && !noHistoryPush) {
        history.push({
          hash: history.location.hash,
          search: 'query' in config ? `?${queryString.stringify(config.query! as any)}` : '',
          pathname: nextPathname,
        });
      }

      router.isRedirecting = false;
    });

    return Promise.resolve();
  };

  return router!;
}
