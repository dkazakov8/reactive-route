import { useContext } from 'solid-js';

import { RouterContext } from './RouterContext';

export default function StaticAutorun(props: {
  spy_pageRender: (props?: any) => void;
  spy_pageAutorun: (arg: any) => void;
}) {
  const { router } = useContext(RouterContext);

  props.spy_pageRender(props);

  router.getGlobalArguments().adapters.autorun(() => {
    props.spy_pageAutorun(router.state.autorun!.name);
  });

  return 'StaticAutorun';
}
