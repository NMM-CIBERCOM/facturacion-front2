import React, { useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { Button } from './Button';
import { DatosFiscalesSection } from './DatosFiscalesSection';
import { TextareaField } from './TextareaField';
import { SelectField } from './SelectField';
import { PAIS_OPTIONS, REGIMEN_FISCAL_OPTIONS, USO_CFDI_OPTIONS } from '../constants';
import { useEmpresa } from '../context/EmpresaContext';
import { generarYDescargarPDFCartaPorte, buildFacturaDataFromCartaPorte } from '../services/cartaPorteService';
import { facturaService } from '../services/facturaService';
import { correoService } from '../services/correoService';
import { apiUrl } from '../services/api';

interface CartaPorteFormData {
  // Datos fiscales receptor
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

  // Información general
  descripcion: string;
  fechaInformacion: string; // YYYYMMDD
  numeroSerie: string;
  precio: string;
  personaAutoriza: string;
  puesto: string;

  // Campos Carta Porte (transporte)
  tipoTransporte: string; // 01 Autotransporte, 02 Marítimo, 03 Aéreo, 04 Ferroviario
  permisoSCT: string;
  numeroPermisoSCT: string;
  placasVehiculo: string;
  configVehicular: string;
  nombreTransportista: string;
  rfcTransportista: string;
  bienesTransportados: string; // listado libre
  origen: string;
  destino: string;
  fechaSalida: string; // ISO date-time
  fechaLlegada: string; // ISO date-time
}

const TIPO_TRANSPORTE_OPTIONS = [
  { value: '01', label: 'Autotransporte' },
  { value: '02', label: 'Transporte marítimo' },
  { value: '03', label: 'Transporte aéreo' },
  { value: '04', label: 'Transporte ferroviario' },
];

const initialCartaPorteFormData: CartaPorteFormData = {
  rfcIniciales: '',
  rfcFecha: '',
  rfcHomoclave: '',
  correoElectronico: '',
  razonSocial: '',
  nombre: '',
  paterno: '',
  materno: '',
  pais: PAIS_OPTIONS[0]?.value || '',
  noRegistroIdentidadTributaria: '',
  domicilioFiscal: '',
  regimenFiscal: REGIMEN_FISCAL_OPTIONS[0]?.value || '',
  usoCfdi: USO_CFDI_OPTIONS[0]?.value || '',
  descripcion: '',
  fechaInformacion: new Date().toISOString().split('T')[0].replace(/-/g, ''), // YYYYMMDD format
  numeroSerie: '',
  precio: '',
  personaAutoriza: '',
  puesto: '',
  tipoTransporte: TIPO_TRANSPORTE_OPTIONS[0].value,
  permisoSCT: '',
  numeroPermisoSCT: '',
  placasVehiculo: '',
  configVehicular: '',
  nombreTransportista: '',
  rfcTransportista: '',
  bienesTransportados: '',
  origen: '',
  destino: '',
  fechaSalida: '',
  fechaLlegada: '',
};

export const FacturacionCartaPortePage: React.FC = () => {
  const [formData, setFormData] = useState<CartaPorteFormData>(initialCartaPorteFormData);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [enviandoCorreo, setEnviandoCorreo] = useState<boolean>(false);
  const { empresaInfo } = useEmpresa();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const cargarEjemplo = () => {
    setFormData((prev) => ({
      ...prev,
      rfcIniciales: 'PELJ',
      rfcFecha: '080101',
      rfcHomoclave: 'U12',
      correoElectronico: 'juan.perez@example.com',
      razonSocial: 'JUAN PÉREZ LÓPEZ',
      nombre: 'JUAN',
      paterno: 'PÉREZ',
      materno: 'LÓPEZ',
      domicilioFiscal: '76120',
      descripcion: 'Motocicleta Italika FT150',
      fechaInformacion: '20251017',
      numeroSerie: 'CP001',
      precio: '25000',
      personaAutoriza: 'Juan Pérez Ramírez',
      puesto: 'Operador',
      tipoTransporte: '01',
      permisoSCT: 'Autotransporte particular',
      numeroPermisoSCT: 'PERM-123',
      placasVehiculo: 'ABC123C',
      configVehicular: 'C2',
      nombreTransportista: 'Juan Pérez Ramírez',
      rfcTransportista: 'PERJ850201QW3',
      bienesTransportados: 'ClaveProdServ: 25101500  Cant: 1  Unidad: PIEZA  Peso: 120 kg  Valor: $25,000.00  Núm. Serie: X9FT150A001245',
      origen: 'Av. Universidad 100, Querétaro, Qro.',
      destino: 'Calle Hidalgo 32, San Juan del Río, Qro.',
      fechaSalida: '2025-10-17T08:00',
      fechaLlegada: '2025-10-17T10:00',
    }));
  };

  const handleRfcSearch = () => {
    alert(`Buscando RFC: ${formData.rfcIniciales}${formData.rfcFecha}${formData.rfcHomoclave}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await generarYDescargarPDFCartaPorte(formData, empresaInfo);
      alert('PDF de Carta Porte generado y descargado.');
    } catch (err) {
      console.error('Error generando Carta Porte:', err);
      alert(`Error al generar Carta Porte: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Helpers
  const blobToBase64 = (blob: Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  const crearXMLCartaPorte = (form: CartaPorteFormData) => {
    const rfcReceptor = `${(form.rfcIniciales || '').toUpperCase()}${form.rfcFecha || ''}${(form.rfcHomoclave || '').toUpperCase()}`;
    const razonSocialReceptor = form.razonSocial?.trim() || [form.nombre, form.paterno, form.materno].filter(Boolean).join(' ').trim();
    const precio = Number(form.precio || 0);
    const subtotal = +(precio || 0).toFixed(2);
    const iva = +((subtotal) * 0.16).toFixed(2);
    const total = +(subtotal + iva).toFixed(2);
    const fechaEmision = new Date().toISOString();

    const emisorRfc = empresaInfo?.rfc || 'XAXX010101000';
    const emisorNombre = empresaInfo?.nombre || 'EMISOR CARTA PORTE';

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<cfdi:Comprobante Version="4.0" Serie="CP" Folio="${form.numeroSerie || 'CP001'}" Fecha="${fechaEmision}" ` +
      `SubTotal="${subtotal.toFixed(2)}" Total="${total.toFixed(2)}" Moneda="MXN" TipoDeComprobante="T" LugarExpedicion="${form.domicilioFiscal || '76120'}" ` +
      `xmlns:cfdi="http://www.sat.gob.mx/cfd/4" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ` +
      `xsi:schemaLocation="http://www.sat.gob.mx/cfd/4 http://www.sat.gob.mx/sitio_internet/cfd/4/cfdv40.xsd">\n` +
      `  <cfdi:Emisor Rfc="${emisorRfc}" Nombre="${emisorNombre}" RegimenFiscal="${form.regimenFiscal || '601'}"/>\n` +
      `  <cfdi:Receptor Rfc="${rfcReceptor}" Nombre="${razonSocialReceptor}" DomicilioFiscalReceptor="${form.domicilioFiscal || ''}" RegimenFiscalReceptor="${form.regimenFiscal || ''}" UsoCFDI="${form.usoCfdi || 'S01'}"/>\n` +
      `  <cfdi:Conceptos>\n` +
      `    <cfdi:Concepto ClaveProdServ="25101500" Cantidad="1" ClaveUnidad="H87" Descripcion="${form.descripcion || 'Servicio de transporte'}" ` +
      `ValorUnitario="${subtotal.toFixed(2)}" Importe="${subtotal.toFixed(2)}">\n` +
      `      <cfdi:Impuestos>\n` +
      `        <cfdi:Traslados>\n` +
      `          <cfdi:Traslado Base="${subtotal.toFixed(2)}" Impuesto="002" TipoFactor="Tasa" TasaOCuota="0.160000" Importe="${iva.toFixed(2)}"/>\n` +
      `        </cfdi:Traslados>\n` +
      `      </cfdi:Impuestos>\n` +
      `    </cfdi:Concepto>\n` +
      `  </cfdi:Conceptos>\n` +
      `  <cfdi:Complemento>\n` +
      `    <cartaporte:CartaPorte xmlns:cartaporte="http://www.sat.gob.mx/CartaPorte20" Version="2.0" TransporteInternacional="No" TotalDistRec="0">\n` +
      `      <cartaporte:Mercancias PesoBrutoTotal="0" UnidadPeso="KGM" NumTotalMercancias="1"/>\n` +
      `      <cartaporte:Ubicaciones TipoTransporte="${form.tipoTransporte || '01'}" Origen="${form.origen || ''}" Destino="${form.destino || ''}" FechaSalida="${form.fechaSalida || ''}" FechaLlegada="${form.fechaLlegada || ''}"/>\n` +
      `    </cartaporte:CartaPorte>\n` +
      `  </cfdi:Complemento>\n` +
      `</cfdi:Comprobante>`;

    return xml;
  };

  const handleDescargarXML = () => {
    try {
      const xml = crearXMLCartaPorte(formData);
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CartaPorte_${formData.numeroSerie || 'CP001'}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar XML:', err);
      alert('Error al generar/descargar el XML de Carta Porte');
    }
  };

  const handleEnviarCorreo = async () => {
    try {
      setEnviandoCorreo(true);
      const correo = formData.correoElectronico?.trim();
      if (!correo || !correoService.validarEmail(correo)) {
        alert('Captura un correo electrónico válido.');
        return;
      }

      // Obtener logos y colores del formato activo
      const logoConfig = await facturaService.obtenerConfiguracionLogos();
      if (!logoConfig.exitoso) {
        throw new Error('No se pudo obtener configuración de logos');
      }

      // Construir datos exactamente como los espera el backend de iText
      const facturaData = buildFacturaDataFromCartaPorte(formData, empresaInfo);

      // Generar PDF en backend usando el mismo endpoint que descarga
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
        throw new Error(`Error al generar PDF: ${resp.status}`);
      }
      const pdfBlob = await resp.blob();
      const pdfBase64 = await blobToBase64(pdfBlob);

      const asunto = `Carta Porte ${facturaData.serie}-${facturaData.folio}`;
      const mensaje = `Estimado(a) cliente,\n\nSe ha generado su Carta Porte.\n\nGracias por su preferencia.`;

      // Generar XML para adjunto
      const xmlString = crearXMLCartaPorte(formData);
      const xmlBlob = new Blob([xmlString], { type: 'application/xml' });
      const xmlBase64 = await blobToBase64(xmlBlob);
      const nombreXml = `CartaPorte_${facturaData.serie}-${facturaData.folio}.xml`;

      await correoService.enviarPdfDirecto({
        pdfBase64,
        correoReceptor: correo,
        asunto,
        mensaje,
        nombreAdjunto: `CartaPorte_${facturaData.serie}-${facturaData.folio}.pdf`,
        xmlBase64,
        nombreAdjuntoXml: nombreXml,
      });

      alert('Carta Porte enviada por correo con PDF y XML adjuntos.');
    } catch (err) {
      console.error('Error enviando Carta Porte por correo:', err);
      alert(`Error enviando por correo: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setEnviandoCorreo(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DatosFiscalesSection
        formData={formData}
        handleChange={handleChange}
        onRfcSearchClick={handleRfcSearch}
      />

      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Información:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
          <TextareaField label="Descripción:" name="descripcion" value={formData.descripcion} onChange={handleChange} rows={4} className="md:col-span-2" required />
          <FormField label="Fecha:" name="fechaInformacion" value={formData.fechaInformacion} onChange={handleChange} placeholder="AAAAMMDD" maxLength={8} required />
          <FormField label="Número de Serie:" name="numeroSerie" value={formData.numeroSerie} onChange={handleChange} required />
          <FormField label="Precio:" name="precio" type="number" value={formData.precio} onChange={handleChange} required />
          <FormField label="Persona que autoriza:" name="personaAutoriza" value={formData.personaAutoriza} onChange={handleChange} required />
          <FormField label="Puesto:" name="puesto" value={formData.puesto} onChange={handleChange} required />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Transporte:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
          <SelectField label="Tipo de Transporte:" name="tipoTransporte" value={formData.tipoTransporte} onChange={handleChange} options={TIPO_TRANSPORTE_OPTIONS} />
          <FormField label="Permiso SCT:" name="permisoSCT" value={formData.permisoSCT} onChange={handleChange} />
          <FormField label="No. Permiso SCT:" name="numeroPermisoSCT" value={formData.numeroPermisoSCT} onChange={handleChange} />
          <FormField label="Placas Vehículo:" name="placasVehiculo" value={formData.placasVehiculo} onChange={handleChange} />
          <FormField label="Config. Vehicular:" name="configVehicular" value={formData.configVehicular} onChange={handleChange} />
          <FormField label="Nombre Transportista:" name="nombreTransportista" value={formData.nombreTransportista} onChange={handleChange} />
          <FormField label="RFC Transportista:" name="rfcTransportista" value={formData.rfcTransportista} onChange={handleChange} />
          <TextareaField label="Bienes Transportados:" name="bienesTransportados" value={formData.bienesTransportados} onChange={handleChange} rows={3} className="md:col-span-2" />
          <FormField label="Origen (Domicilio):" name="origen" value={formData.origen} onChange={handleChange} />
          <FormField label="Destino (Domicilio):" name="destino" value={formData.destino} onChange={handleChange} />
          <FormField label="Fecha Salida:" name="fechaSalida" type="datetime-local" value={formData.fechaSalida} onChange={handleChange} />
          <FormField label="Fecha Llegada:" name="fechaLlegada" type="datetime-local" value={formData.fechaLlegada} onChange={handleChange} />
        </div>
      </Card>

      <div className="flex justify-end mt-6 space-x-3">
        <Button type="button" onClick={cargarEjemplo}>
          CARGAR EJEMPLO
        </Button>
        {/* Nuevo: Descargar XML */}
        <Button type="button" variant="secondary" onClick={handleDescargarXML} disabled={submitting}>
          Descargar XML
        </Button>
        {/* Nuevo: Enviar al correo */}
        <Button type="button" variant="primary" onClick={handleEnviarCorreo} disabled={submitting || enviandoCorreo}>
          {enviandoCorreo ? 'ENVIANDO…' : 'Enviar al correo'}
        </Button>
        <Button type="submit" variant="primary" disabled={submitting}>
          {submitting ? 'GENERANDO...' : 'GENERAR CARTA PORTE'}
        </Button>
      </div>
    </form>
  );
};