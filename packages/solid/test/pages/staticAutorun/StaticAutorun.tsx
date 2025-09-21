import { TypeRouter } from 'reactive-route';

export default function StaticAutorun(props: {
  renderSpy: () => void;
  autorunSpy: (arg: any) => void;
  router: TypeRouter<any>;
}) {
  props.renderSpy();

  props.router.adapters.autorun(() => {
    props.autorunSpy(props.router.currentRoute.name);
  });

  return 'StaticAutorun';
}
