import { describe, expect, it } from 'vitest';

import { getRoutes } from '../../shared/getRoutes';
import { allPossibleOptions } from '../../shared/types';
import { getInitialRoute } from '../utils/getInitialRoute';

[allPossibleOptions[0]].forEach((options) => {
  const routes = getRoutes(options);

  describe(`getInitialRoute [${options.renderer}+${options.reactivity}]`, () => {
    it('Get correct static route by path', () => {
      expect(getInitialRoute({ routes, pathname: '/test/static' })).to.deep.eq({
        route: 'staticRoute',
        params: {},
        query: {},
        replace: undefined,
      });

      expect(getInitialRoute({ routes, pathname: '/test/static?q=test&bar=non' })).to.deep.eq({
        route: 'staticRoute',
        params: {},
        query: { q: 'test' },
        replace: undefined,
      });
    });

    it('Get correct dynamic route by path', () => {
      expect(getInitialRoute({ routes, pathname: '/test/foo' })).to.deep.eq({
        route: 'dynamicRoute',
        params: { static: 'foo' },
        query: {},
        replace: undefined,
      });

      expect(getInitialRoute({ routes, pathname: '/test/foo?q=test' })).to.deep.eq({
        route: 'dynamicRoute',
        params: { static: 'foo' },
        query: { q: 'test' },
        replace: undefined,
      });
    });

    it('Fallback', () => {
      expect(getInitialRoute({ routes, pathname: '/testX/static' })).to.deep.eq({
        route: 'notFound',
        params: {},
        query: {},
        replace: undefined,
      });

      expect(getInitialRoute({ routes, pathname: '/testX/foo' })).to.deep.eq({
        route: 'notFound',
        params: {},
        query: {},
        replace: undefined,
      });
    });
  });
});
