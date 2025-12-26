import { describe, expect, it } from 'vitest';

import { getRoutes } from '../../shared/getRoutes';
import { allPossibleOptions } from '../../shared/types';
import { getQueryValues } from '../utils/getQueryValues';

[allPossibleOptions[0]].forEach((options) => {
  const routes = getRoutes(options);

  describe(`getQueryValues [${options.renderer}+${options.reactivity}]`, () => {
    it('Should return query from pathname', () => {
      expect(getQueryValues({ route: routes.dynamicRoute, pathname: '' })).to.deep.equal({});

      expect(getQueryValues({ route: routes.dynamicRoute2, pathname: '/test3/asd' })).to.deep.equal(
        {}
      );

      expect(
        getQueryValues({ route: routes.dynamicRoute, pathname: '/test/dynamic' })
      ).to.deep.equal({});

      expect(
        getQueryValues({ route: routes.dynamicRoute, pathname: '/test/dynamic?q=t&s=1' })
      ).to.deep.equal({});

      expect(
        getQueryValues({ route: routes.dynamicRoute, pathname: '/test/dynamic?q=test' })
      ).to.deep.equal({ q: 'test' });

      expect(
        getQueryValues({ route: routes.dynamicRoute, pathname: '/test/dynamic?q=test&s=test2' })
      ).to.deep.equal({ q: 'test', s: 'test2' });

      expect(
        getQueryValues({ route: routes.dynamicRoute, pathname: '/test/dynamic?q=test&s=test2&b=1' })
      ).to.deep.equal({ q: 'test', s: 'test2' });
    });
  });
});
