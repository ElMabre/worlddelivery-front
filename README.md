# World Delivery — Frontend

Angular 22 standalone sin Zone.js. Proyecto renombrado a worlddelivery-front; interfaz actualizada mediante signals.

## Ejecutar

```powershell
npm ci
npm start
npm run build
npm test -- --watch=false
```

ng serve usa src/environments/environment.ts; ng build usa environment.production.ts. Desarrollo apunta a localhost:8080/api/pedidos y localhost:8082/api/rabbitmq. Sustituir REEMPLAZAR en producción por API Gateway (incluyendo stage) y CloudFront antes de publicar. Se conservaron los identificadores públicos de Cognito existentes.

Los environments son públicos al compilar. Nunca incluir client secret, contraseñas o access tokens. Angular no carga .env automáticamente. El app client del navegador debe ser público y sin secret.

## Rutas y permisos

- Shell: sesión, logout, navegación y router-outlet.
- /login: Authorization Code mediante Amplify y listener OAuth. Callbacks idénticos a environments, incluida barra final.
- /pedidos: guard de sesión, listado, creación, cambio de estado y borrado confirmado.
- /rabbit-admin: sesión y scope admin; crear y eliminar colas, exchanges y bindings, y consultar una cola por nombre. No simula un listado global.
- /sin-permiso: mensaje de falta de permiso administrativo.

El interceptor adjunta el access token solo a las APIs configuradas, comparando origen y límites del path. Un 401 limpia el estado y lleva al login; un 403 muestra falta de permisos. Guards y botones no sustituyen la autorización de Spring y API Gateway.

El login solicita también resource-server-worlddelivery/admin. Cognito todavía debe permitirlo: si falta, el proveedor puede rechazar el login. Habilitar un scope en un cliente compartido no distingue usuarios administradores; restringir su emisión o añadir control de grupo en la integración final.

## Verificación

Pruebas locales con mocks de Amplify y HTTP: shell, guards, límite del interceptor, 401, scopes, errores de login/logout, formulario, errores de escritura, cancelación de borrado y codificación de #. No llaman a AWS. Callbacks y permisos reales quedan para la prueba final.

Salida: dist/worlddelivery-front/browser. CloudFront debe enviar errores 403/404 a /index.html con respuesta 200, solo en la distribución del frontend.

Referencias: [guards Angular](https://angular.dev/api/router/CanActivateFn), [eventos Amplify](https://docs.amplify.aws/angular/build-a-backend/auth/connect-your-frontend/listen-to-auth-events/).

## Defensa en cinco líneas

1. Separé sesión, shell y vistas para mantener responsabilidades claras.
2. Definí interfaces y servicios HTTP para respetar el contrato del backend.
3. Usé guards y scopes para mostrar las operaciones según permisos.
4. Mostré errores y confirmé borrados para que las acciones sean comprensibles.
5. Probé los flujos localmente y dejé Cognito para la integración final.
