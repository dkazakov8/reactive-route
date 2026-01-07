::: code-group
```tsx [React]
<Link to={{ name: 'user', params: { id: '1' }, query: { phone: '1' } }} />

<LinkProps name={'user'} params={{ id: '1' }} query={{ phone: '1' }} />
```
```tsx [Preact]
<Link to={{ name: 'user', params: { id: '1' }, query: { phone: '1' } }} />

<LinkProps name={'user'} params={{ id: '1' }} query={{ phone: '1' }} />
```
```tsx [Solid]
<Link to={{ name: 'user', params: { id: '1' }, query: { phone: '1' } }} />

<LinkProps name={'user'} params={{ id: '1' }} query={{ phone: '1' }} />
```
```vue [Vue]
<template>
  
<Link :to="{ name: 'user', params: { id: '1' }, query: { phone: '1' } }" />
  
<LinkProps name="user" :params="{ id: '1' }" :query="{ phone: '1' }" />
  
</template>
```
:::