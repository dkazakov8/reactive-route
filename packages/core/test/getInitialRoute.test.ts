import { createRouter } from 'reactive-route';
import { describe, expect, it } from 'vitest';

import { getAdapters } from '../../shared/getAdapters';
import { getRoutes } from '../../shared/getRoutes';
import { allPossibleOptions } from '../../shared/types';

[allPossibleOptions[0]].forEach((options) => {
  describe(`getInitialRoute [${options.renderer}+${options.reactivity}]`, async () => {
    const router = createRouter({
      routes: getRoutes(options),
      adapters: await getAdapters(options),
    });

    it('Get correct static route by path', () => {
      expect(router.createRoutePayload({ pathname: '/test/static' })).to.deep.eq({
        route: 'staticRoute',
        params: {},
        query: {},
        replace: undefined,
      });

      expect(router.createRoutePayload({ pathname: '/test/static?q=test&bar=non' })).to.deep.eq({
        route: 'staticRoute',
        params: {},
        query: { q: 'test' },
        replace: undefined,
      });

      expect(router.createRoutePayload({ pathname: '/test/static/' })).to.deep.eq({
        route: 'staticRoute',
        params: {},
        query: {},
        replace: undefined,
      });

      expect(router.createRoutePayload({ pathname: '/test/static/?q=test&bar=non' })).to.deep.eq({
        route: 'staticRoute',
        params: {},
        query: { q: 'test' },
        replace: undefined,
      });
    });

    it('Get correct dynamic route by path', () => {
      expect(router.createRoutePayload({ pathname: '/test/foo' })).to.deep.eq({
        route: 'dynamicRoute',
        params: { static: 'foo' },
        query: {},
        replace: undefined,
      });

      expect(router.createRoutePayload({ pathname: '/test/foo?q=test' })).to.deep.eq({
        route: 'dynamicRoute',
        params: { static: 'foo' },
        query: { q: 'test' },
        replace: undefined,
      });

      expect(router.createRoutePayload({ pathname: '/test3/123' })).to.deep.eq({
        route: 'dynamicRoute2',
        params: { static: '123' },
        query: {},
        replace: undefined,
      });

      expect(router.createRoutePayload({ pathname: '/test4/123/' })).to.deep.eq({
        route: 'dynamicRoute3',
        params: { ':static': '123' },
        query: {},
        replace: undefined,
      });

      expect(
        router.createRoutePayload({ pathname: '/test/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B/%3Fx%3Dtest' })
      ).to.deep.eq({
        route: 'noPageName2',
        params: { foo: 'шеллы', bar: '?x=test' },
        query: {},
        replace: undefined,
      });
    });

    it('Get correct query route by path', () => {
      // @ts-ignore
      expect(router.createRoutePayload({ pathname: '/test3/asd' }).query).to.deep.equal({});

      // @ts-ignore
      expect(router.createRoutePayload({ pathname: '/test/dynamic?q=t&s=1' }).query).to.deep.equal(
        {}
      );

      // @ts-ignore
      expect(router.createRoutePayload({ pathname: '/test/dynamic?q=test' }).query).to.deep.equal({
        q: 'test',
      });

      expect(
        // @ts-ignore
        router.createRoutePayload({ pathname: '/test/dynamic?q=test&s=test2' }).query
      ).to.deep.equal({
        q: 'test',
        s: 'test2',
      });

      expect(
        // @ts-ignore
        router.createRoutePayload({ pathname: '/test/dynamic?q=test&s=test2&b=1' }).query
      ).to.deep.equal({ q: 'test', s: 'test2' });
    });

    it('Fallback', () => {
      expect(router.createRoutePayload({ pathname: '/test' })).to.deep.eq({
        route: 'notFound',
        params: {},
        query: {},
        replace: undefined,
      });

      expect(router.createRoutePayload({ pathname: '/test?q=test' })).to.deep.eq({
        route: 'notFound',
        params: {},
        query: {},
        replace: undefined,
      });

      expect(router.createRoutePayload({ pathname: '/test/' })).to.deep.eq({
        route: 'notFound',
        params: {},
        query: {},
        replace: undefined,
      });

      expect(router.createRoutePayload({ pathname: '/test/?q=test' })).to.deep.eq({
        route: 'notFound',
        params: {},
        query: {},
        replace: undefined,
      });

      expect(router.createRoutePayload({ pathname: '/test/p' })).to.deep.eq({
        route: 'notFound',
        params: {},
        query: {},
        replace: undefined,
      });

      expect(router.createRoutePayload({ pathname: '/test/p?q=test' })).to.deep.eq({
        route: 'notFound',
        params: {},
        query: {},
        replace: undefined,
      });

      expect(router.createRoutePayload({ pathname: '/testX/static' })).to.deep.eq({
        route: 'notFound',
        params: {},
        query: {},
        replace: undefined,
      });

      expect(router.createRoutePayload({ pathname: '/testX/foo' })).to.deep.eq({
        route: 'notFound',
        params: {},
        query: {},
        replace: undefined,
      });
    });

    it('(error) No validators', () => {
      expect(() => router.createRoutePayload({ pathname: '/test2/param' })).to.throw(
        'missing validator for param "param"'
      );

      expect(() => router.createRoutePayload({ pathname: '/test2/param?q=test' })).to.throw(
        'missing validator for param "param"'
      );
    });
  });
});
