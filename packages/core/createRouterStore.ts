import queryString from 'query-string';

import { InterfaceRouterStore, TypeCreateRouterStore } from './types/InterfaceRouterStore';
import { TypeRedirectToParams } from './types/TypeRedirectToParams';
import { TypeRoute } from './types/TypeRoute';
import { constants } from './utils/constants';
import { getDynamicValues } from './utils/getDynamicValues';
import { getInitialRoute } from './utils/getInitialRoute';
import { getQueryValues } from './utils/getQueryValues';
import { history } from './utils/history';
import { loadComponentToConfig } from './utils/loadComponentToConfig';
import { replaceDynamicValues } from './utils/replaceDynamicValues';

export function createRouterStore<TRoutes extends Record<string, TypeRoute>>({
  batch,
  routes,
  autorun,
  replaceObject,
  routeError500,
  makeObservable,
  lifecycleParams,
}: TypeCreateRouterStore<TRoutes>): InterfaceRouterStore<TRoutes> {
  const routerStore: InterfaceRouterStore<TRoutes> = makeObservable({
    routesHistory: [],
    currentRoute: {} as any,
    isRedirecting: false,
    redirectTo: undefined as any,
    restoreFromURL: undefined as any,
    restoreFromServer: undefined as any,
    utils: {
      batch,
      autorun,
      replaceObject,
      makeObservable,
    },
  });

  routerStore.restoreFromServer = function restoreFromServer(obj) {
    batch(() => {
      routerStore.routesHistory.push(...(obj.routesHistory || []));
      Object.assign(routerStore.currentRoute, obj.currentRoute);
    });

    const preloadedRouteName = Object.keys(routes).find(
      (routeName) => routerStore.currentRoute.name === routeName
    ) as keyof typeof routes;

    return loadComponentToConfig({ route: routes[preloadedRouteName] });
  };

  routerStore.restoreFromURL = function restoreFromURL(params) {
    return routerStore.redirectTo(getInitialRoute({ routes, ...params }));
  };

  routerStore.redirectTo = async function redirectTo<TRouteName extends keyof TRoutes>(
    config: TypeRedirectToParams<TRoutes, TRouteName>
  ) {
    const { route: routeName, noHistoryPush, asClient } = config;

    const isClient = typeof asClient === 'boolean' ? asClient : constants.isClient;

    /**
     * Construct current route data
     *
     */

    let currentRoute: undefined | TRoutes[keyof TRoutes];
    let currentPathname: undefined | string;
    let currentUrl: undefined | string;
    let currentSearch: undefined | string;
    let currentQuery: Partial<Record<keyof TRoutes[TRouteName]['query'], string>> | undefined;

    if (routerStore.currentRoute?.name) {
      currentRoute = routes[routerStore.currentRoute.name];
      currentPathname = replaceDynamicValues({
        route: currentRoute,
        params: routerStore.currentRoute.params,
      });
      currentUrl = queryString.stringifyUrl({
        url: currentPathname,
        query: routerStore.currentRoute.query,
      });
      currentQuery = routerStore.currentRoute.query;
      currentSearch = queryString.stringify(routerStore.currentRoute.query);
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
        pathname: `${nextPathname}?${queryString.stringify(config.query)}`,
      });

      if (Object.keys(clearedQuery).length > 0) {
        nextQuery = clearedQuery;
        nextSearch = queryString.stringify(clearedQuery);
        nextUrl = queryString.stringifyUrl({ url: nextPathname, query: clearedQuery });
      }
    }

    /**
     * Prevent redirect to the same url
     *
     */

    if (currentUrl === nextUrl) return Promise.resolve();

    /**
     * If pathname is the same, but query changed
     *
     */

    if (currentPathname === nextPathname) {
      if (currentSearch !== nextSearch) {
        batch(() => {
          replaceObject(routerStore.currentRoute.query, nextQuery || {});
          routerStore.routesHistory.push(nextUrl);
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

    batch(() => {
      routerStore.isRedirecting = true;
    });

    try {
      /**
       * Lifecycle
       *
       */

      await currentRoute?.beforeLeave?.(
        {
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
        },
        ...(lifecycleParams || [])
      );
      const redirectConfig: TypeRedirectToParams<TRoutes, keyof TRoutes> =
        await nextRoute.beforeEnter?.(
          {
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
          },
          ...(lifecycleParams || [])
        );

      /**
       * Handle redirect returned from beforeEnter
       *
       */

      if (typeof redirectConfig === 'object') {
        if (isClient) return redirectTo({ ...redirectConfig, asClient });

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
            pathname: `${nextPathname}?${queryString.stringify(redirectConfig.query)}`,
          });

          if (Object.keys(clearedQuery).length > 0) {
            redirectUrl = queryString.stringifyUrl({ url: redirectUrl, query: clearedQuery });
          }
        }

        throw Object.assign(new Error(redirectUrl), { name: constants.errorRedirect });
      }

      await loadComponentToConfig({ route: routes[nextRoute.name] });
    } catch (error: any) {
      if (error?.name === constants.errorPrevent) return Promise.resolve();

      if (error?.name === constants.errorRedirect) {
        throw error;
      }

      console.error(error);

      await loadComponentToConfig({ route: routeError500 });

      batch(() => {
        replaceObject(routerStore.currentRoute, {
          name: routeError500.name,
          path: routeError500.path,
          props: routes[routeError500.name].props,
          query: {} as any,
          params: {} as any,
          pageName: routes[routeError500.name].pageName,
        });

        routerStore.isRedirecting = false;
      });

      return Promise.resolve();
    }

    batch(() => {
      replaceObject(routerStore.currentRoute, {
        name: nextRoute.name,
        path: nextRoute.path,
        props: routes[nextRoute.name].props,
        query: getQueryValues({ route: nextRoute, pathname: nextUrl }),
        params: getDynamicValues({ route: nextRoute, pathname: nextUrl }),
        pageName: routes[nextRoute.name].pageName,
      });

      const lastUrl = routerStore.routesHistory[routerStore.routesHistory.length - 1];

      if (lastUrl !== nextUrl) {
        routerStore.routesHistory.push(nextUrl);
      }

      if (history && !noHistoryPush) {
        history.push({
          hash: history.location.hash,
          search: 'query' in config ? `?${queryString.stringify(config.query!)}` : '',
          pathname: nextPathname,
        });
      }

      routerStore.isRedirecting = false;
    });

    return Promise.resolve();
  };

  return routerStore!;
}
