import { describe, expect, it } from 'vitest';

import { getAdapters } from '../../shared/getAdapters';
import { getRoutes } from '../../shared/getRoutes';
import { allPossibleOptions } from '../../shared/types';
import { createRouter } from '../createRouter';

[allPossibleOptions[0]].forEach((options) => {
  describe(`toCurrentRoute [${options.renderer}+${options.reactivity}]`, async () => {
    const router = createRouter({
      routes: getRoutes(options),
      adapters: await getAdapters(options),
    });

    it('Dynamic params', () => {
      let pathname = router.createRouteState({
        route: 'dynamicRoute',
        params: { static: 'dynamic' },
      }).pathname;

      expect(pathname).to.be.eq('/test/dynamic');

      pathname = router.createRouteState({
        route: 'dynamicRoute3',
        params: { ':static': 'dynamic' },
      }).pathname;

      expect(pathname).to.be.eq('/test4/dynamic');
    });

    it('Dynamic params multiple', () => {
      const pathname = router.createRouteState({
        route: 'dynamicRouteMultiple',
        params: { param: 'dynamic', param2: 'dynamic2' },
      }).pathname;

      expect(pathname).to.be.eq('/test/dynamic/dynamic2');
    });

    it('(error) No dynamic param value', () => {
      expect(() => {
        router.createRouteState({
          route: 'dynamicRoute',
          params: {} as any,
        });
      }).to.throw(`no param "static" passed for route dynamicRoute`);
    });

    it('(error) No dynamic param value multiple', () => {
      expect(() => {
        router.createRouteState({
          route: 'dynamicRouteMultiple',
          params: { param: 'dynamic' } as any,
        });
      }).to.throw(`no param "param2" passed for route dynamicRoute`);
    });

    it('Special symbols', () => {
      const pathname = router.createRouteState({
        route: 'dynamicRoute',
        params: { static: 'шеллы' },
      }).pathname;

      expect(pathname).to.be.eq('/test/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B');
    });
  });
});
