import { PreventError, RedirectError } from './constants';
import {
  TypeConfig,
  TypeGlobalArguments,
  TypeLifecycleFunction,
  TypePayload,
  TypeReason,
  TypeRouter,
  TypeRoutesDefault,
  TypeState,
} from './types';

export function createRouter<TRoutes extends TypeRoutesDefault>(
  globalArguments: TypeGlobalArguments<TRoutes>
): TypeRouter<TRoutes> {
  const { adapters, routes } = globalArguments;

  const win = typeof window !== 'undefined' ? window : null;

  const router = adapters.makeObservable({
    state: {},
    isRedirecting: false,

    listener() {
      const payload = this.urlToPayload(`${location.pathname}${location.search}`);

      void this.redirect({ ...payload, replace: true });
    },
    historySyncStart() {
      win?.addEventListener('popstate', this.listener);
    },
    historySyncStop() {
      win?.removeEventListener('popstate', this.listener);
    },

    getGlobalArguments() {
      return globalArguments;
    },

    urlToPayload(url) {
      /**
       * This is the initial step when we only have a URL like `/path?foo=bar`
       *
       * 1. Try to find a relevant route from createRoutes
       * 2. Fill the query object with validated decoded values from search
       * 3. Fill the params object with validated decoded values from pathname
       *
       */

      const urlObject = new URL(url, 'http://a.b');

      const partsDecoded: Array<string> = [];

      const pathname = urlObject.pathname
        .replace(/\/+/g, '/')
        .replace(/([^/]+)/g, (partOriginal, part) => {
          try {
            part = decodeURIComponent(part);
          } catch (_e) {
            // no need to handle errors and log malformed values
            // they should be validated by the developer
          }

          partsDecoded.push(part);

          return partOriginal;
        })
        .replace(/(^\/|\/$)/g, '');

      let config: TypeConfig | undefined;
      const query: Record<string, string> = {};
      let params: Record<string, string> = {};

      for (const name of Object.keys(routes) as Array<keyof TRoutes>) {
        const testedConfig = routes[name];
        const testedPathname = testedConfig.path.replace(/(^\/|\/$)/g, '');

        // return a static match instantly, it has the top priority
        if (!testedPathname.includes(':') && testedPathname === pathname) {
          config = testedConfig;
          params = {};

          break;
        }

        // if a dynamic route has been found, no need to search for another
        if (config) continue;

        const testedParts = testedPathname.split('/').filter(Boolean);

        if (testedParts.length !== partsDecoded.length) continue;

        // Dynamic params must have functional validators
        // and static params should match
        const validationFailed = testedParts.some((expectedValue, i) => {
          const actualValue = partsDecoded[i];

          if (!expectedValue.startsWith(':')) return expectedValue !== actualValue;

          const paramName = expectedValue.slice(1);

          const validator = testedConfig.params?.[paramName];

          if (typeof validator !== 'function') {
            throw new Error(`missing validator for pathname dynamic parameter "${paramName}"`);
          }

          const validationPassed = validator(actualValue);

          if (validationPassed) params[paramName] = actualValue;

          return !validationPassed;
        });

        // no return instantly because next routes may have static match
        if (validationFailed) params = {};
        else config = testedConfig;
      }

      if (!config) return { name: 'notFound', params: {}, query: {} };

      if (config.query) {
        for (const key in config.query) {
          if (!config.query.hasOwnProperty(key)) continue;

          const value = urlObject.searchParams.get(key);
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

      const pathname = config.path.replace(/:([^/]+)/g, (_, pathPart: string) => {
        const value = (payload as any).params?.[pathPart];

        if (!value) throw new Error(`payload missing value for ${config.name}.params.${pathPart}`);

        params[pathPart] = value;

        return encodeURIComponent(value);
      });

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

    async redirect(payload, options) {
      const currentState = this.getActiveState();
      let nextState = this.payloadToState(payload);

      const beforeLeave = currentState ? routes[currentState.name].beforeLeave : undefined;
      const beforeEnter = routes[nextState.name].beforeEnter;

      let reason: TypeReason = 'unmodified';

      if (currentState?.name !== nextState.name) {
        reason = 'new_config';
      } else if (currentState?.pathname !== nextState.pathname) {
        reason = 'new_params';
      } else if (currentState?.search !== nextState.search) {
        reason = 'new_query';
      }

      if (reason === 'unmodified') return currentState!.url;

      this.isRedirecting = true;

      try {
        const data: Parameters<TypeLifecycleFunction>[0] = {
          reason,
          nextState,
          currentState,
          redirect: ((redirectPayload: TypePayload<TRoutes, keyof TRoutes>) => {
            if (win) return redirectPayload;

            const redirectState = this.payloadToState(redirectPayload);

            throw new RedirectError(redirectState.url);
          }) as any,
          preventRedirect() {
            throw new PreventError(`Redirect to ${nextState.url} was prevented`);
          },
        };

        if (!options?.skipLifecycle) {
          await beforeLeave?.(data);

          const redirectPayload: TypePayload<TRoutes, keyof TRoutes> = await beforeEnter?.(data);

          if (redirectPayload) return this.redirect(redirectPayload);
        }

        await this.preloadComponent(nextState.name);
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

        await this.preloadComponent(nextState.name);
      }

      adapters.batch(() => {
        if (!this.state[nextState.name]) this.state[nextState.name] = {} as any;

        adapters.replaceObject(this.state[nextState.name], nextState as any);

        for (const state of Object.values(this.state) as Array<TypeState<any>>) {
          if (state?.name !== nextState.name) state.isActive = false;
        }

        if (nextState.name !== 'internalError') {
          win?.history[payload.replace ? 'replaceState' : 'pushState'](null, '', nextState.url);
        }

        this.isRedirecting = false;
      });

      return nextState.url;
    },

    getActiveState() {
      return Object.values(this.state).find((state: TypeState<any>) => state.isActive);
    },

    async preloadComponent(name) {
      const config = routes[name];

      if (!config.component) {
        const { default: component, ...rest } = await config.loader();

        config.component = component;
        config.otherExports = rest;
      }
    },

    init(url, options) {
      const payload = this.urlToPayload(url);

      return this.redirect(payload, options);
    },
  } as TypeRouter<TRoutes>);

  for (const key of Object.keys(router) as Array<keyof TypeRouter<TRoutes>>) {
    if (typeof router[key] === 'function') (router as any)[key] = router[key].bind(router);
  }

  router.historySyncStart();

  return router;
}
