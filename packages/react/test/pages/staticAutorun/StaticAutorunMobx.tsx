import { observer } from 'mobx-react-lite';
import { useState } from 'react';
import { TypeRouter } from 'reactive-route';

const StaticAutorun = observer(
  (props: {
    spy_pageRender: () => void;
    spy_pageAutorun: (arg: any) => void;
    router: TypeRouter<any>;
  }) => {
    const { router } = props;

    const currentRoute = router.currentRoute.staticRouteAutorun!;

    props.spy_pageRender();

    useState(() => {
      router.adapters.autorun(() => {
        props.spy_pageAutorun(currentRoute.name);
      });
    });

    return 'StaticAutorun';
  }
);

export default StaticAutorun;
