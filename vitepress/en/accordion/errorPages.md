<!-- @include: @shared/introduction/defineRoutesErrorsLibraries.md -->

In routing libraries, the syntax for defining error pages often differs greatly from 
"regular pages", and their presence is optional, which in some cases leads to rendering
a blank page. 

In **Reactive Route**, they are required to ensure stability, but you are allowed to define
only `path`, `loader`, and `props`. You can navigate to them normally with `router.redirect({ name: 'notFound' })`.


`internalError` will be rendered without replacing the URL in browser history on unhandled 
lifecycle exceptions or a page chunk loading error. **Reactive Route** acts here as 
the "last line of defense" and provides additional consistency for the application.
