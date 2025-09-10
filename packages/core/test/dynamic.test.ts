import { describe, expect, it } from 'vitest';

import { routesMobx } from '../../react/test/routesMobx';
import { clearDynamic, isDynamic, isDynamicRoute } from '../utils/dynamic';

describe('isDynamic', () => {
  it('Correctly detects', () => {
    expect(isDynamic('test')).to.eq(false);
    expect(isDynamic('t:e:s:t:')).to.eq(false);
    expect(isDynamic(':test')).to.eq(true);
    expect(isDynamic(':t:e:s:t:')).to.eq(true);
    expect(isDynamic('::t:e:s:t:')).to.eq(true);
  });
});

describe('clearDynamic', () => {
  it('Correctly clears', () => {
    expect(clearDynamic('test')).to.eq('test');
    expect(clearDynamic('t:e:s:t:')).to.eq('t:e:s:t:');
    expect(clearDynamic('test')).to.eq('test');
    expect(clearDynamic(':t:e:s:t:')).to.eq('t:e:s:t:');
    expect(clearDynamic('::t:e:s:t:')).to.eq(':t:e:s:t:');
  });
});

describe('isDynamicRoute', () => {
  it('Correctly detects', () => {
    expect(isDynamicRoute(routesMobx.staticRoute)).to.eq(false);
    expect(isDynamicRoute(routesMobx.dynamicRoute)).to.eq(true);
  });
});
