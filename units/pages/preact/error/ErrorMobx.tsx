// @ts-expect-error
import { observer } from 'mobx-preact';

const Error = observer((props: { errorNumber: number }) => {
  return `Error ${props.errorNumber}`;
});

export default Error;
