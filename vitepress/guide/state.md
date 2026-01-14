# State

The basic idea is covered in the [Core Concepts](/guide/core-concepts) section.

## Properties

<table>
  <thead><tr><th>Property</th><th>Type</th><th>Description</th></tr></thead>
  <tbody><tr>
<td><code>name</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>Equal to the object key</td>
</tr><tr>
<td><code>params</code></td>
<td class="table-td">

```ts
Record<string, string>
```

</td>
<td>Validated and decoded params values</td>
</tr><tr>
<td><code>query</code></td>
<td class="table-td">

```ts
Record<string, string>
```

</td>
<td>Validated and decoded query values</td>
</tr><tr>
<td><code>pathname</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>Encoded string for pathname</td>
</tr><tr>
<td><code>search</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>Encoded string for search</td>
</tr><tr>
<td><code>url</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>Encoded string for <code>${pathname}?${search}</code></td>
</tr><tr>
<td><code>isActive</code></td>
<td class="table-td">

```ts
boolean
```

</td>
<td>An indicator that the relevant page component is rendered or will be rendered in the next tick</td>
</tr><tr>
<td><code>props?</code></td>
<td class="table-td">

```ts
Record<string, any>
```

</td>
<td>Static props from <code>Config</code></td>
</tr></tbody>
</table>

