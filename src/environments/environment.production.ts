export const environment = {
  production: true,
  pedidosUrl: 'https://owpdy1tbaj.execute-api.us-east-1.amazonaws.com/Deploy1_Ev/api/pedidos',
  usuariosUrl: 'https://owpdy1tbaj.execute-api.us-east-1.amazonaws.com/Deploy1_Ev/api/usuarios',
  rabbitAdminUrl: 'https://owpdy1tbaj.execute-api.us-east-1.amazonaws.com/Deploy1_Ev/api/rabbitmq',
  cognito: {
    userPoolId: 'us-east-1_oTG1RQi5f',
    userPoolClientId: 'sdeamtb3pnutncs1kql17mtq',
    domain: 'us-east-1otg1rqi5f.auth.us-east-1.amazoncognito.com',
    redirectSignIn: ['https://54.156.80.92/'],
    redirectSignOut: ['https://54.156.80.92/'],
    scopes: ['openid','email','profile','resource-server-worlddelivery/api-access',
      'resource-server-worlddelivery/write','resource-server-worlddelivery/update',
      'resource-server-worlddelivery/delete','resource-server-worlddelivery/admin'],
  },
  adminScope: 'resource-server-worlddelivery/admin',
};
