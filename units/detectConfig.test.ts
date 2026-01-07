import { describe, expect, it, vi } from 'vitest';

import { checkStateCreation, untypedRouter, v } from './helpers/checkers';

describe(`Config detection from URL`, async () => {
  it('Config path should have urlencoded format', () => {
    const router = untypedRouter({
      staticSpecial: { path: '/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest' },
    });

    const pathname = '/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest';
    const search = '';
    const state = { name: 'staticSpecial', params: {}, query: {} };

    checkStateCreation({
      router,
      state,

      pathname,
      search,

      expectedState: state,
      expectedUrl: `${pathname}${search}`,
    });
  });

  it('Config without params has priority', () => {
    const router = untypedRouter({
      dynamicOneParam: { path: '/test/:one', params: { one: v.length } },
      static: { path: '/test/static' },
    });

    const pathname = '/test/static';
    const search = '';

    const state = { name: 'static', params: {}, query: {} };

    checkStateCreation({
      router,
      state,

      pathname,
      search,

      expectedState: state,
      expectedUrl: `${pathname}${search}`,
    });
  });

  it('Config params may have complex names', () => {
    const router = untypedRouter({
      dynamic: { path: '/::!@#$%^&*()_+one', params: { ':!@#$%^&*()_+one': v.length } },
    });

    const pathname = '/v-%3Aone';
    const search = '';

    const state = { name: 'dynamic', params: { ':!@#$%^&*()_+one': 'v-:one' }, query: {} };

    checkStateCreation({
      router,
      state,

      pathname,
      search,

      expectedState: state,
      expectedUrl: `${pathname}${search}`,
    });
  });

  it('Root Config path works', () => {
    const router = untypedRouter({
      home: { path: '/', query: { q: v.length, s: v.length } },
    });

    let pathname = '/';
    let search = '';
    let state = { name: 'home', params: {}, query: {} };

    checkStateCreation({
      router,
      state,

      pathname,
      search,

      expectedState: state,
      expectedUrl: `${pathname}${search}`,
    });

    pathname = '/';
    search = '?q=v-q&s=v-s';
    state = { name: 'home', params: {}, query: { q: 'v-q', s: 'v-s' } };

    checkStateCreation({
      router,
      state,

      pathname,
      search,

      expectedState: state,
      expectedUrl: `${pathname}${search}`,
    });
  });

  it('Fallback to 404 if no match', () => {
    const router = untypedRouter({});

    const pathname = '/foo';
    const search = '';
    const state = { name: 'notFound', params: {}, query: {} };

    checkStateCreation({
      router,
      state,

      pathname,
      search,

      expectedState: state,
      expectedUrl: `/error404`,
    });
  });

  it('Fallback to 404 and log an error when URL can not be constructed', () => {
    const router = untypedRouter({});

    const pathname = '://&!@#$%^&*(';
    const search = '';
    const state = { name: 'notFound', params: {}, query: {} };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    checkStateCreation({
      router,
      state,

      pathname,
      search,

      expectedState: state,
      expectedUrl: `/error404`,
    });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

    expect(consoleErrorSpy).nthCalledWith(
      1,
      '[reactive-route] Invalid URL "//&!@#$%^&*(", fallback to notFound'
    );
    expect(consoleErrorSpy).nthCalledWith(
      2,
      '[reactive-route] Invalid URL "//&!@#$%^&*(/", fallback to notFound'
    );

    consoleErrorSpy.mockRestore();
  });

  it('Hash is cleared', () => {
    const router = untypedRouter({
      static: { path: '/static', query: { q: v.length } },
      dynamic: { path: '/:one', params: { one: v.length }, query: { q: v.length } },
    });

    let pathname = '/static';
    const hash = '#hash';
    let search = ``;
    let state = { name: 'static', params: {}, query: {} };

    checkStateCreation({
      router,
      state,

      pathname,
      search,
      hash,

      expectedState: state,
      expectedUrl: `${pathname}${search}`,
    });

    search = `?q=v-q`;
    state = { name: 'static', params: {}, query: { q: 'v-q' } };

    checkStateCreation({
      router,
      state,

      pathname,
      search,
      hash,

      expectedState: state,
      expectedUrl: `${pathname}${search}`,
    });

    pathname = '/dynamic';
    search = ``;
    state = { name: 'dynamic', params: { one: 'dynamic' }, query: {} };

    checkStateCreation({
      router,
      state,

      pathname,
      search,
      hash,

      expectedState: state,
      expectedUrl: `${pathname}${search}`,
    });

    search = `?q=v-q`;
    state = { name: 'dynamic', params: { one: 'dynamic' }, query: { q: 'v-q' } };

    checkStateCreation({
      router,
      state,

      pathname,
      search,
      hash,

      expectedState: state,
      expectedUrl: `${pathname}${search}`,
    });
  });

  it('Protocol, host, port are cleared', () => {
    const router = untypedRouter({
      home: { path: '/', query: { q: v.length } },
    });

    let pathname = '/';
    let search = '';
    let state = { name: 'home', params: {}, query: {} };

    expect(router.urlToState('http://localhost:3000')).to.deep.eq(state);
    expect(router.urlToState('https://localhost:3000/')).to.deep.eq(state);
    expect(router.urlToState('//localhost:3000')).to.deep.eq(state);
    expect(router.urlToState('//localhost:3000/')).to.deep.eq(state);

    checkStateCreation({
      router,
      state,

      pathname,
      search,

      expectedState: state,
      expectedUrl: `${pathname}${search}`,
    });

    pathname = '/';
    search = '?q=v-q';
    state = { name: 'home', params: {}, query: { q: 'v-q' } };

    expect(router.urlToState('ws://localhost:3000?q=v-q')).to.deep.eq(state);
    expect(router.urlToState('wss://localhost:3000/?q=v-q')).to.deep.eq(state);
    expect(router.urlToState('//localhost:3000?q=v-q')).to.deep.eq(state);
    expect(router.urlToState('//localhost:3000/?q=v-q')).to.deep.eq(state);

    checkStateCreation({
      router,
      state,

      pathname,
      search,

      expectedState: state,
      expectedUrl: `${pathname}${search}`,
    });
  });

  it('Fallback to next config when validator fails', () => {
    const router = untypedRouter({
      dynamicInvalid: { path: '/:one', params: { one: () => false } },
      dynamicValid: { path: '/:one', params: { one: v.length } },
    });

    const pathname = '/v-one';
    const search = '';
    const state = { name: 'dynamicValid', params: { one: 'v-one' }, query: {} };

    checkStateCreation({
      router,
      state,

      pathname,
      search,

      expectedState: state,
      expectedUrl: `${pathname}${search}`,
    });
  });
});
