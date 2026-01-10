// @ts-ignore
import { observer } from 'kr-observable/preact';
import { TypeRouter } from 'packages/core';
import { useState } from 'preact/hooks';

const StaticAutorun = observer(
  (props: {
    spy_pageRender: () => void;
    spy_pageAutorun: (arg: any) => void;
    router: TypeRouter<any>;
  }) => {
    const { router } = props;
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
