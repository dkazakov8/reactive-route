import { describe, expect, it } from 'vitest';

import { constants } from '../utils/constants';

describe.runIf(constants.isClient)('Client constants', () => {
  it('Correct', () => {
    expect(constants).to.deep.eq({ isClient: true });
  });
});

describe.runIf(!constants.isClient)('SSR constants', () => {
  it('Correct', () => {
    expect(constants).to.deep.eq({ isClient: false });
  });
});
