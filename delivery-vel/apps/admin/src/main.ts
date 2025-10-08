import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';

import { AdminAppComponent } from './app/admin-app.component';
import { adminRoutes } from './app/admin.routes';

bootstrapApplication(AdminAppComponent, {
  providers: [
    provideRouter(adminRoutes),
    provideAnimations(),
    provideHttpClient(withInterceptors([])),
  ]
}).catch(err => console.error(err));