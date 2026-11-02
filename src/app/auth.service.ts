import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { fetchAuthSession, signInWithRedirect, signOut } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { environment } from '../environments/environment';
@Injectable({providedIn:'root'})
export class AuthService {
  private router=inject(Router);
  readonly usuario=signal('');
  readonly autenticado=signal(false);
  readonly verificando=signal(true);
  readonly error=signal('');
  private scopes=signal<string[]>([]);
  readonly admin=computed(() => this.scopes().includes(environment.adminScope));
  private pending: Promise<boolean> | undefined;
  constructor() {
    const cancel=Hub.listen('auth', ({payload}) => {
      if (payload.event==='signedIn') void this.refresh().then(ok => { if(ok) void this.router.navigateByUrl(this.returnPath()); });
      if (payload.event==='signedOut') this.invalidate();
      if (payload.event==='signInWithRedirect_failure') { this.error.set('No se pudo completar el inicio de sesión. Inténtalo nuevamente.'); this.verificando.set(false); }
    });
    inject(DestroyRef).onDestroy(cancel);
  }
  hasScope(name:string) { return this.scopes().includes('resource-server-worlddelivery/'+name); }
  refresh(): Promise<boolean> {
    if(this.pending) return this.pending;
    this.pending=this.load().finally(() => { this.pending=undefined; }); return this.pending;
  }
  private async load(): Promise<boolean> {
    try {
      const session=await fetchAuthSession(); const token=session.tokens?.accessToken;
      this.autenticado.set(!!token);
      this.scopes.set(String(token?.payload['scope'] ?? '').split(' '));
      this.usuario.set(String(session.tokens?.idToken?.payload['email'] ?? token?.payload['username'] ?? 'Usuario'));
      return !!token;
    } catch { this.clear(); return false; }
    finally { this.verificando.set(false); }
  }
  async token(): Promise<string> {
    try {
      const session=await fetchAuthSession(); const value=session.tokens?.accessToken?.toString();
      if(value) return value;
    } catch { /* La UI recibe un 401 uniforme, sin exponer detalles del proveedor. */ }
    this.invalidate(); throw new HttpErrorResponse({status:401,statusText:'Sesión no disponible'});
  }
  async login(returnUrl='/pedidos') {
    this.error.set('');
    sessionStorage.setItem('wd.returnPath',returnUrl==='/rabbit-admin' ? returnUrl:'/pedidos');
    try { await signInWithRedirect(); } catch { this.error.set('No se pudo iniciar sesión. Revisa la configuración de Cognito.'); }
  }
  async logout() {
    this.error.set('');
    try { await signOut(); this.invalidate(); } catch { this.error.set('No se pudo cerrar sesión. Inténtalo otra vez.'); }
  }
  returnPath() { const path=sessionStorage.getItem('wd.returnPath'); sessionStorage.removeItem('wd.returnPath'); return path==='/rabbit-admin' ? path:'/pedidos'; }
  private clear() { this.autenticado.set(false); this.usuario.set(''); this.scopes.set([]); }
  invalidate() { this.clear(); void this.router.navigate(['/login']); }
}
