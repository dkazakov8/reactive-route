import { describe, expect, it } from 'vitest';

import { createConfigs, createRouter, TypeState } from '../packages/core';
import { TypePayloadDefault } from '../packages/core/types';
import { getAdapters } from './helpers/getAdapters';

describe(`payloadAndState`, async () => {
  const router = createRouter({
    configs: createConfigs({
      home: {
        path: '/',
        query: {
          one: (value) => value.length > 2,
          two: (value) => value.length > 2,
          three: (value) => value.length > 2,
          four: (value) => value.length > 2,
        },
        loader: () => Promise.resolve({ default: '' }),
      },
      dynamicOneParam: {
        path: '/test/:one',
        params: { one: (value) => value.length > 2 },
        query: {
          q: (value) => value.length > 2,
          s: (value) => value.length > 2,
        },
        loader: () => Promise.resolve({ default: '' }),
      },
      static: {
        path: '/test/static',
        query: { q: (value) => value.length > 2 },
        loader: () => Promise.resolve({ default: '' }),
      },
      dynamicOneParamStrangeSyntax: {
        path: '/strange-syntax/::static',
        params: {
          ':static': (value) => value.length > 2,
        },
        loader: () => Promise.resolve({ default: '' }),
      },
      dynamicTwoParams: {
        path: '/dynamicTwoParams/:one/:two',
        params: { one: (value) => value.length > 2, two: (value) => value.length > 2 },
        loader: () => Promise.resolve({ default: '' }),
      },
      dynamicRouteNoValidators: {
        path: '/test2/:param',
        params: undefined as any,
        loader: () => Promise.resolve({ default: '' }),
      },
      specialCharsPathname: {
        path: '/special/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest',
        loader: () => Promise.resolve({ default: '' }),
      },
      notFound: {
        path: '/error404',
        props: { errorNumber: 404 },
        loader: () => Promise.resolve({ default: '' }),
      },
      internalError: {
        path: '/error500',
        props: { errorNumber: 500 },
        loader: () => Promise.resolve({ default: '' }),
      },
    }),
    adapters: await getAdapters({ renderer: 'react', reactivity: 'mobx' }),
  });

  function checkPayload(url: string, expectedPayload: TypePayloadDefault) {
    expect(router.urlToPayload(url)).to.deep.eq(
      expectedPayload,
      `${url} should have payload ${JSON.stringify(expectedPayload)} but has ${JSON.stringify(router.urlToPayload(url))}\n`
    );
  }

  function checkState(payload: any, expectedState: Omit<TypeState<any>, 'isActive'>) {
    expect(router.payloadToState(payload)).to.deep.eq(
      Object.assign(expectedState, { isActive: true })
    );
  }

  it('Recognizes static route + prevails over dynamic configs', () => {
    let expected = { name: 'static', params: {}, query: {} } as any;

    checkPayload('/test/static', expected);
    checkPayload('/test/static/', expected);
    checkPayload('test/static', expected);
    checkPayload('test/static/', expected);
    checkPayload('/test//static//', expected);
    checkPayload('/test/static///', expected);

    checkState(expected, {
      ...expected,
      pathname: '/test/static',
      props: undefined,
      search: '',
      url: '/test/static',
    });

    expected = { name: 'specialCharsPathname', params: {}, query: {} };

    checkPayload('/special/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest', expected);
    checkPayload('/special/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest/', expected);
    checkPayload('special/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest', expected);
    checkPayload('special/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest/', expected);

    checkState(expected, {
      ...expected,
      pathname: '/special/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest',
      props: undefined,
      search: '',
      url: '/special/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest',
    });
  });

  it('Recognizes static route + query params', () => {
    const expected = { name: 'static', params: {}, query: { q: 'value-for-q' } };

    checkPayload('/test/static?q=value-for-q&bar=non', expected);
    checkPayload('/test/static/?q=value-for-q&bar=non', expected);
    checkPayload('test/static?q=value-for-q&bar=non', expected);
    checkPayload('test/static/?q=value-for-q&bar=non', expected);

    checkState(
      { ...expected, query: { q: 'value-for-q', bar: 'non' } },
      {
        ...expected,
        pathname: '/test/static',
        props: undefined,
        search: 'q=value-for-q',
        url: '/test/static?q=value-for-q',
      }
    );
  });

  it('Recognizes dynamic route', () => {
    let expected = {
      name: 'dynamicOneParam',
      params: { one: 'value-for-static' },
      query: {},
    } as any;

    checkPayload('/test/value-for-static', expected);
    checkPayload('/test/value-for-static/', expected);
    checkPayload('test/value-for-static', expected);
    checkPayload('test/value-for-static/', expected);

    checkPayload('/test//value-for-static//', expected);

    checkState(expected, {
      ...expected,
      pathname: '/test/value-for-static',
      props: undefined,
      search: '',
      url: '/test/value-for-static',
    });

    expected = {
      name: 'dynamicOneParamStrangeSyntax',
      params: { ':static': 'value-for-:static' },
      query: {},
    };

    checkPayload('/strange-syntax/value-for-%3Astatic', expected);
    checkPayload('/strange-syntax/value-for-%3Astatic/', expected);
    checkPayload('strange-syntax/value-for-%3Astatic', expected);
    checkPayload('strange-syntax/value-for-%3Astatic/', expected);

    checkState(expected, {
      ...expected,
      pathname: '/strange-syntax/value-for-%3Astatic',
      props: undefined,
      search: '',
      url: '/strange-syntax/value-for-%3Astatic',
    });
  });

  it('Recognizes dynamic route + query params', () => {
    let expected = {
      name: 'dynamicOneParam',
      params: { one: 'value-for-static' },
      query: { q: 'value-for-q' },
    } as any;

    checkPayload('/test/value-for-static?q=value-for-q&bar=non', expected);
    checkPayload('/test/value-for-static/?q=value-for-q&bar=non', expected);
    checkPayload('test/value-for-static?q=value-for-q&bar=non', expected);
    checkPayload('test/value-for-static/?q=value-for-q&bar=non', expected);

    checkState(
      { ...expected, query: { q: 'value-for-q', bar: 'non' } },
      {
        ...expected,
        pathname: '/test/value-for-static',
        props: undefined,
        search: 'q=value-for-q',
        url: '/test/value-for-static?q=value-for-q',
      }
    );

    expected = {
      name: 'dynamicOneParam',
      params: { one: 'value-for-static' },
      query: {},
    };

    checkPayload('/test/value-for-static?q=t&bar=non', expected);
    checkPayload('/test/value-for-static/?q=t&bar=non', expected);
    checkPayload('test/value-for-static?q=t&bar=non', expected);
    checkPayload('test/value-for-static/?q=t&bar=non', expected);

    checkState(
      { ...expected, query: { q: 't', bar: 'non' } },
      {
        ...expected,
        pathname: '/test/value-for-static',
        props: undefined,
        search: '',
        url: '/test/value-for-static',
      }
    );

    expected = {
      name: 'dynamicOneParam',
      params: { one: 'value-for-static' },
      query: { q: 'value-for-q', s: 'value-for-s' },
    };

    checkPayload('/test/value-for-static?q=value-for-q&s=value-for-s', expected);
    checkPayload('/test/value-for-static/?q=value-for-q&s=value-for-s', expected);
    checkPayload('test/value-for-static?q=value-for-q&s=value-for-s', expected);
    checkPayload('test/value-for-static/?q=value-for-q&s=value-for-s', expected);

    checkState(expected, {
      ...expected,
      pathname: '/test/value-for-static',
      props: undefined,
      search: 'q=value-for-q&s=value-for-s',
      url: '/test/value-for-static?q=value-for-q&s=value-for-s',
    });
  });

  it('Deserializes query parts', () => {
    let expected = {
      name: 'home',
      params: {},
      query: { one: 'шеллы', two: '?x=test', three: 'malformed%2' },
    } as any;

    checkPayload(
      '/?one=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B&two=%3Fx%3Dtest&three=malformed%2',
      expected
    );
    checkPayload('?one=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B&two=%3Fx%3Dtest&three=malformed%2', expected);
    checkPayload(
      '?one=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B&two=%3Fx%3Dtest&three=malformed%252',
      expected
    );

    checkState(expected, {
      ...expected,
      pathname: '/',
      props: undefined,
      search: 'one=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B&two=%3Fx%3Dtest&three=malformed%252',
      url: '/?one=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B&two=%3Fx%3Dtest&three=malformed%252',
      // do not propagate malformed values further, replace '%2' with '%252'
    });

    expected = {
      name: 'home',
      params: {},
      query: { one: 'foo\0bar', two: '../../etc/passwd', three: 'with space-and&symbols' },
    };

    checkPayload(
      '/?one=foo%00bar&two=..%2F..%2Fetc%2Fpasswd&three=with%20space-and%26symbols',
      expected
    );

    checkState(expected, {
      ...expected,
      pathname: '/',
      props: undefined,
      search: 'one=foo%00bar&two=..%2F..%2Fetc%2Fpasswd&three=with%20space-and%26symbols',
      url: '/?one=foo%00bar&two=..%2F..%2Fetc%2Fpasswd&three=with%20space-and%26symbols',
    });

    expected = {
      name: 'home',
      params: {},
      query: { one: 'val?ue' },
    };

    // "params.two" does not pass validator so not filled
    checkPayload('/?one=val?ue&two=1', expected);

    checkState(expected, {
      ...expected,
      pathname: '/',
      props: undefined,
      search: 'one=val%3Fue',
      url: '/?one=val%3Fue',
    });

    // "params.two" & "params.three" do not pass validator so not filled
    checkState(
      { ...expected, query: { one: 'val?ue', two: '1', three: 123 } },
      {
        ...expected,
        pathname: '/',
        props: undefined,
        search: 'one=val%3Fue',
        url: '/?one=val%3Fue',
      }
    );
  });

  it('Deserializes dynamic pathname parts', () => {
    let expected = {
      name: 'dynamicTwoParams',
      params: { one: 'шеллы', two: '?x=test' },
      query: {},
    } as any;

    checkPayload('/dynamicTwoParams/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B/%3Fx%3Dtest', expected);

    checkState(expected, {
      ...expected,
      pathname: '/dynamicTwoParams/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B/%3Fx%3Dtest',
      props: undefined,
      search: '',
      url: '/dynamicTwoParams/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B/%3Fx%3Dtest',
    });

    expected = {
      name: 'dynamicTwoParams',
      params: { one: 'malformed%2', two: 'foo\0bar' },
      query: {},
    };

    checkPayload('/dynamicTwoParams/malformed%2/foo%00bar', expected);
    checkPayload('/dynamicTwoParams/malformed%252/foo%00bar', expected);

    checkState(expected, {
      ...expected,
      pathname: '/dynamicTwoParams/malformed%252/foo%00bar',
      props: undefined,
      search: '',
      // do not propagate malformed values further, replace '%2' with '%252'
      url: '/dynamicTwoParams/malformed%252/foo%00bar',
    });

    expected = {
      name: 'dynamicTwoParams',
      params: { one: '../../etc/passwd', two: 'with space-and&symbols' },
      query: {},
    };

    checkPayload('/dynamicTwoParams/..%2F..%2Fetc%2Fpasswd/with%20space-and%26symbols', expected);

    checkState(expected, {
      ...expected,
      pathname: '/dynamicTwoParams/..%2F..%2Fetc%2Fpasswd/with%20space-and%26symbols',
      props: undefined,
      search: '',
      url: '/dynamicTwoParams/..%2F..%2Fetc%2Fpasswd/with%20space-and%26symbols',
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

    checkPayload('/other/value', expected);

    checkState(expected, {
      ...expected,
      pathname: '/error404',
      props: { errorNumber: 404 },
      search: '',
      url: '/error404',
    });
  });

  it('Clears hash from url', () => {
    let expected = {
      name: 'static',
      params: {},
      query: { q: 'value' },
    } as any;

    checkPayload('/test/static?q=value#hash', expected);
    checkPayload('/test/static/?q=value#hash', expected);
    checkPayload('test/static?q=value#hash', expected);
    checkPayload('test/static/?q=value#hash', expected);

    expected = {
      name: 'dynamicOneParam',
      params: { one: 'value-for-static' },
      query: {},
    };

    checkPayload('/test/value-for-static#hash', expected);
    checkPayload('/test/value-for-static/#hash', expected);
    checkPayload('test/value-for-static#hash', expected);
    checkPayload('test/value-for-static/#hash', expected);
  });

  it('Clears protocol and host from url', () => {
    let expected = {
      name: 'static',
      params: {},
      query: { q: 'value' },
    } as any;

    checkPayload('http://localhost:3000/test/static?q=value', expected);
    checkPayload('https://example.com/test/static?q=value', expected);
    checkPayload('//example.com/test/static?q=value', expected);
    checkPayload('http://localhost:3000/test/static?q=value#hash', expected);
    checkPayload('https://example.com/test/static?q=value#hash', expected);
    checkPayload('//example.com/test/static?q=value#hash', expected);

    expected = {
      name: 'home',
      params: {},
      query: {},
    };

    checkPayload('http://localhost:3000', expected);
    checkPayload('http://localhost:3000/', expected);
    checkPayload('http://localhost:3000?q=value', expected);
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
      router.payloadToState({ name: 'dynamicOneParam', params: {} as any });
    }).to.throw(`payload missing value for dynamicOneParam.params.one`);

    expect(() => {
      router.payloadToState({ name: 'dynamicOneParam', params: { static: '' } as any });
    }).to.throw(`payload missing value for dynamicOneParam.params.one`);

    expect(() => {
      router.payloadToState({ name: 'dynamicOneParam' } as any);
    }).to.throw(`payload missing value for dynamicOneParam.params.one`);

    expect(() => {
      router.payloadToState({ name: 'dynamicTwoParams', params: { one: 'dynamic' } as any });
    }).to.throw(`payload missing value for dynamicTwoParams.params.two`);
  });
});
