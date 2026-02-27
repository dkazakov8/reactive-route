import { describe, expect, it, vi } from 'vitest';

import { checkStateFromPayload, checkURLPayload, untypedRouter, v } from './helpers/checkers';

describe(`Config detection from URL`, async () => {
  it('Config path should have urlencoded format', () => {
    const router = untypedRouter({
      staticSpecial: { path: '/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest' },
    });

    const payload = { name: 'staticSpecial', params: {}, query: {} };
    const pathname = '/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest';
    const search = '';
    const state = {
      ...payload,
      url: `${pathname}${search}`,
      search: `${search.slice(1)}`,
      pathname,
    };

    checkURLPayload({ router, pathname, payload, search });
    checkStateFromPayload({ router, payload, state });
  });

  it('Config without params has priority', () => {
    const router = untypedRouter({
      dynamicOneParam: { path: '/test/:one', params: { one: v.length } },
      static: { path: '/test/static' },
    });

    const payload = { name: 'static', params: {}, query: {} } as any;
    const pathname = '/test/static';
    const search = '';
    const state = {
      ...payload,
      url: `${pathname}${search}`,
      search: `${search.slice(1)}`,
      pathname,
    };

    checkURLPayload({ router, pathname, payload, search });
    checkStateFromPayload({ router, payload, state });
  });

  it('Config params may have complex names', () => {
    const router = untypedRouter({
      dynamic: { path: '/::!@#$%^&*()_+one', params: { ':!@#$%^&*()_+one': v.length } },
    });

    const payload = { name: 'dynamic', params: { ':!@#$%^&*()_+one': 'v-:one' }, query: {} };
    const pathname = '/v-%3Aone';
    const search = '';
    const state = {
      ...payload,
      url: `${pathname}${search}`,
      search: `${search.slice(1)}`,
      pathname,
    };

    checkURLPayload({ router, pathname, payload, search });
    checkStateFromPayload({ router, payload, state });
  });

  it('Root Config path works', () => {
    const router = untypedRouter({
      home: { path: '/', query: { q: v.length, s: v.length } },
    });

    let payload = { name: 'home', params: {}, query: {} };
    let pathname = '/';
    let search = '';
    let state = {
      ...payload,
      url: `${pathname}${search}`,
      search: `${search.slice(1)}`,
      pathname,
    };

    checkURLPayload({ router, pathname, payload, search });
    checkStateFromPayload({ router, payload, state });

    payload = { name: 'home', params: {}, query: { q: 'v-q', s: 'v-s' } } as any;
    pathname = '/';
    search = '?q=v-q&s=v-s';
    state = {
      ...payload,
      url: `${pathname}${search}`,
      search: `${search.slice(1)}`,
      pathname,
    };

    checkURLPayload({ router, pathname, payload, search });
    checkStateFromPayload({ router, payload, state });
  });

  it('Fallback to 404 if no match', () => {
    const router = untypedRouter({});

    const payload = { name: 'notFound', params: {}, query: {} };
    const pathname = '/foo';
    const search = '';
    const state = {
      ...payload,
      url: `/error404`,
      search: `${search.slice(1)}`,
      pathname: '/error404',
      props: { errorNumber: 404 },
    };

    checkURLPayload({ router, pathname, payload, search });
    checkStateFromPayload({ router, payload, state });
  });

  it('Fallback to 404 and log an error when URL can not be constructed', () => {
    const router = untypedRouter({});

    const payload = { name: 'notFound', params: {}, query: {} };
    const pathname = '://&!@#$%^&*(';
    const search = '';
    const state = {
      ...payload,
      url: `/error404`,
      search: `${search.slice(1)}`,
      pathname: '/error404',
      props: { errorNumber: 404 },
    };

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    checkURLPayload({ router, pathname, payload, search });
    checkStateFromPayload({ router, payload, state });

    expect(consoleErrorSpy).toHaveBeenCalledTimes(2);

    expect(consoleErrorSpy).nthCalledWith(1, 'Invalid URL "//&!@#$%^&*(", fallback to notFound');
    expect(consoleErrorSpy).nthCalledWith(2, 'Invalid URL "//&!@#$%^&*(/", fallback to notFound');

    consoleErrorSpy.mockRestore();
  });

  it('Hash is cleared', () => {
    const router = untypedRouter({
      static: { path: '/static', query: { q: v.length } },
      dynamic: { path: '/:one', params: { one: v.length }, query: { q: v.length } },
    });

    let payload = { name: 'static', params: {}, query: {} } as any;
    let pathname = '/static';
    const hash = '#hash';
    let search = ``;
    let state = {
      ...payload,
      url: `${pathname}${search}`,
      search: `${search.slice(1)}`,
      pathname,
    };

    checkURLPayload({ router, pathname, payload, search, hash });
    checkStateFromPayload({ router, payload, state });

    payload = { name: 'static', params: {}, query: { q: 'v-q' } } as any;
    search = `?q=v-q`;
    state = {
      ...payload,
      url: `${pathname}${search}`,
      search: `${search.slice(1)}`,
      pathname,
    };

    checkURLPayload({ router, pathname, payload, search, hash });
    checkStateFromPayload({ router, payload, state });

    payload = { name: 'dynamic', params: { one: 'dynamic' }, query: {} } as any;
    pathname = '/dynamic';
    search = ``;
    state = {
      ...payload,
      url: `${pathname}${search}`,
      search: `${search.slice(1)}`,
      pathname,
    };

    checkURLPayload({ router, pathname, payload, search, hash });
    checkStateFromPayload({ router, payload, state });

    payload = { name: 'dynamic', params: { one: 'dynamic' }, query: { q: 'v-q' } } as any;
    search = `?q=v-q`;
    state = {
      ...payload,
      url: `${pathname}${search}`,
      search: `${search.slice(1)}`,
      pathname,
    };

    checkURLPayload({ router, pathname, payload, search, hash });
    checkStateFromPayload({ router, payload, state });
  });

  it('Protocol, host, port are cleared', () => {
    const router = untypedRouter({
      home: { path: '/', query: { q: v.length } },
    });

    let payload = { name: 'home', params: {}, query: {} };
    let pathname = '/';
    let search = '';
    let state = {
      ...payload,
      url: `/${search}`,
      search: `${search.slice(1)}`,
      pathname,
    };

    expect(router.urlToPayload('http://localhost:3000')).to.deep.eq(payload);
    expect(router.urlToPayload('https://localhost:3000/')).to.deep.eq(payload);
    expect(router.urlToPayload('//localhost:3000')).to.deep.eq(payload);
    expect(router.urlToPayload('//localhost:3000/')).to.deep.eq(payload);

    checkStateFromPayload({ router, payload, state });

    payload = { name: 'home', params: {}, query: { q: 'v-q' } } as any;
    pathname = '/';
    search = '?q=v-q';
    state = {
      ...payload,
      url: `${pathname}${search}`,
      search: `${search.slice(1)}`,
      pathname,
    };

    expect(router.urlToPayload('ws://localhost:3000?q=v-q')).to.deep.eq(payload);
    expect(router.urlToPayload('wss://localhost:3000/?q=v-q')).to.deep.eq(payload);
    expect(router.urlToPayload('//localhost:3000?q=v-q')).to.deep.eq(payload);
    expect(router.urlToPayload('//localhost:3000/?q=v-q')).to.deep.eq(payload);

    checkStateFromPayload({ router, payload, state });
  });
});
