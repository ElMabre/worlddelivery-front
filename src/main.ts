import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { Amplify } from 'aws-amplify';

Amplify.configure({
  Auth:{
    Cognito:{
      userPoolId: 'us-east-1_opOG7hsM7',
      userPoolClientId : '2sih6u5tqlerpggsiorlpnf8i4',
      loginWith:{
        oauth:{
          domain: 'us-east-1opog7hsm7.auth.us-east-1.amazoncognito.com',
          scopes:[
            'email',
            'openid',
            'profile',
            'rs-api-pedidos/pedidos-read'
          ],
          redirectSignIn:[
            'http://localhost:4200'
          ],
          redirectSignOut:[
            'http://localhost:4200'
          ],
          responseType:'code'
        }
      }
    }
  }
});

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
