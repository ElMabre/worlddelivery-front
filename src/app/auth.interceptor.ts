import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { from, switchMap, catchError, throwError } from 'rxjs';
import { environment } from '../environments/environment';
import { AuthService } from './auth.service';
export function isApiUrl(value:string):boolean {
  try {
    const url=new URL(value,window.location.origin);
    return [environment.pedidosUrl,environment.rabbitAdminUrl].some(base => {
      const target=new URL(base,window.location.origin);
      return url.origin===target.origin && (url.pathname===target.pathname || url.pathname.startsWith(target.pathname+'/'));
    });
  } catch { return false; }
}
export const authInterceptor: HttpInterceptorFn = (req,next) => {
  if(!isApiUrl(req.url)) return next(req);
  const auth=inject(AuthService);
  return from(auth.token()).pipe(switchMap(token => next(req.clone({setHeaders:{Authorization:`Bearer ${token}`}}))),
    catchError((error:unknown) => { if(error instanceof HttpErrorResponse && error.status===401) auth.invalidate(); return throwError(() => error); }));
};
