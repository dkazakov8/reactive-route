import { createConfigs, createRouter } from '../../packages/core';

const loader = async () => ({ default: null });

const v: (value: string) => boolean = () => true;

const adapters = {} as any;

const configs = createConfigs({
  static: { path: '/', loader },
  staticQuery: { path: '/', query: { q: v }, loader },
  dynamic: { path: '/:id', params: { id: v }, loader },
  dynamicQuery: {
    path: '/:id',
    params: { id: v },
    query: { q: v },
    loader,
  },
  notFound: { path: '/404', loader },
  internalError: { path: '/500', loader },
});

createRouter({
  configs,
  adapters,
  beforeComponentChange({ prevConfig, prevState, currentConfig, currentState }) {
    /** prevConfig */

    prevConfig?.name;
    prevConfig?.loader;
    // @ts-expect-error unknown prevConfig property is not available
    prevConfig?.unknown;

    if (prevConfig?.name === 'dynamic') {
      prevConfig.params.id;
      // @ts-expect-error unknown "params" are not available
      prevConfig.params.unknown;
      // @ts-expect-error "query" is not available
      prevConfig.query.q;
    }

    if (prevConfig?.name === 'static') {
      // @ts-expect-error "params" is not available
      prevConfig.params.id;
      // @ts-expect-error "query" is not available
      prevConfig.query.q;
    }

    if (prevConfig?.name === 'staticQuery') {
      prevConfig.query.q;
      // @ts-expect-error unknown "query" are not available
      prevConfig.query.unknown;
      // @ts-expect-error "params" is not available
      prevConfig.params.id;
    }

    if (prevConfig?.name === 'dynamicQuery') {
      prevConfig.params.id;
      prevConfig.query.q;
      // @ts-expect-error unknown "params" are not available
      prevConfig.params.unknown;
      // @ts-expect-error unknown "query" are not available
      prevConfig.query.unknown;
    }

    if (prevConfig?.name === 'notFound') {
      // @ts-expect-error "params" is not available
      prevConfig.params.code;
      // @ts-expect-error "query" is not available
      prevConfig.query.q;
    }

    if (prevConfig?.name === 'internalError') {
      // @ts-expect-error "params" is not available
      prevConfig.params.code;
      // @ts-expect-error "query" is not available
      prevConfig.query.q;
    }

    /** currentConfig */

    currentConfig.name;
    currentConfig.loader;
    // @ts-expect-error unknown currentConfig property is not available
    currentConfig.unknown;

    if (currentConfig.name === 'notFound') {
      // @ts-expect-error "params" is not available
      currentConfig.params.code;
      // @ts-expect-error "query" is not available
      currentConfig.query.q;
    }

    if (currentConfig.name === 'internalError') {
      // @ts-expect-error "params" is not available
      currentConfig.params.code;
      // @ts-expect-error "query" is not available
      currentConfig.query.q;
    }

    if (currentConfig.name === 'static') {
      // @ts-expect-error "params" is not available
      currentConfig.params.id;
      // @ts-expect-error "query" is not available
      currentConfig.query.q;
    }

    if (currentConfig.name === 'staticQuery') {
      currentConfig.query.q;
      // @ts-expect-error unknown "query" are not available
      currentConfig.query.unknown;
      // @ts-expect-error "params" is not available
      currentConfig.params.id;
    }

    if (currentConfig.name === 'dynamicQuery') {
      currentConfig.params.id;
      currentConfig.query.q;
      // @ts-expect-error unknown "params" are not available
      currentConfig.params.unknown;
      // @ts-expect-error unknown "query" are not available
      currentConfig.query.unknown;
    }

    if (currentConfig.name === 'dynamic') {
      currentConfig.params.id;
      // @ts-expect-error unknown "params" are not available
      currentConfig.params.unknown;
      // @ts-expect-error "query" is not available
      currentConfig.query.q;
    }

    /** prevState */

    prevState?.name;
    prevState?.params;
    prevState?.query;
    // @ts-expect-error unknown prevState property is not available
    prevState?.unknown;

    // @ts-expect-error not existing name
    prevState?.name === 'unknown';

    if (prevState?.name === 'staticQuery') {
      prevState.query.q;
      // @ts-expect-error unknown "query" are not available
      prevState.query.unknown;
      // @ts-expect-error "params" values are not available
      prevState.params.unknown;
    }

    if (prevState?.name === 'notFound') {
      prevState.params;
      // @ts-expect-error "params" values are not available
      prevState.params.unknown;
      prevState.query;
      // @ts-expect-error "query" values are not available
      prevState.query.unknown;
    }

    if (prevState?.name === 'internalError') {
      prevState.params;
      // @ts-expect-error "params" values are not available
      prevState.params.unknown;
      prevState.query;
      // @ts-expect-error "query" values are not available
      prevState.query.unknown;
    }

    if (prevState?.name === 'static') {
      prevState.params;
      prevState.query;
      // @ts-expect-error "params" values are not available
      prevState.params.unknown;
      // @ts-expect-error "query" values are not available
      prevState.query.unknown;
    }

    if (prevState?.name === 'dynamic') {
      prevState.params.id;
      // @ts-expect-error unknown "params" are not available
      prevState.params.unknown;
      prevState.query;
      // @ts-expect-error "query" values are not available
      prevState.query.unknown;
    }

    if (prevState?.name === 'dynamicQuery') {
      prevState.params.id;
      prevState.query.q;
      // @ts-expect-error unknown "params" are not available
      prevState.params.unknown;
      // @ts-expect-error unknown "query" are not available
      prevState.query.unknown;
    }

    /** currentState */

    currentState.name;
    currentState.params;
    currentState.query;
    // @ts-expect-error unknown currentState property is not available
    currentState.unknown;

    // @ts-expect-error not existing name
    currentState.name === 'unknown';

    if (currentState.name === 'notFound') {
      currentState.params;
      // @ts-expect-error "params" values are not available
      currentState.params.unknown;
      currentState.query;
      // @ts-expect-error "query" values are not available
      currentState.query.unknown;
    }

    if (currentState.name === 'internalError') {
      currentState.params;
      // @ts-expect-error "params" values are not available
      currentState.params.unknown;
      currentState.query;
      // @ts-expect-error "query" values are not available
      currentState.query.unknown;
    }

    if (currentState.name === 'static') {
      currentState.params;
      currentState.query;
      // @ts-expect-error "params" values are not available
      currentState.params.unknown;
      // @ts-expect-error "query" values are not available
      currentState.query.unknown;
    }

    if (currentState.name === 'staticQuery') {
      currentState.query.q;
      // @ts-expect-error unknown "query" are not available
      currentState.query.unknown;
      // @ts-expect-error "params" values are not available
      currentState.params.unknown;
    }

    if (currentState.name === 'dynamic') {
      currentState.params.id;
      // @ts-expect-error unknown "params" are not available
      currentState.params.unknown;
      // @ts-expect-error "query" values are not available
      currentState.query.unknown;
    }

    if (currentState.name === 'dynamicQuery') {
      currentState.params.id;
      currentState.query.q;
      // @ts-expect-error unknown "params" are not available
      currentState.params.unknown;
      // @ts-expect-error unknown "query" are not available
      currentState.query.unknown;
    }
  },
});
