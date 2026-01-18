// @ts-ignore
import { observer } from 'kr-observable/preact';

const Error = observer((props: { errorNumber: number }) => {
  return `Error ${props.errorNumber}`;
});

export default Error;
