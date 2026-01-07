<table><tbody><tr>
<td class="table-td">

```ts wrap
path: string
```

</td><td>
Путь маршрута, должен начинаться с <code>/</code> и может включать динамические сегменты
</td></tr><tr>
<td class="table-td">

```ts wrap
props?: Record<string, any>
```

</td><td>
Статичные props, передаваемые в компонент страницы
</td></tr><tr>
<td class="table-td">

```ts wrap
params?: Record<
  TypeExtractParams<TPath>,
  (value: string) => boolean
>
```

</td><td>
Валидаторы для динамических сегментов path
</td></tr><tr>
<td class="table-td">

```ts wrap
query?: Record<
  string,
  (value: string) => boolean
>
```

</td><td>
Валидаторы для query параметров
</td></tr><tr>
<td class="table-td">

```ts wrap
loader: () => Promise<{
  default: PageComponent,
  ...otherExports
}>
```

</td><td>
Функция, возвращающая Promise с компонентом в параметре <code>default</code>
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
Функция жизненного цикла, вызываемая перед редиректом на страницу
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
Функция жизненного цикла, вызываемая перед уходом со страницы
</td></tr>
</tbody></table>