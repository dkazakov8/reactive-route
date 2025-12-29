import { TypeRouteConfig } from './types';

export function createRoutes<
  TConfig extends {
    [Key in keyof TConfig | 'notFound' | 'internalError']: Omit<
      TypeRouteConfig,
      'name' | 'component' | 'otherExports'
    >;
  },
>(config: TConfig) {
  Object.entries(config).forEach(([key, value]) => {
    (value as any).name = key;
  });

  return config as {
    [Key in keyof TConfig]: TConfig[Key] & {
      name: Key;
      component?: any;
      otherExports?: Record<string, any>;
    };
  };
}
