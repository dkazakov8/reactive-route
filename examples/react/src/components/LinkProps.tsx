import { TypePayload } from 'reactive-route';

import { TypeConfigsProject, useRouter } from '../router';

export function LinkProps<TName extends keyof TypeConfigsProject>(
  props: TypePayload<TypeConfigsProject, TName> & {
    className?: string;
    children?: any;
  }
) {
  const { router } = useRouter();

  const payload = {
    name: props.name,
    query: 'query' in props ? props.query : undefined,
    params: 'params' in props ? props.params : undefined,
  } as TypePayload<TypeConfigsProject, TName>;

  const state = router.payloadToState(payload);

  return (
    <a
      href={state.url}
      className={props.className}
      onClick={(event) => {
        event.preventDefault();

        router.redirect(payload);
      }}
    >
      {props.children}
    </a>
  );
}
