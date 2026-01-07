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

// @ts-expect-error not existing name
router.state.unknown;

router.state.static!.name;
router.state.static!.params;
router.state.static!.query;
// @ts-expect-error "params" values are not available
router.state.static!.params.unknown;
// @ts-expect-error "query" values are not available
router.state.static!.query.unknown;

router.state.notFound!.name;
router.state.notFound!.params;
// @ts-expect-error "params" values are not available
router.state.notFound!.params.unknown;
router.state.notFound!.query;
// @ts-expect-error "query" values are not available
router.state.notFound!.query.unknown;

router.state.internalError!.name;
router.state.internalError!.params;
// @ts-expect-error "params" values are not available
router.state.internalError!.params.unknown;
router.state.internalError!.query;
// @ts-expect-error "query" values are not available
router.state.internalError!.query.unknown;

router.state.staticQuery!.name;
router.state.staticQuery!.params;
// @ts-expect-error "params" values are not available
router.state.staticQuery!.params.unknown;
router.state.staticQuery!.query.q;
// @ts-expect-error unknown "query" are not available
router.state.staticQuery!.query.unknown;

router.state.dynamic!.name;
router.state.dynamic!.params.id;
// @ts-expect-error unknown "params" are not available
router.state.dynamic!.params.unknown;
router.state.dynamic!.query;
// @ts-expect-error "query" values are not available
router.state.dynamic!.query.unknown;

router.state.dynamicQuery!.name;
router.state.dynamicQuery!.params.id;
router.state.dynamicQuery!.query.q;
// @ts-expect-error unknown "params" are not available
router.state.dynamicQuery!.params.unknown;
// @ts-expect-error unknown "query" are not available
router.state.dynamicQuery!.query.unknown;
