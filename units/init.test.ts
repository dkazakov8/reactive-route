import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createConfigs, createRouter } from '../packages/core';
import { checkURL, destroyAfterTest, getConfigsDefault, loader, v } from './helpers/checkers';
import { getAdapters } from './helpers/getAdapters';
import { allPossibleOptions } from './helpers/types';

beforeEach(() => {
  if (typeof window !== 'undefined') {
    window.history.replaceState(null, '', '/');
  }
});

describe.each(allPossibleOptions)(`Router.init %s`, (options) => {
  it('Initial route is set', async () => {
    const router = createRouter({
      configs: createConfigs({
        static: { path: '/static', query: { q: v.length }, loader },
        ...getConfigsDefault(),
      }),
      adapters: await getAdapters(options),
    });

    destroyAfterTest(router);

    const url = await router.init('/static');

    const nextState: any = {
      name: 'static',
      query: {},
      params: {},
      url: '/static',
      search: '',
      pathname: '/static',
      props: {},
      isActive: true,
    };

    checkURL({ routerUrl: url, expectedUrl: nextState.url });

    expect(router.getActiveState()).to.deep.eq(nextState);
  });

  it('Not found is set', async () => {
    const router = createRouter({
      configs: createConfigs({ ...getConfigsDefault() }),
      adapters: await getAdapters(options),
    });

    destroyAfterTest(router);

    const url = await router.init('/static');

    const nextState: any = {
      name: 'notFound',
      query: {},
      params: {},
      url: `/error404`,
      search: ``,
      pathname: '/error404',
      props: { error: 404 },
      isActive: true,
    };

    checkURL({ routerUrl: url, expectedUrl: nextState.url });

    expect(router.getActiveState()).to.deep.eq(nextState);
  });

  it('Can skip lifecycle', async () => {
    const beforeEnter = vi.fn();
    const beforeLeave = vi.fn();

    const router = createRouter({
      configs: createConfigs({
        static: { path: '/static', loader, beforeEnter, beforeLeave },
        ...getConfigsDefault(),
      }),
      adapters: await getAdapters(options),
    });

    destroyAfterTest(router);

    const url = await router.init('/static', { skipLifecycle: true });

    const nextState: any = {
      name: 'static',
      query: {},
      params: {},
      url: '/static',
      search: '',
      pathname: '/static',
      props: {},
      isActive: true,
    };

    expect(beforeEnter).toHaveBeenCalledTimes(0);
    expect(beforeLeave).toHaveBeenCalledTimes(0);

    checkURL({ routerUrl: url, expectedUrl: nextState.url });

    expect(router.getActiveState()).to.deep.eq(nextState);
  });
});
