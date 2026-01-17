import { isClient, PreventError, RedirectError } from './constants';
import {
  TypeConfig,
  TypeGlobalArguments,
  TypeLifecycleFunction,
  TypePayload,
  TypeRouter,
  TypeRoutesDefault,
  TypeState,
} from './types';

export function createRouter<TRoutes extends TypeRoutesDefault>(
  globalArguments: TypeGlobalArguments<TRoutes>
): TypeRouter<TRoutes> {
  const { adapters, routes } = globalArguments;

  const router = adapters.makeObservable({
    state: {},
    isRedirecting: false,

    historyListener() {
      const payload = this.urlToPayload(`${location.pathname}${location.search}`);

      void this.redirect({ ...payload, replace: true });
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

    urlToPayload(url) {
      /**
       * This is the initial step when we only have a URL like `/path?foo=bar`
       *
       * 1. Try to find a relevant route from createRoutes
       * 2. Fill the query object with validated decoded values from queryPart
       * 3. Fill the params object with validated decoded values from pathnamePart
       *
       */

      let [pathname = '', search = ''] = url.split('?');

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

      let config: TypeConfig | undefined;
      const query: Record<string, string> = {};
      let params: Record<string, string> = {};

      for (const routeName in routes) {
        if (!routes.hasOwnProperty(routeName)) continue;

        const testedConfig = routes[routeName];
        const testedPathname = testedConfig.path.split('/').filter(Boolean).join('/');

        // return a static match instantly, it has the top priority
        if (!testedPathname.includes(':') && testedPathname === pathname) {
          config = testedConfig;
          params = {};

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

          const validator = testedConfig.params?.[paramName.slice(1)];

          if (typeof validator !== 'function') {
            throw new Error(
              `missing validator for pathname dynamic parameter "${paramName.slice(1)}"`
            );
          }

          return !validator(paramFromUrl);
        });

        // no return instantly because next routes may have static match
        if (!validationFailed) {
          config = testedConfig;

          for (let i = 0; i < testedPathnameParts.length; i++) {
            const paramName = testedPathnameParts[i];

            if (paramName[0] === ':') params[paramName.slice(1)] = pathnameParts[i];
          }
        }
      }

      if (!config) return { name: 'notFound', params: {}, query: {} };

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

      return { name: config.name, query, params };
    },

    payloadToState(payload) {
      const config = routes[payload.name];
      const params: Record<string, string> = {};
      const query: Record<string, string> = {};

      // fill the route path with passed params
      // and fill params with relevant values (omitting not required in a path)
      const pathname =
        'params' in payload
          ? config.path.replace(/:([^/]+)/g, (_, pathPart: string) => {
              const value = payload.params[pathPart];

              if (!value)
                throw new Error(
                  `no dynamic parameter "${pathPart}" passed for route ${config.name}`
                );

              params[pathPart] = value;

              return encodeURIComponent(value);
            })
          : config.path;

      if (config.query && 'query' in payload && payload.query) {
        for (const key in config.query) {
          if (!config.query.hasOwnProperty(key)) continue;

          const value = payload.query[key];
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
        query: query as any,
        params: params as any,

        url,
        search,
        pathname,

        props: config.props,
        isActive: true,
      };
    },

    async redirect(nextPayload) {
      const currentState = this.getActiveState();
      let nextState = this.payloadToState(nextPayload);

      const beforeLeave = currentState ? routes[currentState.name].beforeLeave : undefined;
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
        const data: Parameters<TypeLifecycleFunction>[0] = {
          nextState,
          currentState,
          redirect: ((redirectPayload: TypePayload<TRoutes, keyof TRoutes>) => {
            if (isClient) return redirectPayload;

            const redirectState = this.payloadToState(redirectPayload);

            throw new RedirectError(redirectState.url);
          }) as any,
          preventRedirect() {
            throw new PreventError(`Redirect to ${nextState.url} was prevented`);
          },
        };

        await beforeLeave?.(data);

        const redirectPayload: TypePayload<TRoutes, keyof TRoutes> | undefined =
          await beforeEnter?.(data);

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

        nextState = this.payloadToState({ name: 'internalError' } as any);
      }

      await this.preloadComponent(nextState.name);

      adapters.batch(() => {
        if (!this.state[nextState.name]) {
          this.state[nextState.name] = nextState as any;
        } else adapters.replaceObject(this.state[nextState.name], nextState as any);

        const allStates: Array<TypeState<any>> = Object.values(this.state);

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

    getActiveState() {
      return Object.values(this.state).find((state) => state?.isActive);
    },

    async preloadComponent(name) {
      const route = routes[name];

      if (!route.component) {
        const { default: component, ...rest } = await route.loader();

        route.component = component;
        route.otherExports = rest;
      }
    },

    hydrateFromURL(url) {
      return this.redirect(this.urlToPayload(url));
    },

    async hydrateFromState({ state }) {
      adapters.batch(() => {
        Object.assign(this.state, state);
      });

      const activeState = this.getActiveState();

      activeState!.props = routes[activeState!.name].props;

      await this.preloadComponent(activeState!.name);
    },
  } as TypeRouter<TRoutes>);

  router.historyListener = router.historyListener.bind(router);
  router.attachHistoryListener = router.attachHistoryListener.bind(router);
  router.destroyHistoryListener = router.destroyHistoryListener.bind(router);

  router.redirect = router.redirect.bind(router);
  router.hydrateFromURL = router.hydrateFromURL.bind(router);
  router.preloadComponent = router.preloadComponent.bind(router);
  router.payloadToState = router.payloadToState.bind(router);
  router.hydrateFromState = router.hydrateFromState.bind(router);
  router.getGlobalArguments = router.getGlobalArguments.bind(router);
  router.urlToPayload = router.urlToPayload.bind(router);
  router.getActiveState = router.getActiveState.bind(router);

  router.attachHistoryListener();

  return router;
}
