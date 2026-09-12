/** @jsxImportSource @solidjs/web2 */

export default function ExternalObservable(props: { store: { value: number } }) {
  return <div>{props.store.value}</div>;
}
