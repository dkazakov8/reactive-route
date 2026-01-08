module.exports = {
  hooks: {
    readPackage: (pkg, context) => {
      if (pkg.name.startsWith('reactive-route-')) {
        pkg.dependencies['reactive-route'] = 'link:../../dist';
        context.log(`Linked reactive-route to local dist for ${pkg.name}`);
      }

      return pkg;
    },
  },
};
