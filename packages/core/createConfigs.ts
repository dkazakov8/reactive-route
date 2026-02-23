import { TypeConfigsExtended, TypeConfigurableConfigs } from './types';

export function createConfigs<
  const TConfigConfigurable extends TypeConfigurableConfigs<TConfigConfigurable>,
>(configs: TConfigConfigurable): TypeConfigsExtended<TConfigConfigurable> {
  Object.entries(configs).forEach(([name, config]) => {
    (config as any).name = name;

    if (!(config as any).props) (config as any).props = {};
  });

  return configs as any;
}
