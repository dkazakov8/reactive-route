import { PreventError, RedirectError } from './constants';
import {
  TypeConfig,
  TypeConfigKeys,
  TypeConfigsDefault,
  TypeGlobalArguments,
  TypeLifecycleData,
  TypePayload,
  TypePayloadDefault,
  TypePayloadParsed,
  TypeReason,
  TypeRouter,
  TypeState,
} from './types';

export function createRouter<TConfigs extends TypeConfigsDefault>(
  globalArguments: TypeGlobalArguments<TConfigs>
): TypeRouter<TConfigs> {
  const { adapters, configs } = globalArguments;

  const win = typeof window !== 'undefined' ? window : null;
  const configNames = Object.keys(configs) as Array<TypeConfigKeys<TConfigs>>;
  const fallbackPayload: TypePayloadParsed<TConfigs> = {
    name: 'notFound',
    params: {},
    query: {},
  } as any;

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
       * 1. Try to find a relevant route from createConfigs
       * 2. Fill the query object with validated decoded values from the search
       * 3. Fill the params object with validated decoded values from the pathname
       *
       */

      if (url === '' || /^\/+$/.test(url)) url = '/';

      url = url.replace(/^\/+\?/, '/?');

      let urlObject: URL;

      try {
        urlObject = new URL(url, 'http://a.b');
      } catch (_e) {
        console.error(`Invalid URL "${url}", fallback to notFound`);

        return fallbackPayload;
      }

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

      const payloadParsed: {
        name?: TypeConfigKeys<TConfigs>;
        params: Record<string, string>;
        query: Record<string, string>;
      } = {
        name: undefined,
        params: {},
        query: {},
      };

      for (const name of configNames) {
        const testedConfig = configs[name];
        const testedPathname = testedConfig.path.replace(/(^\/|\/$)/g, '');

        if (!testedConfig.params || payloadParsed.name) {
          // return a static match instantly, it has the top priority
          if (testedPathname === pathname) {
            payloadParsed.params = {};
            payloadParsed.name = name;

            break;
          }

          // if a dynamic route has been found, no need to search for another
          continue;
        }

        const testedParts = testedPathname.split('/').filter(Boolean);

        if (testedParts.length !== partsDecoded.length) continue;

        const validationFailed = testedParts.some((expectedValue, i) => {
          const actualValue = partsDecoded[i];

          if (!expectedValue.startsWith(':')) return expectedValue !== actualValue;

          const param = expectedValue.slice(1);
          const validator = testedConfig.params![param];

          if (actualValue && validator(actualValue)) {
            payloadParsed.params[param] = actualValue;

            return false;
          }

          return true;
        });

        // no return instantly because the next Configs may have a static match
        if (validationFailed) payloadParsed.params = {};
        else payloadParsed.name = name;
      }

      if (!payloadParsed.name) return fallbackPayload;

      const config = configs[payloadParsed.name];

      Object.keys(config.query || {}).forEach((key) => {
        const actualValue = urlObject.searchParams.get(key);
        const validator = config.query![key];

        if (actualValue && validator(actualValue)) {
          payloadParsed.query[key] = actualValue;
        }
      });

      return payloadParsed as TypePayloadParsed<TConfigs>;
    },

    payloadToState(payload) {
      let config = configs[payload.name];

      if (!config) {
        console.error(
          `Invalid Payload ${JSON.stringify(payload)} ${!payload?.name ? '(no Config name passed)' : '(no Config found for this name)'}`
        );

        config = configs.notFound as any;
      }

      let params: Record<string, string> = {};
      const query: Record<string, string> = {};

      let validationFailed = false;

      let pathname = config.path.replace(/:([^/]+)/g, (_: string, paramName: string) => {
        const value = (payload as TypePayloadDefault).params?.[paramName];

        const validator = config.params?.[paramName];

        if (!validator || !value || !validator(value)) {
          validationFailed = true;

          console.error(`Invalid Payload ${JSON.stringify(payload)} (params failed validation)`);

          return _;
        }

        params[paramName] = value;

        return encodeURIComponent(value);
      });

      if (validationFailed) {
        config = configs.notFound as any;
        pathname = configs.notFound.path;

        params = {};
      }

      if (config.query && 'query' in payload && payload.query) {
        for (const key in config.query) {
          if (!Object.hasOwn(config.query, key)) continue;

          const value = (payload as TypePayloadDefault).query?.[key];
          const validator = config.query[key];

          if (typeof validator === 'function' && typeof value === 'string' && validator(value)) {
            query[key] = value;
          }
        }
      }

      const search = new URLSearchParams(query).toString().replace(/\+/g, '%20');
      const url = `${pathname}${search ? `?${search}` : ''}`;

      const state = {
        name: config.name,
        // @ts-expect-error
        query: query as Partial<Record<keyof TypeConfig['query'], string>>,
        params: params as Record<keyof TypeConfig['params'], string>,

        url,
        search,
        pathname,

        props: config.props,
        isActive: true,
      } satisfies TypeState<TConfigs, TypeConfigKeys<TConfigs>>;

      return state as any;
    },

    async redirect(payload, options) {
      const activeState = this.getActiveState();

      // this should be immutable, because activeState may change in the process
      const currentState = activeState
        ? this.payloadToState({
            name: activeState.name,
            params: (activeState as any).params,
            query: (activeState as any).query,
          } as TypePayload<TConfigs, TypeConfigKeys<TConfigs>>)
        : undefined;
      let nextState = this.payloadToState(payload);

      const beforeLeave = currentState ? configs[currentState.name].beforeLeave : undefined;
      const beforeEnter = configs[nextState.name].beforeEnter;

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
        if (!options?.skipLifecycle) {
          const lifecycleData: TypeLifecycleData = {
            reason,
            nextState: nextState as any,
            currentState: currentState as any,
          };

          await beforeLeave?.({
            ...lifecycleData,
            preventRedirect() {
              throw new PreventError(`Redirect to ${nextState.url} was prevented`);
            },
          });

          const redirectPayload = await beforeEnter?.({
            ...lifecycleData,
            redirect: (redirectPayload) => {
              if (win) return redirectPayload;

              const redirectState = this.payloadToState(redirectPayload as any);

              throw new RedirectError(redirectState.url);
            },
          });

          if (redirectPayload) return this.redirect(redirectPayload as any);
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

        for (const state of Object.values(this.state) as Array<
          TypeState<TConfigs, TypeConfigKeys<TConfigs>>
        >) {
          if (state?.name !== nextState.name) (state as any).isActive = false;
        }

        if (nextState.name !== 'internalError') {
          win?.history[payload.replace ? 'replaceState' : 'pushState'](null, '', nextState.url);
        }

        this.isRedirecting = false;
      });

      return nextState.url;
    },

    getActiveState() {
      return Object.values(this.state).find((state) => state?.isActive);
    },

    async preloadComponent(name) {
      const config = configs[name];

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
  } satisfies TypeRouter<TConfigs>);

  for (const key of Object.keys(router) as Array<keyof TypeRouter<TConfigs>>) {
    if (typeof router[key] === 'function') (router as any)[key] = router[key].bind(router);
  }

  router.historySyncStart();

  return router;
}
