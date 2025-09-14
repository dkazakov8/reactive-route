// @ts-ignore
import { observer } from 'mobx-preact';

export const pageName = __dirname.split('/').pop();

const Error = observer((props: { errorNumber: number }) => {
  return `Error ${props.errorNumber}`;
});

export default Error;
