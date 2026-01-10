import { describe, expect, it } from 'vitest';

import { getAdapters } from '../../../testHelpers/getAdapters';
import { getRoutes } from '../../../testHelpers/getRoutes';
import { allPossibleOptions } from '../../../testHelpers/types';
import { createRouter } from '../createRouter';

[allPossibleOptions[0]].forEach((options) => {
  describe(`createPayloadAndState [${options.renderer}+${options.reactivity}]`, async () => {
    const router = createRouter({
      routes: getRoutes(options),
      adapters: await getAdapters(options),
    });

    function check(locationInput: string, expected: any) {
      expect(router.createRoutePayload(locationInput)).to.deep.eq(expected);
    }

    function checkState(routePayload: any, expected: any) {
      expect(router.createRouteState(routePayload)).to.deep.eq(expected);
    }

    it('Recognizes static route + prevails over dynamic routes', () => {
      let expected = {
        route: 'staticRoute',
        params: {},
        query: {},
      };

      check('/test/static', expected);
      check('/test/static/', expected);
      check('test/static', expected);
      check('test/static/', expected);

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
        route: 'specialCharsPathname',
        params: {},
        query: {},
      } as any;

      check('/special/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest', expected);
      check('/special/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest/', expected);
      check('special/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest', expected);
      check('special/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B%3Fx%3Dtest/', expected);

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
        route: 'staticRoute',
        params: {},
        query: { q: 'value-for-q' },
      };

      check('/test/static?q=value-for-q&bar=non', expected);
      check('/test/static/?q=value-for-q&bar=non', expected);
      check('test/static?q=value-for-q&bar=non', expected);
      check('test/static/?q=value-for-q&bar=non', expected);

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
        route: 'dynamicRoute',
        params: { static: 'value-for-static' },
        query: {},
      };

      check('/test/value-for-static', expected);
      check('/test/value-for-static/', expected);
      check('test/value-for-static', expected);
      check('test/value-for-static/', expected);

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
        route: 'dynamicRoute3',
        params: { ':static': 'value-for-:static' },
        query: {},
      } as any;

      check('/test4/value-for-%3Astatic', expected);
      check('/test4/value-for-%3Astatic/', expected);
      check('test4/value-for-%3Astatic', expected);
      check('test4/value-for-%3Astatic/', expected);

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
        route: 'dynamicRoute',
        params: { static: 'value-for-static' },
        query: { q: 'value-for-q' },
      };

      check('/test/value-for-static?q=value-for-q&bar=non', expected);
      check('/test/value-for-static/?q=value-for-q&bar=non', expected);
      check('test/value-for-static?q=value-for-q&bar=non', expected);
      check('test/value-for-static/?q=value-for-q&bar=non', expected);

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
        route: 'dynamicRoute',
        params: { static: 'value-for-static' },
        query: {},
      } as any;

      check('/test/value-for-static?q=t&bar=non', expected);
      check('/test/value-for-static/?q=t&bar=non', expected);
      check('test/value-for-static?q=t&bar=non', expected);
      check('test/value-for-static/?q=t&bar=non', expected);

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
        route: 'dynamicRoute',
        params: { static: 'value-for-static' },
        query: { q: 'value-for-q', s: 'value-for-s' },
      } as any;

      check('/test/value-for-static?q=value-for-q&s=value-for-s', expected);
      check('/test/value-for-static/?q=value-for-q&s=value-for-s', expected);
      check('test/value-for-static?q=value-for-q&s=value-for-s', expected);
      check('test/value-for-static/?q=value-for-q&s=value-for-s', expected);

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
        route: 'staticRoute',
        params: {},
        query: { q: 'шеллы' },
      } as any;

      check('/test/static?q=%D1%88%D0%B5%D0%BB%D0%BB%D1%8B', expected);

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
        route: 'staticRoute',
        params: {},
        query: { q: '?x=test' },
      };

      check('/test/static?q=%3Fx%3Dtest', expected);

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
        route: 'staticRoute',
        params: {},
        query: { q: 'malformed%2' },
      };

      check('/test/static?q=malformed%2', expected);

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
        route: 'staticRoute',
        params: {},
        query: { q: 'malformed%2' },
      };

      check('/test/static?q=malformed%252', expected);

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
        route: 'staticRoute',
        params: {},
        query: { q: 'foo\0bar' },
      };

      check('/test/static?q=foo%00bar', expected);

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
        route: 'staticRoute',
        params: {},
        query: { q: '../../etc/passwd' },
      };

      check('/test/static?q=..%2F..%2Fetc%2Fpasswd', expected);

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
        route: 'staticRoute',
        params: {},
        query: { q: 'with space' },
      };

      check('/test/static?q=with%20space', expected);

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
        route: 'staticRoute',
        params: {},
        query: { q: 'and&symbols' },
      };

      check('/test/static?q=and%26symbols', expected);

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
        route: 'noPageName2',
        params: { foo: 'шеллы', bar: '?x=test' },
        query: {},
      } as any;

      check('/test/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B/%3Fx%3Dtest', expected);

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
        route: 'noPageName2',
        params: { foo: 'malformed%2', bar: 'percent' },
        query: {},
      };

      check('/test/malformed%2/percent', expected);
      check('/test/malformed%252/percent', expected);

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
        route: 'noPageName2',
        params: { foo: 'foo\0bar', bar: 'baz' },
        query: {},
      };

      check('/test/foo%00bar/baz', expected);

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
        route: 'noPageName2',
        params: { foo: '../../etc/passwd', bar: 'bar' },
        query: {},
      };

      check('/test/..%2F..%2Fetc%2Fpasswd/bar', expected);

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
        route: 'noPageName2',
        params: { foo: 'with space', bar: 'and&symbols' },
        query: {},
      };

      check('/test/with%20space/and%26symbols', expected);

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
        route: 'notFound',
        params: {},
        query: {},
      };

      check('/test', expected);
      check('/test/', expected);
      check('test', expected);
      check('test/', expected);

      check('/test/p', expected);
      check('/test/p/', expected);
      check('test/p', expected);
      check('test/p/', expected);

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
      expect(() => router.createRoutePayload('/test2/param')).to.throw(
        'missing validator for pathname dynamic parameter "param"'
      );
      expect(() => router.createRoutePayload('/test2/param/')).to.throw(
        'missing validator for pathname dynamic parameter "param"'
      );
      expect(() => router.createRoutePayload('test2/param')).to.throw(
        'missing validator for pathname dynamic parameter "param"'
      );
      expect(() => router.createRoutePayload('test2/param/')).to.throw(
        'missing validator for pathname dynamic parameter "param"'
      );
    });

    it('Throws validation errors for createRouteState', () => {
      expect(() => {
        router.createRouteState({
          route: 'dynamicRoute',
          params: {} as any,
        });
      }).to.throw(`no dynamic parameter "static" passed for route dynamicRoute`);

      expect(() => {
        router.createRouteState({
          route: 'dynamicRoute',
          params: { static: '' } as any,
        });
      }).to.throw(`no dynamic parameter "static" passed for route dynamicRoute`);

      expect(() => {
        router.createRouteState({
          route: 'dynamicRouteMultiple',
          params: { param: 'dynamic' } as any,
        });
      }).to.throw(`no dynamic parameter "param2" passed for route dynamicRouteMultiple`);
    });
  });
});
