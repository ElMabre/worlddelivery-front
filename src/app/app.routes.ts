import { Component } from '@angular/core';
import { Routes, RouterLink } from '@angular/router';
import { authGuard, adminGuard } from './auth.guard';
import { Login } from './login';
@Component({imports:[RouterLink],template:'<section class="card"><h2>Acceso restringido</h2><p>Tu sesión no tiene permisos de administración.</p><a routerLink="/pedidos">Volver a pedidos</a></section>'})
export class SinPermiso {}
export const routes:Routes=[
  {path:'login',component:Login},
  {path:'pedidos',canActivate:[authGuard],loadComponent:() => import('./pedidos').then(m => m.Pedidos)},
  {path:'rabbit-admin',canActivate:[authGuard,adminGuard],loadComponent:() => import('./rabbit-admin').then(m => m.RabbitAdmin)},
  {path:'usuarios',canActivate:[authGuard,adminGuard],loadComponent:() => import('./usuarios').then(m => m.Usuarios)},
  {path:'pedidos-inactivos',canActivate:[authGuard,adminGuard],loadComponent:() => import('./pedidos-inactivos').then(m => m.PedidosInactivos)},
  {path:'sin-permiso',component:SinPermiso,canActivate:[authGuard]},
  {path:'',redirectTo:'pedidos',pathMatch:'full'},
  {path:'**',redirectTo:'pedidos'},
];
