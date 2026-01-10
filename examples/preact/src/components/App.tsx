import { useContext } from 'preact/hooks';
import { Router } from 'reactive-route/preact';

import { RouterContext } from '../router';

export function App() {
  const { router } = useContext(RouterContext);

  return <Router router={router} />;
}
