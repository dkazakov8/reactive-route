import { observer } from 'mobx-react-lite';

const Error = observer((props: { errorCode: number }) => {
  return `Error ${props.errorCode}`;
});

export default Error;
