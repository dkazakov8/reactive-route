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

const router = createRouter({ configs, adapters });

const state = router.urlToState('');

// @ts-expect-error not existing name
state.name === 'unknown';

if (state.name === 'notFound') {
  state.name;
  state.params;
  // @ts-expect-error "params" values are not available
  state.params.unknown;
  state.query;
  // @ts-expect-error "query" values are not available
  state.query.unknown;
}

if (state.name === 'internalError') {
  state.name;
  state.params;
  // @ts-expect-error "params" values are not available
  state.params.unknown;
  state.query;
  // @ts-expect-error "query" values are not available
  state.query.unknown;
}

if (state.name === 'static') {
  state.name;
  state.params;
  state.query;
  // @ts-expect-error "params" values are not available
  state.params.unknown;
  // @ts-expect-error "query" values are not available
  state.query.unknown;
}

if (state.name === 'staticQuery') {
  state.name;
  state.params;
  // @ts-expect-error "params" values are not available
  state.params.unknown;
  state.query.q;
  // @ts-expect-error unknown "query" are not available
  state.query.unknown;
}

if (state.name === 'dynamic') {
  state.name;
  state.params.id;
  // @ts-expect-error unknown "params" are not available
  state.params.unknown;
  state.query;
  // @ts-expect-error "query" values are not available
  state.query.unknown;
}

if (state.name === 'dynamicQuery') {
  state.name;
  state.params.id;
  state.query.q;
  // @ts-expect-error unknown "params" are not available
  state.params.unknown;
  // @ts-expect-error unknown "query" are not available
  state.query.unknown;
}
