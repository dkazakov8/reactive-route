import { describe, expect, it, vi } from 'vitest';

import { createConfigs, createRouter, RedirectError } from '../packages/core';
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

describe.runIf(typeof window !== 'undefined').each(allPossibleOptions)(
  `Lifecycle [browser]: redirect chain %s`,
  (options) => {
    it('Redirects are silent', async () => {
      const spyStart = createBeforeEnterSpy();
      const spySecond = createBeforeEnterSpy();
      const spyThird = createBeforeEnterSpy();
      const spyTarget = createBeforeEnterSpy();

      const router = createRouter({
        configs: createConfigs({
          start: {
            path: '/dynamic/:param',
            params: { param: v.length },
            query: { q: v.length },
            loader,
            async beforeEnter(config) {
              spyStart.beforeEnter(config);

              return config.redirect({
                name: 'second',
                params: { param: (config.nextState.params as any).param },
              });
            },
          },
          second: {
            path: '/second/:param',
            params: { param: v.length },
            loader,
            async beforeEnter(config) {
              spySecond.beforeEnter(config);

              return config.redirect({ name: 'third', query: { q: 'test' } });
            },
          },
          third: {
            path: '/third',
            query: { q: v.length },
            loader,
            async beforeEnter(config) {
              spyThird.beforeEnter(config);

              return config.redirect({ name: 'target' });
            },
          },
          target: {
            path: '/target',
            loader,
            beforeEnter: spyTarget.beforeEnter,
          },
          ...getConfigsDefault(),
        }),
        adapters: await getAdapters(options),
      });

      destroyAfterTest(router);

      const pushStateSpy = vi.spyOn(window.history, 'pushState').mockClear();
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockClear();

      const url = await router.redirect({
        name: 'start',
        params: { param: 'v-param' },
        query: { q: 'v-q' },
      });

      let currentState: any;
      let nextState: any = { name: 'start', query: { q: 'v-q' }, params: { param: 'v-param' } };

      spyStart.checkCount(1);
      spyStart.checkLastArguments({ reason: 'new_config', nextState, currentState });

      nextState = { name: 'second', query: {}, params: { param: 'v-param' } };

      spySecond.checkCount(1);
      spySecond.checkLastArguments({ reason: 'new_config', nextState, currentState });

      nextState = { name: 'third', query: { q: 'test' }, params: {} };

      spyThird.checkCount(1);
      spyThird.checkLastArguments({ reason: 'new_config', nextState, currentState });

      nextState = { name: 'target', query: {}, params: {} };

      spyTarget.checkCount(1);
      spyTarget.checkLastArguments({ reason: 'new_config', nextState, currentState });

      checkURL({ routerUrl: url, expectedUrl: '/target' });

      expect(router.state[router.activeName!]).to.deep.eq(nextState);

      expect(pushStateSpy).toHaveBeenCalledTimes(1);
      expect(replaceStateSpy).toHaveBeenCalledTimes(0);
    });

    it('Inherits replace from the initial redirect', async () => {
      const router = createRouter({
        configs: createConfigs({
          start: {
            path: '/start',
            loader,
            async beforeEnter(data) {
              return data.redirect({ name: 'target' });
            },
          },
          target: { path: '/target', loader },
          ...getConfigsDefault(),
        }),
        adapters: await getAdapters(options),
      });

      destroyAfterTest(router);

      const pushStateSpy = vi.spyOn(window.history, 'pushState').mockClear();
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockClear();

      const url = await router.redirect({ name: 'start', replace: true });

      const nextState: any = { name: 'target', query: {}, params: {} };

      checkURL({ routerUrl: url, expectedUrl: '/target' });

      expect(router.state[router.activeName!]).to.deep.eq(nextState);

      expect(pushStateSpy).toHaveBeenCalledTimes(0);
      expect(replaceStateSpy).toHaveBeenCalledTimes(1);
    });

    it('Ignores replace from beforeEnter redirects', async () => {
      const router = createRouter({
        configs: createConfigs({
          start: {
            path: '/start',
            loader,
            async beforeEnter(data) {
              return data.redirect({ name: 'target', replace: true } as any);
            },
          },
          target: { path: '/target', loader },
          ...getConfigsDefault(),
        }),
        adapters: await getAdapters(options),
      });

      destroyAfterTest(router);

      const pushStateSpy = vi.spyOn(window.history, 'pushState').mockClear();
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockClear();

      const url = await router.redirect({ name: 'start' });

      const nextState: any = { name: 'target', query: {}, params: {} };

      checkURL({ routerUrl: url, expectedUrl: '/target' });

      expect(router.state[router.activeName!]).to.deep.eq(nextState);

      expect(pushStateSpy).toHaveBeenCalledTimes(1);
      expect(replaceStateSpy).toHaveBeenCalledTimes(0);
    });
  }
);

describe.runIf(typeof window === 'undefined').each(allPossibleOptions)(
  `Lifecycle [node]: redirect chain %s`,
  (options) => {
    it('Redirects throw errors', async () => {
      const spyStart = createBeforeEnterSpy();
      const spySecond = createBeforeEnterSpy();
      const spyThird = createBeforeEnterSpy();
      const spyTarget = createBeforeEnterSpy();

      const router = createRouter({
        configs: createConfigs({
          start: {
            path: '/dynamic/:param',
            params: { param: v.length },
            query: { q: v.length },
            loader,
            async beforeEnter(config) {
              spyStart.beforeEnter(config);

              return config.redirect({
                name: 'second',
                params: { param: (config.nextState.params as any).param },
              });
            },
          },
          second: {
            path: '/second/:param',
            params: { param: v.length },
            loader,
            async beforeEnter(config) {
              spySecond.beforeEnter(config);

              return config.redirect({ name: 'third', query: { q: 'test' } });
            },
          },
          third: {
            path: '/third',
            query: { q: v.length },
            loader,
            async beforeEnter(config) {
              spyThird.beforeEnter(config);

              return config.redirect({ name: 'target' });
            },
          },
          target: {
            path: '/target',
            loader,
            beforeEnter: spyTarget.beforeEnter,
          },
          ...getConfigsDefault(),
        }),
        adapters: await getAdapters(options),
      });

      let currentState: any;
      let nextState: any = { name: 'start', query: { q: 'v-q' }, params: { param: 'v-param' } };

      await expect(async () => {
        await router.init('/dynamic/v-param?q=v-q');
      }).rejects.toThrowError(new RedirectError('/second/v-param'));

      spyStart.checkCount(1);
      spyStart.checkLastArguments({ reason: 'new_config', nextState, currentState });

      await expect(async () => {
        await router.redirect({
          name: nextState.name,
          query: nextState.query,
          params: nextState.params,
        });
      }).rejects.toThrowError(new RedirectError('/second/v-param'));

      spyStart.checkCount(2);
      spyStart.checkLastArguments({ reason: 'new_config', nextState, currentState });

      nextState = { name: 'second', query: {}, params: { param: 'v-param' } };

      await expect(async () => {
        await router.init('/second/v-param');
      }).rejects.toThrowError(new RedirectError('/third?q=test'));

      spySecond.checkCount(1);
      spySecond.checkLastArguments({ reason: 'new_config', nextState, currentState });

      await expect(async () => {
        await router.redirect({
          name: nextState.name,
          query: nextState.query,
          params: nextState.params,
        });
      }).rejects.toThrowError(new RedirectError('/third?q=test'));

      spySecond.checkCount(2);
      spySecond.checkLastArguments({ reason: 'new_config', nextState, currentState });

      nextState = { name: 'third', query: { q: 'test' }, params: {} };

      await expect(async () => {
        await router.init('/third?q=test');
      }).rejects.toThrowError(new RedirectError('/target'));

      spyThird.checkCount(1);
      spyThird.checkLastArguments({ reason: 'new_config', nextState, currentState });

      await expect(async () => {
        await router.redirect({
          name: nextState.name,
          query: nextState.query,
          params: nextState.params,
        });
      }).rejects.toThrowError(new RedirectError('/target'));

      spyThird.checkCount(2);
      spyThird.checkLastArguments({ reason: 'new_config', nextState, currentState });

      nextState = { name: 'target', query: {}, params: {} };

      // finally no error
      await router.init('/target');

      spyTarget.checkCount(1);
      spyTarget.checkLastArguments({ reason: 'new_config', nextState, currentState });

      expect(router.state[router.activeName!]).to.deep.eq(nextState);
    });

    it('Redirects from beforeEnter throw target URL', async () => {
      const router = createRouter({
        configs: createConfigs({
          start: {
            path: '/start',
            loader,
            async beforeEnter(data) {
              return data.redirect({ name: 'target' });
            },
          },
          target: { path: '/target', loader },
          ...getConfigsDefault(),
        }),
        adapters: await getAdapters(options),
      });

      destroyAfterTest(router);

      await expect(async () => {
        await router.redirect({ name: 'start' });
      }).rejects.toThrowError(new RedirectError('/target'));
    });
  }
);
