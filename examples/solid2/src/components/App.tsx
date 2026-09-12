import { Router } from 'reactive-route/solid2';

import { useRouter } from '../router';

export function App() {
  const { router } = useRouter();

  return <Router router={router} />;
}
