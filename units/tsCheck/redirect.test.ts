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

await router.redirect({ name: 'static' });
await router.redirect({ name: 'staticQuery' });
await router.redirect({ name: 'staticQuery', query: { q: '' } });
await router.redirect({ name: 'dynamic', params: { id: '' } });
await router.redirect({ name: 'dynamicQuery', params: { id: '' } });
await router.redirect({
  name: 'dynamicQuery',
  params: { id: '' },
  query: { q: '' },
});

/** Not string values raise errors */

await router.redirect({
  // @ts-expect-error name must be a string
  name: 1,
});
await router.redirect({
  name: 'staticQuery',
  // @ts-expect-error "query" values must be strings
  query: { q: 1 },
});
await router.redirect({
  name: 'dynamic',
  // @ts-expect-error "params" values must be strings
  params: { id: 1 },
});
await router.redirect({
  name: 'dynamicQuery',
  params: { id: '' },
  // @ts-expect-error "query" values must be strings
  query: { q: 1 },
});
// @ts-expect-error "params" are required
await router.redirect({ name: 'dynamic' });
await router.redirect({
  name: 'dynamic',
  // @ts-expect-error "params" are incomplete
  params: {},
});

/** Irrelevant StateDynamic raise errors */

// @ts-expect-error name must be present
await router.redirect({});
// @ts-expect-error "name" must be a string key of configs
await router.redirect({ name: 'unknown' });
await router.redirect({
  name: 'static',
  // @ts-expect-error "params" are not allowed
  params: { id: '' },
});
await router.redirect({
  name: 'staticQuery',
  // @ts-expect-error "params" are not allowed
  params: { id: '' },
});
await router.redirect({
  name: 'dynamic',
  // @ts-expect-error extra "params" are not allowed
  params: { id: '', extra: '' },
});
await router.redirect({
  name: 'static',
  // @ts-expect-error "query" is not allowed
  query: { q: '' },
});
await router.redirect({
  name: 'dynamic',
  params: { id: '' },
  // @ts-expect-error "query" is not allowed
  query: { q: '' },
});
await router.redirect({
  name: 'staticQuery',
  // @ts-expect-error unknown "query" key
  query: { unknown: '' },
});
await router.redirect({
  name: 'dynamicQuery',
  params: { id: '' },
  // @ts-expect-error unknown "query" key
  query: { unknown: '' },
});

const state = router.urlToState('');

void router.redirect(state);
