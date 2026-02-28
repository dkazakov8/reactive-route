import { observer } from 'mobx-react-lite';

const Error = observer((props: { error: number }) => {
  return `Error ${props.error}`;
});

export default Error;
