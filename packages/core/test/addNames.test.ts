import { describe, expect, it } from 'vitest';

import { addNames } from '../utils/addNames';

describe('addNames', () => {
  it('Correctly adds names', () => {
    expect(addNames({ config1: { data: '' }, config2: { data: '' } })).to.deep.eq({
      config1: { data: '', name: 'config1' },
      config2: { data: '', name: 'config2' },
    });
  });
});
