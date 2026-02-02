```ts
const configs = createConfigs({
  user: {
    path: '/user/:id',
    params: { id: validators.numeric },
    
    // imagine we have a nested route here
    children: {
      default: {
        // [!code error]
        // :id collision with parent
        path: 'default/:id',
        
        // [!code error]
        // validator schema collision with parent
        params: { id: validators.notNumeric },
        loader: () => import('./pages/user'),
      },
      
      // [!code error]
      // name collision with parent
      user: {
        // [!code error]
        // :id collision with parent
        path: 'view/:id',
        
        // [!code error]
        // validator schema collision with parent
        params: { id: validators.alphaNumeric },
        loader: () => import('./pages/user/view'),
      }
    }
  },
});

// try to extend the configs
configs.extend({
  parent: 'user.user',
  children: {
    default: {
      // [!code error]
      // path collision with parent path: 'view/:id'
      path: 'default/:id',

      // [!code error]
      // validator schema collision with parent
      params: { id: validators.notNumeric },

      // [!code error]
      // component collision with parent
      loader: () => import('./pages/user'),
    }
  }
}
```