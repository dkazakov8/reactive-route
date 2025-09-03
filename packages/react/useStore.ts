import { runInAction } from 'mobx';
import { useEffect, useRef, useState } from 'react';

export interface ViewModelConstructor {
  autorunDisposers?: Array<() => void>;
  props?: Record<string, any>;
  beforeMount?: () => void;
  afterMount?: () => void;
}

export function useStore<
  TViewModel extends new (
    props: ConstructorParameters<TViewModel>[0]
  ) => ViewModelConstructor,
>(ViewModel: TViewModel, props: ConstructorParameters<TViewModel>[0]): InstanceType<TViewModel> {
  const isFirstRenderRef = useRef(true);

  const [vm] = useState(() => {
    const instance = new ViewModel(props || {});

    runInAction(() => {
      instance.beforeMount?.();
    });

    return instance;
  });

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
    } else if (props) {
      runInAction(() => {
        vm.props = props || {};
      });
    }
  }, [props]);

  useEffect(() => {
    vm.afterMount?.();

    return () => {
      vm.autorunDisposers?.forEach((disposer) => disposer());
    };
  }, []);

  return vm as any;
}
