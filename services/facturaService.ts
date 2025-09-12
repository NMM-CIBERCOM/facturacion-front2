// Interfaz para los datos de factura para PDF
export interface FacturaData {
  uuid: string;
  rfcEmisor: string;
  nombreEmisor: string;
  rfcReceptor: string;
  nombreReceptor: string;
  serie: string;
  folio: string;
  fechaEmision: string;
  importe: number;
  subtotal: number;
  iva: number;
  ieps?: number;
  conceptos: ConceptoFactura[];
  metodoPago: string;
  formaPago: string;
  usoCFDI: string;
  xmlTimbrado?: string;
  selloDigital?: string;
  selloCFD?: string;
  noCertificado?: string;
  cadenaOriginal?: string;
  estatusFacturacion: string;
  estatusSat: string;
}

// Interfaz para la respuesta del backend
export interface FacturaCompleta {
  uuid: string;
  rfcEmisor: string;
  nombreEmisor: string;
  rfcReceptor: string;
  nombreReceptor: string;
  serie: string;
  folio: string;
  fechaEmision: string;
  importe: number;
  subtotal: number;
  iva: number;
  ieps?: number;
  conceptos: ConceptoFactura[];
  metodoPago: string;
  formaPago: string;
  usoCFDI: string;
  xmlContent?: string;
  selloDigital?: string;
  selloCFD?: string;
  noCertificado?: string;
  cadenaOriginal?: string;
  estatusFacturacion: string;
  estatusSat: string;
}

export interface ConceptoFactura {
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  importe: number;
}

export interface FacturaResponse {
  exitoso: boolean;
  mensaje: string;
  factura?: FacturaCompleta;
  error?: string;
}

export interface LogosResponse {
  exitoso: boolean;
  logoUrl: string;
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  error?: string;
}

// Servicio para manejar las operaciones con facturas
export class FacturaService {
  private static instance: FacturaService;
  private baseUrl = 'http://localhost:8085/api';
  
  public static getInstance(): FacturaService {
    if (!FacturaService.instance) {
      FacturaService.instance = new FacturaService();
    }
    return FacturaService.instance;
  }

  /**
   * Obtiene los datos completos de una factura por UUID
   */
  public async obtenerFacturaPorUUID(uuid: string): Promise<FacturaCompleta> {
    try {
      const response = await fetch(`${this.baseUrl}/consulta-facturas?uuid=${uuid}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.exitoso || !data.facturas || data.facturas.length === 0) {
        throw new Error(data.mensaje || 'No se encontró la factura');
      }
      
      // El PAC devuelve un array de facturas, tomamos la primera
      const factura = data.facturas[0];
      
      // Convertir la respuesta del PAC al formato esperado
      return {
        uuid: factura.uuid,
        rfcEmisor: factura.rfcEmisor,
        nombreEmisor: factura.nombreEmisor,
        rfcReceptor: factura.rfcReceptor,
        nombreReceptor: factura.nombreReceptor,
        serie: factura.serie,
        folio: factura.folio,
        fechaEmision: factura.fechaEmision,
        importe: factura.total || factura.importe,
        subtotal: factura.subtotal,
        iva: factura.iva,
        ieps: factura.ieps,
        conceptos: factura.conceptos || [],
        metodoPago: factura.metodoPago,
        formaPago: factura.formaPago,
        usoCFDI: factura.usoCfdi,
        xmlContent: factura.xmlTimbrado,
        selloDigital: factura.selloDigital,
        selloCFD: factura.selloCFD,
        noCertificado: factura.certificado,
        cadenaOriginal: factura.cadenaOriginal,
        estatusFacturacion: 'Vigente',
        estatusSat: 'Vigente'
      };
    } catch (error) {
      console.error('Error obteniendo factura:', error);
      throw new Error(`Error al obtener la factura: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtiene múltiples facturas por sus UUIDs
   */
  public async obtenerFacturasPorUUIDs(uuids: string[]): Promise<FacturaCompleta[]> {
    try {
      const promises = uuids.map(uuid => this.obtenerFacturaPorUUID(uuid));
      const facturas = await Promise.all(promises);
      return facturas;
    } catch (error) {
      console.error('Error obteniendo facturas:', error);
      throw new Error(`Error al obtener las facturas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtiene la configuración de logos y colores del backend
   */
  public async obtenerConfiguracionLogos(): Promise<LogosResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/logos/configuracion`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        exitoso: true,
        logoUrl: data.logoUrl || '/logo.png',
        customColors: data.customColors || {
          primary: '#1d4ed8',
          secondary: '#3b82f6',
          accent: '#06b6d4'
        }
      };
    } catch (error) {
      console.error('Error obteniendo configuración de logos:', error);
      return {
        exitoso: false,
        logoUrl: '/logo.png',
        customColors: {
          primary: '#1d4ed8',
          secondary: '#3b82f6',
          accent: '#06b6d4'
        },
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Convierte FacturaCompleta a FacturaData para el PDF
   */
  public convertirAFacturaData(factura: FacturaCompleta): FacturaData {
    return {
      uuid: factura.uuid,
      rfcEmisor: factura.rfcEmisor,
      nombreEmisor: factura.nombreEmisor,
      rfcReceptor: factura.rfcReceptor,
      nombreReceptor: factura.nombreReceptor,
      serie: factura.serie,
      folio: factura.folio,
      fechaEmision: factura.fechaEmision,
      importe: factura.importe,
      subtotal: factura.subtotal,
      iva: factura.iva,
      ieps: factura.ieps,
      conceptos: factura.conceptos,
      metodoPago: factura.metodoPago,
      formaPago: factura.formaPago,
      usoCFDI: factura.usoCFDI,
      xmlTimbrado: factura.xmlContent,
      selloDigital: factura.selloDigital,
      selloCFD: factura.selloCFD,
      noCertificado: factura.noCertificado,
      cadenaOriginal: factura.cadenaOriginal,
      estatusFacturacion: factura.estatusFacturacion,
      estatusSat: factura.estatusSat
    };
  }

  /**
   * Genera y descarga el PDF de una factura
   */
  public async generarYDescargarPDF(uuid: string): Promise<void> {
    try {
      // Obtener datos de la factura
      const factura = await this.obtenerFacturaPorUUID(uuid);
      
      // Obtener configuración de logos
      const logoConfig = await this.obtenerConfiguracionLogos();
      
      if (!logoConfig.exitoso) {
        throw new Error('Error al obtener la configuración de logos');
      }
      
      // Convertir a formato para PDF
      const facturaData = this.convertirAFacturaData(factura);
      
      // Generar PDF en el backend
      const response = await fetch(`${this.baseUrl}/generar-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          facturaData: facturaData,
          logoConfig: {
            logoUrl: logoConfig.logoUrl,
            customColors: logoConfig.customColors
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al generar PDF en el servidor');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Factura_${factura.serie}-${factura.folio}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new Error(`Error al generar el PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Genera y descarga el ZIP con XML y PDF de una factura
   */
  public async generarYDescargarZIP(uuid: string): Promise<void> {
    try {
      // Obtener datos de la factura
      const factura = await this.obtenerFacturaPorUUID(uuid);
      
      // Obtener configuración de logos
      const logoConfig = await this.obtenerConfiguracionLogos();
      
      if (!logoConfig.exitoso) {
        throw new Error('Error al obtener la configuración de logos');
      }
      
      // Convertir a formato para PDF
      const facturaData = this.convertirAFacturaData(factura);
      
      // Generar ZIP en el backend
      const response = await fetch(`${this.baseUrl}/generar-zip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          facturas: [{
            facturaData: facturaData
          }],
          logoConfig: {
            logoUrl: logoConfig.logoUrl,
            customColors: logoConfig.customColors
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al generar ZIP en el servidor');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Factura_${factura.serie}-${factura.folio}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error generando ZIP:', error);
      throw new Error(`Error al generar el ZIP: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Genera y descarga múltiples facturas en un ZIP
   */
  public async generarYDescargarZIPMultiple(uuids: string[]): Promise<void> {
    try {
      if (uuids.length === 0) {
        throw new Error('No se han seleccionado facturas');
      }
      
      // Obtener todas las facturas
      const facturas = await this.obtenerFacturasPorUUIDs(uuids);
      
      // Obtener configuración de logos
      const logoConfig = await this.obtenerConfiguracionLogos();
      
      if (!logoConfig.exitoso) {
        throw new Error('Error al obtener la configuración de logos');
      }
      
      // Generar ZIP en el backend
      const response = await fetch(`${this.baseUrl}/generar-zip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          facturas: facturas.map(factura => ({
            facturaData: this.convertirAFacturaData(factura)
          })),
          logoConfig: {
            logoUrl: logoConfig.logoUrl,
            customColors: logoConfig.customColors
          }
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al generar ZIP en el servidor');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Facturas_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error generando ZIP múltiple:', error);
      throw new Error(`Error al generar el ZIP: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }
}

// Exportar instancia singleton
export const facturaService = FacturaService.getInstance();