import { describe, expect, it } from 'vitest';

import { constants } from '../utils/constants';

describe.runIf(constants.isClient)('Client tests', () => {
  it('Correct constants', () => {
    expect(constants).to.deep.eq({
      dynamicSeparator: ':',
      pathPartSeparator: '/',
      isClient: true,
      errorRedirect: 'REDIRECT',
      errorPrevent: 'PREVENT_REDIRECT',
    });
  });
});

describe.runIf(!constants.isClient)('Client tests', () => {
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
