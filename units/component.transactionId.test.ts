import { createConfigs } from 'reactive-route';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { attachReactivity } from './helpers/attachReactivity';
import { checkHistory } from './helpers/checkers';
import { getPageComponents } from './helpers/getPageComponents';
import { prepareRouterTest } from './helpers/prepareRouterTest';
import type { TypeOptions } from './helpers/types';

const options = OPTIONS as TypeOptions;

await attachReactivity(options);

async function waitForRouterIdle(router: { isRedirecting: boolean }) {
  await vi.waitFor(() => expect(router.isRedirecting).toBe(false));
}

type TypeActiveTransitionTestGates = {
  markOldTransitionBlocked: () => void;
  oldTransitionCanContinue: Promise<void>;
};

afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  if (typeof window !== 'undefined') {
    window.history.replaceState(null, '', '/');
  }
});

describe.runIf(typeof window !== 'undefined').each([options])(
  `Router component transactionId [browser]: %s`,
  () => {
    const { components, expectedContent } = getPageComponents(options);

    const errorConfigs = {
      notFound: { path: '/error404', props: { error: 404 }, loader: components.notFound },
      internalError: { path: '/error500', props: { error: 500 }, loader: components.internalError },
    } as const;

    it.each([
      {
        name: 'external redirect chain',
        beforeOldRedirect: undefined,
        oldRedirectName: 'oldStart',
        createConfigsForCase({
          markOldTransitionBlocked,
          oldTransitionCanContinue,
        }: TypeActiveTransitionTestGates) {
          return createConfigs({
            oldStart: {
              path: '/old-start',
              loader: components.static,
              async beforeEnter({ redirect }) {
                markOldTransitionBlocked();

                await oldTransitionCanContinue;

                return redirect({ name: 'oldFinal' });
              },
            },
            oldFinal: { path: '/old-final', loader: components.static },
            latest: { path: '/latest', loader: components.dynamic },
            ...errorConfigs,
          });
        },
      },
      {
        name: 'beforeLeave transition',
        oldRedirectName: 'oldFinal',
        async beforeOldRedirect(router: any) {
          await router.redirect({ name: 'oldStart' });
        },
        createConfigsForCase({
          markOldTransitionBlocked,
          oldTransitionCanContinue,
        }: TypeActiveTransitionTestGates) {
          return createConfigs({
            oldStart: {
              path: '/old-start',
              loader: components.static,
              async beforeLeave(data) {
                if (data.nextState.name !== 'oldFinal') return;

                markOldTransitionBlocked();

                await oldTransitionCanContinue;
              },
            },
            oldFinal: { path: '/old-final', loader: components.notFound },
            latest: { path: '/latest', loader: components.dynamic },
            ...errorConfigs,
          });
        },
      },
      {
        name: 'component preload transition',
        oldRedirectName: 'oldFinal',
        async beforeOldRedirect(router: any) {
          await router.redirect({ name: 'oldStart' });
        },
        createConfigsForCase({
          markOldTransitionBlocked,
          oldTransitionCanContinue,
        }: TypeActiveTransitionTestGates) {
          return createConfigs({
            oldStart: { path: '/old-start', loader: components.static },
            oldFinal: {
              path: '/old-final',
              async loader() {
                markOldTransitionBlocked();

                await oldTransitionCanContinue;

                return components.notFound();
              },
            },
            latest: { path: '/latest', loader: components.dynamic },
            ...errorConfigs,
          });
        },
      },
    ])('an older $name does not steal activeTransitionId from a newer redirect', async ({
      beforeOldRedirect,
      createConfigsForCase,
      oldRedirectName,
    }) => {
      let markOldTransitionBlocked: (() => void) | undefined;
      let allowOldTransitionToContinue: (() => void) | undefined;

      const oldTransitionBlocked = new Promise<void>((r) => (markOldTransitionBlocked = r));
      const oldTransitionCanContinue = new Promise<void>((r) => (allowOldTransitionToContinue = r));

      const { router, render } = await prepareRouterTest({
        options,
        configs: createConfigsForCase({
          markOldTransitionBlocked: () => markOldTransitionBlocked?.(),
          oldTransitionCanContinue,
        }),
      });

      const screen = await render();
      const container = screen.container;

      await beforeOldRedirect?.(router);

      // create a long old transition
      const oldTransitionPromise = router.redirect({ name: oldRedirectName } as any);
      await oldTransitionBlocked;

      // while an old transition is in progress, finish a new redirect
      await router.redirect({ name: 'latest' });
      await waitForRouterIdle(router);

      expect(router.state[router.activeName!]).to.deep.eq({
        name: 'latest',
        params: {},
        query: {},
      });

      checkHistory({ container, url: '/latest', content: expectedContent.dynamic });

      // old transition has finally passed
      allowOldTransitionToContinue?.();
      await oldTransitionPromise;
      await waitForRouterIdle(router);

      // but discarded
      expect(router.state[router.activeName!]).to.deep.eq({
        name: 'latest',
        params: {},
        query: {},
      });
      checkHistory({ container, url: '/latest', content: expectedContent.dynamic });
    });
  }
);
