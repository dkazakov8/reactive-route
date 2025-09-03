import { onMount } from 'solid-js';

export interface ViewModelConstructor {
  props?: Record<string, any>;
  beforeMount?: () => void;
  afterMount?: () => void;
}

const getAllProperties = (object: Record<string, any>) => {
  const properties = new Set();

  do {
    for (const key of Reflect.ownKeys(object)) {
      properties.add([object, key]);
    }
    // @ts-ignore
    // biome-ignore lint/style/noParameterAssign: false
  } while ((object = Reflect.getPrototypeOf(object)) && object !== Object.prototype);

  return properties;
};

function autoBind<TSelf extends Record<string, any>>(self: TSelf): TSelf {
  // @ts-ignore
  for (const [object, key] of getAllProperties(self.constructor.prototype)) {
    if (key === 'constructor') continue;

    const descriptor = Reflect.getOwnPropertyDescriptor(object, key);
    if (descriptor && typeof descriptor.value === 'function') {
      // @ts-ignore
      self[key] = self[key].bind(self);
    }
  }

  return self;
}

export function useStore<
  TViewModel extends new (
    props: ConstructorParameters<TViewModel>[0]
  ) => ViewModelConstructor,
>(ViewModel: TViewModel, props: ConstructorParameters<TViewModel>[0]): InstanceType<TViewModel> {
  const vm = new ViewModel(props);

  autoBind(vm);

  vm.beforeMount?.();

  onMount(() => {
    vm.afterMount?.();
  });

  return vm as any;
}
