import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { EventBus } from '@opensourcekd/ng-common-libs';

export const eventBus = new EventBus({ id: 'mfe-MY_SALES' });

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error("In bootstrap.ts of mfe-MY_SALES",err));
