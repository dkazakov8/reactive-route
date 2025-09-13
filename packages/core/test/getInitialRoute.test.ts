import { describe, expect, it } from 'vitest';

import { routesMobx } from '../../react/test/routesMobx';
import { getInitialRoute } from '../utils/getInitialRoute';

describe('getInitialRoute', () => {
  it('Get correct static route by path', () => {
    expect(
      getInitialRoute({
        routes: routesMobx,
        pathname: '/test/static',
      })
    ).to.deep.eq({ route: 'staticRoute', params: {}, query: {} });

    expect(
      getInitialRoute({
        routes: routesMobx,
        pathname: '/test/static?q=test&bar=non',
      })
    ).to.deep.eq({ route: 'staticRoute', params: {}, query: { q: 'test' } });
  });

  it('Get correct dynamic route by path', () => {
    expect(
      getInitialRoute({
        routes: routesMobx,
        pathname: '/test/foo',
      })
    ).to.deep.eq({ route: 'dynamicRoute', params: { static: 'foo' }, query: {} });

    expect(
      getInitialRoute({
        routes: routesMobx,
        pathname: '/test/foo?q=test',
      })
    ).to.deep.eq({ route: 'dynamicRoute', params: { static: 'foo' }, query: { q: 'test' } });
  });

  it('Fallback', () => {
    expect(
      getInitialRoute({
        routes: routesMobx,
        pathname: '/testX/static',
      })
    ).to.deep.eq({ route: 'notFound', params: {}, query: {} });

    expect(
      getInitialRoute({
        routes: routesMobx,
        pathname: '/testX/foo',
      })
    ).to.deep.eq({ route: 'notFound', params: {}, query: {} });
  });
});
