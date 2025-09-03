import { describe, expect, it } from 'vitest';

import { constants } from '../utils/constants';

describe('constants', () => {
  it('Correct constants', () => {
    expect(constants).to.deep.eq({
      dynamicSeparator: ':',
      pathPartSeparator: '/',
      isClient: false,
      errorRedirect: 'REDIRECT',
      errorPrevent: 'PREVENT_REDIRECT',
    });
  });
});
