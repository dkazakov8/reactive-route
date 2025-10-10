import { TypeAdapters } from './types/TypeAdapters';
import { TypeLifecycleConfig } from './types/TypeLifecycleConfig';
import { TypeRedirectParams } from './types/TypeRedirectParams';
import { TypeRoute } from './types/TypeRoute';
import { TypeRouter } from './types/TypeRouter';
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
>(config: {
  routes: TRoutes;
  adapters: TypeAdapters;
  lifecycleParams?: Array<any>;
}): TypeRouter<TRoutes> {
  const router: TypeRouter<TRoutes> = config.adapters.makeObservable({
    routesHistory: [],
    currentRoute: {} as any,
    isRedirecting: false,
    redirect: undefined as any,
    restoreFromURL: undefined as any,
    restoreFromServer: undefined as any,
    get adapters() {
      return config.adapters;
    },
    get routes() {
      return config.routes;
    },
    get lifecycleParams() {
      return config.lifecycleParams;
    },
  });

  router.restoreFromServer = function restoreFromServer(obj) {
    router.adapters.batch(() => {
      router.routesHistory.push(...(obj.routesHistory || []));
      Object.assign(router.currentRoute, obj.currentRoute);
    });

    const preloadedRouteName = Object.keys(router.routes).find(
      (routeName) => router.currentRoute.name === routeName
    ) as keyof typeof router.routes;

    return loadComponentToConfig({ route: router.routes[preloadedRouteName] });
  };

  router.restoreFromURL = function restoreFromURL(params) {
    return router.redirect(getInitialRoute({ routes: router.routes, ...params }));
  };

  router.redirect = async function redirect<TRouteName extends keyof TRoutes>(
    config: TypeRedirectParams<TRoutes, TRouteName>
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
      currentRoute = router.routes[router.currentRoute.name];
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

    const nextRoute = router.routes[routeName];
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
        router.adapters.batch(() => {
          router.adapters.replaceObject(router.currentRoute, {
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

    router.adapters.batch(() => {
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
        redirect: (redirectConfig: TypeRedirectParams<TRoutes, keyof TRoutes>) => {
          if (constants.isClient) return redirectConfig;

          const redirectRoute = router.routes[redirectConfig.route];
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

      await currentRoute?.beforeLeave?.(config, ...(router.lifecycleParams || []));
      const redirectConfig: TypeRedirectParams<TRoutes, keyof TRoutes> =
        await nextRoute.beforeEnter?.(config, ...(router.lifecycleParams || []));

      /**
       * Handle redirect returned from beforeEnter
       *
       */

      if (redirectConfig) return redirect(redirectConfig);

      await loadComponentToConfig({ route: router.routes[nextRoute.name] });
    } catch (error: any) {
      if (error instanceof PreventError) {
        return Promise.resolve();
      }

      if (error instanceof RedirectError) {
        throw error;
      }

      console.error(error);

      await loadComponentToConfig({ route: router.routes.internalError });

      router.adapters.batch(() => {
        router.adapters.replaceObject(router.currentRoute, {
          name: router.routes.internalError.name,
          path: router.routes.internalError.path,
          props: router.routes[router.routes.internalError.name].props,
          query: router.adapters.makeObservable({}) as any,
          params: router.adapters.makeObservable({}) as any,
          pageId: router.routes[router.routes.internalError.name].pageId,
        });

        router.isRedirecting = false;
      });

      return Promise.resolve();
    }

    router.adapters.batch(() => {
      router.adapters.replaceObject(router.currentRoute, {
        name: nextRoute.name,
        path: nextRoute.path,
        props: router.routes[nextRoute.name].props,
        query: getQueryValues({ route: nextRoute, pathname: nextUrl }),
        params: getDynamicValues({ route: nextRoute, pathname: nextUrl }),
        pageId: router.routes[nextRoute.name].pageId,
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

  return router;
}
