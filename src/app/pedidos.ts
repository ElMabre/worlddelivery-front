import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { firstValueFrom, tap } from 'rxjs';
import { AuthService } from './auth.service';
import { PedidosService } from './pedidos.service';
import { CrearPedido, Pedido, ESTADOS } from './models';
import { apiError } from './api-error';
@Component({selector:'app-pedidos',imports:[FormsModule],templateUrl:'./pedidos.html'})
export class Pedidos implements OnInit {
  readonly auth=inject(AuthService); private api=inject(PedidosService);
  readonly estados=ESTADOS; readonly pedidos=signal<Pedido[]>([]); readonly busy=signal(false);
  readonly isLoading=signal(true);
  readonly skeletonRows=[1,2,3,4,5,6];
  readonly error=signal(''); readonly success=signal('');
  readonly busqueda=signal('');
  readonly filtrados=computed(() => {
    const id=this.busqueda().trim();
    return id ? this.pedidos().filter(p => String(p.id)===id) : this.pedidos();
  });
  editando:Pedido|null=null;
  original:Pedido|null=null;
  nuevo:CrearPedido=this.empty();

  comenzarEdicion(pedido:Pedido) {
    this.original={...pedido};
    this.editando={...pedido};
    this.error.set('');
  }
  cancelarEdicion() { this.editando=null; this.original=null; }
  datosBloqueados() { return this.original?.estado==='ENTREGADO' && this.editando?.estado==='ENTREGADO'; }
  cambiarEstadoEdicion() {
    if(this.datosBloqueados() && this.original) this.editando={...this.original};
  }
  async guardarEdicion(form:NgForm) {
    if(!this.editando) return;
    if(form.invalid) {form.control.markAllAsTouched(); this.error.set('Completa los campos requeridos.'); return;}
    const {id,producto,cliente,direccion,fechaEntrega,estado}=this.editando;
    if(!producto.trim() || !cliente.trim() || !direccion.trim()) {this.error.set('Los campos no pueden contener solo espacios.');return;}
    await this.run(async () => {
      const value=await firstValueFrom(this.api.editarPedido(id,{producto:producto.trim(),cliente:cliente.trim(),direccion:direccion.trim(),fechaEntrega,estado}));
      this.pedidos.update(list => list.map(p => p.id===id ? value : p));
      this.cancelarEdicion();
      this.success.set('Pedido actualizado.');
    });
  }
  private empty():CrearPedido { return {producto:'',cliente:'',direccion:'',fechaEntrega:'',estado:'PENDIENTE'}; }
  cargarDemoDlq() {
    const manana=new Date(Date.now()+86400000).toISOString().slice(0,10);
    this.nuevo={
      producto:'Encomienda Crítica [ERROR-DLQ]',
      cliente:'Cliente Demo DLQ',
      direccion:'Av. Providencia 1234 [ERROR-DLQ]',
      fechaEntrega:manana,
      estado:'PENDIENTE'
    };
    this.error.set('');
  }
  ngOnInit() { void this.load(); }
  async load() {
    if(this.busy()) return;
    this.isLoading.set(true);
    await this.run(async () => {
      await firstValueFrom(this.api.obtenerPedidos().pipe(
        tap({next:list => {this.pedidos.set(list);this.isLoading.set(false);},error:() => this.isLoading.set(false)})
      ));
    });
  }
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
    if(!this.auth.admin() || !this.auth.hasScope('delete')) return;
    if(!window.confirm(`¿Desactivar el pedido ${pedido.id}? Se conservará en pedidos inactivos.`)) return;
    await this.run(async () => {await firstValueFrom(this.api.eliminarPedido(pedido.id));this.pedidos.update(list => list.filter(p => p.id!==pedido.id));if(this.editando?.id===pedido.id)this.cancelarEdicion();this.success.set('Pedido eliminado.');});
  }
  private async run(action:() => Promise<void>) { if(this.busy()) return;this.busy.set(true);this.error.set('');this.success.set('');try{await action();}catch(e){this.error.set(apiError(e));}finally{this.busy.set(false);this.isLoading.set(false);} }
}
