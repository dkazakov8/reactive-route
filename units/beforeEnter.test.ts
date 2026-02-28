import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createConfigs, createRouter } from '../packages/core';
import {
  checkURL,
  createBeforeEnterSpy,
  destroyAfterTest,
  getConfigsDefault,
  loader,
  v,
} from './helpers/checkers';
import { getAdapters } from './helpers/getAdapters';
import { allPossibleOptions } from './helpers/types';

beforeEach(() => {
  if (typeof window !== 'undefined') {
    window.history.replaceState(null, '', '/');
  }
});

describe.each(allPossibleOptions)(`Lifecycle: beforeEnter %s`, (options) => {
  it('Not called when Payload is the same + query', async () => {
    const spy = createBeforeEnterSpy();

    const router = createRouter({
      configs: createConfigs({
        static: { path: '/static', query: { q: v.length }, loader, beforeEnter: spy.beforeEnter },
        ...getConfigsDefault(),
      }),
      adapters: await getAdapters(options),
    });

    destroyAfterTest(router);

    let url = await router.redirect({ name: 'static' });

    let currentState: any;
    let nextState: any = {
      name: 'static',
      query: {},
      params: {},
      url: '/static',
      search: '',
      pathname: '/static',
      props: {},
      isActive: true,
    };

    spy.checkCount(1);

    spy.checkLastArguments({ reason: 'new_config', nextState, currentState });

    checkURL({ routerUrl: url, expectedUrl: nextState.url });

    expect(router.getActiveState()).to.deep.eq(nextState);

    await router.redirect({ name: 'static' });

    spy.checkCount(1);

    // now with the query

    url = await router.redirect({ name: 'static', query: { q: 'v-q' } });

    currentState = nextState;
    nextState = {
      name: 'static',
      query: { q: 'v-q' },
      params: {},
      url: '/static?q=v-q',
      search: 'q=v-q',
      pathname: '/static',
      props: {},
      isActive: true,
    };

    spy.checkCount(2);

    spy.checkLastArguments({ reason: 'new_query', nextState, currentState });

    checkURL({ routerUrl: url, expectedUrl: nextState.url });

    expect(router.getActiveState()).to.deep.eq(nextState);

    url = await router.redirect({ name: 'static', query: { q: 'v-q' } });

    spy.checkCount(2);

    checkURL({ routerUrl: url, expectedUrl: nextState.url });

    expect(router.getActiveState()).to.deep.eq(nextState);
  });

  it('Not called when Payload is the same + params + query', async () => {
    const spy = createBeforeEnterSpy();

    const router = createRouter({
      configs: createConfigs({
        dynamic: {
          path: '/:one',
          params: { one: v.length },
          query: { q: v.length },
          loader,
          beforeEnter: spy.beforeEnter,
        },
        ...getConfigsDefault(),
      }),
      adapters: await getAdapters(options),
    });

    destroyAfterTest(router);

    let url = await router.redirect({ name: 'dynamic', params: { one: 'v-one' } });

    let currentState: any;
    let nextState: any = {
      name: 'dynamic',
      query: {},
      params: { one: 'v-one' },
      url: '/v-one',
      search: '',
      pathname: '/v-one',
      props: {},
      isActive: true,
    };

    spy.checkCount(1);

    spy.checkLastArguments({ reason: 'new_config', nextState, currentState });

    checkURL({ routerUrl: url, expectedUrl: nextState.url });

    expect(router.getActiveState()).to.deep.eq(nextState);

    url = await router.redirect({ name: 'dynamic', params: { one: 'v-one' } });

    spy.checkCount(1);

    checkURL({ routerUrl: url, expectedUrl: nextState.url });

    expect(router.getActiveState()).to.deep.eq(nextState);

    // now with the query

    url = await router.redirect({ name: 'dynamic', params: { one: 'v-one' }, query: { q: 'v-q' } });

    currentState = nextState;
    nextState = {
      name: 'dynamic',
      query: { q: 'v-q' },
      params: { one: 'v-one' },
      url: '/v-one?q=v-q',
      search: 'q=v-q',
      pathname: '/v-one',
      props: {},
      isActive: true,
    };

    spy.checkCount(2);

    spy.checkLastArguments({ reason: 'new_query', nextState, currentState });

    checkURL({ routerUrl: url, expectedUrl: nextState.url });

    expect(router.getActiveState()).to.deep.eq(nextState);

    url = await router.redirect({ name: 'dynamic', params: { one: 'v-one' }, query: { q: 'v-q' } });

    spy.checkCount(2);

    checkURL({ routerUrl: url, expectedUrl: nextState.url });

    expect(router.getActiveState()).to.deep.eq(nextState);
  });

  it('Called when query changed', async () => {
    const spyStatic = createBeforeEnterSpy();
    const spyDynamic = createBeforeEnterSpy();

    const router = createRouter({
      configs: createConfigs({
        static: {
          path: '/static',
          query: { q: v.length },
          loader,
          beforeEnter: spyStatic.beforeEnter,
        },
        dynamic: {
          path: '/:one',
          params: { one: v.length },
          query: { q: v.length },
          loader,
          beforeEnter: spyDynamic.beforeEnter,
        },
        ...getConfigsDefault(),
      }),
      adapters: await getAdapters(options),
    });

    destroyAfterTest(router);

    let url = await router.redirect({ name: 'static', query: { q: 'v-q-1' } });

    let currentState: any;
    let nextState: any = {
      name: 'static',
      query: { q: 'v-q-1' },
      params: {},
      url: '/static?q=v-q-1',
      search: 'q=v-q-1',
      pathname: '/static',
      props: {},
      isActive: true,
    };

    spyStatic.checkCount(1);

    spyStatic.checkLastArguments({ reason: 'new_config', nextState, currentState });

    checkURL({ routerUrl: url, expectedUrl: nextState.url });

    expect(router.getActiveState()).to.deep.eq(nextState);

    url = await router.redirect({ name: 'static', query: { q: 'v-q-2' } });

    currentState = nextState;
    nextState = {
      name: 'static',
      query: { q: 'v-q-2' },
      params: {},
      url: '/static?q=v-q-2',
      search: 'q=v-q-2',
      pathname: '/static',
      props: {},
      isActive: true,
    };

    spyStatic.checkCount(2);

    spyStatic.checkLastArguments({ reason: 'new_query', nextState, currentState });

    checkURL({ routerUrl: url, expectedUrl: nextState.url });

    expect(router.getActiveState()).to.deep.eq(nextState);

    url = await router.redirect({
      name: 'dynamic',
      params: { one: 'v-one' },
      query: { q: 'v-q-1' },
    });

    currentState = nextState;
    nextState = {
      name: 'dynamic',
      query: { q: 'v-q-1' },
      params: { one: 'v-one' },
      url: '/v-one?q=v-q-1',
      search: 'q=v-q-1',
      pathname: '/v-one',
      props: {},
      isActive: true,
    };

    spyDynamic.checkCount(1);

    spyDynamic.checkLastArguments({ reason: 'new_config', nextState, currentState });

    checkURL({ routerUrl: url, expectedUrl: nextState.url });

    expect(router.getActiveState()).to.deep.eq(nextState);

    url = await router.redirect({
      name: 'dynamic',
      params: { one: 'v-one' },
      query: { q: 'v-q-2' },
    });

    currentState = nextState;
    nextState = {
      name: 'dynamic',
      query: { q: 'v-q-2' },
      params: { one: 'v-one' },
      url: '/v-one?q=v-q-2',
      search: 'q=v-q-2',
      pathname: '/v-one',
      props: {},
      isActive: true,
    };

    spyDynamic.checkCount(2);

    spyDynamic.checkLastArguments({ reason: 'new_query', nextState, currentState });

    checkURL({ routerUrl: url, expectedUrl: nextState.url });

    expect(router.getActiveState()).to.deep.eq(nextState);
  });

  it('Called when params changed + query (when changed both - reason is "new_params")', async () => {
    const spy = createBeforeEnterSpy();

    const router = createRouter({
      configs: createConfigs({
        dynamic: {
          path: '/:one',
          params: { one: v.length },
          query: { q: v.length },
          loader,
          beforeEnter: spy.beforeEnter,
        },
        ...getConfigsDefault(),
      }),
      adapters: await getAdapters(options),
    });

    destroyAfterTest(router);

    let url = await router.redirect({ name: 'dynamic', params: { one: 'v-one-1' } });

    let currentState: any;
    let nextState: any = {
      name: 'dynamic',
      query: {},
      params: { one: 'v-one-1' },
      url: '/v-one-1',
      search: '',
      pathname: '/v-one-1',
      props: {},
      isActive: true,
    };

    spy.checkCount(1);

    spy.checkLastArguments({ reason: 'new_config', nextState, currentState });

    checkURL({ routerUrl: url, expectedUrl: nextState.url });

    expect(router.getActiveState()).to.deep.eq(nextState);

    url = await router.redirect({ name: 'dynamic', params: { one: 'v-one-2' } });

    currentState = nextState;
    nextState = {
      name: 'dynamic',
      query: {},
      params: { one: 'v-one-2' },
      url: '/v-one-2',
      search: '',
      pathname: '/v-one-2',
      props: {},
      isActive: true,
    };

    spy.checkCount(2);

    spy.checkLastArguments({ reason: 'new_params', nextState, currentState });

    checkURL({ routerUrl: url, expectedUrl: nextState.url });

    expect(router.getActiveState()).to.deep.eq(nextState);

    url = await router.redirect({
      name: 'dynamic',
      params: { one: 'v-one-2' },
      query: { q: 'v-q-1' },
    });

    currentState = nextState;
    nextState = {
      name: 'dynamic',
      query: { q: 'v-q-1' },
      params: { one: 'v-one-2' },
      url: '/v-one-2?q=v-q-1',
      search: 'q=v-q-1',
      pathname: '/v-one-2',
      props: {},
      isActive: true,
    };

    spy.checkCount(3);

    spy.checkLastArguments({ reason: 'new_query', nextState, currentState });

    checkURL({ routerUrl: url, expectedUrl: nextState.url });

    expect(router.getActiveState()).to.deep.eq(nextState);

    url = await router.redirect({
      name: 'dynamic',
      params: { one: 'v-one-3' },
      query: { q: 'v-q-1' },
    });

    currentState = nextState;
    nextState = {
      name: 'dynamic',
      query: { q: 'v-q-1' },
      params: { one: 'v-one-3' },
      url: '/v-one-3?q=v-q-1',
      search: 'q=v-q-1',
      pathname: '/v-one-3',
      props: {},
      isActive: true,
    };

    spy.checkCount(4);

    spy.checkLastArguments({ reason: 'new_params', nextState, currentState });

    checkURL({ routerUrl: url, expectedUrl: nextState.url });

    expect(router.getActiveState()).to.deep.eq(nextState);

    url = await router.redirect({
      name: 'dynamic',
      params: { one: 'v-one-4' },
      query: { q: 'v-q-2' },
    });

    currentState = nextState;
    nextState = {
      name: 'dynamic',
      query: { q: 'v-q-2' },
      params: { one: 'v-one-4' },
      url: '/v-one-4?q=v-q-2',
      search: 'q=v-q-2',
      pathname: '/v-one-4',
      props: {},
      isActive: true,
    };

    spy.checkCount(5);

    spy.checkLastArguments({ reason: 'new_params', nextState, currentState });

    checkURL({ routerUrl: url, expectedUrl: nextState.url });

    expect(router.getActiveState()).to.deep.eq(nextState);
  });

  it('Errors should fallback to 500', async () => {
    const router = createRouter({
      configs: createConfigs({
        static: {
          path: '/static',
          loader,
          async beforeEnter() {
            // @ts-expect-error
            // biome-ignore lint/correctness/noUndeclaredVariables: false
            a;
          },
        },
        ...getConfigsDefault(),
      }),
      adapters: await getAdapters(options),
    });

    destroyAfterTest(router);

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    const url = await router.redirect({ name: 'static' });

    const nextState: any = {
      name: 'internalError',
      query: {},
      params: {},
      url: '/error500',
      search: '',
      pathname: '/error500',
      props: { error: 500 },
      isActive: true,
    };

    // the real browser URL is '/' (unchanged) because errors in the lifecycle should not influence history
    checkURL({
      routerUrl: url,
      expectedUrl: nextState.url,
      expectedHistoryUrl: '/',
    });

    expect(router.getActiveState()).to.deep.eq(nextState);

    expect(consoleErrorSpy).toHaveBeenCalledTimes(1);

    expect(consoleErrorSpy).nthCalledWith(1, new ReferenceError('a is not defined'));

    consoleErrorSpy.mockRestore();
  });
});
