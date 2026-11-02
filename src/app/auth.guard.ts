import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
export const authGuard: CanActivateFn = async (_route,state) => {
  const auth=inject(AuthService); const router=inject(Router);
  return await auth.refresh() ? true : router.createUrlTree(['/login'],{queryParams:{returnUrl:state.url}});
};
export const adminGuard: CanActivateFn = async () => {
  const auth=inject(AuthService); const router=inject(Router);
  await auth.refresh(); return auth.admin() ? true:router.createUrlTree(['/sin-permiso']);
};
