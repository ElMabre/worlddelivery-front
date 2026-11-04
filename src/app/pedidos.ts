import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { AuthService } from './auth.service';
import { PedidosService } from './pedidos.service';
import { CrearPedido, Pedido, ESTADOS } from './models';
import { apiError } from './api-error';
@Component({selector:'app-pedidos',imports:[FormsModule],templateUrl:'./pedidos.html'})
export class Pedidos implements OnInit {
  readonly auth=inject(AuthService); private api=inject(PedidosService);
  readonly estados=ESTADOS; readonly pedidos=signal<Pedido[]>([]); readonly busy=signal(false);
  readonly error=signal(''); readonly success=signal('');
  nuevo:CrearPedido=this.empty();
  private empty():CrearPedido { return {producto:'',cliente:'',direccion:'',fechaEntrega:'',estado:'PENDIENTE'}; }
  ngOnInit() { void this.load(); }
  async load() { await this.run(async () => { this.pedidos.set(await firstValueFrom(this.api.obtenerPedidos())); }); }
  async create(form:NgForm) {
    if(form.invalid) { form.control.markAllAsTouched();this.error.set('Completa los campos requeridos.');return; }
    const request={...this.nuevo,producto:this.nuevo.producto.trim(),cliente:this.nuevo.cliente.trim(),direccion:this.nuevo.direccion.trim()};
    if(!request.producto || !request.cliente || !request.direccion) {this.error.set('Los campos no pueden contener solo espacios.');return;}
    await this.run(async () => {const value=await firstValueFrom(this.api.crearPedido(request));this.pedidos.update(list => [...list,value]);this.nuevo=this.empty();form.resetForm(this.nuevo);this.success.set('Pedido creado.');});
  }
  async update(pedido:Pedido,value:string) {
    const estado=this.estados.find(e => e===value);
    if(!estado){this.error.set('Estado inválido.');return;}
    await this.run(async () => {const value=await firstValueFrom(this.api.actualizarEstado(pedido.id,estado));this.pedidos.update(list => list.map(p => p.id===value.id ? value:p));this.success.set('Estado actualizado.');});
  }
  async remove(pedido:Pedido) {
    if(!window.confirm(`¿Eliminar el pedido ${pedido.id}?`)) return;
    await this.run(async () => {await firstValueFrom(this.api.eliminarPedido(pedido.id));this.pedidos.update(list => list.filter(p => p.id!==pedido.id));this.success.set('Pedido eliminado.');});
  }
  private async run(action:() => Promise<void>) { if(this.busy()) return;this.busy.set(true);this.error.set('');this.success.set('');try{await action();}catch(e){this.error.set(apiError(e));}finally{this.busy.set(false);} }
}
