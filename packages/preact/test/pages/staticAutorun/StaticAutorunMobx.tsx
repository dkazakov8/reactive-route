// @ts-ignore
import { observer } from 'mobx-preact';
import { useState } from 'preact/hooks';
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
      props.router.adapters.autorun(() => {
        props.spy_pageAutorun(currentRoute.name);
      });
    });

    return 'StaticAutorun';
  }
);

export default StaticAutorun;
