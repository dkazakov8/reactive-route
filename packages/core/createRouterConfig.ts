import { TypeRouteRaw } from './types/TypeRouteRaw';
import { addNames } from './utils/addNames';

export function createRouterConfig<
  TConfig extends { [Key in keyof TConfig | 'notFound' | 'internalError']: TypeRouteRaw },
>(
  config: TConfig
): {
  [Key in keyof TConfig]: TConfig[Key] & {
    name: Key;
    pageName?: string;
    component?: any;
    otherExports?: Record<string, any>;
  };
} {
  return addNames(config);
}
