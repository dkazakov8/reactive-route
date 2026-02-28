import { observer } from 'kr-observable/preact';

const Error = observer((props: { error: number }) => {
  return <>Error {props.error}</>;
});

export default Error;
