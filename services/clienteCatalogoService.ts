import { apiUrl } from './api';

export interface ClienteDatos {
  rfc: string;
  razonSocial?: string;
  nombre?: string;
  paterno?: string;
  materno?: string;
  correoElectronico?: string;
  pais?: string;
  domicilioFiscal?: string;
  regimenFiscal?: string;
  registroTributario?: string;
  usoCfdi?: string;
}

export interface ClienteResponse {
  encontrado: boolean;
  cliente?: ClienteDatos | null;
}

class ClienteCatalogoService {
  public buildRfc(iniciales: string, fecha: string, homoclave: string): string {
    return `${(iniciales || '').toUpperCase()}${(fecha || '').toUpperCase()}${(homoclave || '').toUpperCase()}`.trim();
  }

  public async buscarClientePorRFC(rfc: string): Promise<ClienteResponse> {
    const normalized = (rfc || '').toUpperCase();
    if (!normalized) {
      return { encontrado: false, cliente: null };
    }
    try {
      const resp = await fetch(apiUrl(`/catalogo-clientes/${encodeURIComponent(normalized)}`));
      const data = await resp.json().catch(() => null);
      if (!data) {
        return { encontrado: false, cliente: null };
      }
      const cliente: ClienteDatos | undefined = data?.cliente ? {
        rfc: data.cliente.rfc,
        razonSocial: data.cliente.razonSocial,
        nombre: data.cliente.nombre,
        paterno: data.cliente.paterno,
        materno: data.cliente.materno,
        correoElectronico: data.cliente.correoElectronico,
        pais: data.cliente.pais,
        domicilioFiscal: data.cliente.domicilioFiscal,
        regimenFiscal: data.cliente.regimenFiscal,
        registroTributario: data.cliente.registroTributario,
        usoCfdi: data.cliente.usoCfdi,
      } : undefined;
      return { encontrado: Boolean(data?.encontrado && cliente), cliente: cliente ?? null };
    } catch (e) {
      console.error('Error consultando cliente catálogo por RFC', e);
      return { encontrado: false, cliente: null };
    }
  }
}

export const clienteCatalogoService = new ClienteCatalogoService();