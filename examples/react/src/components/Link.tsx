import { TypePayload } from 'reactive-route';

import { TypeRoutesProject, useRouter } from '../router';

export function Link<TName extends keyof TypeRoutesProject>(props: {
  payload: TypePayload<TypeRoutesProject, TName>;
  className?: string;
  children?: any;
}) {
  const { router } = useRouter();

  const state = router.payloadToState(props.payload);

  return (
    <a
      href={state.url}
      className={props.className}
      onClick={(event) => {
        event.preventDefault();

        router.redirect(props.payload);
      }}
    >
      {props.children}
    </a>
  );
}
