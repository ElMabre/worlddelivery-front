import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { RabbitAdminService } from './rabbit-admin.service';
import { BindingRequest, ExchangeRequest, QueueStatus, TopologyQueueItem } from './models';
import { apiError } from './api-error';

const TOPOLOGIA_BASE: TopologyQueueItem[] = [
  { name: 'q.despacho.tickets', dominio: 'Despacho', tipo: 'Principal', exchange: 'wd.pedidos.direct (DIRECT)', routingKey: 'pedido.creado', messagesReady: null, consumers: null },
  { name: 'q.despacho.tickets.dlq', dominio: 'Despacho', tipo: 'DLQ', exchange: 'wd.dlx.direct (DIRECT)', routingKey: 'despacho.dead', messagesReady: null, consumers: null },
  { name: 'q.notificaciones.clientes', dominio: 'Notificaciones', tipo: 'Principal', exchange: 'wd.eventos.topic (TOPIC)', routingKey: 'pedido.estado.*', messagesReady: null, consumers: null },
  { name: 'q.notificaciones.clientes.dlq', dominio: 'Notificaciones', tipo: 'DLQ', exchange: 'wd.dlx.direct (DIRECT)', routingKey: 'notificaciones.dead', messagesReady: null, consumers: null },
  { name: 'q.auditoria.eventos', dominio: 'Auditoría', tipo: 'Principal', exchange: 'wd.eventos.topic (TOPIC)', routingKey: 'pedido.#', messagesReady: null, consumers: null },
  { name: 'q.auditoria.eventos.dlq', dominio: 'Auditoría', tipo: 'DLQ', exchange: 'wd.dlx.direct (DIRECT)', routingKey: 'auditoria.dead', messagesReady: null, consumers: null },
];

@Component({selector:'app-rabbit-admin',imports:[FormsModule],templateUrl:'./rabbit-admin.html'})
export class RabbitAdmin {
  private api=inject(RabbitAdminService);
  readonly busy=signal(false); readonly error=signal(''); readonly success=signal('');readonly status=signal<QueueStatus|null>(null);
  readonly topologia=signal<TopologyQueueItem[]>(TOPOLOGIA_BASE.map(item => ({...item})));
  readonly namePattern='(?!amq[.])[A-Za-z0-9][A-Za-z0-9._-]{0,127}';
  queue='';exchange:ExchangeRequest={name:'',type:'TOPIC'};binding:BindingRequest={queue:'',exchange:'',routingKey:''};
  async queueAction(action:'create'|'read'|'purge'|'delete',form:NgForm) {
    if(!this.valid(form))return;const name=this.queue;
    if(action==='delete' && !window.confirm(`¿Eliminar la cola ${name}, sus mensajes y bindings?`))return;
    if(action==='purge' && !window.confirm(`¿Purgar todos los mensajes listos de la cola ${name}?`))return;
    this.status.set(null);
    let completionMessage='Operación completada.';
    await this.run(async () => {
      if(action==='read'){
        const info=await firstValueFrom(this.api.queueStatus(name));
        this.status.set(info);
        this.upsertColaTabla(name,info.messagesReady,info.consumers);
      } else if(action==='purge'){
        const res=await firstValueFrom(this.api.purgeQueue(name));
        completionMessage=`Cola ${res.name} purgada (${res.messagesPurged} mensajes eliminados).`;
        if(typeof this.api.queueStatus==='function'){
          const info=await firstValueFrom(this.api.queueStatus(name)).catch(() => null);
          if(info) this.upsertColaTabla(name,info.messagesReady,info.consumers);
        }
      } else if(action==='create'){
        await firstValueFrom<unknown>(this.api.createQueue(name));
        const info=typeof this.api.queueStatus==='function'
          ? await firstValueFrom(this.api.queueStatus(name)).catch(() => ({name,messagesReady:0,consumers:0}))
          : {name,messagesReady:0,consumers:0};
        this.upsertColaTabla(name,info.messagesReady,info.consumers);
      } else {
        await firstValueFrom<unknown>(this.api.deleteQueue(name));
        this.topologia.update(list => list.filter(item => !(item.name===name && item.custom)));
      }
    }, () => completionMessage);
  }
  async cargarTopologia() {
    await this.run(async () => {
      const current=this.topologia();
      const updated=await Promise.all(current.map(async item => {
        const info=await firstValueFrom(this.api.queueStatus(item.name));
        return {...item,messagesReady:info.messagesReady,consumers:info.consumers};
      }));
      this.topologia.set(updated);
    }, () => 'Estado de las colas actualizado.');
  }
  async purgarColaTopologia(name:string) {
    if(!window.confirm(`¿Purgar todos los mensajes listos de ${name}?`)) return;
    let completionMessage='Operación completada.';
    await this.run(async () => {
      const res=await firstValueFrom(this.api.purgeQueue(name));
      completionMessage=`Cola ${res.name} purgada (${res.messagesPurged} mensajes eliminados).`;
      const info=await firstValueFrom(this.api.queueStatus(name));
      this.topologia.update(list => list.map(item => item.name===name ? {...item,messagesReady:info.messagesReady,consumers:info.consumers} : item));
    }, () => completionMessage);
  }
  async eliminarColaTabla(name:string) {
    if(!window.confirm(`¿Eliminar la cola ${name}, sus mensajes y bindings?`)) return;
    await this.run(async () => {
      await firstValueFrom(this.api.deleteQueue(name));
      this.topologia.update(list => list.filter(item => !(item.name===name && item.custom)));
    }, () => `Cola ${name} eliminada.`);
  }
  private upsertColaTabla(name:string,messagesReady:number,consumers:number) {
    this.topologia.update(list => {
      if(list.some(item => item.name===name)) {
        return list.map(item => item.name===name ? {...item,messagesReady,consumers} : item);
      }
      return [...list,{
        name,
        dominio:'Administración',
        tipo:'Administrativa',
        exchange:'—',
        routingKey:'—',
        messagesReady,
        consumers,
        custom:true
      }];
    });
  }
  async exchangeAction(remove:boolean,form:NgForm) {
    if(!this.valid(form))return;const request={...this.exchange};
    if(remove && !window.confirm(`¿Eliminar el exchange ${request.name} y sus bindings?`))return;
    await this.run(async () => {await firstValueFrom<unknown>(remove ? this.api.deleteExchange(request.name):this.api.createExchange(request));});
  }
  async bindingAction(remove:boolean,form:NgForm) {
    if(!this.valid(form))return;const request={...this.binding};
    if(remove && !window.confirm(`¿Eliminar el binding entre ${request.exchange} y ${request.queue}?`))return;
    await this.run(async () => {
      await firstValueFrom<unknown>(remove ? this.api.deleteBinding(request):this.api.createBinding(request));
      this.topologia.update(list => list.map(item => {
        if(item.name!==request.queue || !item.custom) return item;
        return remove
          ? {...item,exchange:'—',routingKey:'—'}
          : {...item,exchange:request.exchange,routingKey:request.routingKey || '(vacía)'};
      }));
    });
  }
  private valid(form:NgForm) {if(form.invalid){form.control.markAllAsTouched();this.error.set('Revisa los nombres y los campos requeridos.');return false;}return true;}
  private async run(action:() => Promise<void>, message:() => string = () => 'Operación completada.') {if(this.busy())return;this.busy.set(true);this.error.set('');this.success.set('');try{await action();this.success.set(message());}catch(e){this.error.set(apiError(e));}finally{this.busy.set(false);}}
}
