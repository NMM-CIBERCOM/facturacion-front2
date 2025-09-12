import { CustomColors } from '../types';

// Interfaz para los datos de la factura
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
  selloDigital?: string;
  selloCFD?: string;
  noCertificado?: string;
  cadenaOriginal?: string;
}

export interface ConceptoFactura {
  descripcion: string;
  cantidad: number;
  unidad: string;
  precioUnitario: number;
  importe: number;
}

export interface LogoConfig {
  logoUrl: string;
  customColors: CustomColors;
}

// Servicio para generar PDF de facturas
export class PDFService {
  private static instance: PDFService;
  
  public static getInstance(): PDFService {
    if (!PDFService.instance) {
      PDFService.instance = new PDFService();
    }
    return PDFService.instance;
  }

  /**
   * Genera un PDF de la factura usando HTML y CSS
   */
  public async generarPDFFactura(
    facturaData: FacturaData, 
    logoConfig: LogoConfig
  ): Promise<Blob> {
    try {
      // Crear el HTML de la factura
      const htmlContent = this.generarHTMLFactura(facturaData, logoConfig);
      
      // Usar html2pdf para generar el PDF
      const pdf = await this.convertirHTMLaPDF(htmlContent);
      
      return pdf;
    } catch (error) {
      console.error('Error generando PDF:', error);
      throw new Error('Error al generar el PDF de la factura');
    }
  }

  /**
   * Genera el HTML de la factura con estilos
   */
  private generarHTMLFactura(facturaData: FacturaData, logoConfig: LogoConfig): string {
    const { customColors, logoUrl } = logoConfig;
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Factura ${facturaData.serie}-${facturaData.folio}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
          }
          
          .factura-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
          
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 30px;
            border-bottom: 2px solid ${customColors.primary};
            padding-bottom: 20px;
          }
          
          .logo-section {
            flex: 1;
          }
          
          .logo {
            max-width: 200px;
            max-height: 80px;
            object-fit: contain;
          }
          
          .factura-info {
            flex: 1;
            text-align: right;
          }
          
          .factura-titulo {
            font-size: 24px;
            font-weight: bold;
            color: ${customColors.primary};
            margin-bottom: 10px;
          }
          
          .factura-numero {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .emisor-receptor {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
          }
          
          .emisor, .receptor {
            flex: 1;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
          }
          
          .emisor {
            margin-right: 15px;
            background-color: ${customColors.secondary}20;
          }
          
          .receptor {
            margin-left: 15px;
            background-color: ${customColors.accent}20;
          }
          
          .seccion-titulo {
            font-weight: bold;
            font-size: 14px;
            color: ${customColors.primary};
            margin-bottom: 10px;
            border-bottom: 1px solid ${customColors.primary};
            padding-bottom: 5px;
          }
          
          .conceptos-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          
          .conceptos-table th {
            background-color: ${customColors.primary};
            color: white;
            padding: 12px 8px;
            text-align: left;
            font-weight: bold;
          }
          
          .conceptos-table td {
            padding: 10px 8px;
            border-bottom: 1px solid #ddd;
          }
          
          .conceptos-table tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          
          .totales {
            float: right;
            width: 300px;
            margin-bottom: 30px;
          }
          
          .totales-table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .totales-table td {
            padding: 8px 12px;
            border: 1px solid #ddd;
          }
          
          .totales-table .label {
            background-color: ${customColors.secondary};
            color: white;
            font-weight: bold;
            text-align: right;
          }
          
          .totales-table .total-final {
            background-color: ${customColors.primary};
            color: white;
            font-weight: bold;
            font-size: 14px;
          }
          
          .sellos {
            clear: both;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          
          .sello {
            margin-bottom: 15px;
            word-break: break-all;
            font-size: 10px;
            background-color: #f5f5f5;
            padding: 10px;
            border-radius: 3px;
          }
          
          .text-right {
            text-align: right;
          }
          
          .text-center {
            text-align: center;
          }
          
          @media print {
            body {
              margin: 0;
            }
            
            .factura-container {
              max-width: none;
              margin: 0;
              padding: 15px;
            }
          }
        </style>
      </head>
      <body>
        <div class="factura-container">
          <!-- Header -->
          <div class="header">
            <div class="logo-section">
              <img src="${logoUrl}" alt="Logo" class="logo" />
            </div>
            <div class="factura-info">
              <div class="factura-titulo">FACTURA</div>
              <div class="factura-numero">${facturaData.serie}-${facturaData.folio}</div>
              <div><strong>UUID:</strong> ${facturaData.uuid}</div>
              <div><strong>Fecha:</strong> ${new Date(facturaData.fechaEmision).toLocaleDateString('es-MX')}</div>
            </div>
          </div>
          
          <!-- Emisor y Receptor -->
          <div class="emisor-receptor">
            <div class="emisor">
              <div class="seccion-titulo">EMISOR</div>
              <div><strong>Nombre:</strong> ${facturaData.nombreEmisor}</div>
              <div><strong>RFC:</strong> ${facturaData.rfcEmisor}</div>
            </div>
            <div class="receptor">
              <div class="seccion-titulo">RECEPTOR</div>
              <div><strong>Nombre:</strong> ${facturaData.nombreReceptor}</div>
              <div><strong>RFC:</strong> ${facturaData.rfcReceptor}</div>
            </div>
          </div>
          
          <!-- Conceptos -->
          <table class="conceptos-table">
            <thead>
              <tr>
                <th>Descripción</th>
                <th class="text-center">Cantidad</th>
                <th class="text-center">Unidad</th>
                <th class="text-right">Precio Unitario</th>
                <th class="text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              ${facturaData.conceptos.map(concepto => `
                <tr>
                  <td>${concepto.descripcion}</td>
                  <td class="text-center">${concepto.cantidad}</td>
                  <td class="text-center">${concepto.unidad}</td>
                  <td class="text-right">$${concepto.precioUnitario.toFixed(2)}</td>
                  <td class="text-right">$${concepto.importe.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <!-- Totales -->
          <div class="totales">
            <table class="totales-table">
              <tr>
                <td class="label">Subtotal:</td>
                <td class="text-right">$${facturaData.subtotal.toFixed(2)}</td>
              </tr>
              <tr>
                <td class="label">IVA:</td>
                <td class="text-right">$${facturaData.iva.toFixed(2)}</td>
              </tr>
              ${facturaData.ieps ? `
                <tr>
                  <td class="label">IEPS:</td>
                  <td class="text-right">$${facturaData.ieps.toFixed(2)}</td>
                </tr>
              ` : ''}
              <tr>
                <td class="label total-final">Total:</td>
                <td class="text-right total-final">$${facturaData.importe.toFixed(2)}</td>
              </tr>
            </table>
          </div>
          
          <!-- Información de pago -->
          <div style="clear: both; margin-top: 20px;">
            <div><strong>Método de Pago:</strong> ${facturaData.metodoPago}</div>
            <div><strong>Forma de Pago:</strong> ${facturaData.formaPago}</div>
            <div><strong>Uso CFDI:</strong> ${facturaData.usoCFDI}</div>
          </div>
          
          <!-- Sellos digitales -->
          ${facturaData.selloDigital || facturaData.selloCFD ? `
            <div class="sellos">
              <div class="seccion-titulo">SELLOS DIGITALES</div>
              ${facturaData.selloCFD ? `
                <div class="sello">
                  <strong>Sello CFD:</strong><br>
                  ${facturaData.selloCFD}
                </div>
              ` : ''}
              ${facturaData.selloDigital ? `
                <div class="sello">
                  <strong>Sello SAT:</strong><br>
                  ${facturaData.selloDigital}
                </div>
              ` : ''}
              ${facturaData.noCertificado ? `
                <div><strong>No. Certificado:</strong> ${facturaData.noCertificado}</div>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Convierte HTML a PDF usando html2pdf
   */
  private async convertirHTMLaPDF(htmlContent: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      // Crear un elemento temporal para el HTML
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      try {
        // Configuración para html2pdf
        const options = {
          margin: 10,
          filename: 'factura.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Verificar si html2pdf está disponible
        if (typeof (window as any).html2pdf === 'undefined') {
          // Fallback: usar window.print() si html2pdf no está disponible
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            printWindow.document.write(htmlContent);
            printWindow.document.close();
            printWindow.print();
          }
          reject(new Error('html2pdf no está disponible'));
          return;
        }

        // Generar PDF con html2pdf
        (window as any).html2pdf()
          .from(tempDiv)
          .set(options)
          .outputPdf('blob')
          .then((pdfBlob: Blob) => {
            document.body.removeChild(tempDiv);
            resolve(pdfBlob);
          })
          .catch((error: any) => {
            document.body.removeChild(tempDiv);
            reject(error);
          });
      } catch (error) {
        document.body.removeChild(tempDiv);
        reject(error);
      }
    });
  }

  /**
   * Descarga un archivo PDF
   */
  public descargarPDF(pdfBlob: Blob, nombreArchivo: string): void {
    const url = URL.createObjectURL(pdfBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Crea un archivo ZIP con XML y PDF
   */
  public async crearZipFactura(
    facturaData: FacturaData,
    xmlContent: string,
    logoConfig: LogoConfig
  ): Promise<Blob> {
    try {
      // Generar PDF
      const pdfBlob = await this.generarPDFFactura(facturaData, logoConfig);
      
      // Crear ZIP usando JSZip si está disponible
      if (typeof (window as any).JSZip !== 'undefined') {
        const zip = new (window as any).JSZip();
        
        // Agregar XML al ZIP
        zip.file(`${facturaData.serie}-${facturaData.folio}.xml`, xmlContent);
        
        // Agregar PDF al ZIP
        zip.file(`${facturaData.serie}-${facturaData.folio}.pdf`, pdfBlob);
        
        // Generar ZIP
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        return zipBlob;
      } else {
        throw new Error('JSZip no está disponible');
      }
    } catch (error) {
      console.error('Error creando ZIP:', error);
      throw new Error('Error al crear el archivo ZIP');
    }
  }

  /**
   * Descarga un archivo ZIP
   */
  public descargarZip(zipBlob: Blob, nombreArchivo: string): void {
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Exportar instancia singleton
export const pdfService = PDFService.getInstance();