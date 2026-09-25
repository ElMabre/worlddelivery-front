# World Delivery - Frontend

Aplicación Single Page Application (SPA) construida en Angular, correspondiente a la capa frontend de la plataforma de logística World Delivery. Este proyecto se integra con Amazon Cognito para la gestión de identidad y consume un backend protegido en Spring Boot a través de Amazon API Gateway.

## Arquitectura y Tecnologías

- **Framework:** Angular
- **Autenticación:** AWS Amplify + Amazon Cognito
- **Flujo de Seguridad:** OAuth 2.0 / OIDC (Authorization Code Grant con PKCE)
- **Integración Backend:** Amazon API Gateway + Interceptor HTTP para inyección automática de Bearer Token (JWT)

## Prerrequisitos

- Node.js y npm instalados.
- Angular CLI instalado globalmente (`npm install -g @angular/cli`).
- Entorno backend operativo (instancia EC2 con Spring Boot y API Gateway configurado).

## Configuración de AWS Cognito

Antes de ejecutar el proyecto, asegúrate de que las credenciales de tu User Pool y App Client público estén correctamente configuradas en el archivo `src/main.ts`:

```typescript
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: '<USER_POOL_ID>',
      userPoolClientId: '<APP_CLIENT_ID>',
      loginWith: {
        oauth: {
          domain: '<COGNITO_DOMAIN>',
          scopes: ['email', 'openid', 'profile', 'resource-server-worlddelivery/api-access'],
          redirectSignIn: ['http://localhost:4200'],
          redirectSignOut: ['http://localhost:4200'],
          responseType: 'code'
        }
      }
    }
  }
});
```

> **Nota:** Las URLs de redirección (`localhost:4200`) deben estar explícitamente autorizadas en la consola de AWS Cognito (*Allowed callback URLs* / *Allowed sign-out URLs*).

## Ejecución Local (Desarrollo)

1. Instala las dependencias del proyecto:

   ```bash
   npm install
   ```

2. Levanta el servidor de desarrollo:

   ```bash
   ng serve
   ```

   La aplicación estará disponible en `http://localhost:4200/`. El servidor recargará la vista automáticamente al detectar cambios en el código.

## Construcción para Producción

Para compilar los artefactos estáticos optimizados y subirlos a una instancia EC2 (Nginx) o un bucket S3:

```bash
ng build
```

Los archivos minificados listos para despliegue se generarán en el directorio `dist/`.
