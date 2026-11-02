import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { firstValueFrom, Observable } from 'rxjs';
import { RabbitAdminService } from './rabbit-admin.service';
import { BindingRequest, ExchangeRequest, QueueStatus } from './models';
import { apiError } from './api-error';
@Component({selector:'app-rabbit-admin',imports:[FormsModule],templateUrl:'./rabbit-admin.html'})
export class RabbitAdmin {
  private api=inject(RabbitAdminService);
  readonly busy=signal(false); readonly error=signal(''); readonly success=signal('');readonly status=signal<QueueStatus|null>(null);
  readonly namePattern='(?!amq[.])[A-Za-z0-9][A-Za-z0-9._-]{0,127}';
  queue='';exchange:ExchangeRequest={name:'',type:'TOPIC'};binding:BindingRequest={queue:'',exchange:'',routingKey:''};
  async queueAction(action:'create'|'read'|'delete',form:NgForm) {
    if(!this.valid(form))return;const name=this.queue;
    if(action==='delete' && !window.confirm(`¿Eliminar la cola ${name}, sus mensajes y bindings?`))return;
    this.status.set(null);
    await this.run(async () => { if(action==='read'){this.status.set(await firstValueFrom(this.api.queueStatus(name)));}else{await firstValueFrom<unknown>(action==='create' ? this.api.createQueue(name):this.api.deleteQueue(name));} });
  }
  async exchangeAction(remove:boolean,form:NgForm) {
    if(!this.valid(form))return;const request={...this.exchange};
    if(remove && !window.confirm(`¿Eliminar el exchange ${request.name} y sus bindings?`))return;
    await this.run(async () => {await firstValueFrom<unknown>(remove ? this.api.deleteExchange(request.name):this.api.createExchange(request));});
  }
  async bindingAction(remove:boolean,form:NgForm) {
    if(!this.valid(form))return;const request={...this.binding};
    if(remove && !window.confirm(`¿Eliminar el binding entre ${request.exchange} y ${request.queue}?`))return;
    await this.run(async () => {await firstValueFrom<unknown>(remove ? this.api.deleteBinding(request):this.api.createBinding(request));});
  }
  private valid(form:NgForm) {if(form.invalid){form.control.markAllAsTouched();this.error.set('Revisa los nombres y los campos requeridos.');return false;}return true;}
  private async run(action:() => Promise<void>) {if(this.busy())return;this.busy.set(true);this.error.set('');this.success.set('');try{await action();this.success.set('Operación completada.');}catch(e){this.error.set(apiError(e));}finally{this.busy.set(false);}}
}
