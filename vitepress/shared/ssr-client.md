import { App } from './App';
import { unescapeAllStrings } from './utils/unescapeAllStrings';

const router = getRouter();

await router.hydrateFromState({
  state: unescapeAllStrings((window as any).ROUTER_STATE)
});