import { createConfigs, createRouter } from '../../packages/core';

const loader = async () => ({ default: null });

const v: (value: string) => boolean = () => true;

const adapters = {} as any;

const configs = createConfigs({
  static: { path: '/', loader },
  staticQuery: { path: '/', query: { q: v }, loader },
  dynamic: { path: '/:id', params: { id: v }, loader },
  dynamicQuery: { path: '/:id', params: { id: v }, query: { q: v }, loader },
  notFound: { path: '/404', loader },
  internalError: { path: '/500', loader },
});

const router = createRouter({ configs, adapters });

/**
 * TS Valid
 *
 */

router.payloadToState({ name: 'static' });
await router.redirect({ name: 'static' });
router.payloadToState({ name: 'staticQuery' });
await router.redirect({ name: 'staticQuery' });
router.payloadToState({ name: 'staticQuery', query: { q: '' } });
await router.redirect({ name: 'staticQuery', query: { q: '' } });
router.payloadToState({ name: 'dynamic', params: { id: '' } });
await router.redirect({ name: 'dynamic', params: { id: '' } });
router.payloadToState({ name: 'dynamicQuery', params: { id: '' } });
await router.redirect({ name: 'dynamicQuery', params: { id: '' } });
router.payloadToState({ name: 'dynamicQuery', params: { id: '' }, query: { q: '' } });
await router.redirect({ name: 'dynamicQuery', params: { id: '' }, query: { q: '' } });

/**
 * Not string values raise errors
 *
 */

// @ts-expect-error name must be present
router.payloadToState({});
// @ts-expect-error name must be present
await router.redirect({});
// @ts-expect-error name must be a string key of configs
router.payloadToState({ name: 1 });
// @ts-expect-error name must be a string key of configs
await router.redirect({ name: 1 });
// @ts-expect-error "query" values must be strings
router.payloadToState({ name: 'staticQuery', query: { q: 1 } });
// @ts-expect-error "query" values must be strings
await router.redirect({ name: 'staticQuery', query: { q: 1 } });
// @ts-expect-error "params" values must be strings
router.payloadToState({ name: 'dynamic', params: { id: 1 } });
// @ts-expect-error "params" values must be strings
await router.redirect({ name: 'dynamic', params: { id: 1 } });
// @ts-expect-error "query" values must be strings
router.payloadToState({ name: 'dynamicQuery', params: { id: '' }, query: { q: 1 } });
// @ts-expect-error "query" values must be strings
await router.redirect({ name: 'dynamicQuery', params: { id: '' }, query: { q: 1 } });
// @ts-expect-error "params" are required
router.payloadToState({ name: 'dynamic' });
// @ts-expect-error "params" are required
await router.redirect({ name: 'dynamic' });
// @ts-expect-error "params" are incomplete
router.payloadToState({ name: 'dynamic', params: {} });
// @ts-expect-error "params" are incomplete
await router.redirect({ name: 'dynamic', params: {} });

/**
 * Irrelevant Payloads raise errors
 *
 */

// @ts-expect-error "name" must be a string key of configs
router.payloadToState({ name: 'unknown' });
// @ts-expect-error "name" must be a string key of configs
await router.redirect({ name: 'unknown' });
// @ts-expect-error "params" are not allowed
router.payloadToState({ name: 'static', params: { id: '' } });
// @ts-expect-error "params" are not allowed
await router.redirect({ name: 'static', params: { id: '' } });
// @ts-expect-error "params" are not allowed
router.payloadToState({ name: 'staticQuery', params: { id: '' } });
// @ts-expect-error "params" are not allowed
await router.redirect({ name: 'staticQuery', params: { id: '' } });
// @ts-expect-error extra "params" are not allowed
router.payloadToState({ name: 'dynamic', params: { id: '', extra: '' } });
// @ts-expect-error extra "params" are not allowed
await router.redirect({ name: 'dynamic', params: { id: '', extra: '' } });
// @ts-expect-error "query" is not allowed
router.payloadToState({ name: 'static', query: { q: '' } });
// @ts-expect-error "query" is not allowed
await router.redirect({ name: 'static', query: { q: '' } });
// @ts-expect-error "query" is not allowed
router.payloadToState({ name: 'dynamic', params: { id: '' }, query: { q: '' } });
// @ts-expect-error "query" is not allowed
await router.redirect({ name: 'dynamic', params: { id: '' }, query: { q: '' } });
// @ts-expect-error unknown query key
router.payloadToState({ name: 'staticQuery', query: { unknown: '' } });
// @ts-expect-error unknown query key
await router.redirect({ name: 'staticQuery', query: { unknown: '' } });
// @ts-expect-error unknown query key
router.payloadToState({ name: 'dynamicQuery', params: { id: '' }, query: { unknown: '' } });
// @ts-expect-error unknown query key
await router.redirect({ name: 'dynamicQuery', params: { id: '' }, query: { unknown: '' } });

/**
 * Type Narrowing
 *
 */

const payload = router.urlToPayload('');

payload.replace;

// @ts-expect-error not existing name
payload.name === 'unknown';

if (payload.name === 'notFound') {
  // @ts-expect-error params are not available
  payload.params;
  // @ts-expect-error "query" are not available
  payload.query;
}

if (payload.name === 'internalError') {
  // @ts-expect-error params are not available
  payload.params;
  // @ts-expect-error "query" are not available
  payload.query;
}

if (payload.name === 'static') {
  // @ts-expect-error params are not available
  payload.params;
  // @ts-expect-error "query" are not available
  payload.query;
}

if (payload.name === 'staticQuery') {
  payload.query.q;
  // @ts-expect-error params are not available
  payload.params;
}

if (payload.name === 'dynamic') {
  payload.params.id;
  // @ts-expect-error "query" are not available
  payload.query;
}

if (payload.name === 'dynamicQuery') {
  payload.params.id;
  payload.query.q;
}

void router.redirect(payload);
