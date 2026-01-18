import { observer } from 'mobx-react-lite';

const Error = observer((props: { errorNumber: number }) => {
  return `Error ${props.errorNumber}`;
});

export default Error;
