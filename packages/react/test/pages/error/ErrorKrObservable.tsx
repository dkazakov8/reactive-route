// @ts-ignore
import { observer } from 'kr-observable/react';

const Error = observer((props: { errorNumber: number }) => {
  return `Error ${props.errorNumber}`;
});

export default Error;
