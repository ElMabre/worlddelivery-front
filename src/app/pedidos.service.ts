import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: 'root' })
export class PedidosService {
    private apiUrl = "https://owpdy1tbaj.execute-api.us-east-1.amazonaws.com/Deploy1_Ev/api/pedidos";

    constructor(
        private http: HttpClient
    ) {}

    obtenerPedidos(): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl);
    }

    crearPedido(pedido: any): Observable<any> {
        return this.http.post<any>(this.apiUrl, pedido);
    }

    actualizarEstado(id: number, estado: string): Observable<any> {
        const url = `${this.apiUrl}/${id}/estado`;
        return this.http.patch<any>(url, { estado: estado });
    }

    eliminarPedido(id: number): Observable<any> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete<any>(url);
    }
}