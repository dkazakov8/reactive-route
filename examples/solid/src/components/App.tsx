import { Router } from 'reactive-route/solid';

import { useRouter } from '../router';

export function App() {
  const { router } = useRouter();

  return <Router router={router} />;
}
