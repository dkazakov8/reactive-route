import { routerTests } from '../../../testHelpers/routerTests';

routerTests([
  {
    renderer: 'preact',
    reactivity: 'mobx',
  },
  {
    renderer: 'preact',
    reactivity: 'kr-observable',
  },
]);
