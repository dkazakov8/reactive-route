export const pageName = __dirname.split('/').pop();

export default function Error(props: { errorNumber: number }) {
  return <>Error {props.errorNumber}</>;
}
