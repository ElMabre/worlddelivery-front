import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import { App } from './app';
import { PedidosService } from './pedidos.service';

vi.mock('aws-amplify/auth', () => ({
  getCurrentUser: vi.fn(), fetchUserAttributes: vi.fn(),
  signInWithRedirect: vi.fn(), signOut: vi.fn(),
}));

describe('World Delivery', () => {
  const pedidos = { obtenerPedidos: vi.fn() };
  beforeEach(async () => {
    vi.resetAllMocks();
    vi.mocked(getCurrentUser).mockRejectedValue(new Error('Sin sesión'));
    pedidos.obtenerPedidos.mockReturnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [{ provide: PedidosService, useValue: pedidos }],
    }).compileComponents();
  });
  it('muestra el título real y login sin una sesión', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('h1')?.textContent).toContain('World Delivery');
    expect(page.textContent).toContain('Iniciar Sesión');
    expect(page.querySelector('.create-order-form')).toBeNull();
    expect(pedidos.obtenerPedidos).not.toHaveBeenCalled();
  });
  it('muestra el correo y los pedidos de una sesión autenticada', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ username: 'demo', userId: 'local-test' });
    vi.mocked(fetchUserAttributes).mockResolvedValue({ email: 'demo@example.test' });
    pedidos.obtenerPedidos.mockReturnValue(of([{ id: 1, producto: 'Pedido local' }]));
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.componentInstance.consultarPedidos();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('demo@example.test');
    expect(fixture.nativeElement.textContent).toContain('Pedido local');
  });
  it('mantiene el username si no se puede recuperar el correo', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ username: 'demo', userId: 'local-test' });
    vi.mocked(fetchUserAttributes).mockRejectedValue(new Error('Sin atributos'));
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.componentInstance.usuario).toBe('demo');
    expect(fixture.componentInstance.autenticado).toBe(true);
  });
  it('muestra el error de consulta y termina la carga', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({ username: 'demo', userId: 'local-test' });
    vi.mocked(fetchUserAttributes).mockResolvedValue({});
    pedidos.obtenerPedidos.mockReturnValue(throwError(() => ({ status: 403 })));
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    fixture.componentInstance.consultarPedidos();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Error HTTP 403');
    expect(fixture.componentInstance.cargandoPedidos).toBe(false);
  });
});
