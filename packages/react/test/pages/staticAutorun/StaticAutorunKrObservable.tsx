// @ts-ignore
import { observer } from 'kr-observable/react';
import { useState } from 'react';
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
