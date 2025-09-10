import { observer } from 'mobx-react-lite';
import React from 'react';

export const pageName = __dirname.split('/').pop();

const Dynamic: React.FC = observer(() => {
  return <div>Dynamic</div>;
});

export default Dynamic;
