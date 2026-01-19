import { describe, expect, it } from 'vitest';

import { createRouter, TypeState } from '../packages/core';
import { TypePayloadDefault } from '../packages/core/types';
import { getAdapters } from './helpers/getAdapters';
import { getRoutes } from './helpers/getRoutes';

describe(`payloadAndState`, async () => {
  const router = createRouter({
    routes: getRoutes({ renderer: 'react', reactivity: 'mobx' }),
    adapters: await getAdapters({ renderer: 'react', reactivity: 'mobx' }),
  });

  function checkPayload(url: string, expectedPayload: TypePayloadDefault) {
    expect(router.urlToPayload(url)).to.deep.eq(expectedPayload);
  }

  function checkState(payload: any, expectedState: TypeState<any>) {
    expect(router.payloadToState(payload)).to.deep.eq(expectedState);
  }

  it('Recognizes static route + prevails over dynamic routes', () => {
    let expected = {
      name: 'staticRoute',
      params: {},
      query: {},
    };

    checkPayload('/test/static', expected);
    checkPayload('/test/static/', expected);
    checkPayload('test/static', expected);
    checkPayload('test/static/', expected);

    checkState(expected, {
      isActive: true,
      name: 'staticRoute',
      params: {},
      pathname: '/test/static',
      props: undefined,
      query: {},
      search: '',
      url: '/test/static',
    });

    expected = {
      name: 'specialCharsPathname',
      params: {},
      query: {},
    } as any;

    checkPayload('/special/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest', expected);
    checkPayload('/special/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest/', expected);
    checkPayload('special/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest', expected);
    checkPayload('special/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest/', expected);

    checkState(expected, {
      isActive: true,
      name: 'specialCharsPathname',
      params: {},
      pathname: '/special/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest',
      props: undefined,
      query: {},
      search: '',
      url: '/special/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest',
    });
  });

  it('Recognizes static route + query params', () => {
    const expected = {
      name: 'staticRoute',
      params: {},
      query: { q: 'value-for-q' },
    };

    checkPayload('/test/static?q=value-for-q&bar=non', expected);
    checkPayload('/test/static/?q=value-for-q&bar=non', expected);
    checkPayload('test/static?q=value-for-q&bar=non', expected);
    checkPayload('test/static/?q=value-for-q&bar=non', expected);

    // @ts-ignore
    expected.query.bar = 'non';

    checkState(expected, {
      isActive: true,
      name: 'staticRoute',
      params: {},
      pathname: '/test/static',
      props: undefined,
      query: { q: 'value-for-q' },
      search: 'q=value-for-q',
      url: '/test/static?q=value-for-q',
    });
  });

  it('Recognizes dynamic route', () => {
    let expected = {
      name: 'dynamicRoute',
      params: { static: 'value-for-static' },
      query: {},
    };

    checkPayload('/test/value-for-static', expected);
    checkPayload('/test/value-for-static/', expected);
    checkPayload('test/value-for-static', expected);
    checkPayload('test/value-for-static/', expected);

    checkState(expected, {
      isActive: true,
      name: 'dynamicRoute',
      params: { static: 'value-for-static' },
      pathname: '/test/value-for-static',
      props: undefined,
      query: {},
      search: '',
      url: '/test/value-for-static',
    });

    expected = {
      name: 'dynamicRoute3',
      params: { ':static': 'value-for-:static' },
      query: {},
    } as any;

    checkPayload('/test4/value-for-%3Astatic', expected);
    checkPayload('/test4/value-for-%3Astatic/', expected);
    checkPayload('test4/value-for-%3Astatic', expected);
    checkPayload('test4/value-for-%3Astatic/', expected);

    checkState(expected, {
      isActive: true,
      name: 'dynamicRoute3',
      params: { ':static': 'value-for-:static' },
      pathname: '/test4/value-for-%3Astatic',
      props: undefined,
      query: {},
      search: '',
      url: '/test4/value-for-%3Astatic',
    });
  });

  it('Recognizes dynamic route + query params', () => {
    let expected = {
      name: 'dynamicRoute',
      params: { static: 'value-for-static' },
      query: { q: 'value-for-q' },
    };

    checkPayload('/test/value-for-static?q=value-for-q&bar=non', expected);
    checkPayload('/test/value-for-static/?q=value-for-q&bar=non', expected);
    checkPayload('test/value-for-static?q=value-for-q&bar=non', expected);
    checkPayload('test/value-for-static/?q=value-for-q&bar=non', expected);

    // @ts-ignore
    expected.query.bar = 'non';

    checkState(expected, {
      isActive: true,
      name: 'dynamicRoute',
      params: { static: 'value-for-static' },
      pathname: '/test/value-for-static',
      props: undefined,
      query: { q: 'value-for-q' },
      search: 'q=value-for-q',
      url: '/test/value-for-static?q=value-for-q',
    });

    expected = {
      name: 'dynamicRoute',
      params: { static: 'value-for-static' },
      query: {},
    } as any;

    checkPayload('/test/value-for-static?q=t&bar=non', expected);
    checkPayload('/test/value-for-static/?q=t&bar=non', expected);
    checkPayload('test/value-for-static?q=t&bar=non', expected);
    checkPayload('test/value-for-static/?q=t&bar=non', expected);

    // @ts-ignore
    expected.query.q = 't';
    // @ts-ignore
    expected.query.bar = 'non';

    checkState(expected, {
      isActive: true,
      name: 'dynamicRoute',
      params: { static: 'value-for-static' },
      pathname: '/test/value-for-static',
      props: undefined,
      query: {},
      search: '',
      url: '/test/value-for-static',
    });

    expected = {
      name: 'dynamicRoute',
      params: { static: 'value-for-static' },
      query: { q: 'value-for-q', s: 'value-for-s' },
    } as any;

    checkPayload('/test/value-for-static?q=value-for-q&s=value-for-s', expected);
    checkPayload('/test/value-for-static/?q=value-for-q&s=value-for-s', expected);
    checkPayload('test/value-for-static?q=value-for-q&s=value-for-s', expected);
    checkPayload('test/value-for-static/?q=value-for-q&s=value-for-s', expected);

    checkState(expected, {
      isActive: true,
      name: 'dynamicRoute',
      params: { static: 'value-for-static' },
      pathname: '/test/value-for-static',
      props: undefined,
      query: { q: 'value-for-q', s: 'value-for-s' },
      search: 'q=value-for-q&s=value-for-s',
      url: '/test/value-for-static?q=value-for-q&s=value-for-s',
    });
  });

  it('Deserializes query parts', () => {
    let expected = {
      name: 'staticRoute',
      params: {},
      query: { q: 'шеллы' },
    } as any;

    checkPayload('/test/static?q=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B', expected);

    checkState(expected, {
      isActive: true,
      name: 'staticRoute',
      params: {},
      pathname: '/test/static',
      props: undefined,
      query: { q: 'шеллы' },
      search: 'q=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B',
      url: '/test/static?q=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B',
    });

    expected = {
      name: 'staticRoute',
      params: {},
      query: { q: '?x=test' },
    };

    checkPayload('/test/static?q=%3Fx%3Dtest', expected);

    checkState(expected, {
      isActive: true,
      name: 'staticRoute',
      params: {},
      pathname: '/test/static',
      props: undefined,
      query: { q: '?x=test' },
      search: 'q=%3Fx%3Dtest',
      url: '/test/static?q=%3Fx%3Dtest',
    });

    expected = {
      name: 'staticRoute',
      params: {},
      query: { q: 'malformed%2' },
    };

    checkPayload('/test/static?q=malformed%2', expected);

    checkState(expected, {
      isActive: true,
      name: 'staticRoute',
      params: {},
      pathname: '/test/static',
      props: undefined,
      query: { q: 'malformed%2' },
      search: 'q=malformed%252',
      // do not propagate malformed values further, replace '%2' with '%252'
      url: '/test/static?q=malformed%252',
    });

    expected = {
      name: 'staticRoute',
      params: {},
      query: { q: 'malformed%2' },
    };

    checkPayload('/test/static?q=malformed%252', expected);

    checkState(expected, {
      isActive: true,
      name: 'staticRoute',
      params: {},
      pathname: '/test/static',
      props: undefined,
      query: { q: 'malformed%2' },
      search: 'q=malformed%252',
      // do not propagate malformed values further, replace '%2' with '%252'
      url: '/test/static?q=malformed%252',
    });

    expected = {
      name: 'staticRoute',
      params: {},
      query: { q: 'foo\0bar' },
    };

    checkPayload('/test/static?q=foo%00bar', expected);

    checkState(expected, {
      isActive: true,
      name: 'staticRoute',
      params: {},
      pathname: '/test/static',
      props: undefined,
      query: { q: 'foo\0bar' },
      search: 'q=foo%00bar',
      url: '/test/static?q=foo%00bar',
    });

    expected = {
      name: 'staticRoute',
      params: {},
      query: { q: '../../etc/passwd' },
    };

    checkPayload('/test/static?q=..%2F..%2Fetc%2Fpasswd', expected);

    checkState(expected, {
      isActive: true,
      name: 'staticRoute',
      params: {},
      pathname: '/test/static',
      props: undefined,
      query: { q: '../../etc/passwd' },
      search: 'q=..%2F..%2Fetc%2Fpasswd',
      url: '/test/static?q=..%2F..%2Fetc%2Fpasswd',
    });

    expected = {
      name: 'staticRoute',
      params: {},
      query: { q: 'with space' },
    };

    checkPayload('/test/static?q=with%20space', expected);

    checkState(expected, {
      isActive: true,
      name: 'staticRoute',
      params: {},
      pathname: '/test/static',
      props: undefined,
      query: { q: 'with space' },
      search: 'q=with%20space',
      url: '/test/static?q=with%20space',
    });

    expected = {
      name: 'staticRoute',
      params: {},
      query: { q: 'and&symbols' },
    };

    checkPayload('/test/static?q=and%26symbols', expected);

    checkState(expected, {
      isActive: true,
      name: 'staticRoute',
      params: {},
      pathname: '/test/static',
      props: undefined,
      query: { q: 'and&symbols' },
      search: 'q=and%26symbols',
      url: '/test/static?q=and%26symbols',
    });
  });

  it('Deserializes dynamic pathname parts', () => {
    let expected = {
      name: 'noPageName2',
      params: { foo: 'шеллы', bar: '?x=test' },
      query: {},
    } as any;

    checkPayload('/test/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B/%3Fx%3Dtest', expected);

    checkState(expected, {
      isActive: true,
      name: 'noPageName2',
      params: { foo: 'шеллы', bar: '?x=test' },
      pathname: '/test/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B/%3Fx%3Dtest',
      props: undefined,
      query: {},
      search: '',
      url: '/test/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B/%3Fx%3Dtest',
    });

    expected = {
      name: 'noPageName2',
      params: { foo: 'malformed%2', bar: 'percent' },
      query: {},
    };

    checkPayload('/test/malformed%2/percent', expected);
    checkPayload('/test/malformed%252/percent', expected);

    checkState(expected, {
      isActive: true,
      name: 'noPageName2',
      params: { foo: 'malformed%2', bar: 'percent' },
      pathname: '/test/malformed%252/percent',
      props: undefined,
      query: {},
      search: '',
      // do not propagate malformed values further, replace '%2' with '%252'
      url: '/test/malformed%252/percent',
    });

    expected = {
      name: 'noPageName2',
      params: { foo: 'foo\0bar', bar: 'baz' },
      query: {},
    };

    checkPayload('/test/foo%00bar/baz', expected);

    checkState(expected, {
      isActive: true,
      name: 'noPageName2',
      params: { foo: 'foo\0bar', bar: 'baz' },
      pathname: '/test/foo%00bar/baz',
      props: undefined,
      query: {},
      search: '',
      url: '/test/foo%00bar/baz',
    });

    expected = {
      name: 'noPageName2',
      params: { foo: '../../etc/passwd', bar: 'bar' },
      query: {},
    };

    checkPayload('/test/..%2F..%2Fetc%2Fpasswd/bar', expected);

    checkState(expected, {
      isActive: true,
      name: 'noPageName2',
      params: { foo: '../../etc/passwd', bar: 'bar' },
      pathname: '/test/..%2F..%2Fetc%2Fpasswd/bar',
      props: undefined,
      query: {},
      search: '',
      url: '/test/..%2F..%2Fetc%2Fpasswd/bar',
    });

    expected = {
      name: 'noPageName2',
      params: { foo: 'with space', bar: 'and&symbols' },
      query: {},
    };

    checkPayload('/test/with%20space/and%26symbols', expected);

    checkState(expected, {
      isActive: true,
      name: 'noPageName2',
      params: { foo: 'with space', bar: 'and&symbols' },
      pathname: '/test/with%20space/and%26symbols',
      props: undefined,
      query: {},
      search: '',
      url: '/test/with%20space/and%26symbols',
    });
  });

  it('Returns notFound if there is no match', () => {
    const expected = {
      name: 'notFound',
      params: {},
      query: {},
    };

    checkPayload('/test', expected);
    checkPayload('/test/', expected);
    checkPayload('test', expected);
    checkPayload('test/', expected);

    checkPayload('/test/p', expected);
    checkPayload('/test/p/', expected);
    checkPayload('test/p', expected);
    checkPayload('test/p/', expected);

    checkState(expected, {
      isActive: true,
      name: 'notFound',
      params: {},
      pathname: '/error404',
      props: { errorNumber: 404 },
      query: {},
      search: '',
      url: '/error404',
    });
  });

  it('Throws an error when no validators', () => {
    expect(() => router.urlToPayload('/test2/param')).to.throw(
      'missing validator for pathname dynamic parameter "param"'
    );
    expect(() => router.urlToPayload('/test2/param/')).to.throw(
      'missing validator for pathname dynamic parameter "param"'
    );
    expect(() => router.urlToPayload('test2/param')).to.throw(
      'missing validator for pathname dynamic parameter "param"'
    );
    expect(() => router.urlToPayload('test2/param/')).to.throw(
      'missing validator for pathname dynamic parameter "param"'
    );
  });

  it('Throws validation errors for payloadToState', () => {
    expect(() => {
      router.payloadToState({
        name: 'dynamicRoute',
        params: {} as any,
      });
    }).to.throw(`no dynamic parameter "static" passed for route dynamicRoute`);

    expect(() => {
      router.payloadToState({
        name: 'dynamicRoute',
        params: { static: '' } as any,
      });
    }).to.throw(`no dynamic parameter "static" passed for route dynamicRoute`);

    expect(() => {
      router.payloadToState({
        name: 'dynamicRouteMultiple',
        params: { param: 'dynamic' } as any,
      });
    }).to.throw(`no dynamic parameter "param2" passed for route dynamicRouteMultiple`);
  });
});
