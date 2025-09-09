// @ts-ignore
import { observer } from 'kr-observable/react';

export const pageName = __dirname.split('/').pop();

const Dynamic = observer(() => {
  return <div>Dynamic</div>;
});

export default Dynamic;
