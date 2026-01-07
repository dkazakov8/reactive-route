<table><tbody><tr>
<td class="table-td">

```ts wrap
configs: ReturnType<typeof createConfigs>
```

</td>
<td>Объект с <code>Configs</code></td>
</tr><tr>
<td class="table-td">

```ts wrap
adapters: TypeAdapters
```

</td>
<td>Адаптеры для системы реактивности</td>
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
<td>Глобальная функция жизненного цикла, которая выполняется только при изменении компонента (не страницы!)</td>
</tr></tbody>
</table>