import { ApplicationConfig } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from '@org/core-services';

import { routes } from './app.routes';
import { DataService } from './services/data.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withHashLocation()), 
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: 'DataService', useClass: DataService }
  ]
};
