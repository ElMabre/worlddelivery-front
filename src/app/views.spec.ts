import { TestBed } from '@angular/core/testing';
import { provideHttpClient,HttpErrorResponse } from '@angular/common/http';
import { provideHttpClientTesting,HttpTestingController } from '@angular/common/http/testing';
import { of,throwError,firstValueFrom } from 'rxjs';
import { describe,it,expect,vi,afterEach } from 'vitest';
import { Pedidos } from './pedidos';
import { RabbitAdmin } from './rabbit-admin';
import { AuthService } from './auth.service';
import { PedidosService } from './pedidos.service';
import { RabbitAdminService } from './rabbit-admin.service';
import { Pedido } from './models';
import { NgForm } from '@angular/forms';
import { environment } from '../environments/environment';
const pedido:Pedido={id:1,producto:'Caja',cliente:'Cliente',direccion:'Dirección',fechaEntrega:'2026-11-10',estado:'PENDIENTE'};
describe('Vistas y contrato HTTP',() => {
  afterEach(() => vi.restoreAllMocks());
  it('muestra errores de escritura y conserva el pedido',async () => {
    const api={obtenerPedidos:vi.fn().mockReturnValue(of([pedido])),actualizarEstado:vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({status:403})))};
    TestBed.configureTestingModule({imports:[Pedidos],providers:[{provide:AuthService,useValue:{hasScope:() => true}},{provide:PedidosService,useValue:api}]});
    const f=TestBed.createComponent(Pedidos);await f.whenStable();await f.componentInstance.update(pedido,'ENTREGADO');await f.whenStable();
    expect(f.nativeElement.querySelector('[role=alert]').textContent).toContain('No tienes permisos');expect(f.componentInstance.pedidos()[0].estado).toBe('PENDIENTE');expect(f.componentInstance.busy()).toBe(false);
  });
  it('crea pedidos desde un formulario válido y limpia los campos',async () => {
    const api={obtenerPedidos:vi.fn().mockReturnValue(of([])),crearPedido:vi.fn().mockReturnValue(of(pedido))};
    TestBed.configureTestingModule({imports:[Pedidos],providers:[{provide:AuthService,useValue:{hasScope:() => true}},{provide:PedidosService,useValue:api}]});
    const f=TestBed.createComponent(Pedidos);await f.whenStable();
    for(const [name,value] of Object.entries({producto:'Caja',cliente:'Cliente',direccion:'Direccion',fechaEntrega:'2026-11-10'})) {
      const input=f.nativeElement.querySelector(`input[name="${name}"]`) as HTMLInputElement;
      input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));
    }
    await f.whenStable();
    f.nativeElement.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await f.whenStable();
    expect(api.crearPedido).toHaveBeenCalled();expect(f.componentInstance.pedidos()).toHaveLength(1);expect(f.componentInstance.nuevo.producto).toBe('');
  });
  it('cancelar borrado no llama a RabbitMQ',async () => {
    const api={deleteQueue:vi.fn()};TestBed.configureTestingModule({imports:[RabbitAdmin],providers:[{provide:RabbitAdminService,useValue:api}]});
    const f=TestBed.createComponent(RabbitAdmin);await f.whenStable();f.componentInstance.queue='demo';vi.spyOn(window,'confirm').mockReturnValue(false);
    await f.componentInstance.queueAction('delete',{invalid:false} as NgForm);expect(api.deleteQueue).not.toHaveBeenCalled();
  });
  it('muestra error de RabbitMQ sin afirmar éxito',async () => {
    const api={createQueue:vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({status:503})))};
    TestBed.configureTestingModule({imports:[RabbitAdmin],providers:[{provide:RabbitAdminService,useValue:api}]});const f=TestBed.createComponent(RabbitAdmin);await f.whenStable();f.componentInstance.queue='demo';await f.componentInstance.queueAction('create',{invalid:false} as NgForm);await f.whenStable();expect(f.nativeElement.querySelector('[role=alert]').textContent).toContain('no confirmó');expect(f.componentInstance.success()).toBe('');
  });
  it('codifica el comodín del binding y envía DELETE sin cuerpo',async () => {
    TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});const result=firstValueFrom(TestBed.inject(RabbitAdminService).deleteBinding({queue:'demo.q',exchange:'demo.x',routingKey:'pedido.#'}));
    const control=TestBed.inject(HttpTestingController);const req=control.expectOne(r => r.url===environment.rabbitAdminUrl+'/bindings');expect(req.request.method).toBe('DELETE');expect(req.request.urlWithParams).toContain('pedido.%23');expect(req.request.body).toBeNull();req.flush(null);await result;control.verify();
  });
});
