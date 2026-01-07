<table><tbody><tr>
<td class="table-td">

```ts wrap
name: string
```

</td>
<td>Corresponds to the <code>Config</code> key</td>
</tr><tr>
<td class="table-td">

```ts wrap
params: Record<
  keyof TConfig['params'], 
  string
>
```

</td>
<td>Validated and decoded `params` values. All of them will always be present</td>
</tr><tr>
<td class="table-td">

```ts wrap
query: Partial<Record<
  keyof TConfig['query'], 
  string
>>
```

</td>
<td>Validated and decoded `query` values. All are optional</td>
</tr></tbody>
</table>