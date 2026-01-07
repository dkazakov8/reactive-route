import { Router } from 'reactive-route/react';

import { useRouter } from '../router';

export function App() {
  const { router } = useRouter();

  return <Router router={router} />;
}
