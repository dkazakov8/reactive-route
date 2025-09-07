import { TypeLifecycleConfig } from './TypeLifecycleConfig';
import { TypeValidator } from './TypeValidator';

export type TypeRouteRaw = {
  path: string;
  loader: () => Promise<{ default: any }>;
  props?: Record<string, any>;
  query?: Record<string, TypeValidator>;
  params?: Record<string, TypeValidator>;
  beforeEnter?: (config: TypeLifecycleConfig, ...args: Array<any>) => Promise<any>;
  beforeLeave?: (config: TypeLifecycleConfig, ...args: Array<any>) => Promise<any> | null;
};
