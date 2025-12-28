import {
  TypeAdapters,
  TypeCurrentRoute,
  TypeDefaultRoutes,
  TypeLifecycleConfig,
  TypeRedirectParams,
  TypeRoute,
  TypeRouter,
} from './types';
import { getDynamicValues } from './utils/getDynamicValues';
import { getInitialRoute } from './utils/getInitialRoute';
import { getQueryValues } from './utils/getQueryValues';
import { isClient } from './utils/isClient';
import { loadComponentToConfig } from './utils/loadComponentToConfig';
import { PreventError } from './utils/PreventError';
import { queryString } from './utils/queryString';
import { RedirectError } from './utils/RedirectError';
import { replaceDynamicValues } from './utils/replaceDynamicValues';

export function createRouter<TRoutes extends TypeDefaultRoutes>(routerConfig: {
  routes: TRoutes;
  adapters: TypeAdapters;
  lifecycleParams?: Array<any>;
}): TypeRouter<TRoutes> {
  const { adapters, routes, lifecycleParams } = routerConfig;

  function popHandler() {
    void router.restoreFromURL({
      pathname: `${location.pathname}${location.search}`,
      replace: true,
    });
  }

  function constructRouteData(
    routeName: keyof TRoutes | undefined,
    data: { paramsRaw?: Record<string, any>; queryRaw?: Record<string, any> }
  ) {
    if (!routeName) {
      return {
        url: undefined,
        route: undefined,
        query: undefined,
        search: undefined,
        pathname: undefined,
      };
    }

    const route = routes[routeName];
    const pathname = replaceDynamicValues({ route, params: data.paramsRaw as any });

    let query: Partial<Record<keyof TRoutes[keyof TRoutes]['query'], string>> | undefined;
    let url = pathname;
    let search: undefined | string;

    if (data.queryRaw) {
      const clearedQuery = getQueryValues({
        route,
        pathname: `${pathname}?${queryString.stringify(data.queryRaw)}`,
      });

      if (Object.keys(clearedQuery).length > 0) {
        query = clearedQuery;
        search = queryString.stringify(clearedQuery);
        url = `${pathname}?${search}`;
      }
    }

    return { route, pathname, query, url, search };
  }

  const router: TypeRouter<TRoutes> = adapters.makeObservable({
    // @ts-ignore
    currentRoute: {},
    isRedirecting: false,
    destroy() {
      if (isClient) {
        window.removeEventListener('popstate', popHandler);
      }
    },
    getConfig: () => routerConfig,
    restoreFromURL(params) {
      return this.redirect(getInitialRoute({ routes, ...params }));
    },
    restoreFromServer(obj) {
      adapters.batch(() => {
        Object.assign(this.currentRoute, obj.currentRoute);
      });

      const activeRoute: TypeRouter<TRoutes>['currentRoute'][keyof TRoutes] = Object.values(
        this.currentRoute
      ).find((currentRoute) => currentRoute?.isActive);

      const preloadedRouteName = Object.keys(routes).find(
        (routeName) => activeRoute?.name === routeName
      ) as keyof TRoutes;

      return loadComponentToConfig({ route: routes[preloadedRouteName] });
    },
    async redirect(config) {
      const { route: routeName, replace } = config;

      const currentRouteActive: TypeCurrentRoute<TRoutes[keyof TRoutes]> = Object.values(
        this.currentRoute
      ).find((currentRoute) => currentRoute?.isActive);

      const currentRoute = currentRouteActive ? routes[currentRouteActive.name] : undefined;

      const {
        url: currentUrl,
        query: currentQuery,
        search: currentSearch,
        pathname: currentPathname,
      } = currentRouteActive || {};

      const {
        url: nextUrl,
        route: nextRoute,
        query: nextQuery,
        search: nextSearch,
        pathname: nextPathname,
      } = constructRouteData(routeName, {
        paramsRaw: 'params' in config ? config.params : undefined,
        queryRaw: 'query' in config ? config.query : undefined,
      });

      if (!nextUrl || !nextRoute || !nextPathname) return '/';

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
          adapters.batch(() => {
            adapters.replaceObject(this.currentRoute[routeName]!, {
              ...this.currentRoute[routeName],
              query: nextQuery || {},
              search: nextSearch,
              url: nextUrl,
            });
          });

          if (isClient) {
            window.history[replace ? 'replaceState' : 'pushState'](null, '', nextUrl);
          }
        }

        return nextUrl;
      }

      adapters.batch(() => {
        this.isRedirecting = true;
      });

      try {
        const lifecycleConfig: TypeLifecycleConfig = {
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
            if (isClient) return redirectConfig;

            const { route: redirectRouteName } = redirectConfig;

            const { url: redirectUrl } = constructRouteData(redirectRouteName, {
              paramsRaw: 'params' in redirectConfig ? redirectConfig.params : undefined,
              queryRaw: 'query' in redirectConfig ? redirectConfig.query : undefined,
            });

            throw new RedirectError(redirectUrl!);
          },
          preventRedirect: () => {
            throw new PreventError(`Redirect to ${nextUrl} was prevented`);
          },
        };

        await currentRoute?.beforeLeave?.(lifecycleConfig, ...(lifecycleParams || []));

        const redirectConfig: TypeRedirectParams<TRoutes, keyof TRoutes> =
          await nextRoute.beforeEnter?.(lifecycleConfig, ...(lifecycleParams || []));

        /**
         * Handle redirect returned from beforeEnter
         *
         */

        if (redirectConfig) return this.redirect(redirectConfig);

        await loadComponentToConfig({ route: routes[nextRoute.name] });
      } catch (error: any) {
        if (error instanceof PreventError) {
          return currentUrl!;
        }

        if (error instanceof RedirectError) {
          throw error;
        }

        console.error(error);

        await loadComponentToConfig({ route: routes.internalError });

        adapters.batch(() => {
          const newCurrent: TypeCurrentRoute<TRoutes['internalError']> = {
            name: routes.internalError.name,
            path: routes.internalError.path,
            props: routes[routes.internalError.name].props,
            query: {} as any,
            params: {} as any,
            pageId: routes[routes.internalError.name].pageId,
            url: currentUrl || '',
            pathname: currentPathname || '',
            isActive: true,
          };

          if (!this.currentRoute.internalError) this.currentRoute.internalError = newCurrent;
          else adapters.replaceObject(this.currentRoute.internalError, newCurrent);

          Object.values(this.currentRoute).forEach((r) => {
            if (r && r.name !== 'internalError') r.isActive = false;
          });

          this.isRedirecting = false;
        });

        return nextUrl;
      }

      adapters.batch(() => {
        const newCurrent: TypeCurrentRoute<TRoutes[keyof TRoutes]> = {
          name: nextRoute.name,
          path: nextRoute.path,
          props: routes[nextRoute.name].props,
          query: nextQuery || {},
          params: getDynamicValues({ route: nextRoute, pathname: nextUrl }),
          pageId: routes[nextRoute.name].pageId,
          url: nextUrl,
          pathname: nextPathname,
          search: nextSearch,
          isActive: true,
        };

        // @ts-ignore
        if (!this.currentRoute[routeName]) this.currentRoute[routeName] = newCurrent;
        else adapters.replaceObject(this.currentRoute[routeName], newCurrent);

        Object.values(this.currentRoute).forEach((r) => {
          if (r && r.name !== routeName) r.isActive = false;
        });

        if (isClient) {
          window.history[replace ? 'replaceState' : 'pushState'](null, '', nextUrl);
        }

        this.isRedirecting = false;
      });

      return nextUrl;
    },
  });

  router.destroy = router.destroy.bind(router);
  router.redirect = router.redirect.bind(router);
  router.getConfig = router.getConfig.bind(router);
  router.restoreFromURL = router.restoreFromURL.bind(router);
  router.restoreFromServer = router.restoreFromServer.bind(router);

  if (isClient) {
    window.addEventListener('popstate', popHandler);
  }

  return router;
}
