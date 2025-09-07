import { onMount } from 'solid-js';

export interface ViewModelConstructor {
  props?: Record<string, any>;
  beforeMount?: () => void;
  afterMount?: () => void;
}

export function useStore<
  TViewModel extends new (
    props: ConstructorParameters<TViewModel>[0]
  ) => ViewModelConstructor,
>(ViewModel: TViewModel, props: ConstructorParameters<TViewModel>[0]): InstanceType<TViewModel> {
  const vm = new ViewModel(props);

  vm.beforeMount?.();

  onMount(() => {
    vm.afterMount?.();
  });

  return vm as any;
}
