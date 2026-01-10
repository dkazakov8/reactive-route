import { useContext } from 'react';
import { Router } from 'reactive-route/react';

import { RouterContext } from '../router';

export function App() {
  const { router } = useContext(RouterContext);

  return <Router router={router} />;
}
