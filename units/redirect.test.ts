import { describe, expect, it, vi } from 'vitest';

import { RedirectError } from '../packages/core/constants';
import { createConfigs } from '../packages/core/createConfigs';
import { createRouter } from '../packages/core/createRouter';
import { TypeRouter } from '../packages/core/types';
import { getAdapters } from './helpers/getAdapters';
import { getConfigs } from './helpers/getConfigs';
import { allPossibleOptions } from './helpers/types';

function check(router: TypeRouter<any>, redirectParams: any, url?: string) {
  const currentRoute = router.getActiveState()!;

  const expectedCurrentRoute = router.payloadToState({
    name: redirectParams.route.name,
    query: redirectParams.query,
    params: redirectParams.params,
  });

  expect(currentRoute.name).to.deep.eq(expectedCurrentRoute.name);
  expect(currentRoute.props).to.deep.eq(expectedCurrentRoute.props);
  expect(currentRoute.params).to.deep.eq(expectedCurrentRoute.params || {});
  expect(currentRoute.query).to.deep.eq(expectedCurrentRoute.query);
  expect(currentRoute.url).to.deep.eq(expectedCurrentRoute.url);
  if (url) {
    expect(url).to.eq(expectedCurrentRoute.url);
  }

  if (expectedCurrentRoute.pathname === '/test/static') {
    expect(redirectParams.route.otherExports?.store).to.deep.eq('');
    expect(redirectParams.route.otherExports?.actions).to.deep.eq('');
  }
}

function getConfigsDefault(configs: any) {
  return {
    notFound: {
      path: '/error400',
      props: { errorNumber: 400 },
      loader: configs.notFound.loader,
    },
    internalError: {
      path: '/error500',
      props: { errorNumber: 500 },
      loader: configs.internalError.loader,
    },
  } as const;
}

function createCounters() {
  const spyOne = vi.fn();
  const spyTwo = vi.fn();

  const counter = { spyOne: 0, spyTwo: 0 };

  function checkSpy() {
    expect(spyOne).toHaveBeenCalledTimes(counter.spyOne);
    expect(spyTwo).toHaveBeenCalledTimes(counter.spyTwo);
  }

  return { spyOne, spyTwo, counter, checkSpy };
}

allPossibleOptions.forEach((options) => {
  const configsDefault = getConfigs(options);

  describe(`redirect [${options.renderer}+${options.reactivity}]`, () => {
    it('restoreFromURL: sets initial route', async () => {
      const router = createRouter({
        configs: configsDefault,
        adapters: await getAdapters(options),
      });

      const url = await router.init('/test/static');

      check(router, { route: configsDefault.staticRoute }, url);
    });

    it('restoreFromURL: sets initial route not found', async () => {
      const router = createRouter({
        configs: configsDefault,
        adapters: await getAdapters(options),
      });

      const url = await router.init('/testX/static');

      check(router, { route: configsDefault.notFound }, url);
    });

    it('beforeEnter: not called when redirecting to same static route', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        configs: createConfigs({
          spyOne: {
            path: '/test/static',
            loader: configsDefault.staticRoute.loader,
            async beforeEnter(config) {
              spyOne();
            },
          },
          ...getConfigsDefault(configsDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { configs } = router.getGlobalArguments();

      let url = await router.redirect({ name: 'spyOne' });

      counter.spyOne += 1;

      checkSpy();

      check(router, { route: configs.spyOne }, url);

      url = await router.redirect({ name: 'spyOne' });

      checkSpy();

      check(router, { route: configs.spyOne }, url);
    });

    it('beforeEnter: not called when redirecting to same dynamic route (no params change)', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        configs: createConfigs({
          spyOneDynamic: {
            path: '/test/:static',
            params: {
              static: (value) => value.length > 2,
            },
            loader: configsDefault.dynamicOneParam.loader,
            async beforeEnter(config) {
              spyOne();
            },
          },
          ...getConfigsDefault(configsDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { configs } = router.getGlobalArguments();

      let url = await router.redirect({ name: 'spyOneDynamic', params: { static: 'foo' } });

      counter.spyOne += 1;

      checkSpy();

      check(router, { route: configs.spyOneDynamic, params: { static: 'foo' } }, url);

      url = await router.redirect({ name: 'spyOneDynamic', params: { static: 'foo' } });

      checkSpy();

      check(router, { route: configs.spyOneDynamic, params: { static: 'foo' } }, url);
    });

    it('beforeEnter: not called when redirecting to same route (no query change)', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        configs: createConfigs({
          spyOne: {
            path: '/test/static',
            query: {
              q: (value) => value.length > 2,
            },
            loader: configsDefault.staticRoute.loader,
            async beforeEnter(config) {
              spyOne();
            },
          },
          ...getConfigsDefault(configsDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { configs } = router.getGlobalArguments();

      let url = await router.redirect({ name: 'spyOne', query: { q: 'foo' } });

      counter.spyOne += 1;

      checkSpy();

      check(router, { route: configs.spyOne, query: { q: 'foo' } }, url);

      url = await router.redirect({ name: 'spyOne', query: { q: 'foo' } });

      checkSpy();

      check(router, { route: configs.spyOne, query: { q: 'foo' } }, url);
    });

    it('beforeEnter: not called when redirecting to same route (query changed)', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        configs: createConfigs({
          spyOne: {
            path: '/test/static',
            query: {
              q: (value) => value.length > 2,
            },
            loader: configsDefault.staticRoute.loader,
            async beforeEnter(config) {
              spyOne();
            },
          },
          ...getConfigsDefault(configsDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { configs } = router.getGlobalArguments();

      let url = await router.redirect({ name: 'spyOne', query: { q: 'foo' } });

      counter.spyOne += 1;

      checkSpy();

      check(router, { route: configs.spyOne, query: { q: 'foo' } }, url);

      url = await router.redirect({ name: 'spyOne', query: { q: 'bar' } });

      counter.spyOne += 1;

      checkSpy();

      check(router, { route: configs.spyOne, query: { q: 'bar' } }, url);
    });

    it('beforeEnter: called when redirecting to same dynamic route (params changed)', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        configs: createConfigs({
          spyOneDynamic: {
            path: '/test/:static',
            params: {
              static: (value) => value.length > 2,
            },
            loader: configsDefault.dynamicOneParam.loader,
            async beforeEnter(config) {
              spyOne();
            },
          },
          ...getConfigsDefault(configsDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { configs } = router.getGlobalArguments();

      let url = await router.redirect({ name: 'spyOneDynamic', params: { static: 'foo' } });

      counter.spyOne += 1;

      checkSpy();

      check(router, { route: configs.spyOneDynamic, params: { static: 'foo' } }, url);

      url = await router.redirect({ name: 'spyOneDynamic', params: { static: 'bar' } });

      counter.spyOne += 1;

      checkSpy();

      check(router, { route: configs.spyOneDynamic, params: { static: 'bar' } }, url);
    });

    it('beforeEnter: errors are rendered with internalError and not pushed to history', async () => {
      const router = createRouter({
        configs: createConfigs({
          buggyCode: {
            path: '/test/static4',
            loader: configsDefault.dynamicOneParam.loader,
            async beforeEnter() {
              // @ts-ignore
              // biome-ignore lint/correctness/noUndeclaredVariables: false
              a;
            },
          },
          ...getConfigsDefault(configsDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { configs } = router.getGlobalArguments();

      // TODO: check url
      await router.redirect({ name: 'buggyCode' });

      check(router, { route: configs.internalError });
    });

    it('beforeLeave: not called when redirecting to same static route', async () => {
      const { spyOne, checkSpy } = createCounters();

      const router = createRouter({
        configs: createConfigs({
          spyOne: {
            path: '/test/static',
            loader: configsDefault.staticRoute.loader,
            async beforeLeave(config) {
              spyOne();
            },
          },
          ...getConfigsDefault(configsDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { configs } = router.getGlobalArguments();

      let url = await router.redirect({ name: 'spyOne' });

      checkSpy();

      check(router, { route: configs.spyOne }, url);

      url = await router.redirect({ name: 'spyOne' });

      checkSpy();

      check(router, { route: configs.spyOne }, url);
    });

    it('beforeLeave: called when redirecting to another route', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        configs: createConfigs({
          spyOne: {
            path: '/test/static',
            loader: configsDefault.staticRoute.loader,
            async beforeLeave(config) {
              spyOne();
            },
          },
          spyOneDynamic: {
            path: '/test/:static',
            params: {
              static: (value) => value.length > 2,
            },
            loader: configsDefault.dynamicOneParam.loader,
          },
          ...getConfigsDefault(configsDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { configs } = router.getGlobalArguments();

      let url = await router.redirect({ name: 'spyOne' });

      checkSpy();

      check(router, { route: configs.spyOne }, url);

      url = await router.redirect({ name: 'spyOneDynamic', params: { static: 'foo' } });

      counter.spyOne += 1;

      checkSpy();

      check(router, { route: configs.spyOneDynamic, params: { static: 'foo' } }, url);
    });

    it('beforeLeave: not called when redirecting to same dynamic route (no params change)', async () => {
      const { spyOne, checkSpy } = createCounters();

      const router = createRouter({
        configs: createConfigs({
          spyOneDynamic: {
            path: '/test/:static',
            params: {
              static: (value) => value.length > 2,
            },
            loader: configsDefault.dynamicOneParam.loader,
            async beforeLeave(config) {
              spyOne();
            },
          },
          ...getConfigsDefault(configsDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { configs } = router.getGlobalArguments();

      let url = await router.redirect({ name: 'spyOneDynamic', params: { static: 'foo' } });

      checkSpy();

      check(router, { route: configs.spyOneDynamic, params: { static: 'foo' } }, url);

      url = await router.redirect({ name: 'spyOneDynamic', params: { static: 'foo' } });

      checkSpy();

      check(router, { route: configs.spyOneDynamic, params: { static: 'foo' } }, url);
    });

    it('beforeLeave: called when redirecting to same dynamic route (params changed)', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        configs: createConfigs({
          spyOneDynamic: {
            path: '/test/:static',
            params: {
              static: (value) => value.length > 2,
            },
            loader: configsDefault.dynamicOneParam.loader,
            async beforeLeave(config) {
              spyOne();
            },
          },
          ...getConfigsDefault(configsDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { configs } = router.getGlobalArguments();

      let url = await router.redirect({ name: 'spyOneDynamic', params: { static: 'foo' } });

      checkSpy();

      check(router, { route: configs.spyOneDynamic, params: { static: 'foo' } }, url);

      url = await router.redirect({ name: 'spyOneDynamic', params: { static: 'bar' } });

      counter.spyOne += 1;

      checkSpy();

      check(router, { route: configs.spyOneDynamic, params: { static: 'bar' } }, url);
    });

    it('beforeLeave: prevent and allow redirects', async () => {
      const { spyOne, counter, checkSpy } = createCounters();

      const router = createRouter({
        configs: createConfigs({
          spyOne: {
            path: '/test/static',
            loader: configsDefault.staticRoute.loader,
          },
          spyTwoDynamic: {
            path: '/test/:static',
            params: {
              static: (value) => value.length > 2,
            },
            loader: configsDefault.dynamicOneParam.loader,
          },
          preventRedirect: {
            path: '/test/prevent-redirect',
            loader: configsDefault.dynamicOneParam.loader,
            async beforeLeave(config) {
              spyOne();

              if (config.nextState.name === 'spyOne') {
                return config.preventRedirect();
              }
            },
          },
          ...getConfigsDefault(configsDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { configs } = router.getGlobalArguments();

      let url = await router.redirect({ name: 'preventRedirect' });

      check(router, { route: configs.preventRedirect }, url);

      url = await router.redirect({ name: 'spyOne' });

      // Redirect to spyOne prevented
      check(router, { route: configs.preventRedirect }, url);

      counter.spyOne += 1;

      checkSpy();

      url = await router.redirect({ name: 'spyTwoDynamic', params: { static: 'asd' } });

      // Redirect to spyTwoDynamic not prevented
      check(router, { route: configs.spyTwoDynamic, params: { static: 'asd' } }, url);

      counter.spyOne += 1;

      checkSpy();
    });

    it('beforeLeave: errors are rendered with internalError and not pushed to history', async () => {
      const router = createRouter({
        configs: createConfigs({
          spyOne: {
            path: '/test/static',
            loader: configsDefault.staticRoute.loader,
          },
          buggyCode: {
            path: '/test/buggy-code',
            loader: configsDefault.dynamicOneParam.loader,
            async beforeLeave() {
              // @ts-ignore
              // biome-ignore lint/correctness/noUndeclaredVariables: false
              a;
            },
          },
          ...getConfigsDefault(configsDefault),
        }),
        adapters: await getAdapters(options),
      });
      const { configs } = router.getGlobalArguments();

      let url = await router.redirect({ name: 'buggyCode' });

      check(router, { route: configs.buggyCode }, url);

      // TODO: check url
      url = await router.redirect({ name: 'spyOne' });

      check(router, { route: configs.internalError });
    });

    it('query: no push to history if query is the same', async () => {
      const router = createRouter({
        configs: configsDefault,
        adapters: await getAdapters(options),
      });

      let url = await router.redirect({ name: 'staticRoute', query: { q: 'test' } });

      check(router, { route: configsDefault.staticRoute, query: { q: 'test' } }, url);

      url = await router.redirect({ name: 'staticRoute', query: { q: 'test' } });

      check(router, { route: configsDefault.staticRoute, query: { q: 'test' } }, url);

      // url is cleared of nonExistent
      url = await router.redirect({
        name: 'staticRoute',
        // @ts-ignore
        query: { q: 'test', nonExistent: 'test' },
      });

      check(router, { route: configsDefault.staticRoute, query: { q: 'test' } }, url);
    });

    it('query: no push to history if query is the same (non existent param)', async () => {
      const router = createRouter({
        configs: configsDefault,
        adapters: await getAdapters(options),
      });

      let url = await router.redirect({ name: 'staticRoute' });

      check(router, { route: configsDefault.staticRoute }, url);

      // url is cleared of nonExistent
      // @ts-ignore
      url = await router.redirect({ name: 'staticRoute', query: { nonExistent: 'test' } });

      check(router, { route: configsDefault.staticRoute }, url);
    });

    it('query: push to history if query changed', async () => {
      const router = createRouter({
        configs: configsDefault,
        adapters: await getAdapters(options),
      });

      let url = await router.redirect({ name: 'staticRoute', query: { q: 'test' } });

      check(router, { route: configsDefault.staticRoute, query: { q: 'test' } }, url);

      url = await router.redirect({ name: 'staticRoute', query: { q: 'test2' } });

      check(router, { route: configsDefault.staticRoute, query: { q: 'test2' } }, url);

      url = await router.redirect({ name: 'staticRoute' });

      check(router, { route: configsDefault.staticRoute }, url);

      url = await router.redirect({ name: 'staticRoute', query: { q: 'test' } });

      check(router, { route: configsDefault.staticRoute, query: { q: 'test' } }, url);
    });
  });

  describe.runIf(typeof window !== 'undefined')(
    `redirect Client [${options.renderer}+${options.reactivity}]`,
    () => {
      it('beforeEnter: redirects are made silently and call lifecycle', async () => {
        const { spyOne, spyTwo, counter, checkSpy } = createCounters();

        const router = createRouter({
          configs: createConfigs({
            spyOne: {
              path: '/test/static',
              loader: configsDefault.staticRoute.loader,
              async beforeEnter(config) {
                spyOne();
              },
            },
            redirectSpyOne: {
              path: '/test/static3',
              loader: configsDefault.dynamicOneParam.loader,
              async beforeEnter(config) {
                spyTwo();

                return config.redirect({ name: 'spyOne' });
              },
            },
            ...getConfigsDefault(configsDefault),
          }),
          adapters: await getAdapters(options),
        });
        const { configs } = router.getGlobalArguments();

        const url = await router.redirect({ name: 'redirectSpyOne' });

        counter.spyOne += 1;
        counter.spyTwo += 1;

        checkSpy();

        check(router, { route: configs.spyOne }, url);
      });

      it('beforeEnter: multiple redirects are not registered in history', async () => {
        const router = createRouter({
          configs: createConfigs({
            one: {
              path: '/1',
              loader: configsDefault.dynamicOneParam.loader,
            },
            two: {
              path: '/2',
              loader: configsDefault.dynamicOneParam.loader,
              async beforeEnter(config) {
                return config.redirect({ name: 'one' });
              },
            },
            three: {
              path: '/3',
              loader: configsDefault.dynamicOneParam.loader,
              async beforeEnter(config) {
                return config.redirect({ name: 'two' });
              },
            },
            four: {
              path: '/4',
              loader: configsDefault.dynamicOneParam.loader,
              async beforeEnter(config) {
                return config.redirect({ name: 'three' });
              },
            },
            ...getConfigsDefault(configsDefault),
          }),
          adapters: await getAdapters(options),
        });
        const { configs } = router.getGlobalArguments();

        const url = await router.redirect({ name: 'four' });

        check(router, { route: configs.one }, url);
      });
    }
  );

  describe.runIf(typeof window === 'undefined')(
    `redirect SSR [${options.renderer}+${options.reactivity}]`,
    () => {
      it('beforeEnter: redirects throw exception and not call next lifecycle', async () => {
        const { spyOne, spyTwo, counter, checkSpy } = createCounters();

        const router = createRouter({
          configs: createConfigs({
            spyOne: {
              path: '/test/:dynamic',
              params: { dynamic: (v) => true },
              query: { a: () => true },
              loader: configsDefault.staticRoute.loader,
              async beforeEnter(config) {
                spyOne();
              },
            },
            redirectSpyOne: {
              path: '/test/static3',
              loader: configsDefault.dynamicOneParam.loader,
              async beforeEnter(config) {
                spyTwo();

                return config.redirect({
                  name: 'spyOne',
                  params: { dynamic: 'bar' },
                  query: { a: 'test' },
                });
              },
            },
            ...getConfigsDefault(configsDefault),
          }),
          adapters: await getAdapters(options),
        });
        const { configs } = router.getGlobalArguments();

        const url = await router.redirect({ name: 'spyOne', params: { dynamic: 'foo' } });

        counter.spyOne += 1;

        check(router, { route: configs.spyOne, params: { dynamic: 'foo' } }, url);

        checkSpy();

        await expect(async () => {
          await router.redirect({ name: 'redirectSpyOne' });
        }).rejects.toThrowError(new RedirectError('/test/bar?a=test'));

        counter.spyTwo += 1;

        check(router, { route: configs.spyOne, params: { dynamic: 'foo' } }, url);

        checkSpy();
      });

      it('beforeEnter: multiple redirects are not registered in history', async () => {
        const router = createRouter({
          configs: createConfigs({
            one: {
              path: '/1',
              loader: configsDefault.dynamicOneParam.loader,
            },
            two: {
              path: '/2',
              loader: configsDefault.dynamicOneParam.loader,
              async beforeEnter(config) {
                return config.redirect({ name: 'one' });
              },
            },
            three: {
              path: '/3',
              loader: configsDefault.dynamicOneParam.loader,
              async beforeEnter(config) {
                return config.redirect({ name: 'two' });
              },
            },
            four: {
              path: '/4',
              loader: configsDefault.dynamicOneParam.loader,
              async beforeEnter(config) {
                return config.redirect({ name: 'three' });
              },
            },
            ...getConfigsDefault(configsDefault),
          }),
          adapters: await getAdapters(options),
        });
        const { configs } = router.getGlobalArguments();

        const redirectThree = new RedirectError(configs.three.path);

        await expect(async () => {
          await router.init(configs.four.path);
        }).rejects.toThrowError(redirectThree);

        const redirectTwo = new RedirectError(configs.two.path);

        await expect(async () => {
          await router.init(redirectThree.message);
        }).rejects.toThrowError(redirectTwo);

        const redirectOne = new RedirectError(configs.one.path);

        await expect(async () => {
          await router.init(redirectTwo.message);
        }).rejects.toThrowError(redirectOne);

        const url = await router.init(redirectOne.message);

        check(router, { route: configs.one }, url);
      });
    }
  );
});
