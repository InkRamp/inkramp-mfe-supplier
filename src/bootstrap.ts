import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { eventBus } from './event-bus';

export { eventBus };

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error("In bootstrap.ts of mfe-MY_SALES",err));
