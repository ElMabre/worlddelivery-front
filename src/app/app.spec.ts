import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { describe,it,expect,vi,beforeEach } from 'vitest';
import { App } from './app';
import { AuthService } from './auth.service';
describe('Shell World Delivery',() => {
  const auth={autenticado:signal(false),admin:signal(false),usuario:signal('demo'),error:signal(''),refresh:vi.fn().mockResolvedValue(false),logout:vi.fn()};
  beforeEach(() => {auth.autenticado.set(false);auth.admin.set(false);auth.error.set('');TestBed.configureTestingModule({imports:[App],providers:[provideRouter([]),{provide:AuthService,useValue:auth}]});});
  it('muestra shell y router outlet sin formularios privados',async () => {const f=TestBed.createComponent(App);await f.whenStable();expect(f.nativeElement.querySelector('h1 img[alt="World Delivery"]').getAttribute('src')).toBe('/assets/Logo_Grande.svg');expect(f.nativeElement.querySelectorAll('h1 img')).toHaveLength(1);expect(f.nativeElement.querySelector('h1 source').getAttribute('srcset')).toBe('/assets/logo_chico.svg');expect(f.nativeElement.querySelector('router-outlet')).not.toBeNull();expect(f.nativeElement.querySelector('nav')).toBeNull();});
  it('muestra administración solo con permiso',async () => {auth.autenticado.set(true);const f=TestBed.createComponent(App);await f.whenStable();expect(f.nativeElement.textContent).not.toContain('Administración RabbitMQ');auth.admin.set(true);await f.whenStable();expect(f.nativeElement.textContent).toContain('Administración RabbitMQ');});
  it('muestra errores de autenticación',async () => {auth.error.set('No se pudo cerrar sesión');const f=TestBed.createComponent(App);await f.whenStable();expect(f.nativeElement.querySelector('[role=alert]').textContent).toContain('No se pudo cerrar sesión');});
});
