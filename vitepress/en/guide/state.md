# State

The general purpose is described in the [Core Concepts](/en/guide/core-concepts) section.

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
<td>Matches the key used in the configs object</td>
</tr><tr>
<td><code>params</code></td>
<td class="table-td">

```ts
Record<
  keyof TConfig['params'], 
  string
>
```

</td>
<td>Validated and decoded path parameters. All keys defined in the <code>Config</code> validators
will be present</td>
</tr><tr>
<td><code>query</code></td>
<td class="table-td">

```ts
Partial<Record<
  keyof TConfig['query'], 
  string
>>
```

</td>
<td>Validated and decoded query parameters. All query parameters are optional</td>
</tr><tr>
<td><code>pathname</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>The encoded pathname</td>
</tr><tr>
<td><code>search</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>The encoded search (query) string</td>
</tr><tr>
<td><code>url</code></td>
<td class="table-td">

```ts
string
```

</td>
<td>The full encoded URL: <code>${pathname}?${search}</code></td>
</tr><tr>
<td><code>isActive</code></td>
<td class="table-td">

```ts
boolean
```

</td>
<td>Indicates whether this route's page component is currently rendered or scheduled to render in the
next tick</td>
</tr><tr>
<td><code>props?</code></td>
<td class="table-td">

```ts
TConfig['props']
```

</td>
<td>Static properties defined in the <code>Config</code></td>
</tr></tbody>
</table>

## Types

### TypeState

<<< @/../packages/core/types.ts#type-state{typescript}

