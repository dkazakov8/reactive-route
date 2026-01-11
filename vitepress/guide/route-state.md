# Route State

The basic idea is covered in the [Core Concepts](/guide/core-concepts) section.

## API

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
<td>An indicator that this route is active and the relevant page component is rendered</td>
</tr><tr>
<td><code>props?</code></td>
<td class="table-td">

```ts
Record<string, any>
```

</td>
<td>Static props from Route <code>Config</code></td>
</tr></tbody>
</table>

## Encoding

In Reactive Route the router handles the process of encoding and decoding in this way:

For example, the user comes to the website with a path: `/test/with%20space?q=and%26symbols`.

`hydrateFromURL` calls `createRoutePayload` which finds the corresponding `Config` and produces the following `Payload`
with auto-redirecting to it:

```ts
{
  route: 'test', 
  params: { id: 'with space' },
  query: { q: 'and&symbols' }
}
```

Then a `State` is produced by `createRoutePayload` in `router.state.test`:

```ts
{
  isActive: true,
  name: 'test',
  params: { id: 'with space' },
  pathname: '/test/with%20space',
  props: undefined,
  query: { q: 'and&symbols' },
  search: 'q=and%26symbols',
  url: '/test/with%20space?q=and%26symbols'
}
```

So, the process is double-sided. `createRoutePayload` validates and decodes, while `createRouteState`
validates and encodes to ensure safety, prevent malformed values and produce correct URLs.
