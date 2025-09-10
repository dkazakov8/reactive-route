import { describe, expect, it } from 'vitest';

import { routesMobx } from '../../react/test/routesMobx';
import { findRouteByPathname } from '../utils/findRouteByPathname';

describe('findRouteByPathname', () => {
  it('Get correct static route by path', () => {
    const route = findRouteByPathname({ routes: routesMobx, pathname: '/test/static' });

    expect(route).to.deep.eq(routesMobx.staticRoute);

    const route2 = findRouteByPathname({ routes: routesMobx, pathname: '/test/static?q=test' });

    expect(route2).to.deep.eq(routesMobx.staticRoute);
  });

  it('Get correct static route by path with slash', () => {
    const route = findRouteByPathname({ routes: routesMobx, pathname: '/test/static/' });

    expect(route).to.deep.eq(routesMobx.staticRoute);

    const route2 = findRouteByPathname({ routes: routesMobx, pathname: '/test/static/?q=test' });

    expect(route2).to.deep.eq(routesMobx.staticRoute);
  });

  it('Get correct dynamic route by path', () => {
    const route = findRouteByPathname({ routes: routesMobx, pathname: '/test3/123' });

    expect(route).to.deep.eq(routesMobx.dynamicRoute2);

    const route2 = findRouteByPathname({ routes: routesMobx, pathname: '/test4/123/' });

    expect(route2).to.deep.eq(routesMobx.dynamicRoute3);

    const route3 = findRouteByPathname({ routes: routesMobx, pathname: '/test3/123?q=test' });

    expect(route3).to.deep.eq(routesMobx.dynamicRoute2);

    const route4 = findRouteByPathname({ routes: routesMobx, pathname: '/test4/123/?q=test' });

    expect(route4).to.deep.eq(routesMobx.dynamicRoute3);
  });

  it('Pass empty param to dynamic route (no route found)', () => {
    const route = findRouteByPathname({
      routes: routesMobx,
      pathname: '/test/',
    });

    expect(route).to.be.undefined;

    const route2 = findRouteByPathname({
      routes: routesMobx,
      pathname: '/test/?q=test',
    });

    expect(route2).to.be.undefined;
  });

  it('Pass invalid pathname (no route found)', () => {
    const route = findRouteByPathname({
      routes: routesMobx,
      pathname: '/wrongpath',
    });

    expect(route).to.be.undefined;

    const route2 = findRouteByPathname({
      routes: routesMobx,
      pathname: '/wrongpath?q=test',
    });

    expect(route2).to.be.undefined;
  });

  it('Param not passed validator (no route found)', () => {
    const route = findRouteByPathname({
      routes: routesMobx,
      pathname: '/test/p',
    });

    expect(route).to.be.undefined;

    const route2 = findRouteByPathname({
      routes: routesMobx,
      pathname: '/test/p?q=test',
    });

    expect(route2).to.be.undefined;
  });

  it('(error) No validators', () => {
    expect(() =>
      findRouteByPathname({
        routes: routesMobx,
        pathname: '/test2/param',
      })
    ).to.throw('findRoute: missing validator for param ":param"');

    expect(() =>
      findRouteByPathname({
        routes: routesMobx,
        pathname: '/test2/param?q=test',
      })
    ).to.throw('findRoute: missing validator for param ":param"');
  });
});
