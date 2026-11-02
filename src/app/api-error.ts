import { HttpErrorResponse } from '@angular/common/http';
export function apiError(error:unknown):string {
  if(!(error instanceof HttpErrorResponse)) return 'No se pudo completar la operación. Inténtalo nuevamente.';
  const messages:Record<number,string>={0:'No hay conexión con la API. Revisa la conexión y CORS.',
    400:'Los datos no son válidos. Revisa los campos.',401:'Tu sesión no está disponible. Inicia sesión nuevamente.',
    403:'No tienes permisos para esta operación.',404:'El recurso no existe.',409:'El recurso tiene una configuración incompatible o fue modificado.',
    503:'El servicio no está disponible o no confirmó la operación. Consulta el recurso antes de repetir.'};
  return messages[error.status] ?? `No se pudo completar la operación (HTTP ${error.status}).`;
}
