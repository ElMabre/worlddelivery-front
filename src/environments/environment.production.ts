// Identificadores publicos; nunca incluir client secrets ni tokens en Angular.
export const environment = {
  production: true,
  pedidosUrl: 'https://REEMPLAZAR.execute-api.us-east-1.amazonaws.com/prod/api/pedidos',
  rabbitAdminUrl: 'https://REEMPLAZAR.execute-api.us-east-1.amazonaws.com/prod/api/rabbitmq',
  cognito: {
    userPoolId: 'us-east-1_oTG1RQi5f',
    userPoolClientId: 'sdeamtb3pnutncs1kql17mtq',
    domain: 'us-east-1otg1rqi5f.auth.us-east-1.amazoncognito.com',
    redirectSignIn: ['https://REEMPLAZAR.cloudfront.net/'],
    redirectSignOut: ['https://REEMPLAZAR.cloudfront.net/'],
    scopes: ['openid','email','profile','resource-server-worlddelivery/api-access',
      'resource-server-worlddelivery/write','resource-server-worlddelivery/update',
      'resource-server-worlddelivery/delete','resource-server-worlddelivery/admin'],
  },
  adminScope: 'resource-server-worlddelivery/admin',
};
