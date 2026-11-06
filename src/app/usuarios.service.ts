import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';

export type RolUsuario = 'Admin' | 'Usuario';
export interface Usuario {
  username: string;
  enabled: boolean;
  status: string;
  atributos: Record<string,string>;
  grupos: string[];
  rol: RolUsuario | 'Sin rol';
}
@Injectable({providedIn:'root'})
export class UsuariosService {
  private http=inject(HttpClient);
  private url=environment.usuariosUrl;
  listar() { return this.http.get<Usuario[]>(this.url); }
  cambiarRol(username:string,rol:RolUsuario) {
    return this.http.patch<Usuario>(this.url+'/'+encodeURIComponent(username)+'/rol',{rol});
  }
  deshabilitar(username:string) {
    return this.http.patch<void>(this.url+'/'+encodeURIComponent(username)+'/deshabilitar',{});
  }
}
