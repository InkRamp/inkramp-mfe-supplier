import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { BearerTokenInterceptor, APP_CONFIG, STORAGE_KEYS } from '@opensourcekd/ng-common-libs';

import { routes } from './app.routes';

function initBearerTokenInterceptor(): () => void {
  return () => {
    const interceptor = BearerTokenInterceptor.getInstance('mfe-MY_SALES', {
      apiUrl: APP_CONFIG.apiUrl,
      getToken: () => sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN),
    });
    interceptor.activate();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()),
    provideHttpClient(),
    {
      provide: APP_INITIALIZER,
      useFactory: initBearerTokenInterceptor,
      multi: true,
    },
  ]
};
