import { createConfigs } from '../../packages/core';

const loader = async () => ({ default: null });

const v = () => true;

createConfigs({
  dynamic: { path: '/:id/:tab', params: { id: v, tab: v }, loader },
  // @ts-expect-error params.tab is required
  dynamic2: { path: '/:id/:tab', params: { id: v }, loader },
  // @ts-expect-error params.tab and params.id are required
  dynamic3: { path: '/:id/:tab', params: {}, loader },
  // @ts-expect-error params are required
  dynamic4: { path: '/:id/:tab', loader },
  // @ts-expect-error params validators must be functions
  dynamic5: { path: '/:id/:tab', params: { id: v, tab: '' }, loader },

  static: { path: '/', loader },
  // @ts-expect-error params must be undefined
  static2: { path: '/', loader, params: {} },

  // props are allowed for error pages
  notFound: { path: '/404', props: {}, loader },
  internalError: { path: '/500', props: {}, loader },
});

createConfigs({ notFound: { path: '/404', loader }, internalError: { path: '/500', loader } });

// @ts-expect-error internalError is required
createConfigs({ notFound: { path: '/404', loader } });

// @ts-expect-error notFound is required
createConfigs({ internalError: { path: '/500', loader } });

createConfigs({
  // @ts-expect-error query is not allowed
  notFound: { path: '/404', loader, query: {} },
  // @ts-expect-error params are not allowed
  internalError: { path: '/500', loader, params: { code: v } },
});

createConfigs({
  // @ts-expect-error beforeLeave is not allowed
  notFound: { path: '/404', loader, beforeLeave: async () => undefined },
  // @ts-expect-error beforeEnter is not allowed
  internalError: { path: '/500', loader, beforeEnter: async () => undefined },
});
