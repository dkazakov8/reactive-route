import { describe, expect, it } from 'vitest';

import { getRoutes } from '../../shared/getRoutes';
import { allPossibleOptions } from '../../shared/types';
import { getDynamicValues } from '../utils/getDynamicValues';

[allPossibleOptions[0]].forEach((options) => {
  const routes = getRoutes(options);

  describe(`getDynamicValues [${options.renderer}+${options.reactivity}]`, () => {
    it('Should return params from pathname', () => {
      const params = getDynamicValues({
        route: routes.dynamicRoute,
        pathname: '/test/dynamic',
      });

      expect(params).to.deep.equal({ static: 'dynamic' });

      const params2 = getDynamicValues({
        route: routes.dynamicRoute3,
        pathname: '/test4/dynamic',
      });

      expect(params2).to.deep.equal({ ':static': 'dynamic' });

      const params3 = getDynamicValues({
        route: routes.dynamicRoute,
        pathname: '/test/dynamic?q=test',
      });

      expect(params3).to.deep.equal({ static: 'dynamic' });

      const params4 = getDynamicValues({
        route: routes.dynamicRoute3,
        pathname: '/test4/dynamic?q=test',
      });

      expect(params4).to.deep.equal({ ':static': 'dynamic' });
    });

    it('Should return multi params from pathname', () => {
      const params = getDynamicValues({
        route: routes.dynamicRouteMultiple,
        pathname: '/test/dynamic/dynamic2',
      });

      expect(params).to.deep.equal({ param: 'dynamic', param2: 'dynamic2' });

      const params2 = getDynamicValues({
        route: routes.dynamicRouteMultiple,
        pathname: '/test/dynamic/dynamic2?q=test',
      });

      expect(params2).to.deep.equal({ param: 'dynamic', param2: 'dynamic2' });
    });

    it('Should return empty params', () => {
      const params = getDynamicValues({
        route: routes.staticRoute,
        pathname: '/test/static',
      });

      expect(params).to.be.empty;

      const params2 = getDynamicValues({
        route: routes.staticRoute,
        pathname: '/test/static?q=test',
      });

      expect(params2).to.be.empty;
    });

    it('Special symbols', () => {
      const params = getDynamicValues({
        route: routes.dynamicRouteMultiple,
        pathname: '/test/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B/%3Fx%3Dtest',
      });

      expect(params).to.deep.equal({ param: 'шеллы', param2: '?x=test' });
    });
  });
});
