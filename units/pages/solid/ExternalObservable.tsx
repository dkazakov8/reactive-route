export default function ExternalObservable(props: { store: { value: number } }) {
  return <div>{props.store.value}</div>;
}
