import { routerTests } from '../../../testHelpers/routerTests';

routerTests([
  {
    renderer: 'react',
    reactivity: 'mobx',
  },
  {
    renderer: 'react',
    reactivity: 'kr-observable',
  },
]);
