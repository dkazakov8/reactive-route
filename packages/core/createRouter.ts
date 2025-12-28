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
>(routerConfig: {
  routes: TRoutes;
  adapters: TypeAdapters;
  lifecycleParams?: Array<any>;
}): TypeRouter<TRoutes> {
  const { adapters, routes, lifecycleParams } = routerConfig;

  function popHandler() {
    const currentUrl = `${location.pathname}${location.search}`;

    void router.restoreFromURL({ pathname: currentUrl, replace: true });
  }

  const router: TypeRouter<TRoutes> = adapters.makeObservable({
    // @ts-ignore
    currentRoute: {},
    isRedirecting: false,
    destroy() {
      if (constants.isClient) {
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

      /**
       * Construct current route data
       *
       */

      let currentRoute: undefined | TRoutes[keyof TRoutes];
      let currentPathname: undefined | string;
      let currentUrl: undefined | string;
      let currentSearch: undefined | string;
      let currentQuery: Partial<Record<keyof TRoutes[keyof TRoutes]['query'], string>> | undefined;

      const activeRoute: TypeCurrentRoute<TRoutes[keyof TRoutes]> = Object.values(
        this.currentRoute
      ).find((currentRoute) => currentRoute?.isActive);

      if (activeRoute) {
        currentRoute = routes[activeRoute.name];
        currentPathname = replaceDynamicValues({ route: currentRoute, params: activeRoute.params });
        currentQuery = activeRoute.query;
        currentSearch = queryString.stringify(activeRoute.query as any);
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
      let nextQuery: Partial<Record<keyof TRoutes[keyof TRoutes]['query'], string>> | undefined;
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
          adapters.batch(() => {
            adapters.replaceObject(this.currentRoute[routeName]!, {
              ...this.currentRoute[routeName],
              query: nextQuery || {},
            });
          });

          if (constants.isClient) {
            window.history[replace ? 'replaceState' : 'pushState'](null, '', nextUrl);
          }
        }

        return nextUrl;
      }

      adapters.batch(() => {
        this.isRedirecting = true;
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

            const redirectRoute = routes[redirectConfig.route];
            const redirectParams =
              'params' in redirectConfig && redirectConfig.params
                ? redirectConfig.params
                : undefined;

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

        const redirectConfig: TypeRedirectParams<TRoutes, keyof TRoutes> =
          await nextRoute.beforeEnter?.(config, ...(lifecycleParams || []));

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
          const newObj: TypeCurrentRoute<TRoutes['internalError']> = {
            name: routes.internalError.name,
            path: routes.internalError.path,
            props: routes[routes.internalError.name].props,
            query: adapters.makeObservable({}) as any,
            params: adapters.makeObservable({}) as any,
            pageId: routes[routes.internalError.name].pageId,
            isActive: true,
          };

          if (!this.currentRoute.internalError) this.currentRoute.internalError = newObj;
          else adapters.replaceObject(this.currentRoute.internalError!, newObj);

          Object.values(this.currentRoute).forEach((r) => {
            if (r && r.name !== 'internalError') r.isActive = false;
          });

          this.isRedirecting = false;
        });

        return nextUrl;
      }

      adapters.batch(() => {
        const newObj: TypeCurrentRoute<TRoutes[keyof TRoutes]> = {
          name: nextRoute.name,
          path: nextRoute.path,
          props: routes[nextRoute.name].props,
          query: getQueryValues({ route: nextRoute, pathname: nextUrl }),
          params: getDynamicValues({ route: nextRoute, pathname: nextUrl }),
          pageId: routes[nextRoute.name].pageId,
          isActive: true,
        };

        if (!this.currentRoute[routeName]) {
          // @ts-ignore
          this.currentRoute[routeName] = newObj;
        } else {
          adapters.replaceObject(this.currentRoute[routeName]!, newObj);
        }

        Object.values(this.currentRoute).forEach((r) => {
          if (r && r.name !== routeName) r.isActive = false;
        });

        if (constants.isClient) {
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

  if (constants.isClient) {
    window.addEventListener('popstate', popHandler);
  }

  return router;
}
