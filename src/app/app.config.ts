import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './auth.interceptor';
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_oTG1RQi5f',
      userPoolClientId: 'sdeamtb3pnutncs1kql17mtq',
      loginWith: {
        oauth: {
          domain: 'us-east-1otg1rqi5f.auth.us-east-1.amazoncognito.com',
          scopes: ['openid', 'email', 'resource-server-worlddelivery/api-access'],
          redirectSignIn: ['http://localhost:4200'],
          redirectSignOut: ['http://localhost:4200'],
          responseType: 'code'
        }
      }
    }
  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        authInterceptor
      ])
    )
  ]
};