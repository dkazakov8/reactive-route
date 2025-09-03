export const pageName = __dirname.split('/').pop();

function Error(props: { errorNumber: number }) {
  return <>Error {props.errorNumber}</>;
}

export default Error;
