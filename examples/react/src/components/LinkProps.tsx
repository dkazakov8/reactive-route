import { TypePayload } from 'reactive-route';

import { TypeRoutesProject, useRouter } from '../router';

export function LinkProps<TName extends keyof TypeRoutesProject>(
  props: TypePayload<TypeRoutesProject, TName> & {
    className?: string;
    children?: any;
  }
) {
  const { router } = useRouter();

  const payload = {
    name: props.name,
    query: 'query' in props ? props.query : undefined,
    params: 'params' in props ? props.params : undefined,
  } as TypePayload<TypeRoutesProject, TName>;

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
