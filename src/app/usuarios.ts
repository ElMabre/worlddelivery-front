import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { UsuariosService, Usuario, RolUsuario } from './usuarios.service';
import { apiError } from './api-error';

@Component({selector:'app-usuarios',imports:[FormsModule],templateUrl:'./usuarios.html'})
export class Usuarios implements OnInit {
  private api=inject(UsuariosService);
  readonly usuarios=signal<Usuario[]>([]);
  readonly busy=signal(false);
  readonly error=signal('');
  readonly success=signal('');
  roles:Record<string,RolUsuario>=Object.create(null);
  atributos(user:Usuario) { return Object.entries(user.atributos); }
  ngOnInit() { void this.load(); }
  private async listar() {
    const users=await firstValueFrom(this.api.listar());
    this.usuarios.set(users);
    this.roles=Object.fromEntries(users.map(u => [u.username,u.rol==='Admin' ? 'Admin' : 'Usuario']));
  }
  async load() { await this.run(() => this.listar()); }
  async cambiarRol(user:Usuario) {
    const rol=this.roles[user.username];
    if(!window.confirm(`¿Asignar el rol ${rol} a ${user.username}?`)) return;
    await this.run(async () => {
      const updated=await firstValueFrom(this.api.cambiarRol(user.username,rol));
      this.usuarios.update(users => users.map(u => u.username===user.username ? updated : u));
      this.success.set('Rol actualizado. El usuario debe renovar su sesión para recibir el nuevo rol.');
    },true);
  }
  async deshabilitar(user:Usuario) {
    if(!window.confirm(`¿Deshabilitar el acceso de ${user.username}?`)) return;
    await this.run(async () => {
      await firstValueFrom(this.api.deshabilitar(user.username));
      this.usuarios.update(users => users.map(u => u.username===user.username ? {...u,enabled:false} : u));
      this.success.set('Usuario deshabilitado.');
    },true);
  }
  private async run(action:() => Promise<void>,reloadOnError=false) {
    if(this.busy()) return;
    this.busy.set(true); this.error.set(''); this.success.set('');
    try { await action(); }
    catch(error) {
      this.error.set(apiError(error));
      if(reloadOnError) {
        try { await this.listar(); }
        catch { this.error.update(message => message+' No se pudo actualizar la lista.'); }
      }
    } finally { this.busy.set(false); }
  }
}
