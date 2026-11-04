export const environment = {
  production: false,
  pedidosUrl: 'https://owpdy1tbaj.execute-api.us-east-1.amazonaws.com/Deploy1_Ev/api/pedidos',
  rabbitAdminUrl: 'https://owpdy1tbaj.execute-api.us-east-1.amazonaws.com/Deploy1_Ev/api/rabbitmq',
  cognito: {
    userPoolId: 'us-east-1_oTG1RQi5f',
    userPoolClientId: 'sdeamtb3pnutncs1kql17mtq',
    domain: 'us-east-1otg1rqi5f.auth.us-east-1.amazoncognito.com',
    redirectSignIn: ['http://localhost:4200/'],
    redirectSignOut: ['http://localhost:4200/'],
    scopes: ['openid','email','profile','resource-server-worlddelivery/api-access',
      'resource-server-worlddelivery/write','resource-server-worlddelivery/update',
      'resource-server-worlddelivery/delete','resource-server-worlddelivery/admin'],
  },
  adminScope: 'resource-server-worlddelivery/admin',
};
