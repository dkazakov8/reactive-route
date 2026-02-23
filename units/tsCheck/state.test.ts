import { createConfigs, createRouter } from '../../packages/core';

const loader = async () => ({ default: null });

const v: (param: string) => boolean = () => true;

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

const stateStatic = router.payloadToState({ name: 'static' });
stateStatic.name;
stateStatic.url;
stateStatic.search;
stateStatic.pathname;
stateStatic.isActive;
// @ts-expect-error params are not available
stateStatic.params;
// @ts-expect-error query is not available
stateStatic.query;

const stateStaticQuery = router.payloadToState({ name: 'staticQuery' });
stateStaticQuery.name;
stateStaticQuery.query.q;
// @ts-expect-error unknown query are not available
stateStaticQuery.query.unknown;
// @ts-expect-error params are not available
stateStaticQuery.params;

const stateStaticQuery2 = router.payloadToState({ name: 'staticQuery', query: { q: '' } });
stateStaticQuery2.query.q;
// @ts-expect-error unknown query are not available
stateStaticQuery2.query.unknown;
// @ts-expect-error params are not available
stateStaticQuery2.params;

const stateDynamic = router.payloadToState({ name: 'dynamic', params: { id: '' } });
stateDynamic.params.id;
// @ts-expect-error unknown params are not available
stateDynamic.params.unknown;
// @ts-expect-error query is not available
stateDynamic.query;

const stateDynamicQuery = router.payloadToState({ name: 'dynamicQuery', params: { id: '' } });
stateDynamicQuery.params.id;
stateDynamicQuery.query.q;
// @ts-expect-error unknown params are not available
stateDynamicQuery.params.unknown;
// @ts-expect-error unknown query are not available
stateDynamicQuery.query.unknown;

const stateDynamicQuery2 = router.payloadToState({
  name: 'dynamicQuery',
  params: { id: '' },
  query: { q: '' },
});
stateDynamicQuery2.params.id;
stateDynamicQuery2.query.q;
// @ts-expect-error unknown params are not available
stateDynamicQuery2.params.unknown;
// @ts-expect-error unknown query are not available
stateDynamicQuery2.query.unknown;
