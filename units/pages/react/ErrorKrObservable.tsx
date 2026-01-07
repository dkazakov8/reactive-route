import { observer } from 'kr-observable/react';

const Error = observer((props: { error: number }) => {
  return `Error ${props.error}`;
});

export default Error;
