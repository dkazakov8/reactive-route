// @ts-expect-error
import { observer } from 'mobx-preact';

const Dynamic = observer(() => {
  return <div>Dynamic</div>;
});

export default Dynamic;
