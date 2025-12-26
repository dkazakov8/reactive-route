import { routerTests } from '../../shared/routerTests';

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
