import{
    Injectable
}from "@angular/core";

import{
    HttpClient
}from "@angular/common/http";

@Injectable ({ providedIn: 'root'})

export class PedidosService{
    private apiUrl = "https://owpdy1tbaj.execute-api.us-east-1.amazonaws.com/Deploy1_Ev/api/pedidos";
    constructor(
        private http: HttpClient
    ){}

    obtenerPedidos(){
        return this.http.get<any[]>(
            this.apiUrl
        );
    }
}
