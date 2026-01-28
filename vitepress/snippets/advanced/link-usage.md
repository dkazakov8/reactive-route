::: code-group
```tsx [React]
<Link
  payload={{
    name: 'user',
    params: { id: '9999' },
    query: { phone: '123456' }
  }} 
  className={'link-class'} 
/>

<LinkProps
  name={'user'}
  params={{ id: '9999' }}
  query={{ phone: '123456' }}
  className={'link-class'}
/>
```
```tsx [Preact]
<Link
  payload={{
    name: 'user',
    params: { id: '9999' },
    query: { phone: '123456' }
  }} 
  className={'link-class'} 
/>

<LinkProps
  name={'user'}
  params={{ id: '9999' }}
  query={{ phone: '123456' }}
  className={'link-class'}
/>
```
```tsx [Solid]
<Link
  payload={{
    name: 'user',
    params: { id: '9999' },
    query: { phone: '123456' }
  }} 
  class={'link-class'} 
/>

<LinkProps
  name={'user'}
  params={{ id: '9999' }}
  query={{ phone: '123456' }}
  class={'link-class'}
/>
```
```vue [Vue]
<template>
  <Link
    :payload="{
      name: 'user',
      params: { id: '9999' },
      query: { phone: '123456' }
    }"
    class="link-class"
  />
  
  <LinkProps 
    name="user" 
    :params="{ id: '9999' }" 
    :query="{ phone: '123456' }" 
    class="link-class"
  />
</template>
```
:::