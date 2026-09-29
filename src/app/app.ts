import { Component, ChangeDetectorRef, OnInit } from "@angular/core";
import {
  signInWithRedirect,
  signOut,
  getCurrentUser,
  fetchUserAttributes
} from 'aws-amplify/auth';
import { PedidosService } from "./pedidos.service";

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  usuario = '';
  autenticado = false;
  verificandoSesion = true;
  pedidos: any[] = [];
  cargandoPedidos = false;
  errorPedidos = '';

  constructor(
    private pedidosService : PedidosService,
    private cdr: ChangeDetectorRef 
  ){}

  async ngOnInit() {
    try {
      const user = await getCurrentUser();
      this.autenticado = true; 
      this.usuario = user.username; 
      try {
        const attributes = await fetchUserAttributes();
        if (attributes.email) {
          this.usuario = attributes.email; 
        }
      } catch (attrError) {
        console.warn("No se pudo obtener el correo. Mostrando username.");
      }

    } catch (Error) {
      console.log("No existe sesión activa");
      this.autenticado = false;
    } finally {
      this.verificandoSesion = false;
      this.cdr.detectChanges();
    }
  }

  async login(){
    await signInWithRedirect();
  }
  
  async logout(){
    await signOut();
  }
  
  consultarPedidos() {
    this.cargandoPedidos = true;
    this.errorPedidos = '';
    this.cdr.detectChanges();

    this.pedidosService.obtenerPedidos().subscribe({
        next: (data) => {
          this.pedidos = data;
          this.cargandoPedidos = false;
          this.cdr.detectChanges(); 
        },
        error: (error) => {
          this.errorPedidos = `Error HTTP ${error.status}`;
          this.cargandoPedidos = false;
          this.cdr.detectChanges();
        }
      });
  }

  crearPedido(
    inputProducto: HTMLInputElement, 
    inputCliente: HTMLInputElement,
    inputDireccion: HTMLInputElement,
    inputFecha: HTMLInputElement,
    selectEstado: HTMLSelectElement
  ) {
    const producto = inputProducto.value;
    const cliente = inputCliente.value;
    const direccion = inputDireccion.value;
    const fechaEntrega = inputFecha.value;
    const estado = selectEstado.value;
    
    if (!producto || !cliente || !direccion || !fechaEntrega) return;

    const nuevo = { 
      producto: producto, 
      cliente: cliente,
      direccion: direccion,
      fechaEntrega: fechaEntrega,
      estado: estado 
    };
    
    this.pedidosService.crearPedido(nuevo).subscribe({
      next: (res) => {
        this.pedidos.push(res);
        inputProducto.value = '';
        inputCliente.value = '';
        inputDireccion.value = '';
        inputFecha.value = '';
        selectEstado.value = 'EN PREPARACION'; 
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al crear:', err)
    });
  }

  eliminarPedido(id: number) {
    this.pedidosService.eliminarPedido(id).subscribe({
      next: () => {
        this.pedidos = this.pedidos.filter(p => p.id !== id);
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al eliminar:', err)
    });
  }

  actualizarEstado(id: number, nuevoEstado: string) {
    this.pedidosService.actualizarEstado(id, nuevoEstado).subscribe({
      next: (res) => {
        const index = this.pedidos.findIndex(p => p.id === id);
        if (index !== -1) {
          this.pedidos[index].estado = res.estado ? res.estado : nuevoEstado;
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error al actualizar:', err)
    });
  }
}