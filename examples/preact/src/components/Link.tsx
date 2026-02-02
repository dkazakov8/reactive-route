import { TypePayload } from 'reactive-route';

import { TypeConfigsProject, useRouter } from '../router';

export function Link<TName extends keyof TypeConfigsProject>(props: {
  payload: TypePayload<TypeConfigsProject, TName>;
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
