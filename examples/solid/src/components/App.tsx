import { Router } from 'reactive-route/solid';
import { useContext } from 'solid-js';

import { RouterContext } from '../router';

export function App() {
  const { router } = useContext(RouterContext);

  return <Router router={router} />;
}
