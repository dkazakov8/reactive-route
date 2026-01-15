import { isClient, PreventError, RedirectError } from './constants';
import {
  TypeGlobalArguments,
  TypeLifecycleFunction,
  TypeRouteConfig,
  TypeRoutePayload,
  TypeRouter,
  TypeRouteState,
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
      const routePayload = this.createRoutePayload(`${location.pathname}${location.search}`);

      void this.redirect({ ...routePayload, replace: true });
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
      /**
       * This is the initial step when we only have a URL like `/path?foo=bar`
       *
       * 1. Try to find a relevant route from createRoutes
       * 2. Fill the query object with validated decoded values from queryPart
       * 3. Fill the params object with validated decoded values from pathnamePart
       *
       */

      let [pathname = '', search = ''] = locationInput.split('?');

      const pathnameParts: Array<string> = [];

      pathname = pathname
        .split('/')
        .filter(Boolean)
        .map((str) => {
          let deserializedPart = str;

          try {
            deserializedPart = decodeURIComponent(str);
          } catch (_e) {
            // no need to handle errors and log malformed values
            // they should be validated by the developer
          }

          pathnameParts.push(deserializedPart);

          return str;
        })
        .join('/');

      let config: TypeRouteConfig | undefined;
      const query: Record<string, string> = {};
      let params: Record<string, string> = {};

      for (const routeName in routes) {
        if (!routes.hasOwnProperty(routeName)) continue;

        const testedRoute = routes[routeName];
        const testedPathname = testedRoute.path.split('/').filter(Boolean).join('/');

        // return a static match instantly, it has the top priority
        if (!testedPathname.includes(':') && testedPathname === pathname) {
          config = testedRoute;

          break;
        }

        // if a dynamic route has been found, no need to search for another
        if (config) continue;

        const testedPathnameParts = testedPathname.split('/').filter(Boolean);

        if (testedPathnameParts.length !== pathnameParts.length) continue;

        // Dynamic params must have functional validators
        // and static params should match
        const validationFailed = testedPathnameParts.some((paramName, i) => {
          const paramFromUrl = pathnameParts[i];

          if (paramName[0] !== ':') return paramName !== paramFromUrl;

          const validator = testedRoute.params?.[paramName.slice(1)];

          if (typeof validator !== 'function') {
            throw new Error(
              `missing validator for pathname dynamic parameter "${paramName.slice(1)}"`
            );
          }

          return !validator(paramFromUrl);
        });

        // no return instantly because next routes may have static match
        if (!validationFailed) {
          config = testedRoute;

          for (let i = 0; i < testedPathnameParts.length; i++) {
            const paramName = testedPathnameParts[i];

            if (paramName[0] === ':') params[paramName.slice(1)] = pathnameParts[i];
          }
        }
      }

      if (!config) {
        return { name: 'notFound', params: {}, query: {} };
      }

      if (config.query) {
        const urlQuery = new URLSearchParams(search);

        for (const key in config.query) {
          if (!config.query.hasOwnProperty(key)) continue;

          const value = urlQuery.get(key);
          const validator = config.query[key];

          if (typeof validator === 'function' && typeof value === 'string' && validator(value)) {
            query[key] = value;
          }
        }
      }

      if (!config.params) params = {};

      return { name: config.name, query, params };
    },

    createRouteState(routePayload) {
      const config = routes[routePayload.name];

      const params: Record<string, string> = {};
      const query: Record<string, string> = {};

      // fill the route path with passed params
      // and fill params with relevant values (omitting not required in a path)
      const pathname =
        'params' in routePayload
          ? config.path.replace(/:([^/]+)/g, (_, pathPart: string) => {
              const value = routePayload.params[pathPart];

              if (!value)
                throw new Error(
                  `no dynamic parameter "${pathPart}" passed for route ${config.name}`
                );

              params[pathPart] = value;

              return encodeURIComponent(value);
            })
          : config.path;

      if (config.query && 'query' in routePayload && routePayload.query) {
        for (const key in config.query) {
          if (!config.query.hasOwnProperty(key)) continue;

          const value = routePayload.query[key];
          const validator = config.query[key];

          if (typeof validator === 'function' && typeof value === 'string' && validator(value)) {
            query[key] = value;
          }
        }
      }

      const search = new URLSearchParams(query).toString().replace(/\+/g, '%20');
      const url = `${pathname}${search ? `?${search}` : ''}`;

      return {
        name: config.name,
        props: config.props,
        isActive: true,
        url,
        query: query as any,
        params: params as any,
        search,
        pathname,
      };
    },

    async redirect(nextPayload) {
      const currentState = this.getActiveRouteState();
      let nextState = this.createRouteState(nextPayload);

      const beforeLeave = currentState ? routes[currentState.name]?.beforeLeave : undefined;
      const beforeEnter = routes[nextState.name].beforeEnter;

      if (currentState?.url === nextState.url) return currentState.url;

      if (currentState?.pathname === nextState.pathname) {
        if (currentState?.search !== nextState.search) {
          adapters.batch(() => adapters.replaceObject(currentState, nextState));

          if (isClient) {
            window.history[nextPayload.replace ? 'replaceState' : 'pushState'](
              null,
              '',
              currentState.url
            );
          }
        }

        return currentState.url;
      }

      this.isRedirecting = true;

      try {
        const lifecycleConfig: Parameters<TypeLifecycleFunction>[0] = {
          nextState: nextState,
          currentState: currentState,
          redirect: ((redirectPayload: TypeRoutePayload<TRoutes, keyof TRoutes>) => {
            if (isClient) return redirectPayload;

            const redirectRouteState = this.createRouteState(redirectPayload);

            throw new RedirectError(redirectRouteState.url);
          }) as any,
          preventRedirect() {
            throw new PreventError(`Redirect to ${nextState.url} was prevented`);
          },
        };

        await beforeLeave?.(lifecycleConfig);

        const redirectPayload: TypeRoutePayload<TRoutes, keyof TRoutes> | undefined =
          await beforeEnter?.(lifecycleConfig);

        if (redirectPayload) return this.redirect(redirectPayload);
      } catch (error: any) {
        if (error instanceof PreventError || error instanceof RedirectError) {
          adapters.batch(() => {
            this.isRedirecting = false;
          });
        }

        if (error instanceof PreventError) return currentState!.url;

        if (error instanceof RedirectError) throw error;

        console.error(error);

        nextState = this.createRouteState({ name: 'internalError' } as any);
      }

      await this.preloadComponent(nextState.name);

      adapters.batch(() => {
        if (!this.state[nextState.name]) {
          this.state[nextState.name] = nextState as any;
        } else adapters.replaceObject(this.state[nextState.name]!, nextState as any);

        const allStates: Array<TypeRouteState<any>> = Object.values(this.state);

        for (const state of allStates) {
          if (state?.name !== nextState.name) state.isActive = false;
        }

        if (isClient && nextState.name !== 'internalError') {
          window.history[nextPayload.replace ? 'replaceState' : 'pushState'](
            null,
            '',
            nextState.url
          );
        }

        this.isRedirecting = false;
      });

      return nextState.url;
    },

    getActiveRouteState() {
      return Object.values(this.state).find((currentRoute) => currentRoute?.isActive);
    },

    async preloadComponent(routeName) {
      const route = routes[routeName];

      if (!route.component) {
        const { default: component, ...rest } = await route.loader();

        route.component = component;
        route.otherExports = rest;
      }
    },

    hydrateFromURL(locationInput) {
      return this.redirect(this.createRoutePayload(locationInput));
    },

    async hydrateFromState(routerState) {
      adapters.batch(() => {
        Object.assign(this.state, routerState.state);
      });

      const activeRoute = this.getActiveRouteState();

      await this.preloadComponent(activeRoute!.name);
    },
  } as TypeRouter<TRoutes>);

  router.historyListener = router.historyListener.bind(router);
  router.attachHistoryListener = router.attachHistoryListener.bind(router);
  router.destroyHistoryListener = router.destroyHistoryListener.bind(router);

  router.redirect = router.redirect.bind(router);
  router.hydrateFromURL = router.hydrateFromURL.bind(router);
  router.preloadComponent = router.preloadComponent.bind(router);
  router.createRouteState = router.createRouteState.bind(router);
  router.hydrateFromState = router.hydrateFromState.bind(router);
  router.getGlobalArguments = router.getGlobalArguments.bind(router);
  router.createRoutePayload = router.createRoutePayload.bind(router);
  router.getActiveRouteState = router.getActiveRouteState.bind(router);

  router.attachHistoryListener();

  return router;
}
