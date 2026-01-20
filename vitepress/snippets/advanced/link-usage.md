::: code-group
```tsx [React]
<Link 
  name={'user'} 
  params={{ id: '9999' }} 
  query={{ phone: '123456' }} 
  className={'link-class'} 
/>

<LinkPayload 
  payload={{
    name: 'user',
    params: { id: '9999' },
    query: { phone: '123456' }
  }} 
  className={'link-class'} 
/>
```
```tsx [Preact]
<Link 
  name={'user'} 
  params={{ id: '9999' }} 
  query={{ phone: '123456' }} 
  className={'link-class'} 
/>

<LinkPayload 
  payload={{
    name: 'user',
    params: { id: '9999' },
    query: { phone: '123456' }
  }} 
  className={'link-class'} 
/>
```
```tsx [Solid]
<Link 
  name={'user'} 
  params={{ id: '9999' }} 
  query={{ phone: '123456' }} 
  class={'link-class'} 
/>

<LinkPayload 
  payload={{
    name: 'user',
    params: { id: '9999' },
    query: { phone: '123456' }
  }} 
  class={'link-class'} 
/>
```
```vue [Vue]
<template>
  <Link 
    name="user" 
    :params="{ id: '9999' }" 
    :query="{ phone: '123456' }" 
    class="link-class"
  />
  
  <LinkPayload 
    :payload="{
      name: 'user',
      params: { id: '9999' },
      query: { phone: '123456' }
    }" 
    class="link-class" 
  />
</template>
```
:::