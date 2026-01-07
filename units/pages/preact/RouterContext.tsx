import { createContext } from 'preact';

export const RouterContext = createContext<{ router: any }>({ router: null });
