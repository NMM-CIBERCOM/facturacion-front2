import { apiUrl } from './api';
import { facturaService } from './facturaService';

export interface EmpresaInfo {
  nombre: string;
  rfc: string;
}

export interface CartaPorteFormData {
  rfcIniciales: string;
  rfcFecha: string;
  rfcHomoclave: string;
  correoElectronico: string;
  razonSocial: string;
  nombre: string;
  paterno: string;
  materno: string;
  pais: string;
  noRegistroIdentidadTributaria: string;
  domicilioFiscal: string;
  regimenFiscal: string;
  usoCfdi: string;
  descripcion: string;
  fechaInformacion: string; // YYYYMMDD
  numeroSerie: string;
  precio: string;
  personaAutoriza: string;
  puesto: string;
  tipoTransporte: string;
  permisoSCT: string;
  numeroPermisoSCT: string;
  placasVehiculo: string;
  configVehicular: string;
  nombreTransportista: string;
  rfcTransportista: string;
  bienesTransportados: string;
  origen: string;
  destino: string;
  fechaSalida: string; // ISO date-time
  fechaLlegada: string; // ISO date-time
}

export function buildFacturaDataFromCartaPorte(form: CartaPorteFormData, empresa?: EmpresaInfo): Record<string, any> {
  const rfcReceptor = `${(form.rfcIniciales || '').toUpperCase()}${form.rfcFecha || ''}${(form.rfcHomoclave || '').toUpperCase()}`;
  const razonSocialReceptor = form.razonSocial?.trim() || [form.nombre, form.paterno, form.materno].filter(Boolean).join(' ').trim();

  const precio = Number(form.precio || 0);
  const cantidad = 1;
  const valorUnitario = +(precio || 0).toFixed(2);
  const importe = +(cantidad * valorUnitario).toFixed(2);
  const iva = +((importe) * 0.16).toFixed(2);
  const subtotal = importe;
  const total = +(subtotal + iva).toFixed(2);

  const ahoraIso = new Date().toISOString();
  const uuid = `CP-${Date.now()}`;

  // Concepto principal (usado por el generador de iText)
  const conceptos = [
    {
      cantidad: String(cantidad),
      descripcion: form.descripcion || 'Carta Porte',
      valorUnitario: String(valorUnitario.toFixed(2)),
      importe: String(subtotal.toFixed(2)),
      iva: String(iva.toFixed(2)),
      // Campos adicionales útiles para el complemento
      claveProdServ: '25101500',
      noIdentificacion: form.numeroSerie || 'CP001',
      unidad: 'PIEZA',
    },
  ];

  return {
    // Encabezado y emisor/receptor
    uuid,
    serie: 'CP',
    folio: form.numeroSerie || 'CP001',
    fechaEmision: ahoraIso,
    rfcEmisor: empresa?.rfc || 'XAXX010101000',
    nombreEmisor: empresa?.nombre || 'EMISOR CARTA PORTE',
    rfcReceptor,
    nombreReceptor: razonSocialReceptor || 'RECEPTOR',
    subtotal: String(subtotal.toFixed(2)),
    iva: String(iva.toFixed(2)),
    total: String(total.toFixed(2)),
    metodoPago: 'PUE',
    formaPago: '99',
    usoCfdi: form.usoCfdi || 'G03',
    tipoComprobante: 'T',
    lugarExpedicion: form.domicilioFiscal || '76120',
    moneda: 'MXN',

    // Conceptos compatibles con el generador de iText
    conceptos,

    // Complemento Carta Porte (renderizado por backend)
    complementoCartaPorte: {
      tipoTransporte: form.tipoTransporte,
      permisoSCT: form.permisoSCT,
      numeroPermisoSCT: form.numeroPermisoSCT,
      placasVehiculo: form.placasVehiculo,
      configVehicular: form.configVehicular,
      operadorNombre: form.nombreTransportista,
      operadorRfc: form.rfcTransportista,
      bienesTransportados: form.bienesTransportados,
      origen: form.origen,
      destino: form.destino,
      fechaSalida: form.fechaSalida,
      fechaLlegada: form.fechaLlegada,
      fechaInformacion: form.fechaInformacion,
      personaAutoriza: form.personaAutoriza,
      puesto: form.puesto,
      mercancia: {
        descripcion: form.descripcion,
        claveProdServ: '25101500',
        cantidad: String(cantidad),
        unidad: 'PIEZA',
        peso: '120 kg', // si el formulario no lo captura, lo podemos construir en "Cargar ejemplo"
        valor: String(subtotal.toFixed(2)),
        numeroSerie: form.numeroSerie || '',
      },
    },

    // Campos fiscales opcionales
    xmlTimbrado: "<?xml version='1.0' encoding='UTF-8'?><cfdi:Comprobante></cfdi:Comprobante>",
    cadenaOriginal: `||1.1|${uuid}|${ahoraIso}||`,
    selloDigital: 'ABC123DEF456',
    certificado: 'MIIE',
    folioFiscal: uuid,
    fechaTimbrado: ahoraIso,
  };
}

export async function generarYDescargarPDFCartaPorte(form: CartaPorteFormData, empresa?: EmpresaInfo): Promise<void> {
  // Obtener logo y colores
  const logoConfig = await facturaService.obtenerConfiguracionLogos();
  if (!logoConfig.exitoso) {
    throw new Error('No se pudo obtener configuración de logos');
  }

  // Construir datos compatibles con generador iText del backend
  const facturaData = buildFacturaDataFromCartaPorte(form, empresa);

  // Invocar backend para generar PDF
  const resp = await fetch(apiUrl('/factura/generar-pdf'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      facturaData,
      logoConfig: {
        logoUrl: logoConfig.logoUrl,
        logoBase64: logoConfig.logoBase64,
        customColors: logoConfig.customColors,
      },
    }),
  });

  if (!resp.ok) {
    const txt = await resp.text().catch(() => '');
    throw new Error(`Error al generar PDF (HTTP ${resp.status}) ${txt}`);
  }

  const blob = await resp.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const nombre = `CartaPorte_${facturaData.serie}-${facturaData.folio}.pdf`;
  a.download = nombre;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}