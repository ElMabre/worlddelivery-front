import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting,HttpTestingController } from '@angular/common/http/testing';
import { of,firstValueFrom,throwError,Subject } from 'rxjs';
import { describe,it,expect,vi,afterEach } from 'vitest';
import { NgForm } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Pedidos } from './pedidos';
import { PedidosService } from './pedidos.service';
import { AuthService } from './auth.service';
import { Pedido } from './models';
import { UsuariosService,Usuario } from './usuarios.service';
import { Usuarios } from './usuarios';
import { environment } from '../environments/environment';
const pedido:Pedido={id:7,producto:'Caja',cliente:'Ana',direccion:'Calle 1',fechaEntrega:'2026-12-01',estado:'ENTREGADO'};
describe('Evolución de pedidos y usuarios',() => {
  afterEach(() => vi.restoreAllMocks());
  it('muestra skeleton hasta recibir datos y oculta eliminar a Usuario',async () => {
    const response=new Subject<Pedido[]>();
    const api={obtenerPedidos:() => response,eliminarPedido:vi.fn()};
    TestBed.configureTestingModule({imports:[Pedidos],providers:[{provide:PedidosService,useValue:api},
      {provide:AuthService,useValue:{hasScope:() => true,admin:() => false,rol:() => 'Usuario'}}]});
    const f=TestBed.createComponent(Pedidos);await f.whenStable();
    expect(f.nativeElement.querySelectorAll('.skeleton-card')).toHaveLength(6);
    response.next([pedido]);await f.whenStable();
    expect(f.componentInstance.isLoading()).toBe(false);
    expect(f.nativeElement.querySelector('.skeleton-card')).toBeNull();
    expect(f.nativeElement.textContent).toContain('Editar pedido');
    expect(f.nativeElement.textContent).not.toContain('Eliminar pedido');
    await f.componentInstance.remove(pedido);expect(api.eliminarPedido).not.toHaveBeenCalled();
  });
  it('finaliza el skeleton ante errores y permite recargar',async () => {
    const api={obtenerPedidos:vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({status:500})))};
    TestBed.configureTestingModule({imports:[Pedidos],providers:[{provide:PedidosService,useValue:api},
      {provide:AuthService,useValue:{hasScope:() => true,admin:() => true,rol:() => 'Admin'}}]});
    const f=TestBed.createComponent(Pedidos);await f.whenStable();
    expect(f.componentInstance.isLoading()).toBe(false);expect(f.componentInstance.error()).not.toBe('');
    api.obtenerPedidos.mockReturnValue(of([pedido]));await f.componentInstance.load();await f.whenStable();
    expect(f.nativeElement.textContent).toContain('Eliminar pedido');
  });
  it('filtra ID exacto y desbloquea el formulario al cambiar el estado',async () => {
    const api={obtenerPedidos:vi.fn().mockReturnValue(of([pedido])),editarPedido:vi.fn().mockReturnValue(of({...pedido,estado:'PENDIENTE',producto:'Nueva'}))};
    TestBed.configureTestingModule({imports:[Pedidos],providers:[{provide:PedidosService,useValue:api},{provide:AuthService,useValue:{hasScope:() => true,admin:() => true,rol:() => "Admin"}}]});
    const f=TestBed.createComponent(Pedidos);await f.whenStable();
    f.componentInstance.busqueda.set('70');expect(f.componentInstance.filtrados()).toEqual([]);
    f.componentInstance.busqueda.set('7');expect(f.componentInstance.filtrados()).toHaveLength(1);
    f.componentInstance.comenzarEdicion(pedido);await f.whenStable();
    expect(f.nativeElement.querySelector('[name=editarProducto]').disabled).toBe(true);
    const select=f.nativeElement.querySelector('[name=editarEstado]') as HTMLSelectElement;
    select.value='PENDIENTE';select.dispatchEvent(new Event('change'));await f.whenStable();
    expect(f.nativeElement.querySelector('[name=editarProducto]').disabled).toBe(false);
    f.componentInstance.editando!.producto='Nueva';
    await f.componentInstance.guardarEdicion({invalid:false} as NgForm);
    expect(api.editarPedido).toHaveBeenCalledWith(7,expect.objectContaining({producto:'Nueva',estado:'PENDIENTE'}));
    expect(f.componentInstance.editando).toBeNull();
  });
  it('al volver a ENTREGADO restaura los datos originales bloqueados',async () => {
    TestBed.configureTestingModule({imports:[Pedidos],providers:[{provide:PedidosService,useValue:{obtenerPedidos:() => of([pedido])}},{provide:AuthService,useValue:{hasScope:() => true,admin:() => true,rol:() => "Admin"}}]});
    const f=TestBed.createComponent(Pedidos);await f.whenStable();
    const component=f.componentInstance;component.comenzarEdicion(pedido);
    component.editando!.estado='PENDIENTE';component.editando!.producto='Cambio';
    component.editando!.estado='ENTREGADO';component.cambiarEstadoEdicion();
    expect(component.editando!.producto).toBe('Caja');expect(component.datosBloqueados()).toBe(true);
  });
  it('envía PUT completo y codifica el username de Cognito',async () => {
    TestBed.configureTestingModule({providers:[provideHttpClient(),provideHttpClientTesting()]});
    const http=TestBed.inject(HttpTestingController);
    const {id,...request}=pedido;
    const edited=firstValueFrom(TestBed.inject(PedidosService).editarPedido(id,request));
    const put=http.expectOne(environment.pedidosUrl+'/7');
    expect(put.request.method).toBe('PUT');expect(put.request.body).toEqual(request);put.flush(pedido);await edited;
    const result=firstValueFrom(TestBed.inject(UsuariosService).cambiarRol('ana+demo@example.test','Usuario'));
    const patch=http.expectOne(environment.usuariosUrl+'/ana%2Bdemo%40example.test/rol');
    expect(patch.request.body).toEqual({rol:'Usuario'});patch.flush({});await result;http.verify();
  });
  it('recarga los roles tras un error parcial y permite cancelar la baja',async () => {
    const user:Usuario={username:'ana',enabled:true,status:'CONFIRMED',atributos:{email:'ana@example.test'},grupos:['Admin'],rol:'Admin'};
    const api={listar:vi.fn().mockReturnValue(of([user])),cambiarRol:vi.fn().mockReturnValue(throwError(() => new HttpErrorResponse({status:503}))),deshabilitar:vi.fn()};
    TestBed.configureTestingModule({imports:[Usuarios],providers:[{provide:UsuariosService,useValue:api}]});
    const f=TestBed.createComponent(Usuarios);await f.whenStable();
    vi.spyOn(window,'confirm').mockReturnValue(true);
    f.componentInstance.roles['ana']='Usuario';await f.componentInstance.cambiarRol(user);
    expect(api.listar).toHaveBeenCalledTimes(2);expect(f.componentInstance.roles['ana']).toBe('Admin');
    expect(f.componentInstance.success()).toBe('');
    vi.mocked(window.confirm).mockReturnValue(false);
    await f.componentInstance.deshabilitar(user);expect(api.deshabilitar).not.toHaveBeenCalled();
  });
});
