import { TypeAdapters } from './types/TypeAdapters';
import { TypeCurrentRoute } from './types/TypeCurrentRoute';
import { TypeLifecycleConfig } from './types/TypeLifecycleConfig';
import { TypeRedirectParams } from './types/TypeRedirectParams';
import { TypeRoute } from './types/TypeRoute';
import { TypeRouter } from './types/TypeRouter';
import { constants } from './utils/constants';
import { getDynamicValues } from './utils/getDynamicValues';
import { getInitialRoute } from './utils/getInitialRoute';
import { getQueryValues } from './utils/getQueryValues';
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
    currentRoute: {} as any,
    isRedirecting: false,
    redirect: undefined as any,
    restoreFromURL: undefined as any,
    restoreFromServer: undefined as any,
    destroy: undefined as any,
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
      Object.assign(router.currentRoute, obj.currentRoute);
    });

    const activeRoute: TypeRouter<TRoutes>['currentRoute'][keyof TRoutes] = Object.values(
      router.currentRoute
    ).find((currentRoute) => currentRoute?.isActive);

    const preloadedRouteName = Object.keys(router.routes).find(
      (routeName) => activeRoute?.name === routeName
    ) as keyof TRoutes;

    return loadComponentToConfig({ route: router.routes[preloadedRouteName] });
  };

  router.restoreFromURL = function restoreFromURL(params) {
    return router.redirect(getInitialRoute({ routes: router.routes, ...params }));
  };

  router.redirect = async function redirect<TRouteName extends keyof TRoutes>(
    config: TypeRedirectParams<TRoutes, TRouteName>
  ) {
    const { route: routeName, replace } = config;

    /**
     * Construct current route data
     *
     */

    let currentRoute: undefined | TRoutes[keyof TRoutes];
    let currentPathname: undefined | string;
    let currentUrl: undefined | string;
    let currentSearch: undefined | string;
    let currentQuery: Partial<Record<keyof TRoutes[TRouteName]['query'], string>> | undefined;

    const activeRoute: TypeCurrentRoute<TRoutes[TRouteName]> = Object.values(
      router.currentRoute
    ).find((currentRoute) => currentRoute?.isActive);

    if (activeRoute) {
      currentRoute = router.routes[activeRoute.name];
      currentPathname = replaceDynamicValues({ route: currentRoute, params: activeRoute.params });
      currentQuery = activeRoute.query;
      currentSearch = queryString.stringify(activeRoute.query as any);
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

    if (currentUrl === nextUrl) return nextUrl;

    /**
     * If pathname is the same, but query changed (no lifecycle)
     *
     */

    if (currentPathname === nextPathname) {
      if (currentSearch !== nextSearch) {
        router.adapters.batch(() => {
          router.adapters.replaceObject(router.currentRoute[routeName]!, {
            ...router.currentRoute[routeName],
            query: nextQuery || {},
          });
        });

        if (constants.isClient) {
          window.history[replace ? 'replaceState' : 'pushState'](null, '', nextUrl);
        }
      }

      return nextUrl;
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
        return currentUrl!;
      }

      if (error instanceof RedirectError) {
        throw error;
      }

      console.error(error);

      await loadComponentToConfig({ route: router.routes.internalError });

      router.adapters.batch(() => {
        const newObj: TypeCurrentRoute<TRoutes['internalError']> = {
          name: router.routes.internalError.name,
          path: router.routes.internalError.path,
          props: router.routes[router.routes.internalError.name].props,
          query: router.adapters.makeObservable({}) as any,
          params: router.adapters.makeObservable({}) as any,
          pageId: router.routes[router.routes.internalError.name].pageId,
          isActive: true,
        };

        if (!router.currentRoute.internalError) router.currentRoute.internalError = newObj;
        else router.adapters.replaceObject(router.currentRoute.internalError!, newObj);

        Object.values(router.currentRoute).forEach((r) => {
          if (r && r.name !== 'internalError') r.isActive = false;
        });

        router.isRedirecting = false;
      });

      return nextUrl;
    }

    router.adapters.batch(() => {
      const newObj: TypeCurrentRoute<TRoutes[TRouteName]> = {
        name: nextRoute.name,
        path: nextRoute.path,
        props: router.routes[nextRoute.name].props,
        query: getQueryValues({ route: nextRoute, pathname: nextUrl }),
        params: getDynamicValues({ route: nextRoute, pathname: nextUrl }),
        pageId: router.routes[nextRoute.name].pageId,
        isActive: true,
      };

      if (!router.currentRoute[routeName]) {
        router.currentRoute[routeName] = newObj;
      } else {
        router.adapters.replaceObject(router.currentRoute[routeName]!, newObj);
      }

      Object.values(router.currentRoute).forEach((r) => {
        if (r && r.name !== routeName) r.isActive = false;
      });

      if (constants.isClient) {
        window.history[replace ? 'replaceState' : 'pushState'](null, '', nextUrl);
      }

      router.isRedirecting = false;
    });

    return nextUrl;
  };

  function popHandler() {
    const currentUrl = `${location.pathname}${location.search}`;

    void router.restoreFromURL({ pathname: currentUrl, replace: true });
  }

  if (constants.isClient) {
    window.addEventListener('popstate', popHandler);
  }

  router.destroy = function destroy() {
    if (constants.isClient) {
      window.removeEventListener('popstate', popHandler);
    }
  };

  return router;
}
