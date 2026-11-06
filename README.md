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
| `/pedidos` | Listado, creación (incluyendo atajo `[ERROR-DLQ]`), edición, actualización de estado y eliminación según los scopes y rol de la sesión |
| `/rabbit-admin` | Monitoreo de las 6 colas de negocio y DLQ, alta, baja y purga de colas, exchanges y bindings |
| `/usuarios` | Usuarios, roles y bajas en Cognito, requiere grupo Admin |
| `/pedidos-inactivos` | Consulta administrativa de pedidos desactivados |
| `/sin-permiso` | Destino de una sesión que carece del rol o scope administrativo |

## Configuración

`src/environments/environment.ts` configura el desarrollo. Las API usan el stage `Deploy1_Ev` con las rutas `/api/pedidos`, `/api/usuarios` y `/api/rabbitmq`. Durante el build de producción, Angular sustituye este archivo por `environment.production.ts`. Antes de publicar, configura allí el origen HTTPS definitivo de CloudFront o EC2 para los redirects de entrada y salida y regístralo en Cognito.

`AuthService` gestiona la sesión. El interceptor agrega el access token a las peticiones dirigidas a las API configuradas. La autorización efectiva corresponde a API Gateway y a cada microservicio. La configuración compilada y los recursos en `public/` y `src/assets/` son públicos.

## Pruebas y compilación

```powershell
npm test -- --watch=false
npm run build
```

Los archivos que se publican están en `dist/worlddelivery-front/browser/`. El servidor de archivos debe devolver `index.html` al recargar las rutas de Angular.

## Roles y edición

`AuthService` distingue los grupos Admin y Usuario del access token. La navegación administrativa requiere Admin. Las API de usuarios, administración de RabbitMQ y pedidos inactivos requieren el grupo Admin y el scope administrativo. Tras asignar un grupo en Cognito, renovar la sesión para obtener el claim actualizado.

Pedidos permite filtrar por ID exacto, cargar datos de prueba `[ERROR-DLQ]` y editar todos sus campos. En un pedido ENTREGADO, el formulario bloquea los datos hasta seleccionar otro estado. Guardar envía los datos y el nuevo estado juntos mediante PUT. La baja conserva el registro para la vista de pedidos inactivos.

La propiedad `usuariosUrl` de los dos environments apunta a `/api/usuarios` en el stage `Deploy1_Ev`. El interceptor añade el access token solo a las tres API configuradas.
