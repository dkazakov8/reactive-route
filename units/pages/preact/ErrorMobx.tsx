// @ts-expect-error
import { observer } from 'mobx-preact';

const Error = observer((props: { error: number }) => {
  return `Error ${props.error}`;
});

export default Error;
