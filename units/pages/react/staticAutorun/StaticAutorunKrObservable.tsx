import { observer } from 'kr-observable/react';
import { useContext, useState } from 'react';

import { RouterContext } from '../RouterContext';

const StaticAutorun = observer(
  (props: { spy_pageRender: () => void; spy_pageAutorun: (arg: any) => void }) => {
    const { router } = useContext(RouterContext);
    const { adapters } = router.getGlobalArguments();

    const currentRoute = router.state.staticRouteAutorun!;

    props.spy_pageRender();

    useState(() => {
      adapters.autorun(() => {
        props.spy_pageAutorun(currentRoute.name);
      });
    });

    return 'StaticAutorun';
  }
);

export default StaticAutorun;
