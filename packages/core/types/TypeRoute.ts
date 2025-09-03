import { TypeRouteRaw } from './TypeRouteRaw';

export type TypeRoute = TypeRouteRaw & {
  name: string;
  pageName?: string;
  component?: any;
  otherExports?: Record<string, any>;
};
