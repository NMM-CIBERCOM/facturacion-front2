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
  logoBase64?: string;
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
  private baseUrl = 'http://localhost:8080/api';
  
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
      // Cambiar para usar el endpoint del backend principal que tiene datos reales
      const response = await fetch(`http://localhost:8080/api/factura/timbrado/status/${uuid}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.exitoso || !data.datosFactura) {
        throw new Error(data.mensaje || 'No se encontró la factura');
      }
      
      // Usar los datos reales del backend principal
      const factura = data.datosFactura;
      
      // Convertir la respuesta del backend principal al formato esperado
      return {
        uuid: data.uuid,
        rfcEmisor: 'EEM123456789', // Datos del emisor por defecto
        nombreEmisor: 'Empresa Ejemplo',
        rfcReceptor: 'XEXX010101000', // Datos del receptor por defecto
        nombreReceptor: 'Cliente Ejemplo',
        serie: factura.serie,
        folio: factura.folio,
        fechaEmision: factura.fechaTimbrado,
        importe: factura.total,
        subtotal: factura.subtotal,
        iva: factura.iva,
        ieps: 0,
        conceptos: [{
          claveProdServ: '01010101',
          cantidad: 1,
          claveUnidad: 'H87',
          unidad: 'Pieza',
          descripcion: 'Producto de ejemplo',
          valorUnitario: factura.subtotal,
          importe: factura.subtotal
        }],
        metodoPago: 'PUE',
        formaPago: '01',
        usoCFDI: 'G03',
        xmlContent: data.xmlTimbrado,
        selloDigital: factura.selloDigital,
        selloCFD: factura.selloDigital,
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
        logoUrl: data.logoUrl || '/images/cibercom-logo.svg',
        logoBase64: data.logoBase64,
        customColors: data.customColors || {
          primary: '#2E86AB',
          secondary: '#1E4A5F',
          accent: '#0F2A3A'
        }
      };
    } catch (error) {
      console.error('Error obteniendo configuración de logos:', error);
      return {
        exitoso: false,
        logoUrl: '/images/cibercom-logo.svg',
        customColors: {
          primary: '#2E86AB',
          secondary: '#1E4A5F',
          accent: '#0F2A3A'
        },
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    }
  }

  /**
   * Convierte FacturaCompleta a FacturaData para el backend (pac-simulator-back)
   */
  public convertirAFacturaData(factura: FacturaCompleta): any {
    return {
      uuid: factura.uuid,
      serie: factura.serie,
      folio: factura.folio,
      fechaEmision: factura.fechaEmision,
      rfcEmisor: factura.rfcEmisor,
      nombreEmisor: factura.nombreEmisor,
      rfcReceptor: factura.rfcReceptor,
      nombreReceptor: factura.nombreReceptor,
      subtotal: factura.subtotal,
      iva: factura.iva,
      total: factura.importe,
      moneda: "MXN",
      metodoPago: factura.metodoPago,
      formaPago: factura.formaPago,
      usoCfdi: factura.usoCFDI,
      tipoComprobante: "I",
      lugarExpedicion: "12345",
      xmlTimbrado: factura.xmlContent || "<?xml version='1.0' encoding='UTF-8'?><cfdi:Comprobante></cfdi:Comprobante>",
      cadenaOriginal: factura.cadenaOriginal || `||1.1|${factura.uuid}|${factura.fechaEmision}||`,
      selloDigital: factura.selloDigital || "ABC123DEF456",
      certificado: factura.noCertificado || "MIIE",
      folioFiscal: factura.uuid,
      fechaTimbrado: factura.fechaEmision,
      conceptos: factura.conceptos.map(concepto => ({
        claveProdServ: "01010101",
        noIdentificacion: "PROD001",
        cantidad: concepto.cantidad,
        claveUnidad: "H87",
        unidad: concepto.unidad,
        descripcion: concepto.descripcion,
        valorUnitario: concepto.precioUnitario,
        importe: concepto.importe,
        descuento: 0.0,
        impuestos: [{
          tipo: "Traslado",
          impuesto: "002",
          tipoFactor: "Tasa",
          tasaOCuota: 0.16,
          base: concepto.importe,
          importe: concepto.importe * 0.16
        }]
      }))
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
      const response = await fetch(`${this.baseUrl}/factura/generar-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          facturaData: facturaData,
          logoConfig: {
            logoUrl: logoConfig.logoUrl,
            logoBase64: logoConfig.logoBase64,
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
      
      // Generar ZIP en el backend (pac-simulator-back en puerto 8085)
      const response = await fetch(`http://localhost:8085/api/generar-zip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          facturas: [{
            facturaData: facturaData
          }],
          logoConfig: logoConfig
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
   * Genera y descarga el XML de una factura
   */
  public async generarYDescargarXML(uuid: string): Promise<void> {
    try {
      // Usar el endpoint del backend principal para descargar XML
      const response = await fetch(`http://localhost:8080/api/factura/descargar-xml/${uuid}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }
      
      // El endpoint devuelve directamente el XML como bytes
      const xmlBlob = await response.blob();
      
      if (xmlBlob.size === 0) {
        throw new Error('El XML no está disponible para esta factura');
      }
      
      // Crear URL para descarga
      const url = window.URL.createObjectURL(xmlBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `FACTURA_${uuid}.xml`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
    } catch (error) {
      console.error('Error descargando XML:', error);
      throw new Error(`Error al descargar el XML: ${error instanceof Error ? error.message : 'Error desconocido'}`);
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
      
      // Generar ZIP en el backend (pac-simulator-back en puerto 8085)
      const response = await fetch(`http://localhost:8085/api/generar-zip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          facturas: facturas.map(factura => ({
            facturaData: this.convertirAFacturaData(factura)
          })),
          logoConfig: logoConfig
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

export const facturaService = FacturaService.getInstance();