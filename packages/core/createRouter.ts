import { isClient, PreventError, RedirectError } from './constants';
import {
  TypeGlobalArguments,
  TypeLifecycleFunction,
  TypeRouteConfig,
  TypeRoutePayload,
  TypeRouter,
  TypeRoutesDefault,
} from './types';

export function createRouter<TRoutes extends TypeRoutesDefault>(
  globalArguments: TypeGlobalArguments<TRoutes>
): TypeRouter<TRoutes> {
  const { adapters, routes } = globalArguments;

  const router = adapters.makeObservable({
    state: {},
    isRedirecting: false,

    historyListener() {
      void this.redirect(
        this.createRoutePayload({
          pathname: `${location.pathname}${location.search}`,
          replace: true,
        })
      );
    },
    attachHistoryListener() {
      if (isClient) window.addEventListener('popstate', this.historyListener);
    },
    destroyHistoryListener() {
      if (isClient) window.removeEventListener('popstate', this.historyListener);
    },

    getGlobalArguments() {
      return globalArguments;
    },

    createRoutePayload(locationInput) {
      const { pathname, replace } = locationInput;

      /**
       * This is the initial step when we only have a URL like `/path?foo=bar`
       *
       * 1. Try to find a relevant route from createRoutes
       * 2. Fill the query object with validated decoded values from queryPart
       * 3. Fill the params object with validated decoded values from pathnamePart
       *
       */

      const [pathnamePart = '', queryPart = ''] = pathname.split('?');

      let route: TypeRouteConfig | undefined;
      const query: Record<string, string> = {};
      let params: Record<string, string> = {};

      const pathnameArray = pathnamePart
        .split('/')
        .filter(Boolean)
        .map((str) => decodeURIComponent(str));

      for (const routeName in routes) {
        if (!Object.hasOwn(routes, routeName)) continue;

        const testedRoute = routes[routeName];

        // return a static match instantly, it has the top priority
        if (
          !testedRoute.path.includes(':') &&
          (pathname === testedRoute.path || pathname === `${testedRoute.path}/`)
        ) {
          route = testedRoute;

          break;
        }

        // if a dynamic route has been found, no need to search for another
        if (route) continue;

        const routePathnameArray = testedRoute.path.split('/').filter(Boolean);

        if (routePathnameArray.length !== pathnameArray.length) continue;

        // Dynamic params must have functional validators
        // and static params should match
        const validationFailed = routePathnameArray.some((paramName, i) => {
          const paramFromUrl = pathnameArray[i];

          if (paramName[0] !== ':') return paramName !== paramFromUrl;

          const validator = testedRoute.params?.[paramName.slice(1)];

          if (typeof validator !== 'function') {
            throw new Error(`missing validator for param "${paramName.slice(1)}"`);
          }

          return !validator(paramFromUrl);
        });

        // no return instantly because next routes may have static match
        if (!validationFailed) {
          route = testedRoute;

          for (let i = 0; i < routePathnameArray.length; i++) {
            const paramName = routePathnameArray[i];

            if (paramName[0] === ':') params[paramName.slice(1)] = pathnameArray[i];
          }
        }
      }

      route = route || routes.notFound;

      if (route.query) {
        const urlQuery = new URLSearchParams(queryPart);

        for (const key in route.query) {
          if (!Object.hasOwn(route.query, key)) continue;

          const value = urlQuery.get(key);
          const validator = route.query[key];

          if (typeof validator === 'function' && typeof value === 'string' && validator(value)) {
            query[key] = value;
          }
        }
      }

      if (!route.params) params = {};

      return {
        route: route.name,
        query,
        params,
        replace,
      } as TypeRoutePayload<TRoutes, keyof TRoutes>;
    },

    createRouteState(routePayload) {
      const route = routes[routePayload.route];

      const params: Record<string, string> = {};
      const query: Record<string, string> = {};

      // fill the route path with passed params
      // and fill params with relevant values (omitting not required in a path)
      const pathname =
        'params' in routePayload
          ? route.path.replace(/:([^/]+)/g, (_, pathPart: string) => {
              const value = routePayload.params?.[pathPart];

              if (!value) throw new Error(`no param "${pathPart}" passed for route ${route.name}`);

              params[pathPart] = value;

              return encodeURIComponent(value);
            })
          : route.path;

      if (route.query && 'query' in routePayload && routePayload.query) {
        for (const key in route.query) {
          if (!Object.hasOwn(route.query, key)) continue;

          const value = routePayload.query[key];
          const validator = route.query[key];

          if (typeof validator === 'function' && typeof value === 'string' && validator(value)) {
            query[key] = value;
          }
        }
      }

      const search = new URLSearchParams(query).toString();
      const url = `${pathname}${search ? `?${search}` : ''}`;

      return {
        name: route.name,
        path: route.path,
        props: route.props,
        isActive: true,
        url,
        query: query as any,
        params: params as any,
        search,
        pathname,
      };
    },

    async redirect(nextRoutePayload) {
      const activeRouteState = this.getActiveRouteState();
      const activeRouteConfig = activeRouteState ? routes[activeRouteState.name] : undefined;

      let nextRouteState = this.createRouteState({
        route: nextRoutePayload.route,
        params: 'params' in nextRoutePayload ? nextRoutePayload.params : undefined,
        query: 'query' in nextRoutePayload ? nextRoutePayload.query : undefined,
      } as any);
      const nextRouteConfig = routes[nextRoutePayload.route];

      if (activeRouteState?.url === nextRouteState.url) return nextRouteState.url;

      if (activeRouteState?.pathname === nextRouteState.pathname) {
        if (activeRouteState?.search !== nextRouteState.search) {
          adapters.batch(() => adapters.replaceObject(activeRouteState!, nextRouteState));

          if (isClient) {
            window.history[nextRoutePayload.replace ? 'replaceState' : 'pushState'](
              null,
              '',
              activeRouteState.url
            );
          }
        }

        return activeRouteState.url;
      }

      adapters.batch(() => {
        this.isRedirecting = true;
      });

      try {
        const lifecycleConfig: Parameters<TypeLifecycleFunction>[0] = {
          nextState: nextRouteState,
          currentState: activeRouteState,
          redirect: (redirectRoutePayload) => {
            if (isClient) return redirectRoutePayload;

            const redirectRouteState = this.createRouteState(redirectRoutePayload as any);

            throw new RedirectError(redirectRouteState.url);
          },
          preventRedirect() {
            throw new PreventError(`Redirect to ${nextRouteState.url} was prevented`);
          },
        };

        await activeRouteConfig?.beforeLeave?.(lifecycleConfig);

        const redirectRoutePayload: TypeRoutePayload<TRoutes, keyof TRoutes> | undefined =
          await nextRouteConfig.beforeEnter?.(lifecycleConfig);

        if (redirectRoutePayload) return this.redirect(redirectRoutePayload);
      } catch (error: any) {
        if (error instanceof PreventError) {
          return activeRouteState!.url;
        }

        if (error instanceof RedirectError) {
          throw error;
        }

        console.error(error);

        nextRouteState = this.createRouteState({ route: 'internalError' } as any);
      }

      const route = routes[nextRouteState.name];

      if (!route.component) {
        const { default: component, ...rest } = await route.loader();

        route.component = component;
        route.otherExports = rest;
      }

      adapters.batch(() => {
        if (!this.state[nextRouteState.name]) {
          this.state[nextRouteState.name] = nextRouteState as any;
        } else adapters.replaceObject(this.state[nextRouteState.name]!, nextRouteState);

        Object.values(this.state).forEach((r) => {
          if (r && r.name !== nextRouteState.name) r.isActive = false;
        });

        if (isClient && nextRouteState.name !== 'internalError') {
          window.history[nextRoutePayload.replace ? 'replaceState' : 'pushState'](
            null,
            '',
            nextRouteState.url
          );
        }

        this.isRedirecting = false;
      });

      return nextRouteState.url;
    },

    getActiveRouteState() {
      return Object.values(this.state).find((currentRoute) => currentRoute?.isActive);
    },

    hydrateFromURL(locationInput) {
      return this.redirect(this.createRoutePayload(locationInput));
    },
    async hydrateFromState(routerState) {
      adapters.batch(() => {
        Object.assign(this.state, routerState.state);
      });

      const activeRoute = this.getActiveRouteState();

      const route = routes[activeRoute!.name];

      if (!route.component) {
        const { default: component, ...rest } = await route.loader();

        route.component = component;
        route.otherExports = rest;
      }
    },
  } as TypeRouter<TRoutes>);

  router.historyListener = router.historyListener.bind(router);
  router.attachHistoryListener = router.attachHistoryListener.bind(router);
  router.destroyHistoryListener = router.destroyHistoryListener.bind(router);

  router.redirect = router.redirect.bind(router);
  router.hydrateFromURL = router.hydrateFromURL.bind(router);
  router.createRouteState = router.createRouteState.bind(router);
  router.hydrateFromState = router.hydrateFromState.bind(router);
  router.getGlobalArguments = router.getGlobalArguments.bind(router);
  router.createRoutePayload = router.createRoutePayload.bind(router);
  router.getActiveRouteState = router.getActiveRouteState.bind(router);

  router.attachHistoryListener();

  return router;
}
