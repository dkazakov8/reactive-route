import { describe, expect, it } from 'vitest';

import { routes } from '../../react/test/routes';
import { getQueryValues } from '../utils/getQueryValues';

describe('getQueryValues', () => {
  it('Should return query from pathname', () => {
    expect(
      getQueryValues({
        route: routes.dynamicRoute,
        pathname: '/test/dynamic',
      })
    ).to.deep.equal({});

    expect(
      getQueryValues({
        route: routes.dynamicRoute,
        pathname: '/test/dynamic?q=t&s=1',
      })
    ).to.deep.equal({});

    expect(
      getQueryValues({
        route: routes.dynamicRoute,
        pathname: '/test/dynamic?q=test',
      })
    ).to.deep.equal({ q: 'test' });

    expect(
      getQueryValues({
        route: routes.dynamicRoute,
        pathname: '/test/dynamic?q=test&s=test2',
      })
    ).to.deep.equal({ q: 'test', s: 'test2' });

    expect(
      getQueryValues({
        route: routes.dynamicRoute,
        pathname: '/test/dynamic?q=test&s=test2&b=1',
      })
    ).to.deep.equal({ q: 'test', s: 'test2' });
  });
});
