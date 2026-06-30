import { createConfigs } from 'reactive-route';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { attachReactivity } from './helpers/attachReactivity';
import { checkHistory, v } from './helpers/checkers';
import { getPageComponents } from './helpers/getPageComponents';
import { prepareRouterTest } from './helpers/prepareRouterTest';
import type { TypeOptions } from './helpers/types';

const options = OPTIONS as TypeOptions;

await attachReactivity(options);

async function waitForRouterIdle(router: { isRedirecting: boolean }) {
  await vi.waitFor(() => expect(router.isRedirecting).toBe(false));
}

afterEach(() => {
  vi.restoreAllMocks();
});

beforeEach(() => {
  if (typeof window !== 'undefined') {
    window.history.replaceState(null, '', '/');
  }
});

describe.runIf(typeof window !== 'undefined').each([options])(
  `Router component popstate [browser]: %s`,
  () => {
    const { components, expectedContent } = getPageComponents(options);

    const errorConfigs = {
      notFound: { path: '/error404', props: { error: 404 }, loader: components.notFound },
      internalError: { path: '/error500', props: { error: 500 }, loader: components.internalError },
    } as const;

    it('Native history.go works', async () => {
      const { router, render, checkSpy, calls, waitForRedirect } = await prepareRouterTest({
        options,
        configs: createConfigs({
          static: { path: '/static', query: { q: v.length }, loader: components.static },
          autorun: { path: '/autorun', loader: components.autorun },
          dynamic: { path: '/:one', params: { one: v.length }, loader: components.dynamic },
          dynamic2: { path: '/2/:one', params: { one: v.length }, loader: components.dynamic },
          ...errorConfigs,
        }),
      });

      const container = (await render()).container;

      const redirectSteps = [
        {
          action: () => router.redirect({ name: 'notFound' }),
          url: '/error404',
          content: expectedContent.notFound,
          componentChange: true,
        },
        {
          action: () => router.redirect({ name: 'static' }),
          url: '/static',
          content: expectedContent.static,
          componentChange: true,
        },
        {
          action: () => router.redirect({ name: 'static', query: { q: 'v-q' } }),
          url: '/static?q=v-q',
          content: expectedContent.static,
        },
        {
          action: () => router.redirect({ name: 'dynamic', params: { one: 'v-one' } }),
          url: '/v-one',
          content: expectedContent.dynamic,
          componentChange: true,
        },
        {
          action: () => router.redirect({ name: 'dynamic2', params: { one: 'v-one' } }),
          url: '/2/v-one',
          content: expectedContent.dynamic,
        },
      ];

      for (const { action, content, url, componentChange } of redirectSteps) {
        await action();

        if (componentChange) calls.beforeComponentChange += 1;

        checkHistory({ container, checkSpy, url, content });
      }

      const popstateSteps = [
        // go back to start
        { action: () => history.back(), expectedStep: redirectSteps[3] },
        { action: () => history.back(), expectedStep: redirectSteps[2], componentChange: true },
        { action: () => history.back(), expectedStep: redirectSteps[1] },
        { action: () => history.back(), expectedStep: redirectSteps[0], componentChange: true },
        // go forward to end
        { action: () => history.forward(), expectedStep: redirectSteps[1], componentChange: true },
        { action: () => history.forward(), expectedStep: redirectSteps[2] },
        { action: () => history.forward(), expectedStep: redirectSteps[3], componentChange: true },
        { action: () => history.forward(), expectedStep: redirectSteps[4] },
      ];

      for (const { action, componentChange, expectedStep } of popstateSteps) {
        await waitForRedirect(action);
        await waitForRouterIdle(router);

        if (componentChange) calls.beforeComponentChange += 1;

        checkHistory({ container, checkSpy, url: expectedStep.url, content: expectedStep.content });
      }
    });

    it('Native history.go works (with replace)', async () => {
      const { router, render, checkSpy, calls, waitForRedirect } = await prepareRouterTest({
        options,
        configs: createConfigs({
          static: { path: '/static', query: { q: v.length }, loader: components.static },
          autorun: { path: '/autorun', loader: components.autorun },
          dynamic: { path: '/:one', params: { one: v.length }, loader: components.dynamic },
          dynamic2: { path: '/2/:one', params: { one: v.length }, loader: components.dynamic },
          ...errorConfigs,
        }),
      });

      const container = (await render()).container;

      const redirectSteps = [
        {
          action: () => router.redirect({ name: 'notFound' }),
          url: '/error404',
          content: expectedContent.notFound,
          componentChange: true,
        },
        {
          action: () => router.redirect({ name: 'static' }),
          url: '/static',
          content: expectedContent.static,
          componentChange: true,
        },
        {
          action: () => router.redirect({ name: 'static', query: { q: 'v-q' }, replace: true }),
          url: '/static?q=v-q',
          content: expectedContent.static,
        },
        {
          action: () =>
            router.redirect({ name: 'dynamic', params: { one: 'v-one' }, replace: true }),
          url: '/v-one',
          content: expectedContent.dynamic,
          componentChange: true,
        },
        {
          action: () =>
            router.redirect({ name: 'dynamic2', params: { one: 'v-one' }, replace: true }),
          url: '/2/v-one',
          content: expectedContent.dynamic,
        },
      ];

      for (const { action, content, url, componentChange } of redirectSteps) {
        await action();

        if (componentChange) calls.beforeComponentChange += 1;

        checkHistory({ container, checkSpy, url, content });
      }

      const popstateSteps = [
        // go back to start
        { action: () => history.back(), expectedStep: redirectSteps[0], componentChange: true },
        // go forward to end
        { action: () => history.forward(), expectedStep: redirectSteps[4], componentChange: true },
      ];

      for (const { action, componentChange, expectedStep } of popstateSteps) {
        await waitForRedirect(action);
        await waitForRouterIdle(router);

        if (componentChange) calls.beforeComponentChange += 1;

        checkHistory({ container, checkSpy, url: expectedStep.url, content: expectedStep.content });
      }
    });

    it('popstate redirect from beforeEnter replaces the current history entry', async () => {
      const { router, render, checkSpy, calls, waitForRedirect } = await prepareRouterTest({
        options,
        configs: createConfigs({
          start: {
            path: '/start',
            loader: components.static,
            async beforeEnter({ redirect, currentState }) {
              if (currentState?.name === 'notFound') {
                return redirect({ name: 'target', params: { one: 'v-one' } });
              }
            },
          },
          target: { path: '/target/:one', params: { one: v.length }, loader: components.dynamic },
          ...errorConfigs,
        }),
      });

      const container = (await render()).container;

      await router.redirect({ name: 'start' });

      calls.beforeComponentChange += 1;

      await router.redirect({ name: 'notFound' });

      calls.beforeComponentChange += 1;

      const pushStateSpy = vi.spyOn(window.history, 'pushState').mockClear();
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockClear();

      // history.back() moves from '/error404' to '/start',
      // then beforeEnter redirects to '/target/v-one' and replaces '/start' with it.
      // Now the history stack is ['/target/v-one', '/error404'], and the pointer is at element 0.
      await waitForRedirect(() => history.back());
      await waitForRouterIdle(router);

      calls.beforeComponentChange += 1;

      expect(pushStateSpy).toHaveBeenCalledTimes(0);
      expect(replaceStateSpy).toHaveBeenCalledTimes(1);
      expect(router.activeName).toBe('target');

      checkHistory({ container, checkSpy, url: '/target/v-one', content: expectedContent.dynamic });

      // Moves the pointer to element 1 of ['/target/v-one', '/error404'].
      await waitForRedirect(() => history.forward());
      await waitForRouterIdle(router);

      calls.beforeComponentChange += 1;

      expect(pushStateSpy).toHaveBeenCalledTimes(0);
      expect(replaceStateSpy).toHaveBeenCalledTimes(1);
      expect(router.activeName).toBe('notFound');

      checkHistory({ container, checkSpy, url: '/error404', content: expectedContent.notFound });
    });

    it('popstate redirect back to currentState restores the current URL and clears redirecting', async () => {
      const { router, render, checkSpy, calls, waitForRedirect } = await prepareRouterTest({
        options,
        configs: createConfigs({
          start: {
            path: '/start',
            loader: components.static,
            async beforeEnter({ redirect, currentState }) {
              if (currentState?.name === 'notFound') {
                return redirect(currentState);
              }
            },
          },
          ...errorConfigs,
        }),
      });

      const container = (await render()).container;

      await router.redirect({ name: 'start' });

      calls.beforeComponentChange += 1;

      await router.redirect({ name: 'notFound' });

      calls.beforeComponentChange += 1;

      const pushStateSpy = vi.spyOn(window.history, 'pushState').mockClear();
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState').mockClear();

      // history.back() moves from '/error404' to '/start',
      // then beforeEnter emulates "back redirect" which replaces '/start' with '/error404'.
      // Now the history stack is ['/error404', '/error404'], and the pointer is at element 0.
      await waitForRedirect(() => history.back());
      await waitForRouterIdle(router);

      expect(pushStateSpy).toHaveBeenCalledTimes(0);
      expect(replaceStateSpy).toHaveBeenCalledTimes(1);
      expect(router.activeName).toBe('notFound');

      checkHistory({ container, checkSpy, url: '/error404', content: expectedContent.notFound });

      // Moves the pointer to element 1 of ['/error404', '/error404'].
      await waitForRedirect(() => history.forward());
      await waitForRouterIdle(router);

      expect(pushStateSpy).toHaveBeenCalledTimes(0);
      expect(replaceStateSpy).toHaveBeenCalledTimes(1);
      expect(router.activeName).toBe('notFound');

      checkHistory({ container, checkSpy, url: '/error404', content: expectedContent.notFound });
    });

    it('popstate race: forward back to the current state discards the pending back transition', async () => {
      let resolveDelayedBack: (() => void) | undefined;
      let notifyDelayedBackStarted: (() => void) | undefined;
      let notifyDelayedBackFinished: (() => void) | undefined;

      const delayedBackStarted = new Promise<void>((resolve) => {
        notifyDelayedBackStarted = resolve;
      });
      const delayedBack = new Promise<void>((resolve) => {
        resolveDelayedBack = resolve;
      });
      const delayedBackFinished = new Promise<void>((resolve) => {
        notifyDelayedBackFinished = resolve;
      });

      const { router, render, checkSpy, calls, waitForRedirect } = await prepareRouterTest({
        options,
        configs: createConfigs({
          dynamic: {
            path: '/dynamic',
            loader: components.dynamic,
            async beforeEnter({ currentState }) {
              if (currentState?.name === 'static') {
                notifyDelayedBackStarted?.();
                await delayedBack;
                notifyDelayedBackFinished?.();
              }
            },
          },
          static: { path: '/static', loader: components.static },
          ...errorConfigs,
        }),
      });

      const container = (await render()).container;

      // Prepare the history stack: ['/dynamic', '/static'], pointer at '/static'.
      await router.redirect({ name: 'dynamic' });

      calls.beforeComponentChange += 1;

      await router.redirect({ name: 'static' });

      calls.beforeComponentChange += 1;

      // history.back() moves the browser URL to '/dynamic'.
      // Router starts the '/static' -> '/dynamic' transition, then blocks in beforeEnter(dynamic).
      const backEvent = waitForRedirect(() => history.back());

      await delayedBackStarted;
      await backEvent;

      // URL is '/dynamic' but the rendered component is from '/static'.
      checkHistory({ container, checkSpy, url: '/dynamic', content: expectedContent.static });
      expect(router.activeName).toBe('static');
      expect(router.isRedirecting).toBe(true);
      // Browser does not serve previous page content from cache, it is waiting for the router
      await new Promise((resolve) => setTimeout(resolve, 100));
      checkHistory({ container, checkSpy, url: '/dynamic', content: expectedContent.static });

      // history.forward() moves the browser URL back to the current router state, '/static'.
      // This goes through the unmodified popstate branch and clears isRedirecting.
      await waitForRedirect(() => history.forward());
      await waitForRouterIdle(router);

      expect(router.activeName).toBe('static');
      checkHistory({ container, checkSpy, url: '/static', content: expectedContent.static });

      // The blocked back transition can now continue, but it is stale and must not apply '/dynamic'.
      resolveDelayedBack?.();
      await delayedBackFinished;
      await Promise.resolve();

      expect(router.activeName).toBe('static');
      checkHistory({ container, checkSpy, url: '/static', content: expectedContent.static });
    });
  }
);
