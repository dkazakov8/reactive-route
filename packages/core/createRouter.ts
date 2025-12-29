import {
  TypeAdapters,
  TypeDefaultRoutes,
  TypeLifecycleConfig,
  TypeRedirectParams,
  TypeRouter,
} from './types';
import { getInitialRoute } from './utils/getInitialRoute';
import { isClient } from './utils/isClient';
import { loadComponentToConfig } from './utils/loadComponentToConfig';
import { PreventError } from './utils/PreventError';
import { RedirectError } from './utils/RedirectError';
import { toCurrentRoute } from './utils/toCurrentRoute';

export function createRouter<TRoutes extends TypeDefaultRoutes>(routerConfig: {
  routes: TRoutes;
  adapters: TypeAdapters;
  lifecycleParams?: Array<any>;
}): TypeRouter<TRoutes> {
  const { adapters, routes, lifecycleParams } = routerConfig;

  function popHandler() {
    const { pathname, search } = location;

    void router.restoreFromURL({ pathname: `${pathname}${search}`, replace: true });
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
    getActiveCurrentRoute() {
      return Object.values(this.currentRoute).find((currentRoute) => currentRoute?.isActive);
    },
    restoreFromURL(params) {
      return this.redirect(getInitialRoute({ routes, ...params }));
    },
    restoreFromServer(obj) {
      adapters.batch(() => {
        Object.assign(this.currentRoute, obj.currentRoute);
      });

      const activeRoute = this.getActiveCurrentRoute();

      const preloadedRouteName = Object.keys(routes).find(
        (routeName) => activeRoute?.name === routeName
      ) as keyof TRoutes;

      return loadComponentToConfig({ route: routes[preloadedRouteName] });
    },
    async redirect(config) {
      let { route: routeName, replace } = config;

      const currentRouteActive = this.getActiveCurrentRoute();
      const currentRoute = currentRouteActive ? routes[currentRouteActive.name] : undefined;

      const nextRoute = routes[routeName];
      let nextCurrentRoute = toCurrentRoute({
        route: nextRoute,
        paramsRaw: 'params' in config ? config.params : undefined,
        queryRaw: 'query' in config ? config.query : undefined,
      });

      /**
       * Prevent redirect to the same url
       *
       */

      if (currentRouteActive?.url === nextCurrentRoute.url) return nextCurrentRoute.url;

      /**
       * If pathname is the same, but query changed (no lifecycle)
       *
       */

      if (currentRouteActive?.pathname === nextCurrentRoute.pathname) {
        if (currentRouteActive?.search !== nextCurrentRoute.search) {
          adapters.batch(() => {
            adapters.replaceObject(currentRouteActive!, nextCurrentRoute);
          });

          if (isClient) {
            window.history[replace ? 'replaceState' : 'pushState'](
              null,
              '',
              currentRouteActive.url
            );
          }
        }

        return currentRouteActive.url;
      }

      adapters.batch(() => {
        this.isRedirecting = true;
      });

      try {
        const lifecycleConfig: TypeLifecycleConfig = {
          next: nextCurrentRoute,
          current: currentRouteActive,
          redirect: (redirectConfig: TypeRedirectParams<TRoutes, keyof TRoutes>) => {
            if (isClient) return redirectConfig;

            const { route: redirectRouteName } = redirectConfig;

            const redirectCurrentRoute = toCurrentRoute({
              route: routes[redirectRouteName],
              paramsRaw: 'params' in redirectConfig ? redirectConfig.params : undefined,
              queryRaw: 'query' in redirectConfig ? redirectConfig.query : undefined,
            });

            throw new RedirectError(redirectCurrentRoute.url);
          },
          preventRedirect: () => {
            throw new PreventError(`Redirect to ${nextCurrentRoute.url} was prevented`);
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
          return currentRouteActive!.url;
        }

        if (error instanceof RedirectError) {
          throw error;
        }

        console.error(error);

        await loadComponentToConfig({ route: routes.internalError });

        routeName = 'internalError' as any;
        nextCurrentRoute = toCurrentRoute({ route: routes[routeName] });
      }

      adapters.batch(() => {
        if (!this.currentRoute[routeName]) this.currentRoute[routeName] = nextCurrentRoute;
        else adapters.replaceObject(this.currentRoute[routeName]!, nextCurrentRoute);

        Object.values(this.currentRoute).forEach((r) => {
          if (r && r.name !== routeName) r.isActive = false;
        });

        if (isClient && routeName !== 'internalError') {
          window.history[replace ? 'replaceState' : 'pushState'](null, '', nextCurrentRoute.url);
        }

        this.isRedirecting = false;
      });

      return nextCurrentRoute.url;
    },
  });

  router.destroy = router.destroy.bind(router);
  router.redirect = router.redirect.bind(router);
  router.getConfig = router.getConfig.bind(router);
  router.restoreFromURL = router.restoreFromURL.bind(router);
  router.restoreFromServer = router.restoreFromServer.bind(router);
  router.getActiveCurrentRoute = router.getActiveCurrentRoute.bind(router);

  if (isClient) {
    window.addEventListener('popstate', popHandler);
  }

  return router;
}
