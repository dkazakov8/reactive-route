import { describe, expect, it } from 'vitest';

import { createConfigs, createRouter, RedirectError } from '../packages/core';
import { createBeforeEnterSpy, getConfigsDefault, loader, v } from './helpers/checkers';
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

      const url = await router.redirect({
        name: 'start',
        params: { param: 'v-param' },
        query: { q: 'v-q' },
      });

      let currentState: any;
      let nextState: any = {
        name: 'start',
        query: { q: 'v-q' },
        params: { param: 'v-param' },
        url: '/dynamic/v-param?q=v-q',
        search: 'q=v-q',
        pathname: '/dynamic/v-param',
        props: {},
        isActive: true,
      };

      spyStart.checkCount(1);
      spyStart.checkLastArguments({ reason: 'new_config', nextState, currentState });

      nextState = {
        name: 'second',
        query: {},
        params: { param: 'v-param' },
        url: '/second/v-param',
        search: '',
        pathname: '/second/v-param',
        props: {},
        isActive: true,
      };

      spySecond.checkCount(1);
      spySecond.checkLastArguments({ reason: 'new_config', nextState, currentState });

      nextState = {
        name: 'third',
        query: { q: 'test' },
        params: {},
        url: '/third?q=test',
        search: 'q=test',
        pathname: '/third',
        props: {},
        isActive: true,
      };

      spyThird.checkCount(1);
      spyThird.checkLastArguments({ reason: 'new_config', nextState, currentState });

      nextState = {
        name: 'target',
        query: {},
        params: {},
        url: '/target',
        search: '',
        pathname: '/target',
        props: {},
        isActive: true,
      };

      spyTarget.checkCount(1);
      spyTarget.checkLastArguments({ reason: 'new_config', nextState, currentState });

      expect(url).to.eq(nextState.url);

      expect(router.getActiveState()).to.deep.eq(nextState);

      expect(location.pathname).to.eq(nextState.url);
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
      let nextState: any = {
        name: 'start',
        query: { q: 'v-q' },
        params: { param: 'v-param' },
        url: '/dynamic/v-param?q=v-q',
        search: 'q=v-q',
        pathname: '/dynamic/v-param',
        props: {},
        isActive: true,
      };

      await expect(async () => {
        await router.init(nextState.url);
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

      nextState = {
        name: 'second',
        query: {},
        params: { param: 'v-param' },
        url: '/second/v-param',
        search: '',
        pathname: '/second/v-param',
        props: {},
        isActive: true,
      };

      await expect(async () => {
        await router.init(nextState.url);
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

      nextState = {
        name: 'third',
        query: { q: 'test' },
        params: {},
        url: '/third?q=test',
        search: 'q=test',
        pathname: '/third',
        props: {},
        isActive: true,
      };

      await expect(async () => {
        await router.init(nextState.url);
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

      nextState = {
        name: 'target',
        query: {},
        params: {},
        url: '/target',
        search: '',
        pathname: '/target',
        props: {},
        isActive: true,
      };

      // finally no error
      await router.init('/target');

      spyTarget.checkCount(1);
      spyTarget.checkLastArguments({ reason: 'new_config', nextState, currentState });

      expect(router.getActiveState()).to.deep.eq(nextState);
    });
  }
);
