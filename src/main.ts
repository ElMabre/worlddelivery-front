import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_oTG1RQi5f',
      userPoolClientId: 'sdeamtb3pnutncs1kql17mtq',
      loginWith: {
        oauth: {
          domain: 'us-east-1otg1rqi5f.auth.us-east-1.amazoncognito.com', 
          scopes: [
            'email',
            'openid',
            'profile',
            'resource-server-worlddelivery/api-access'
          ],
          redirectSignIn: ['http://localhost:4200'],
          redirectSignOut: ['http://localhost:4200'],
          responseType: 'code'
        }
      }
    }
  }
});

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));