import { TypeRouteRaw } from './types';

export function createRoutes<
  TConfig extends { [Key in keyof TConfig | 'notFound' | 'internalError']: TypeRouteRaw },
>(config: TConfig) {
  Object.entries(config).forEach(([key, value]) => {
    (value as any).name = key;
  });

  return config as {
    [Key in keyof TConfig]: TConfig[Key] & {
      name: Key;
      pageId?: string;
      component?: any;
      otherExports?: Record<string, any>;
    };
  };
}
