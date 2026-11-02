import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../environments/environment';
import { BindingRequest, ExchangeRequest, QueueStatus } from './models';
@Injectable({providedIn:'root'})
export class RabbitAdminService {
  private http=inject(HttpClient); private url=environment.rabbitAdminUrl;
  createQueue(name:string) { return this.http.post<{name:string}>(`${this.url}/queues`,{name}); }
  queueStatus(name:string) { return this.http.get<QueueStatus>(`${this.url}/queues/${encodeURIComponent(name)}`); }
  deleteQueue(name:string) { return this.http.delete<void>(`${this.url}/queues/${encodeURIComponent(name)}`); }
  createExchange(request:ExchangeRequest) { return this.http.post<ExchangeRequest>(`${this.url}/exchanges`,request); }
  deleteExchange(name:string) { return this.http.delete<void>(`${this.url}/exchanges/${encodeURIComponent(name)}`); }
  createBinding(request:BindingRequest) { return this.http.post<BindingRequest>(`${this.url}/bindings`,request); }
  deleteBinding(request:BindingRequest) {
    return this.http.delete<void>(`${this.url}/bindings`,{params:new HttpParams().set('queue',request.queue).set('exchange',request.exchange).set('routingKey',request.routingKey)});
  }
}
