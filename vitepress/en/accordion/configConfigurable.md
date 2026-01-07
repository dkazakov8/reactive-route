<table><tbody><tr>
<td class="table-td">

```ts wrap
path: string
```

</td><td>
Route path, must start with <code>/</code> and may include dynamic segments
</td></tr><tr>
<td class="table-td">

```ts wrap
props?: Record<string, any>
```

</td><td>
Static props passed to the page component
</td></tr><tr>
<td class="table-td">

```ts wrap
params?: Record<
  TypeExtractParams<TPath>,
  (value: string) => boolean
>
```

</td><td>
Validators for dynamic path segments
</td></tr><tr>
<td class="table-td">

```ts wrap
query?: Record<
  string,
  (value: string) => boolean
>
```

</td><td>
Validators for `query` parameters
</td></tr><tr>
<td class="table-td">

```ts wrap
loader: () => Promise<{
  default: PageComponent,
  ...otherExports
}>
```

</td><td>
Function that returns a Promise with the component in the <code>default</code> property
</td></tr><tr>
<td class="table-td">

```ts wrap
beforeEnter?: (data: {
  reason: TypeReason;
  nextState: TypeStateUntyped;
  currentState?: TypeStateUntyped;
  redirect: (
    stateDynamic: 
      TypeStateDynamicUntyped & 
      { replace?: boolean; }
  ) => void;
}) => Promise<void | (
  TypeStateDynamicUntyped & 
  { replace?: boolean; }
)>;
```

</td><td>
Lifecycle function called before redirecting to the page
</td></tr><tr>
<td class="table-td">

```ts wrap
beforeLeave?: (data: {
  reason: TypeReason;
  nextState: TypeStateUntyped;
  currentState: TypeStateUntyped;
  preventRedirect: () => void;
}) => Promise<void>;
```

</td><td>
Lifecycle function called before leaving the page
</td></tr>
</tbody></table>