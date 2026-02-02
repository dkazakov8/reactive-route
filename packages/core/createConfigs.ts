import { TypeConfig, TypeConfigConfigurable } from './types';

export function createConfigs<
  const TConfig extends {
    [K in keyof TConfig]: TypeConfigConfigurable<
      TConfig[K] extends { path: infer P extends string } ? P : string
    >;
  } & {
    notFound: Omit<TypeConfig, 'name' | 'component' | 'otherExports' | 'params' | 'query'>;
    internalError: Omit<TypeConfig, 'name' | 'component' | 'otherExports' | 'params' | 'query'>;
  },
>(
  config: TConfig
): {
  [Key in keyof TConfig]: TConfig[Key] & {
    name: Key;
    component?: TypeConfig['component'];
    otherExports?: TypeConfig['otherExports'];
  };
} {
  Object.entries(config).forEach(([key, value]) => {
    (value as any).name = key;
  });

  return config as any;
}
