import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { CrearPedido, EstadoPedido, Pedido } from './models';
@Injectable({providedIn:'root'})
export class PedidosService {
  private http=inject(HttpClient); private url=environment.pedidosUrl;
  obtenerPedidos() { return this.http.get<Pedido[]>(this.url); }
  obtenerInactivos() { return this.http.get<Pedido[]>(this.url+'/inactivos'); }
  editarPedido(id:number,pedido:CrearPedido) { return this.http.put<Pedido>(`${this.url}/${id}`,pedido); }
  crearPedido(pedido:CrearPedido) { return this.http.post<Pedido>(this.url,pedido); }
  actualizarEstado(id:number,estado:EstadoPedido) { return this.http.patch<Pedido>(`${this.url}/${id}/estado`,{estado}); }
  eliminarPedido(id:number) { return this.http.delete<void>(`${this.url}/${id}`); }
}
