import { expect, onTestFinished, vi } from 'vitest';

import { createConfigs, createRouter, TypeRouter, TypeState } from '../packages/core';
import { TypeLifecycleData, TypePayloadDefault, TypeURL } from '../packages/core/types';
import { getAdapters } from './helpers/getAdapters';

export const loader = () => Promise.resolve({ default: '' });

export const adapters = await getAdapters({ renderer: 'react', reactivity: 'mobx' });

export const v = {
  length: (v: string) => v.length > 2,
};

export function getConfigsDefault() {
  return {
    notFound: { path: '/error404', props: { errorNumber: 404 }, loader },
    internalError: { path: '/error500', props: { errorNumber: 500 }, loader },
  } as const;
}

export function destroyAfterTest(router: TypeRouter<any, any>) {
  onTestFinished(() => {
    try {
      router.historySyncStop();
    } catch (_e) {
      // noop
    }
  });
}

export function untypedRouter(configs: any) {
  const router = createRouter({
    adapters,
    // @ts-expect-error
    configs: createConfigs({
      ...configs,
      ...getConfigsDefault(),
    }),
  });

  destroyAfterTest(router);

  return router;
}

export function checkURLPayload({
  router,
  pathname,
  payload,
  search,
  hash = '',
}: {
  router: TypeRouter<any>;
  pathname: TypeURL;
  payload: TypePayloadDefault;
  search: string;
  hash?: string;
}) {
  const urlWithoutSlash = pathname.slice(1);
  const urlsToCheck = [
    `${pathname}${search}${hash}`,
    `${pathname}/${search}${hash}`,
    `${urlWithoutSlash}${search}${hash}`,
    `${urlWithoutSlash}/${search}${hash}`,
    `${pathname}//${search}${hash}`,
    `${pathname}///${search}${hash}`,
  ];

  for (const checkURL of urlsToCheck) {
    const actualPayload = router.urlToPayload(checkURL);

    const errorMessage = `${checkURL} should have payload ${JSON.stringify(payload)} but has ${JSON.stringify(actualPayload)}\n`;

    expect(actualPayload).to.deep.eq(payload, errorMessage);
  }
}

export function checkStateFromPayload({
  router,
  payload,
  state,
}: {
  router: TypeRouter<any>;
  payload: TypePayloadDefault;
  state: Omit<TypeState<any, any>, 'isActive' | 'props'>;
}) {
  expect(router.payloadToState(payload as any)).to.deep.eq(
    Object.assign({ isActive: true, props: {} }, state)
  );
}

export function createBeforeEnterSpy() {
  const format = (obj: any) => JSON.stringify(obj, null, 2);

  const beforeEnter = vi.fn() as any;

  function checkLastArguments(expectedLifecycle: TypeLifecycleData) {
    const actualLifecycle = beforeEnter.mock.lastCall?.[0];

    if (!actualLifecycle) return;

    expect(Object.keys(actualLifecycle).sort()).to.deep.eq([
      'currentState',
      'nextState',
      'reason',
      'redirect',
    ]);

    expect(actualLifecycle.reason).to.deep.eq(
      expectedLifecycle.reason,
      `reason mismatch: ${actualLifecycle.reason} !== ${expectedLifecycle.reason}`
    );
    expect(actualLifecycle.nextState).to.deep.eq(
      expectedLifecycle.nextState,
      `nextState mismatch: ${format(actualLifecycle.nextState)} !== ${format(expectedLifecycle.nextState)}`
    );
    expect(actualLifecycle.currentState).to.deep.eq(
      expectedLifecycle.currentState,
      `currentState mismatch: ${format(actualLifecycle.currentState)} !== ${format(expectedLifecycle.currentState)}`
    );
  }

  function checkCount(count: number) {
    expect(beforeEnter).toHaveBeenCalledTimes(count);
  }

  return { beforeEnter, checkLastArguments, checkCount };
}

export function createBeforeLeaveSpy() {
  const format = (obj: any) => JSON.stringify(obj, null, 2);

  const beforeLeave = vi.fn() as any;

  function checkLastArguments(expectedLifecycle: TypeLifecycleData) {
    const actualLifecycle = beforeLeave.mock.lastCall?.[0];

    if (!actualLifecycle) return;

    expect(Object.keys(actualLifecycle).sort()).to.deep.eq([
      'currentState',
      'nextState',
      'preventRedirect',
      'reason',
    ]);

    expect(actualLifecycle.reason).to.deep.eq(
      expectedLifecycle.reason,
      `reason mismatch: ${actualLifecycle.reason} !== ${expectedLifecycle.reason}`
    );
    expect(actualLifecycle.nextState).to.deep.eq(
      expectedLifecycle.nextState,
      `nextState mismatch: ${format(actualLifecycle.nextState)} !== ${format(expectedLifecycle.nextState)}`
    );
    expect(actualLifecycle.currentState).to.deep.eq(
      expectedLifecycle.currentState,
      `currentState mismatch: ${format(actualLifecycle.currentState)} !== ${format(expectedLifecycle.currentState)}`
    );
  }

  function checkCount(count: number) {
    expect(beforeLeave).toHaveBeenCalledTimes(count);
  }

  return { beforeLeave, checkLastArguments, checkCount };
}

export function checkURL(params: {
  routerUrl: string;
  expectedUrl: string;
  expectedHistoryUrl?: string;
}) {
  expect(params.routerUrl).to.eq(params.expectedUrl);

  if (typeof window !== 'undefined') {
    expect(location.pathname + location.search).to.eq(
      params.expectedHistoryUrl || params.expectedUrl
    );
  }
}
