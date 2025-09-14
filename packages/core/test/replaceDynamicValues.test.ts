import { describe, expect, it } from 'vitest';

import { getRoutes } from '../../shared/helpers';
import { replaceDynamicValues } from '../utils/replaceDynamicValues';

const routes = getRoutes({ renderer: 'react', reactivity: 'mobx' });

describe('replaceDynamicValues', () => {
  it('Dynamic params', () => {
    const pathname = replaceDynamicValues({
      route: routes.dynamicRoute,
      params: { static: 'dynamic' },
    });

    expect(pathname).to.be.eq('/test/dynamic');

    const pathname2 = replaceDynamicValues({
      route: routes.dynamicRoute3,
      params: { ':static': 'dynamic' },
    });

    expect(pathname2).to.be.eq('/test4/dynamic');
  });

  it('Dynamic params multiple', () => {
    const pathname = replaceDynamicValues({
      route: routes.dynamicRouteMultiple,
      params: { param: 'dynamic', param2: 'dynamic2' },
    });

    expect(pathname).to.be.eq('/test/dynamic/dynamic2');
  });

  it('(error) No dynamic param value', () => {
    expect(() => {
      replaceDynamicValues({
        route: routes.dynamicRoute,
        params: {} as any,
      });
    }).to.throw(`replaceDynamicValues: no param ":static" passed for route dynamicRoute`);
  });

  it('(error) No dynamic param value multiple', () => {
    expect(() => {
      replaceDynamicValues({
        route: routes.dynamicRouteMultiple,
        params: { param: 'dynamic' } as any,
      });
    }).to.throw(`replaceDynamicValues: no param ":param2" passed for route dynamicRoute`);
  });

  it('Special symbols', () => {
    const pathname = replaceDynamicValues({
      route: routes.dynamicRoute,
      params: { static: 'шеллы' },
    });

    expect(pathname).to.be.eq('/test/%D1%88%D0%B5%D0%BB%D0%BB%D1%8B');
  });
});
