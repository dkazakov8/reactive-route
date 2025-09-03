import { observer } from 'mobx-react-lite';

export const pageName = __dirname.split('/').pop();

const Dynamic = observer(() => {
  return <div>Dynamic</div>;
});

export default Dynamic;
