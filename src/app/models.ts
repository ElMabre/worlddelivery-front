export const ESTADOS = ['PENDIENTE','EN PREPARACION','EN TRANSITO','EN REPARTO','ENTREGADO'] as const;
export type EstadoPedido = typeof ESTADOS[number];
export interface CrearPedido { producto: string; cliente: string; direccion: string; fechaEntrega: string; estado: EstadoPedido; }
export interface Pedido extends CrearPedido { id: number; }
export type ExchangeType = 'DIRECT' | 'TOPIC' | 'FANOUT';
export interface ExchangeRequest { name: string; type: ExchangeType; }
export interface BindingRequest { queue: string; exchange: string; routingKey: string; }
export interface QueueStatus { name: string; messagesReady: number; consumers: number; }
export interface PurgeStatus { name: string; messagesPurged: number; }
export interface TopologyQueueItem {
  name: string;
  dominio: string;
  tipo: 'Principal' | 'DLQ' | 'Administrativa';
  exchange: string;
  routingKey: string;
  messagesReady: number | null;
  consumers: number | null;
  custom?: boolean;
}
