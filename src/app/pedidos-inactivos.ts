import { Component, inject, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PedidosService } from './pedidos.service';
import { Pedido } from './models';
import { apiError } from './api-error';

@Component({selector:'app-pedidos-inactivos',templateUrl:'./pedidos-inactivos.html'})
export class PedidosInactivos implements OnInit {
  private api=inject(PedidosService);
  readonly pedidos=signal<Pedido[]>([]);
  readonly busy=signal(false);
  readonly error=signal('');
  ngOnInit() { void this.load(); }
  async load() {
    if(this.busy()) return;
    this.busy.set(true);this.error.set('');
    try {this.pedidos.set(await firstValueFrom(this.api.obtenerInactivos()));}
    catch(error) {this.error.set(apiError(error));}
    finally {this.busy.set(false);}
  }
}
