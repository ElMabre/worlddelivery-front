import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe,it,expect,vi,beforeEach } from 'vitest';
import { fetchAuthSession,signInWithRedirect,signOut } from 'aws-amplify/auth';
import { AuthService } from './auth.service';
vi.mock('aws-amplify/auth',() => ({fetchAuthSession:vi.fn(),signInWithRedirect:vi.fn(),signOut:vi.fn()}));
vi.mock('aws-amplify/utils',() => ({Hub:{listen:() => () => {}}}));
describe('Sesión Amplify aislada',() => {
  beforeEach(() => {vi.resetAllMocks();sessionStorage.clear();TestBed.configureTestingModule({providers:[provideRouter([])]});});
  it('lee permisos del access token y correo del ID token',async () => {
    vi.mocked(fetchAuthSession).mockResolvedValue({tokens:{accessToken:{payload:{scope:'resource-server-worlddelivery/admin'},toString:() => 'access-local'},idToken:{payload:{email:'demo@example.test'}}}} as Awaited<ReturnType<typeof fetchAuthSession>>);
    const auth=TestBed.inject(AuthService);expect(await auth.refresh()).toBe(true);expect(auth.admin()).toBe(true);expect(auth.usuario()).toBe('demo@example.test');expect(await auth.token()).toBe('access-local');
  });
  it('termina la comprobación sin sesión',async () => {vi.mocked(fetchAuthSession).mockResolvedValue({});const auth=TestBed.inject(AuthService);expect(await auth.refresh()).toBe(false);expect(auth.verificando()).toBe(false);expect(auth.admin()).toBe(false);});
  it('muestra fallos de login y limita el destino de retorno',async () => {vi.mocked(signInWithRedirect).mockRejectedValue(new Error('detalle privado'));const auth=TestBed.inject(AuthService);await auth.login('https://externo.example');expect(auth.error()).toContain('No se pudo iniciar');expect(auth.returnPath()).toBe('/pedidos');});
  it('muestra fallos de logout',async () => {vi.mocked(signOut).mockRejectedValue(new Error('fallo'));const auth=TestBed.inject(AuthService);await auth.logout();expect(auth.error()).toContain('No se pudo cerrar');});
});
