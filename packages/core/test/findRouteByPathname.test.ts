import { describe, expect, it } from 'vitest';

import { getRoutes } from '../../shared/helpers';
import { allPossibleOptions } from '../../shared/types';
import { findRouteByPathname } from '../utils/findRouteByPathname';

[allPossibleOptions[0]].forEach((options) => {
  const routes = getRoutes(options);

  describe(`findRouteByPathname [${options.renderer}+${options.reactivity}]`, () => {
    it('Get correct static route by path', () => {
      const route = findRouteByPathname({ routes: routes, pathname: '/test/static' });

      expect(route).to.deep.eq(routes.staticRoute);

      const route2 = findRouteByPathname({ routes: routes, pathname: '/test/static?q=test' });

      expect(route2).to.deep.eq(routes.staticRoute);
    });

    it('Get correct static route by path with slash', () => {
      const route = findRouteByPathname({ routes: routes, pathname: '/test/static/' });

      expect(route).to.deep.eq(routes.staticRoute);

      const route2 = findRouteByPathname({ routes: routes, pathname: '/test/static/?q=test' });

      expect(route2).to.deep.eq(routes.staticRoute);
    });

    it('Get correct dynamic route by path', () => {
      const route = findRouteByPathname({ routes: routes, pathname: '/test3/123' });

      expect(route).to.deep.eq(routes.dynamicRoute2);

      const route2 = findRouteByPathname({ routes: routes, pathname: '/test4/123/' });

      expect(route2).to.deep.eq(routes.dynamicRoute3);

      const route3 = findRouteByPathname({ routes: routes, pathname: '/test3/123?q=test' });

      expect(route3).to.deep.eq(routes.dynamicRoute2);

      const route4 = findRouteByPathname({ routes: routes, pathname: '/test4/123/?q=test' });

      expect(route4).to.deep.eq(routes.dynamicRoute3);
    });

    it('Pass empty param to dynamic route (no route found)', () => {
      const route = findRouteByPathname({
        routes: routes,
        pathname: '/test/',
      });

      expect(route).to.be.undefined;

      const route2 = findRouteByPathname({
        routes: routes,
        pathname: '/test/?q=test',
      });

      expect(route2).to.be.undefined;
    });

    it('Pass invalid pathname (no route found)', () => {
      const route = findRouteByPathname({
        routes: routes,
        pathname: '/wrongpath',
      });

      expect(route).to.be.undefined;

      const route2 = findRouteByPathname({
        routes: routes,
        pathname: '/wrongpath?q=test',
      });

      expect(route2).to.be.undefined;
    });

    it('Param not passed validator (no route found)', () => {
      const route = findRouteByPathname({
        routes: routes,
        pathname: '/test/p',
      });

      expect(route).to.be.undefined;

      const route2 = findRouteByPathname({
        routes: routes,
        pathname: '/test/p?q=test',
      });

      expect(route2).to.be.undefined;
    });

    it('(error) No validators', () => {
      expect(() =>
        findRouteByPathname({
          routes: routes,
          pathname: '/test2/param',
        })
      ).to.throw('findRoute: missing validator for param ":param"');

      expect(() =>
        findRouteByPathname({
          routes: routes,
          pathname: '/test2/param?q=test',
        })
      ).to.throw('findRoute: missing validator for param ":param"');
    });
  });
});
