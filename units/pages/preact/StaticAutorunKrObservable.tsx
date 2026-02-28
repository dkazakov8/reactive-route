import { observer } from 'kr-observable/preact';
import { useContext, useEffect, useState } from 'preact/hooks';

import { RouterContext } from './RouterContext';

const StaticAutorun = observer(
  (props: { spy_pageRender: () => void; spy_pageAutorun: (arg: any) => void }) => {
    const { router } = useContext(RouterContext);
    const { adapters } = router.getGlobalArguments();

    const currentState = router.state.autorun!;

    props.spy_pageRender();

    const [disposer] = useState(() => {
      return adapters.autorun(() => {
        props.spy_pageAutorun(currentState.name);
      });
    });

    // biome-ignore lint/correctness/useExhaustiveDependencies: false
    useEffect(() => {
      return () => {
        disposer?.();
      };
    }, []);

    return <>StaticAutorun</>;
  }
);

export default StaticAutorun;
