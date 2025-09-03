import { TypeRouteRaw } from './types/TypeRouteRaw';
import { addNames } from './utils/addNames';

type TypeRouteItemFinalGeneric<TConfig extends { [Key in keyof TConfig]: TypeRouteRaw }> = {
  [Key in keyof TConfig]: TConfig[Key] & {
    name: Key;
    pageName?: string;
    component?: any;
    otherExports?: Record<string, any>;
  };
};

export function createRouterConfig<
  TConfig extends {
    [Key in keyof TConfig]: TypeRouteRaw;
  },
>(config: TConfig): TypeRouteItemFinalGeneric<TConfig> {
  return addNames(config);
}
