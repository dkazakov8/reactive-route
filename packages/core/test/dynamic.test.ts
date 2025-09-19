import { describe, expect, it } from 'vitest';

import { getRoutes } from '../../shared/helpers';
import { allPossibleOptions } from '../../shared/types';
import { clearDynamic, isDynamic, isDynamicRoute } from '../utils/dynamic';

[allPossibleOptions[0]].forEach((options) => {
  const routes = getRoutes(options);

  describe(`Dynamic utils [${options.renderer}+${options.reactivity}]`, () => {
    it('isDynamic: correctly detects', () => {
      expect(isDynamic('test')).to.eq(false);
      expect(isDynamic('t:e:s:t:')).to.eq(false);
      expect(isDynamic(':test')).to.eq(true);
      expect(isDynamic(':t:e:s:t:')).to.eq(true);
      expect(isDynamic('::t:e:s:t:')).to.eq(true);
    });

    it('clearDynamic: correctly clears', () => {
      expect(clearDynamic('test')).to.eq('test');
      expect(clearDynamic('t:e:s:t:')).to.eq('t:e:s:t:');
      expect(clearDynamic('test')).to.eq('test');
      expect(clearDynamic(':t:e:s:t:')).to.eq('t:e:s:t:');
      expect(clearDynamic('::t:e:s:t:')).to.eq(':t:e:s:t:');
    });

    it('isDynamicRoute: correctly detects', () => {
      expect(isDynamicRoute(routes.staticRoute)).to.eq(false);
      expect(isDynamicRoute(routes.dynamicRoute)).to.eq(true);
    });
  });
});
