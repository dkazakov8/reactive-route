import { routerTests } from '../../shared/routerTests';

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
