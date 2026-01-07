import { describe, expect, it, vi } from 'vitest';

import { checkStateCreation, untypedRouter, v } from './helpers/checkers';

describe(`Config detection from URL`, async () => {
  it('Irrelevant Config "params" should be silently cleared', () => {
    const router = untypedRouter({
      dynamic: { path: '/:one', params: { one: v.length } },
    });

    const pathname = '/v-one';
    const search = '';
    const state = { name: 'dynamic', params: { one: 'v-one' }, query: {} };

    checkStateCreation({
      router,
      // pass irrelevant param "two"
      state: { name: 'dynamic', params: { one: 'v-one', two: 'v-two' }, query: {} },

      pathname,
      search,

      expectedState: state,
      expectedUrl: `${pathname}${search}`,
    });
  });

  it('Irrelevant Config "query" should be silently cleared', () => {
    const router = untypedRouter({
      static: { path: '/static', query: { q: v.length, s: v.length } },
      dynamic: { path: '/:one', params: { one: v.length }, query: { q: v.length, s: v.length } },
    });

    let pathname = '/static';
    let search = '?q=v-q&s=v-s';
    let state = { name: 'static', params: {}, query: { q: 'v-q', s: 'v-s' } };

    checkStateCreation({
      router,
      // pass irrelevant query "foo"
      state: { name: 'static', params: {}, query: { q: 'v-q', s: 'v-s', foo: 'bar' } },

      pathname,
      search,

      expectedState: state,
      expectedUrl: `${pathname}${search}`,
    });

    pathname = '/v-one';
    search = '?q=v-q&s=v-s';
    state = { name: 'dynamic', params: { one: 'v-one' }, query: { q: 'v-q', s: 'v-s' } };

    checkStateCreation({
      router,
      // pass irrelevant query "foo"
      state: {
        name: 'dynamic',
        params: { one: 'v-one' },
        query: { q: 'v-q', s: 'v-s', foo: 'bar' },
      },

      pathname,
      search,

      expectedState: state,
      expectedUrl: `${pathname}${search}`,
    });
  });

  it('Invalid Config "params" should fallback to 404 and log error', () => {
    const router = untypedRouter({
      dynamic: { path: '/:one', params: { one: v.length } },
    });

    const pathname = '/v';
    const search = '';
    const state = { name: 'notFound', params: {}, query: {} };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    checkStateCreation({
      router,
      state: { name: 'dynamic', params: { one: 'v' } } as any,

      pathname,
      search,

      expectedState: state,
      expectedUrl: `/error404`,
    });

    checkStateCreation({
      router,
      state: { name: 'dynamic', params: {} } as any,

      pathname,
      search,

      expectedState: state,
      expectedUrl: `/error404`,
    });

    checkStateCreation({
      router,
      state: { name: 'dynamic' } as any,

      pathname,
      search,

      expectedState: state,
      expectedUrl: `/error404`,
    });

    checkStateCreation({
      router,
      state: { name: 'dynamic', params: { test: 'v' } } as any,

      pathname,
      search,

      expectedState: state,
      expectedUrl: `/error404`,
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(4);

    expect(consoleErrorSpy).nthCalledWith(
      1,
      '[reactive-route] Invalid State {"name":"dynamic","params":{"one":"v"}} (params failed validation)'
    );

    expect(consoleErrorSpy).nthCalledWith(
      2,
      '[reactive-route] Invalid State {"name":"dynamic","params":{}} (params failed validation)'
    );

    expect(consoleErrorSpy).nthCalledWith(
      3,
      '[reactive-route] Invalid State {"name":"dynamic"} (params failed validation)'
    );

    expect(consoleErrorSpy).nthCalledWith(
      4,
      '[reactive-route] Invalid State {"name":"dynamic","params":{"test":"v"}} (params failed validation)'
    );

    consoleErrorSpy.mockRestore();
  });

  it('Invalid Config "query" should be silently cleared', () => {
    const router = untypedRouter({
      static: { path: '/static', query: { q: v.length, s: v.length } },
      dynamic: { path: '/:one', params: { one: v.length }, query: { q: v.length, s: v.length } },
    });

    let pathname = '/static';
    let search = '?q=v-q&s=v';
    let state = { name: 'static', params: {}, query: { q: 'v-q' } };

    checkStateCreation({
      router,
      // pass invalid query "s"
      state: { name: 'static', params: {}, query: { q: 'v-q', s: 'v' } },

      pathname,
      search,

      expectedState: state,
      expectedUrl: `${pathname}${search.replace('&s=v', '')}`,
    });

    pathname = '/v-one';
    search = '?q=v-q&s=v';
    state = { name: 'dynamic', params: { one: 'v-one' }, query: { q: 'v-q' } };

    checkStateCreation({
      router,
      // pass invalid query "s"
      state: { name: 'dynamic', params: { one: 'v-one' }, query: { q: 'v-q', s: 'v' } },

      pathname,
      search,

      expectedState: state,
      expectedUrl: `${pathname}${search.replace('&s=v', '')}`,
    });
  });

  it('Invalid State should fallback to 404 and log error', () => {
    const router = untypedRouter({});

    const pathname = '/';
    const search = '';
    const state = { name: 'notFound', params: {}, query: {} };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    checkStateCreation({
      router,
      state: {} as any,

      pathname,
      search,

      expectedState: state,
      expectedUrl: `/error404`,
    });

    checkStateCreation({
      router,
      state: { name: 'empty' } as any,

      pathname,
      search,

      expectedState: state,
      expectedUrl: `/error404`,
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

    expect(consoleErrorSpy).nthCalledWith(
      1,
      '[reactive-route] Invalid State {} (no Config name passed)'
    );

    expect(consoleErrorSpy).nthCalledWith(
      2,
      '[reactive-route] Invalid State {"name":"empty"} (no Config found for this name)'
    );

    consoleErrorSpy.mockRestore();
  });

  it('Missing Config validators should fallback to 404 and log error (normalizeState)', () => {
    const router = untypedRouter({
      dynamic: { path: '/:one' },
    });

    const pathname = '/';
    const search = '';
    const state = { name: 'notFound', params: {}, query: {} };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    checkStateCreation({
      router,
      state: { name: 'dynamic', params: { one: 'v' } } as any,

      pathname,
      search,

      expectedState: state,
      expectedUrl: `/error404`,
    });

    checkStateCreation({
      router,
      state: { name: 'dynamic', params: {} } as any,

      pathname,
      search,

      expectedState: state,
      expectedUrl: `/error404`,
    });

    checkStateCreation({
      router,
      state: { name: 'dynamic' } as any,

      pathname,
      search,

      expectedState: state,
      expectedUrl: `/error404`,
    });

    checkStateCreation({
      router,
      state: { name: 'dynamic', params: { test: 'v' } } as any,

      pathname,
      search,

      expectedState: state,
      expectedUrl: `/error404`,
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(4);

    expect(consoleErrorSpy).nthCalledWith(
      1,
      '[reactive-route] Invalid State {"name":"dynamic","params":{"one":"v"}} (params failed validation)'
    );

    expect(consoleErrorSpy).nthCalledWith(
      2,
      '[reactive-route] Invalid State {"name":"dynamic","params":{}} (params failed validation)'
    );

    expect(consoleErrorSpy).nthCalledWith(
      3,
      '[reactive-route] Invalid State {"name":"dynamic"} (params failed validation)'
    );

    expect(consoleErrorSpy).nthCalledWith(
      4,
      '[reactive-route] Invalid State {"name":"dynamic","params":{"test":"v"}} (params failed validation)'
    );

    consoleErrorSpy.mockRestore();
  });
});
