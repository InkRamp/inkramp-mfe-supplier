const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({

  name: 'mfeMySales',

  exposes: {
    './Component': './src/app/app.component.ts',
  },

  // shared: {
  //   ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
  // },
  shared: {
    '@angular/core': { singleton: true, strictVersion: true, requiredVersion: '18.2.13' },
    '@angular/common': { singleton: true, strictVersion: true, requiredVersion: '18.2.13' },
    '@angular/common/http': { singleton: true, strictVersion: true, requiredVersion: '18.2.13' },
    '@org/core-services': { singleton: true, strictVersion: true, requiredVersion: 'auto' },
    '@opensourcekd/ng-common-libs': { singleton: true, strictVersion: true, requiredVersion: '^2.2.0' },
    'rxjs': { singleton: true, strictVersion: true, requiredVersion: '7.8.0' },
    'zone.js': { singleton: true, strictVersion: true, requiredVersion: '~0.14.3' },
  },

});
