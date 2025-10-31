import { apiUrl } from './api';

export interface Ticket {
  idTicket?: number;
  tiendaId?: number;
  codigoTienda?: string;
  terminalId?: number;
  fecha: string; // ISO yyyy-MM-dd
  folio: number;
  total?: number;
  subtotal?: number;
  iva?: number;
  formaPago?: string; // 01, 03, etc.
  rfcCliente?: string;
  nombreCliente?: string;
  status?: number; // 1 activo, 0 cancelado
  idFactura?: number;
}

export interface TicketSearchFilters {
  codigoTienda?: string;
  tiendaId?: number;
  terminalId?: number;
  fecha?: string; // yyyy-MM-dd
  folio?: number;
  status?: number;
  rfcCliente?: string;
}

class TicketService {
  private baseUrl = apiUrl('/tickets');

  /**
   * Busca tickets en el backend. Si el endpoint aún no existe,
   * devuelve datos simulados coherentes con los filtros.
   */
  async buscarTickets(filters: TicketSearchFilters): Promise<Ticket[]> {
    try {
      const resp = await fetch(`${this.baseUrl}/buscar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters)
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const data = await resp.json();
      // El backend devuelve { success, message, data: Ticket[] }
      if (Array.isArray(data)) {
        return data as Ticket[];
      }
      if (data?.data && Array.isArray(data.data)) {
        return data.data as Ticket[];
      }
      if (data?.tickets && Array.isArray(data.tickets)) {
        return data.tickets as Ticket[];
      }
      if (data?.resultados && Array.isArray(data.resultados)) {
        return data.resultados as Ticket[];
      }
      return [];
    } catch (err) {
      // Fallback con datos simulados para pruebas de UI
      const hoy = filters.fecha || new Date().toISOString().split('T')[0];
      const codigo = filters.codigoTienda || 'S001';
      const folioBase = filters.folio ?? 1001;
      return [
        {
          idTicket: 1,
          codigoTienda: codigo,
          fecha: hoy,
          terminalId: filters.terminalId ?? 1,
          folio: folioBase,
          subtotal: 800.0,
          iva: 128.0,
          total: 928.0,
          formaPago: '01',
          rfcCliente: filters.rfcCliente || 'XAXX010101000',
          nombreCliente: 'Público en general',
          status: 1,
          idFactura: undefined,
        },
        {
          idTicket: 2,
          codigoTienda: codigo,
          fecha: hoy,
          terminalId: filters.terminalId ?? 2,
          folio: folioBase + 1,
          subtotal: 1200.0,
          iva: 192.0,
          total: 1392.0,
          formaPago: '03',
          rfcCliente: 'ABC123456789',
          nombreCliente: 'Cliente Demo',
          status: 1,
          idFactura: 555,
        },
      ];
    }
  }
}

export const ticketService = new TicketService();
export type { TicketService };