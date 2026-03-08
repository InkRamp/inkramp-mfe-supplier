import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { EventBus, AuthService, APP_CONFIG } from '@opensourcekd/ng-common-libs';
import { bearerTokenInterceptor } from '@org/core-services';

const MFE_ID = 'mfe-MY_SALES';
const AUTH_CALLBACK_PATH = '/i17e';

// Create EventBus instance before bootstrap with MFE identifier
const eventBus = new EventBus({ id: MFE_ID });

// Create AuthService instance with configuration from library's APP_CONFIG
const authService = new AuthService(
  {
    domain: APP_CONFIG.auth0Domain,
    clientId: APP_CONFIG.auth0ClientId,
    audience: APP_CONFIG.apiUrl,
    redirectUri: `${window.location.origin}${AUTH_CALLBACK_PATH}`,
    logoutUri: `${window.location.origin}${AUTH_CALLBACK_PATH}`,
    scope: 'openid profile email',
  },
  eventBus,
  undefined, // storageConfig - use defaults
  undefined, // storageKeys - use defaults
  { id: MFE_ID } // options - provide id for debugging
);

export { eventBus };

// In standalone mode, Auth0 redirects back with ?code=...&state=... after login.
// We detect the callback URL params and call the public handleCallback() before Angular
// renders any components, so auth0_access_token is stored in sessionStorage before
// SalesHistoryComponent fires loadIncentives() and the bearer interceptor runs.
const urlParams = new URLSearchParams(window.location.search);
const hasAuthCallback = urlParams.has('code') && urlParams.has('state');

const authCallbackPromise: Promise<unknown> = hasAuthCallback
  ? authService.handleCallback()
  : Promise.resolve();

authCallbackPromise
  .then(() =>
    bootstrapApplication(AppComponent, {
      providers: [
        provideRouter(routes, withHashLocation()),
        provideHttpClient(withInterceptors([bearerTokenInterceptor])),
        { provide: EventBus, useValue: eventBus },
        { provide: AuthService, useValue: authService },
      ],
    })
  )
  .catch((err) => console.error('In bootstrap.ts of mfe-MY_SALES', err));
