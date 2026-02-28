import { describe, expect, it, vi } from 'vitest';

import { checkStateFromPayload, checkURLPayload, untypedRouter, v } from './helpers/checkers';

describe(`Config detection from URL`, async () => {
  it('Irrelevant Config "params" should be silently cleared', () => {
    const router = untypedRouter({
      dynamic: { path: '/:one', params: { one: v.length } },
    });

    const payload = { name: 'dynamic', params: { one: 'v-one' }, query: {} } as any;
    const pathname = '/v-one';
    const search = '';
    const state = {
      ...payload,
      url: `${pathname}${search}`,
      search: `${search.slice(1)}`,
      pathname,
    };

    checkURLPayload({ router, pathname, payload, search });
    checkStateFromPayload({
      // pass irrelevant param "two"
      payload: { name: 'dynamic', params: { one: 'v-one', two: 'v-two' }, query: {} },
      router,
      state,
    });
  });

  it('Irrelevant Config "query" should be silently cleared', () => {
    const router = untypedRouter({
      static: { path: '/static', query: { q: v.length, s: v.length } },
      dynamic: { path: '/:one', params: { one: v.length }, query: { q: v.length, s: v.length } },
    });

    let payload = { name: 'static', params: {}, query: { q: 'v-q', s: 'v-s' } } as any;
    let pathname = '/static';
    let search = '?q=v-q&s=v-s';
    let state = {
      ...payload,
      url: `${pathname}${search}`,
      search: `${search.slice(1)}`,
      pathname,
    };

    checkURLPayload({ router, pathname, payload, search });
    checkStateFromPayload({ router, payload, state });

    checkStateFromPayload({
      // pass irrelevant query "foo"
      payload: { name: 'static', params: {}, query: { q: 'v-q', s: 'v-s', foo: 'bar' } },
      router,
      state,
    });

    payload = { name: 'dynamic', params: { one: 'v-one' }, query: { q: 'v-q', s: 'v-s' } } as any;
    pathname = '/v-one';
    search = '?q=v-q&s=v-s';
    state = {
      ...payload,
      url: `${pathname}${search}`,
      search: `${search.slice(1)}`,
      pathname,
    };

    checkURLPayload({ router, pathname, payload, search });
    checkStateFromPayload({ router, payload, state });

    checkStateFromPayload({
      // pass irrelevant query "foo"
      payload: {
        name: 'dynamic',
        params: { one: 'v-one' },
        query: { q: 'v-q', s: 'v-s', foo: 'bar' },
      },
      router,
      state,
    });
  });

  it('Invalid Config "params" should fallback to 404 and log error', () => {
    const router = untypedRouter({
      dynamic: { path: '/:one', params: { one: v.length } },
    });

    const payload = { name: 'notFound', params: {}, query: {} } as any;
    const pathname = '/v';
    const search = '';
    const state = {
      ...payload,
      url: `/error404`,
      search: `${search.slice(1)}`,
      pathname: `/error404`,
      props: { error: 404 },
    };

    checkURLPayload({ router, pathname, payload, search });
    checkStateFromPayload({ payload, router, state });

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    checkStateFromPayload({
      payload: { name: 'dynamic', params: { one: 'v' } },
      router,
      state,
    });

    checkStateFromPayload({
      payload: { name: 'dynamic', params: {} },
      router,
      state,
    });

    checkStateFromPayload({
      payload: { name: 'dynamic' },
      router,
      state,
    });

    checkStateFromPayload({
      payload: { name: 'dynamic', params: { test: 'v' } },
      router,
      state,
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(4);

    expect(consoleErrorSpy).nthCalledWith(
      1,
      'Invalid Payload {"name":"dynamic","params":{"one":"v"}} (params failed validation)'
    );

    expect(consoleErrorSpy).nthCalledWith(
      2,
      'Invalid Payload {"name":"dynamic","params":{}} (params failed validation)'
    );

    expect(consoleErrorSpy).nthCalledWith(
      3,
      'Invalid Payload {"name":"dynamic"} (params failed validation)'
    );

    expect(consoleErrorSpy).nthCalledWith(
      4,
      'Invalid Payload {"name":"dynamic","params":{"test":"v"}} (params failed validation)'
    );

    consoleErrorSpy.mockRestore();
  });

  it('Invalid Config "query" should be silently cleared', () => {
    const router = untypedRouter({
      static: { path: '/static', query: { q: v.length, s: v.length } },
      dynamic: { path: '/:one', params: { one: v.length }, query: { q: v.length, s: v.length } },
    });

    let payload = { name: 'static', params: {}, query: { q: 'v-q' } } as any;
    let pathname = '/static';
    let search = '?q=v-q&s=v';
    let state = {
      ...payload,
      url: `${pathname}${search.replace('&s=v', '')}`,
      search: `${search.slice(1).replace('&s=v', '')}`,
      pathname,
    };

    checkURLPayload({ router, pathname, payload, search });
    checkStateFromPayload({ router, payload, state });

    checkStateFromPayload({
      // pass invalid query "s"
      payload: { name: 'static', params: {}, query: { q: 'v-q', s: 'v' } },
      router,
      state,
    });

    payload = { name: 'dynamic', params: { one: 'v-one' }, query: { q: 'v-q' } } as any;
    pathname = '/v-one';
    search = '?q=v-q&s=v';
    state = {
      ...payload,
      url: `${pathname}${search.replace('&s=v', '')}`,
      search: `${search.slice(1).replace('&s=v', '')}`,
      pathname,
    };

    checkURLPayload({ router, pathname, payload, search });
    checkStateFromPayload({ router, payload, state });

    checkStateFromPayload({
      // pass invalid query "s"
      payload: {
        name: 'dynamic',
        params: { one: 'v-one' },
        query: { q: 'v-q', s: 'v' },
      },
      router,
      state,
    });
  });

  it('Invalid Payload should fallback to 404 and log error', () => {
    const router = untypedRouter({});

    const payload = { name: 'notFound', params: {}, query: {} };
    const search = '';
    const state = {
      ...payload,
      url: `/error404`,
      search: `${search.slice(1)}`,
      pathname: '/error404',
      props: { error: 404 },
    };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    checkStateFromPayload({ payload: {} as any, router, state });
    checkStateFromPayload({ payload: { name: 'empty' } as any, router, state });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

    expect(consoleErrorSpy).nthCalledWith(1, 'Invalid Payload {} (no Config name passed)');

    expect(consoleErrorSpy).nthCalledWith(
      2,
      'Invalid Payload {"name":"empty"} (no Config found for this name)'
    );

    consoleErrorSpy.mockRestore();
  });

  it('Missing Config validators should fallback to 404 and log error (payloadToState)', () => {
    const router = untypedRouter({
      dynamic: { path: '/:one' },
    });

    const payload = { name: 'notFound', params: {}, query: {} } as any;
    const search = '';
    const state = {
      ...payload,
      url: `/error404`,
      search: `${search.slice(1)}`,
      pathname: `/error404`,
      props: { error: 404 },
    };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    checkStateFromPayload({ payload, router, state });

    checkStateFromPayload({
      payload: { name: 'dynamic', params: { one: 'v' } },
      router,
      state,
    });

    checkStateFromPayload({
      payload: { name: 'dynamic', params: {} },
      router,
      state,
    });

    checkStateFromPayload({
      payload: { name: 'dynamic' },
      router,
      state,
    });

    checkStateFromPayload({
      payload: { name: 'dynamic', params: { test: 'v' } },
      router,
      state,
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(4);

    expect(consoleErrorSpy).nthCalledWith(
      1,
      'Invalid Payload {"name":"dynamic","params":{"one":"v"}} (params failed validation)'
    );

    expect(consoleErrorSpy).nthCalledWith(
      2,
      'Invalid Payload {"name":"dynamic","params":{}} (params failed validation)'
    );

    expect(consoleErrorSpy).nthCalledWith(
      3,
      'Invalid Payload {"name":"dynamic"} (params failed validation)'
    );

    expect(consoleErrorSpy).nthCalledWith(
      4,
      'Invalid Payload {"name":"dynamic","params":{"test":"v"}} (params failed validation)'
    );

    consoleErrorSpy.mockRestore();
  });

  it('Missing Config validators should fallback to 404 and log error (urlToPayload)', () => {
    const router = untypedRouter({
      dynamic: { path: '/:one' },
    });

    const payload = { name: 'notFound', params: {}, query: {} } as any;
    const search = '';

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    checkURLPayload({ router, pathname: '/param', payload, search });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(6);

    expect(consoleErrorSpy).nthCalledWith(1, 'Config "dynamic" has no validator for "one"');
    expect(consoleErrorSpy).nthCalledWith(2, 'Config "dynamic" has no validator for "one"');
    expect(consoleErrorSpy).nthCalledWith(3, 'Config "dynamic" has no validator for "one"');
    expect(consoleErrorSpy).nthCalledWith(4, 'Config "dynamic" has no validator for "one"');
    expect(consoleErrorSpy).nthCalledWith(5, 'Config "dynamic" has no validator for "one"');
    expect(consoleErrorSpy).nthCalledWith(6, 'Config "dynamic" has no validator for "one"');

    consoleErrorSpy.mockRestore();
  });
});
