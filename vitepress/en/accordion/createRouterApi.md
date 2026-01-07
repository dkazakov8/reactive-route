<table><tbody><tr>
<td class="table-td">

```ts wrap
configs: ReturnType<typeof createConfigs>
```

</td>
<td>Object with <code>Configs</code></td>
</tr><tr>
<td class="table-td">

```ts wrap
adapters: TypeAdapters
```

</td>
<td>Adapters for the reactivity system</td>
</tr><tr>
<td class="table-td">

```ts wrap
beforeComponentChange?: (params: {
  prevState?: TypeState;
  prevConfig?: TypeConfig;

  currentState: TypeState;
  currentConfig: TypeConfig;
}) => void
```

</td>
<td>Global lifecycle function that runs only when the component changes (not the page!)</td>
</tr></tbody>
</table>