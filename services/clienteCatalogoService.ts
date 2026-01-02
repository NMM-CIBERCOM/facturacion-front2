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

  /**
   * Busca clientes por RFC parcial (para autocompletado)
   * Usa el endpoint GET /api/catalogo-clientes/buscar?rfc=...&limit=10
   */
  public async buscarClientesPorRFCParcial(rfc: string, limit: number = 10): Promise<ClienteDatos[]> {
    const normalized = (rfc || '').toUpperCase().trim();
    if (!normalized || normalized.length < 3) {
      return [];
    }
    try {
      const resp = await fetch(apiUrl(`/catalogo-clientes/buscar?rfc=${encodeURIComponent(normalized)}&limit=${limit}`));
      if (resp.ok) {
        const data = await resp.json();
        if (data.clientes && Array.isArray(data.clientes)) {
          return data.clientes.map((c: any) => ({
            rfc: c.rfc || '',
            razonSocial: c.razonSocial,
            nombre: c.nombre,
            paterno: c.paterno,
            materno: c.materno,
            correoElectronico: c.correoElectronico,
            pais: c.pais,
            domicilioFiscal: c.domicilioFiscal,
            regimenFiscal: c.regimenFiscal,
            registroTributario: c.registroTributario,
            usoCfdi: c.usoCfdi,
          }));
        }
      }
      return [];
    } catch (e) {
      console.error('Error buscando clientes por RFC parcial', e);
      return [];
    }
  }

  /**
   * Guarda un nuevo cliente en el catálogo
   * Usa el endpoint POST /api/catalogo-clientes
   */
  public async guardarCliente(cliente: any): Promise<{ success: boolean; idCliente?: number; error?: string }> {
    try {
      const resp = await fetch(apiUrl('/catalogo-clientes'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cliente),
      });
      
      const data = await resp.json();
      
      if (resp.ok && !data.error) {
        return {
          success: true,
          idCliente: data.idCliente,
        };
      } else {
        return {
          success: false,
          error: data.error || 'Error al guardar cliente',
        };
      }
    } catch (e) {
      console.error('Error guardando cliente', e);
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Error desconocido',
      };
    }
  }
}

export const clienteCatalogoService = new ClienteCatalogoService();