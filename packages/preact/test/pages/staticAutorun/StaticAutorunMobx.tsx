// @ts-ignore
import { observer } from 'mobx-preact';
import { useState } from 'preact/hooks';
import { TypeRouter } from 'reactive-route';

const StaticAutorun = observer(
  (props: { renderSpy: () => void; autorunSpy: (arg: any) => void; router: TypeRouter<any> }) => {
    props.renderSpy();

    useState(() => {
      props.router.adapters.autorun(() => {
        props.autorunSpy(props.router.currentRoute.name);
      });
    });

    return 'StaticAutorun';
  }
);

export default StaticAutorun;
