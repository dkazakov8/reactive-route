// import { adapters as adapters1 } from 'lib/adapters/kr-observable-preact';
// import { adapters as adapters2 } from 'lib/adapters/kr-observable-react';
// import { adapters as adapters3 } from 'lib/adapters/kr-observable-solid';
// import { adapters as adapters4 } from 'lib/adapters/mobx-preact';
// import { adapters as adapters5 } from 'lib/adapters/mobx-react';
// import { adapters as adapters6 } from 'lib/adapters/mobx-solid';
// import { adapters as adapters7 } from 'lib/adapters/solid';
// import { Router } from 'lib/preact';
// import { Router } from 'lib/react';
// import { Router } from 'lib/solid';

import { createRouter, createRoutes } from 'reactive-route';
import { adapters as adapters1 } from 'reactive-route/adapters/kr-observable-preact';
import { describe, expect, it } from 'vitest';

describe('tsNode16', () => {
  it('Imports work', () => {
    expect(typeof createRouter).to.deep.eq('function');
  });
});
