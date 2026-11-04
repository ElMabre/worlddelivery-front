# World Delivery | Frontend

Aplicación Angular 22 para gestionar pedidos y administrar recursos de RabbitMQ. Utiliza componentes standalone, Angular Router y AWS Amplify. Las peticiones al backend pasan por la REST API de World Delivery.

## Desarrollo

Desde la raíz del frontend, con Node.js y npm instalados:

```powershell
npm ci
npm start
```

El servidor de desarrollo escucha en `http://localhost:4200/`. Para usar Cognito, esta URL debe figurar entre los callbacks y las URL de cierre de sesión del app client.

| Ruta | Función |
|---|---|
| `/login` | Acceso mediante Cognito con flujo de código de autorización y login administrado en español |
| `/pedidos` | Listado, creación, actualización de estado y eliminación según los scopes de la sesión |
| `/rabbit-admin` | Alta y baja de colas, exchanges y bindings, y consulta de una cola por nombre |
| `/sin-permiso` | Destino de una sesión que carece del scope administrativo |

## Configuración

`src/environments/environment.ts` configura el desarrollo. Ambas API usan el stage `Deploy1_Ev` con las rutas `/api/pedidos` y `/api/rabbitmq`. Durante el build de producción, Angular sustituye este archivo por `environment.production.ts`. Antes de publicar, configura allí el origen HTTPS definitivo de CloudFront para los redirects de entrada y salida y regístralo en Cognito.

`AuthService` gestiona la sesión. El interceptor agrega el access token a las peticiones dirigidas a las API configuradas. La autorización efectiva corresponde a API Gateway y a cada microservicio. La configuración compilada y los recursos en `public/` y `src/assets/` son públicos.

## Pruebas y compilación

```powershell
npm test -- --watch=false
npm run build
```

Los archivos que se publican están en `dist/worlddelivery-front/browser/`. El servidor de archivos debe devolver `index.html` al recargar las rutas de Angular.
