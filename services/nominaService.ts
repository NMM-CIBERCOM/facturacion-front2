import { apiUrl } from './api';

export interface NominaFormPayload {
  rfcEmisor: string;
  rfcReceptor: string;
  nombre: string;
  curp?: string;
  periodoPago?: string;
  fechaPago: string; // YYYY-MM-DD
  percepciones?: string; // decimal string
  deducciones?: string; // decimal string
  total?: string; // decimal string
  tipoNomina: string; // O/E
  usoCfdi: string; // CN01
  correoElectronico: string;
}

export interface NominaSaveResponse {
  ok: boolean;
  message?: string;
  uuidFactura?: string;
  idFactura?: number;
  idFacturaNomina?: number;
  errors?: string[];
}

export interface NominaHistorialRecord {
  id: number;
  idEmpleado: string;
  fecha: string; // YYYY-MM-DD
  estado: string;
  uuid?: string;
}

export async function guardarNomina(
  form: NominaFormPayload,
  idEmpleado: string,
  fechaNomina: string
): Promise<NominaSaveResponse> {
  const payload = {
    idEmpleado,
    fechaNomina,
    rfcEmisor: form.rfcEmisor,
    rfcReceptor: form.rfcReceptor,
    nombre: form.nombre,
    curp: form.curp || '',
    periodoPago: form.periodoPago || '',
    fechaPago: form.fechaPago,
    percepciones: form.percepciones || '0',
    deducciones: form.deducciones || '0',
    total: form.total || '',
    tipoNomina: form.tipoNomina,
    usoCfdi: form.usoCfdi || 'CN01',
    correoElectronico: form.correoElectronico,
    usuarioCreacion: 'frontend',
  };

  const resp = await fetch(apiUrl('/nominas/guardar'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await resp.json().catch(() => ({ ok: false, message: 'Respuesta inválida' }));
  return data as NominaSaveResponse;
}

export async function consultarHistorialNominas(idEmpleado: string): Promise<NominaHistorialRecord[]> {
  const url = apiUrl(`/nominas/historial?idEmpleado=${encodeURIComponent(idEmpleado)}`);
  const resp = await fetch(url);
  if (!resp.ok) return [];
  const data = await resp.json().catch(() => []);
  return data as NominaHistorialRecord[];
}