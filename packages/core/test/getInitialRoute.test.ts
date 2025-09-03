import { describe, expect, it } from 'vitest';

import { routes } from '../../react/test/routes';
import { getInitialRoute } from '../utils/getInitialRoute';

describe('getInitialRoute', () => {
  it('Get correct static route by path', () => {
    expect(
      getInitialRoute({
        routes,
        pathname: '/test/static',
        fallback: 'error404',
      })
    ).to.deep.eq({ route: 'staticRoute', params: {}, query: {} });

    expect(
      getInitialRoute({
        routes,
        pathname: '/test/static?q=test&bar=non',
        fallback: 'error404',
      })
    ).to.deep.eq({ route: 'staticRoute', params: {}, query: { q: 'test' } });
  });

  it('Get correct dynamic route by path', () => {
    expect(
      getInitialRoute({
        routes,
        pathname: '/test/foo',
        fallback: 'error404',
      })
    ).to.deep.eq({ route: 'dynamicRoute', params: { static: 'foo' }, query: {} });

    expect(
      getInitialRoute({
        routes,
        pathname: '/test/foo?q=test',
        fallback: 'error404',
      })
    ).to.deep.eq({ route: 'dynamicRoute', params: { static: 'foo' }, query: { q: 'test' } });
  });

  it('Fallback', () => {
    expect(
      getInitialRoute({
        routes,
        pathname: '/testX/static',
        fallback: 'error404',
      })
    ).to.deep.eq({ route: 'error404', params: {}, query: {} });

    expect(
      getInitialRoute({
        routes,
        pathname: '/testX/foo',
        fallback: 'error404',
      })
    ).to.deep.eq({ route: 'error404', params: {}, query: {} });
  });
});
