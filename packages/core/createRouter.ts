import { PreventError, RedirectError } from './constants';
import type {
  TypeConfigKeys,
  TypeConfigsDefault,
  TypeGlobalArguments,
  TypeReason,
  TypeRouter,
  TypeState,
  TypeStateDenormalized,
} from './types';

function log(message: string) {
  return (data: unknown) => {
    console.error(
      `[reactive-route] ${message.replace('%s', typeof data === 'string' ? `"${data}"` : JSON.stringify(data))}`
    );
  };
}

const errors = {
  brokenUrl: log(`Invalid URL %s, fallback to notFound`),
  noName: log(`Invalid State %s (no Config name passed)`),
  noConfig: log(`Invalid State %s (no Config found for this name)`),
  invalidParams: log(`Invalid State %s (params failed validation)`),
  chunkLoad:
    'Failed to load the error route chunk. Set up chunk retry/offline recovery in the app or bundler runtime',
};

export function createRouter<TConfigs extends TypeConfigsDefault>(
  globalArguments: TypeGlobalArguments<TConfigs>
): TypeRouter<TConfigs> {
  const { adapters, configs } = globalArguments;

  const win = typeof window !== 'undefined' ? window : null;
  const configNames = Object.keys(configs) as Array<TypeConfigKeys<TConfigs>>;
  let syncStopped = false;
  let activeTransitionId = 0;

  function isValidNonEmptyValue(validator: unknown, value: unknown): value is string {
    return (
      typeof validator === 'function' && typeof value === 'string' && !!value && validator(value)
    );
  }

  function normalizeState(
    stateLoose: TypeStateDenormalized<TConfigs>,
    silent = false
  ): TypeState<TConfigs> {
    const normalizedState: TypeState<TConfigs> = { name: 'notFound', params: {} as any, query: {} };
    const config = configs[stateLoose.name];

    if (!config) {
      if (!silent) {
        if (!stateLoose?.name) errors.noName(stateLoose);
        else errors.noConfig(stateLoose);
      }

      return normalizedState;
    }

    // config.path is always the source of truth,
    // we can't use config.params because the developer may use ts-ignore
    const requiredParams = (config.path.match(/:([^/]+)/g) || []).map((m) => m.slice(1));
    const validParams: Record<string, string> = {};

    for (const paramName of requiredParams) {
      // @ts-expect-error TS types are too strict, not needed here
      const value = stateLoose.params?.[paramName];
      const validator = config.params?.[paramName];

      if (!isValidNonEmptyValue(validator, value)) {
        if (!silent) errors.invalidParams(stateLoose);

        // return notFound State
        return normalizedState;
      }

      validParams[paramName] = value;
    }

    const requiredQuery = config.query || {};
    const validQuery: Record<string, string> = {};

    for (const queryName of Object.keys(requiredQuery)) {
      // @ts-expect-error TS types are too strict, not needed here
      const value = stateLoose.query?.[queryName];
      const validator = requiredQuery[queryName];

      if (isValidNonEmptyValue(validator, value)) validQuery[queryName] = value;
    }

    return { name: config.name, params: validParams as any, query: validQuery as any };
  }

  const router = adapters.makeObservable({
    state: {},
    activeName: undefined,
    isRedirecting: false,

    listener() {
      const state = this.urlToState(location.href);

      void this.redirect({ ...(state as any), replace: true }, { fromBrowserPopstate: true });
    },
    historySyncStart() {
      win?.addEventListener('popstate', this.listener);
    },
    historySyncStop() {
      win?.removeEventListener('popstate', this.listener);
      syncStopped = true;
    },

    getGlobalArguments() {
      return globalArguments;
    },

    urlToState(url) {
      let matchedState: TypeState<TConfigs> = { name: 'notFound', params: {} as any, query: {} };

      url = (url || '/').replace(/^\/+$/, '/').replace(/^\/+\?/, '/?');

      let urlObject: URL;

      try {
        urlObject = new URL(url, 'http://a.b');
      } catch (_e) {
        errors.brokenUrl(url);

        return matchedState;
      }

      const actualValues: Array<string> = [];

      const normalizedPathname = urlObject.pathname
        .replace(/\/+/g, '/')
        .replace(/([^/]+)/g, (valueOriginal, value: string) => {
          try {
            value = decodeURIComponent(value);
          } catch (_e) {
            // no need to handle errors and log malformed values
            // they should be validated by the developer
          }

          actualValues.push(value);

          return valueOriginal;
        })
        .replace(/(^\/|\/$)/g, '');

      const query = Object.fromEntries(urlObject.searchParams);

      for (const name of configNames) {
        const testedPathname = configs[name].path.replace(/(^\/|\/$)/g, '');

        if (!testedPathname.includes(':')) {
          if (testedPathname === normalizedPathname) return normalizeState({ name, query });

          continue;
        }

        const expectedValues = testedPathname.split('/').filter(Boolean);

        if (matchedState.name !== 'notFound' || expectedValues.length !== actualValues.length)
          continue;

        const params: Record<string, string> = {};

        const shapeMismatch = expectedValues.some((expectedValue, i) => {
          if (!expectedValue.startsWith(':')) return expectedValue !== actualValues[i];

          params[expectedValue.slice(1)] = actualValues[i];

          return false;
        });

        if (shapeMismatch) continue;

        matchedState = normalizeState({ name, params, query }, true);
      }

      return matchedState;
    },

    stateToUrl(stateLoose) {
      const normalizedState = normalizeState(stateLoose);
      const config = configs[normalizedState.name];

      const pathname = config.path.replace(/:([^/]+)/g, (_, paramName: string) => {
        // @ts-expect-error TS types are too strict, not needed here
        return encodeURIComponent(normalizedState.params[paramName]);
      });

      // @ts-expect-error TS types are too strict, not needed here
      const search = new URLSearchParams(normalizedState.query).toString().replace(/\+/g, '%20');

      return `${pathname}${search ? `?${search}` : ''}`;
    },

    async redirect(stateDynamic, options) {
      const transitionId = ++activeTransitionId;

      function isStale() {
        return transitionId !== activeTransitionId;
      }

      // this should be immutable, because activeState may change in the process
      const currentState = this.activeName ? { ...this.state[this.activeName] } : undefined;
      const currentUrl = currentState ? this.stateToUrl(currentState) : '';

      let nextState: TypeState<TConfigs> = normalizeState(stateDynamic);
      let nextUrl = this.stateToUrl(nextState);

      const beforeLeave = currentState ? configs[currentState.name].beforeLeave : undefined;
      const beforeEnter = configs[nextState.name].beforeEnter;

      let reason: TypeReason = 'unmodified';
      const currentBrowserUrl = `${win?.location.pathname || ''}${win?.location.search || ''}`;

      const [currentPathname = '', currentSearch = ''] = currentUrl.split('?');
      const [nextPathname = '', nextSearch = ''] = nextUrl.split('?');

      if (currentState?.name !== nextState.name) {
        reason = 'new_config';
      } else if (currentPathname !== nextPathname) {
        reason = 'new_params';
      } else if (currentSearch !== nextSearch) {
        reason = 'new_query';
      }

      if (reason === 'unmodified') {
        if (!isStale()) {
          adapters.batch(() => {
            this.isRedirecting = false;

            if (options?.fromBrowserPopstate && currentBrowserUrl !== currentUrl && !syncStopped) {
              win?.history.replaceState(null, '', currentUrl);
            }
          });
        }

        return currentUrl;
      }

      this.isRedirecting = true;

      try {
        if (!options?.skipLifecycle) {
          if (!options?.fromBrowserPopstate) {
            await beforeLeave?.({
              reason,
              nextState: nextState as any,
              currentState: currentState as any,
              preventRedirect() {
                throw new PreventError();
              },
            });

            if (isStale()) return currentUrl;
          }

          const redirectState = await beforeEnter?.({
            reason,
            nextState: nextState as any,
            currentState: currentState as any,
            redirect: (untypedState) => {
              if (win) return untypedState;

              throw new RedirectError(this.stateToUrl(untypedState));
            },
          });

          if (isStale()) return currentUrl;

          // redirectState is untyped because of TS limitations,
          // so we trust a user input - it will be validated anyway
          if (redirectState) {
            return this.redirect(
              {
                ...redirectState,
                replace: options?.fromBrowserPopstate ? true : redirectState.replace,
              } as any,
              options
            );
          }
        }

        await this.preloadComponent(nextState.name);
      } catch (error: unknown) {
        if (isStale()) return currentUrl;

        if (error instanceof PreventError || error instanceof RedirectError) {
          adapters.batch(() => {
            this.isRedirecting = false;
          });
        }

        if (error instanceof PreventError) return currentUrl;

        if (error instanceof RedirectError) throw error;

        // may happen when there is a syntax error in beforeEnter / beforeLeave
        // or a network problem with preloadComponent when a chunk can't be loaded
        console.error(error);

        nextState = normalizeState({ name: 'internalError' });
        nextUrl = this.stateToUrl(nextState);

        try {
          await this.preloadComponent(nextState.name);
        } catch (error: unknown) {
          console.error(error);

          throw new Error(errors.chunkLoad);
        }
      }

      if (isStale()) return currentUrl;

      adapters.batch(() => {
        this.state[nextState.name] ??= {} as any;

        adapters.replaceObject(this.state[nextState.name]!, nextState);

        if (nextState.name !== 'internalError' && !syncStopped) {
          if (!options?.fromBrowserPopstate || currentBrowserUrl !== nextUrl) {
            win?.history[stateDynamic.replace ? 'replaceState' : 'pushState'](null, '', nextUrl);
          }
        }

        this.activeName = nextState.name;
        this.isRedirecting = false;
      });

      return nextUrl;
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
      const nextState = this.urlToState(url);

      // we pass a normalized State instead of a dynamic one, it is secure,
      // so "as any" is a valid solution
      return this.redirect(nextState as any, options);
    },
  } satisfies TypeRouter<TConfigs>);

  for (const key of Object.keys(router) as Array<keyof TypeRouter<TConfigs>>) {
    if (typeof router[key] === 'function') (router as any)[key] = router[key].bind(router);
  }

  router.historySyncStart();

  return router;
}
