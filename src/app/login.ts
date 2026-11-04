import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from './auth.service';
@Component({
  selector: 'app-login',
  styleUrl: './login.css',
  template: `
    <div class="login-background">
      <section class="login-card" aria-labelledby="login-title">
        <img class="login-logo" src="/assets/Logo_Grande.svg" alt="World Delivery">
        <h2 id="login-title">Tu operación, en un solo lugar</h2>
        <p>Inicia sesión para gestionar pedidos y consultar su estado.</p>
        @if (auth.verificando()) {
          <p role="status">Comprobando sesión…</p>
        } @else {
          <button type="button" class="primary" (click)="login()">Iniciar sesión</button>
        }
      </section>
    </div>`
})
export class Login implements OnInit {
  readonly auth=inject(AuthService); private route=inject(ActivatedRoute); private router=inject(Router);
  async ngOnInit() { if(await this.auth.refresh()) await this.router.navigateByUrl(this.auth.returnPath()); }
  login() { return this.auth.login(this.route.snapshot.queryParamMap.get('returnUrl') ?? '/pedidos'); }
}
