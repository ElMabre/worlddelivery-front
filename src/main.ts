import { bootstrapApplication } from '@angular/platform-browser';
import { Amplify } from 'aws-amplify';
import 'aws-amplify/auth/enable-oauth-listener';
import { environment } from './environments/environment';
import { appConfig } from './app/app.config';
import { App } from './app/app';
const auth=environment.cognito;
Amplify.configure({ Auth: { Cognito: {
  userPoolId: auth.userPoolId, userPoolClientId: auth.userPoolClientId,
  loginWith: { oauth: { domain: auth.domain, scopes: auth.scopes,
    redirectSignIn: auth.redirectSignIn, redirectSignOut: auth.redirectSignOut, responseType: 'code' } }
} } });
bootstrapApplication(App, appConfig).catch(() => {
  document.body.textContent='No se pudo iniciar World Delivery. Revisa la configuración y vuelve a cargar.';
});
