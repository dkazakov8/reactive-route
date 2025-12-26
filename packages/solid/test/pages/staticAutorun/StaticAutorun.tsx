import { TypeRouter } from 'reactive-route';

export default function StaticAutorun(props: {
  spy_pageRender: () => void;
  spy_pageAutorun: (arg: any) => void;
  router: TypeRouter<any>;
}) {
  props.spy_pageRender();

  props.router.getGlobalArguments().adapters.autorun(() => {
    props.spy_pageAutorun(props.router.state.staticRouteAutorun!.name);
  });

  return 'StaticAutorun';
}
