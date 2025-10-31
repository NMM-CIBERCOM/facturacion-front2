import React, { useState, useContext } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { Button } from './Button';
import { DatosFiscalesSection } from './DatosFiscalesSection';
import { ThemeContext } from '../App';
import { useEmpresa } from '../context/EmpresaContext';
import { USO_CFDI_OPTIONS, REGIMEN_FISCAL_OPTIONS, PAIS_OPTIONS } from '../constants';
import { pdfService } from '../services/pdfService';
import { facturaService } from '../services/facturaService';
import { correoService } from '../services/correoService';
import { configuracionCorreoService } from '../services/configuracionCorreoService';
import { apiUrl } from '../services/api';

// Base URL para endpoints de notas de crédito (no usan /api)
const CREDIT_NOTES_BASE_URL: string = (
  (import.meta as any)?.env?.VITE_CREDIT_NOTES_BASE_URL || 'http://localhost:8081'
).replace(/\/+$/,'');
interface ConceptoForm {
  descripcion: string;
  cantidad: number | '';
  unidad: string;
  precioUnitario: number | '';
}

interface NotaCreditoFormData {
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
  referenciaFactura: string;
  motivo: string;
  serie: string;
  folio: string;
  metodoPago: string;
  formaPago: string;
}

const initialFormData: NotaCreditoFormData = {
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
  referenciaFactura: '',
  motivo: '',
  serie: 'NC',
  folio: '',
  metodoPago: 'PUE',
  formaPago: '01',
};

export const NotasCreditoPage: React.FC = () => {
  const { empresaInfo } = useEmpresa();
  const { customColors, logoUrl } = useContext(ThemeContext);

  const [formData, setFormData] = useState<NotaCreditoFormData>(initialFormData);
  const [concepto, setConcepto] = useState<ConceptoForm>({
    descripcion: 'DEVOLUCION_MERCANCIA',
    cantidad: 1,
    unidad: 'E48',
    precioUnitario: 0,
  });
  const [descripcionLibre, setDescripcionLibre] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<'rfc' | 'correoElectronico' | 'razonSocial' | 'domicilioFiscal' | 'regimenFiscal' | 'usoCfdi', string>>>({});
  const [generando, setGenerando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);

  const blobToBase64 = (blob: Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      resolve((dataUrl || '').split(',')[1] || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

  // Helper: obtener uuid de nota de crédito desde backend por UUID de factura origen
  const obtenerUuidNotaCredito = async (uuidFacturaOrigen?: string) => {
    try {
      if (!uuidFacturaOrigen || !uuidFacturaOrigen.trim()) return undefined as undefined | { uuidNc: string; serie?: string; folio?: string };
      const resp = await fetch(`${CREDIT_NOTES_BASE_URL}/credit-notes/search?uuidFactura=${encodeURIComponent(uuidFacturaOrigen.trim())}`);
      if (!resp.ok) return undefined;
      const lista = await resp.json();
      if (!Array.isArray(lista) || lista.length === 0) return undefined;
      // Ordenar por fecha_emision descendente si está disponible
      const ordenada = lista
        .slice()
        .sort((a, b) => {
          const fa = new Date(a.fecha_emision || a.fechaEmision || 0).getTime();
          const fb = new Date(b.fecha_emision || b.fechaEmision || 0).getTime();
          return fb - fa;
        });
      const primera = ordenada[0];
      return {
        uuidNc: (primera.uuid_nc || primera.uuidNc || '').toString(),
        serie: primera.serie,
        folio: primera.folio,
      };
    } catch {
      return undefined;
    }
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setMensaje(null);
    setFieldErrors(prev => {
      const next = { ...prev };
      if (name === 'rfcIniciales' || name === 'rfcFecha' || name === 'rfcHomoclave') delete next.rfc;
      // @ts-ignore
      if (next[name]) delete next[name as keyof typeof next];
      return next;
    });
  };

  const handleConceptoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'descripcionLibre') {
      setDescripcionLibre(value);
    } else {
      setConcepto(prev => ({
        ...prev,
        [name]: (name === 'cantidad' || name === 'precioUnitario')
          ? (value === '' ? '' : Number(value))
          : value,
      } as any));
    }
  };

  const validarCampos = () => {
    const rfcCompleto = `${formData.rfcIniciales}${formData.rfcFecha}${formData.rfcHomoclave}`;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const rfcRegex = /^[A-Z&Ñ]{3,4}[0-9]{6}[A-Z0-9]{3}$/;
    const errors: any = {};
    if (!emailRegex.test(formData.correoElectronico || '')) errors.correoElectronico = 'Email inválido';
    if (!rfcRegex.test((rfcCompleto || '').toUpperCase())) errors.rfc = 'RFC inválido';
    ['razonSocial', 'domicilioFiscal', 'regimenFiscal', 'usoCfdi'].forEach((k) => {
      if (!(formData as any)[k]) errors[k] = 'Campo requerido';
    });
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calcularImportes = () => {
    const cantidadNum = typeof concepto.cantidad === 'number' ? concepto.cantidad : 0;
    const precioUnitarioNum = typeof concepto.precioUnitario === 'number' ? concepto.precioUnitario : 0;
    const subtotal = cantidadNum * precioUnitarioNum;
    const iva = +(subtotal * 0.16).toFixed(2);
    const total = +(subtotal + iva).toFixed(2);
    return { subtotal, iva, total };
  };

  const crearXMLNotaCredito = (notaData: any) => {
    const fecha = new Date(notaData.fechaEmision).toISOString();
    const conceptosXML = notaData.conceptos.map((c: any) =>
      `<cfdi:Concepto ClaveProdServ="01010101" Cantidad="${c.cantidad}" ClaveUnidad="${c.unidad || 'E48'}" Descripcion="${c.descripcion}" ValorUnitario="${c.precioUnitario.toFixed(2)}" Importe="${c.importe.toFixed(2)}"/>`
    ).join('');
    return `<?xml version="1.0" encoding="UTF-8"?>\n<cfdi:Comprobante Version="4.0" Serie="${notaData.serie}" Folio="${notaData.folio}" Fecha="${fecha}" SubTotal="${notaData.subtotal.toFixed(2)}" Total="${notaData.importe.toFixed(2)}" Moneda="MXN" TipoDeComprobante="E" LugarExpedicion="12345" xmlns:cfdi="http://www.sat.gob.mx/cfd/4">\n  <cfdi:Emisor Rfc="${notaData.rfcEmisor}" Nombre="${notaData.nombreEmisor}" RegimenFiscal="601"/>\n  <cfdi:Receptor Rfc="${notaData.rfcReceptor}" Nombre="${notaData.nombreReceptor}" UsoCFDI="${notaData.usoCFDI || notaData.usoCfdi}"/>\n  <cfdi:Conceptos>\n    ${conceptosXML}\n  </cfdi:Conceptos>\n</cfdi:Comprobante>`;
  };

  // Guardar la nota de crédito en Oracle (FACTURAS y NOTAS_CREDITO) antes de generar/descargar
  const guardarNotaCreditoEnBD = async (notaData: any, rfcReceptor: string) => {
    try {
      const xmlContent = crearXMLNotaCredito(notaData);
      const payload = {
        uuidFacturaOrig: formData.referenciaFactura || undefined,
        serieFacturaOrig: undefined,
        folioFacturaOrig: undefined,
        uuidNc: notaData.uuid || undefined,
        serieNc: notaData.serie,
        folioNc: notaData.folio,
        fechaEmision: notaData.fechaEmision,
        usoCfdi: formData.usoCfdi,
        regimenFiscal: formData.regimenFiscal,
        motivo: formData.motivo || undefined,
        concepto: notaData.conceptos?.[0]?.descripcion || 'Nota de crédito',
        cantidad: notaData.conceptos?.[0]?.cantidad || 1,
        unidad: notaData.conceptos?.[0]?.unidad || 'E48',
        precioUnitario: notaData.conceptos?.[0]?.precioUnitario || 0,
        subtotal: notaData.subtotal,
        ivaImporte: notaData.iva,
        ivaPorcentaje: 0.16,
        iepsImporte: notaData.ieps || 0,
        iepsPorcentaje: undefined,
        total: notaData.importe,
        xmlContent,
        selloDigital: undefined,
        estatusSat: undefined,
        codeSat: undefined,
        rfcEmisor: empresaInfo.rfc,
        rfcReceptor,
        formaPago: formData.formaPago,
        metodoPago: formData.metodoPago,
      };
      const resp = await fetch(`${CREDIT_NOTES_BASE_URL}/credit-notes/guardar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) {
        throw new Error('No se pudo guardar la nota de crédito en BD');
      }
      const data = await resp.json();
      if (!data?.ok) {
        const errs = (data?.errors || []) as string[];
        const msg = errs.length ? errs.join(' | ') : 'Guardado incompleto';
        throw new Error(msg);
      }
      return true;
    } catch (e) {
      console.warn('Fallo guardando NOTA_CREDITO:', e);
      return false;
    }
  };

  // Guardar únicamente en BD, sin generar PDF/XML
  const handleGuardarFactura = async () => {
    setMensaje(null);
    if (!validarCampos()) {
      setMensaje({ tipo: 'error', texto: 'Completa los datos fiscales obligatorios' });
      return;
    }
    if (concepto.descripcion === 'OTRO' && !descripcionLibre.trim()) {
      setMensaje({ tipo: 'error', texto: 'Especifica la descripción libre del concepto' });
      return;
    }

    const rfcReceptor = `${formData.rfcIniciales}${formData.rfcFecha}${formData.rfcHomoclave}`;
    const { subtotal, iva, total } = calcularImportes();
    const uuidInfo = await obtenerUuidNotaCredito(formData.referenciaFactura);

    const notaData = {
      uuid: uuidInfo?.uuidNc || '',
      rfcEmisor: empresaInfo.rfc,
      nombreEmisor: empresaInfo.nombre,
      rfcReceptor,
      nombreReceptor: formData.razonSocial || `${formData.nombre} ${formData.paterno} ${formData.materno}`.trim(),
      serie: (formData.serie || uuidInfo?.serie || 'NC'),
      folio: (formData.folio || uuidInfo?.folio || new Date().getTime().toString().slice(-6)),
      fechaEmision: new Date().toISOString(),
      importe: total,
      subtotal,
      iva,
      ieps: undefined,
      conceptos: [
        {
          descripcion: (concepto.descripcion === 'OTRO'
            ? descripcionLibre
            : (CONCEPTO_DESC_OPTIONS.find(o => o.value === concepto.descripcion)?.label || concepto.descripcion)),
          cantidad: typeof concepto.cantidad === 'number' ? concepto.cantidad : 0,
          unidad: concepto.unidad,
          precioUnitario: typeof concepto.precioUnitario === 'number' ? concepto.precioUnitario : 0,
          importe: subtotal,
        },
      ],
      metodoPago: formData.metodoPago,
      formaPago: formData.formaPago,
      usoCFDI: formData.usoCfdi,
      referenciaFactura: formData.referenciaFactura || undefined,
      motivo: formData.motivo || undefined,
    };

    try {
      setGenerando(true);
      const ok = await guardarNotaCreditoEnBD(notaData, rfcReceptor);
      if (ok) {
        setMensaje({ tipo: 'success', texto: 'Nota de crédito guardada correctamente' });
      } else {
        setMensaje({ tipo: 'error', texto: 'No se pudo guardar la nota de crédito' });
      }
    } catch (e: any) {
      setMensaje({ tipo: 'error', texto: e?.message || 'Error al guardar la nota de crédito' });
    } finally {
      setGenerando(false);
    }
  };
  const convertirANotaDataParaPDF = (notaData: any) => {
    return {
      uuid: notaData.uuid,
      serie: notaData.serie,
      folio: notaData.folio,
      fechaEmision: notaData.fechaEmision,
      rfcEmisor: notaData.rfcEmisor,
      nombreEmisor: notaData.nombreEmisor,
      rfcReceptor: notaData.rfcReceptor,
      nombreReceptor: notaData.nombreReceptor,
      subtotal: notaData.subtotal,
      iva: notaData.iva,
      total: notaData.importe,
      moneda: 'MXN',
      metodoPago: notaData.metodoPago,
      formaPago: notaData.formaPago,
      usoCfdi: notaData.usoCFDI || notaData.usoCfdi,
      tipoComprobante: 'E',
      lugarExpedicion: '12345',
      xmlTimbrado: crearXMLNotaCredito(notaData),
      cadenaOriginal: `||1.1|${notaData.uuid || 'SIN-UUID'}|${notaData.fechaEmision}||`,
      selloDigital: 'ABC123DEF456',
      certificado: 'MIIE',
      folioFiscal: notaData.uuid || '',
      fechaTimbrado: notaData.fechaEmision,
      conceptos: notaData.conceptos.map((concepto: any) => ({
        claveProdServ: '01010101',
        noIdentificacion: 'NC001',
        cantidad: concepto.cantidad,
        claveUnidad: concepto.unidad || 'E48',
        unidad: concepto.unidad,
        descripcion: concepto.descripcion,
        valorUnitario: concepto.precioUnitario,
        importe: concepto.importe,
        descuento: 0.0,
        impuestos: [{
          tipo: 'Traslado',
          impuesto: '002',
          tipoFactor: 'Tasa',
          tasaOCuota: 0.16,
          base: concepto.importe,
          importe: +(concepto.importe * 0.16).toFixed(2)
        }]
      }))
    };
  };

  const handleDescargarPDFyXML = async () => {
    setMensaje(null);
    if (!validarCampos()) {
      setMensaje({ tipo: 'error', texto: 'Completa los datos fiscales obligatorios' });
      return;
    }
    if (concepto.descripcion === 'OTRO' && !descripcionLibre.trim()) {
      setMensaje({ tipo: 'error', texto: 'Especifica la descripción libre del concepto' });
      return;
    }
    const rfcReceptor = `${formData.rfcIniciales}${formData.rfcFecha}${formData.rfcHomoclave}`;
    const { subtotal, iva, total } = calcularImportes();

    // Intentar obtener uuid de la nota de crédito vinculada a la factura origen
    const uuidInfo = await obtenerUuidNotaCredito(formData.referenciaFactura);

    const notaData = {
      uuid: uuidInfo?.uuidNc || '',
      rfcEmisor: empresaInfo.rfc,
      nombreEmisor: empresaInfo.nombre,
      rfcReceptor,
      nombreReceptor: formData.razonSocial || `${formData.nombre} ${formData.paterno} ${formData.materno}`.trim(),
      serie: (formData.serie || uuidInfo?.serie || 'NC'),
      folio: (formData.folio || uuidInfo?.folio || new Date().getTime().toString().slice(-6)),
      fechaEmision: new Date().toISOString(),
      importe: total,
      subtotal,
      iva,
      ieps: undefined,
      conceptos: [
        {
          descripcion: (concepto.descripcion === 'OTRO'
            ? descripcionLibre
            : (CONCEPTO_DESC_OPTIONS.find(o => o.value === concepto.descripcion)?.label || concepto.descripcion)),
          cantidad: typeof concepto.cantidad === 'number' ? concepto.cantidad : 0,
          unidad: concepto.unidad,
          precioUnitario: typeof concepto.precioUnitario === 'number' ? concepto.precioUnitario : 0,
          importe: subtotal,
        },
      ],
      metodoPago: formData.metodoPago,
      formaPago: formData.formaPago,
      usoCFDI: formData.usoCfdi,
      referenciaFactura: formData.referenciaFactura || undefined,
      motivo: formData.motivo || undefined,
    };

    // Obtener configuración de logos del backend con fallback al tema
    let logoConfigFinal: any = { logoUrl, customColors };
    try {
      const logosResp = await facturaService.obtenerConfiguracionLogos();
      if ((logosResp as any)?.exitoso) {
        logoConfigFinal = {
          logoUrl: logosResp.logoUrl,
          logoBase64: logosResp.logoBase64,
          customColors: logosResp.customColors
        };
      }
    } catch {
      // Fallback ya inicializado
    }

    try {
      setGenerando(true);
      // Guardar en BD antes de generar/descargar
      await guardarNotaCreditoEnBD(notaData, rfcReceptor);
      // Adaptar datos y llamar endpoint backend para PDF
      const facturaData = convertirANotaDataParaPDF(notaData as any);
      const response = await fetch(apiUrl('/factura/generar-pdf'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          facturaData: facturaData,
          logoConfig: logoConfigFinal
        })
      });

      if (!response.ok) {
        throw new Error('Error al generar PDF en el servidor');
      }

      setMensaje({ tipo: 'success', texto: 'PDF generado. Iniciando descarga...' });

      const pdfBlob = await response.blob();
      pdfService.descargarPDF(pdfBlob, `NotaCredito_${notaData.serie}-${notaData.folio}.pdf`);

      // Generar y descargar XML desde el frontend
      const xmlContent = crearXMLNotaCredito(notaData);
      const xmlBlob = new Blob([xmlContent], { type: 'application/xml' });
      const url = window.URL.createObjectURL(xmlBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NotaCredito_${notaData.serie}-${notaData.folio}.xml`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setMensaje({ tipo: 'success', texto: 'PDF y XML descargados correctamente' });
    } catch (e: any) {
      setMensaje({ tipo: 'error', texto: e?.message || 'Error al descargar PDF/XML' });
    } finally {
      setGenerando(false);
    }
  };

  // Descargas individuales: XML y PDF para Nota de Crédito
  const handleDescargarXML = async () => {
    setMensaje(null);
    if (!validarCampos()) {
      setMensaje({ tipo: 'error', texto: 'Completa los datos fiscales obligatorios' });
      return;
    }
    if (concepto.descripcion === 'OTRO' && !descripcionLibre.trim()) {
      setMensaje({ tipo: 'error', texto: 'Especifica la descripción libre del concepto' });
      return;
    }
  
    const rfcReceptor = `${formData.rfcIniciales}${formData.rfcFecha}${formData.rfcHomoclave}`;
    const { subtotal, iva, total } = calcularImportes();
  
    const uuidInfo = await obtenerUuidNotaCredito(formData.referenciaFactura);
  
    const notaData = {
      uuid: uuidInfo?.uuidNc || '',
      rfcEmisor: empresaInfo.rfc,
      nombreEmisor: empresaInfo.nombre,
      rfcReceptor,
      nombreReceptor: formData.razonSocial || `${formData.nombre} ${formData.paterno} ${formData.materno}`.trim(),
      serie: (formData.serie || uuidInfo?.serie || 'NC'),
      folio: (formData.folio || uuidInfo?.folio || new Date().getTime().toString().slice(-6)),
      fechaEmision: new Date().toISOString(),
      importe: total,
      subtotal,
      iva,
      ieps: undefined,
      conceptos: [
        {
          descripcion: (concepto.descripcion === 'OTRO'
            ? descripcionLibre
            : (CONCEPTO_DESC_OPTIONS.find(o => o.value === concepto.descripcion)?.label || concepto.descripcion)),
          cantidad: typeof concepto.cantidad === 'number' ? concepto.cantidad : 0,
          unidad: concepto.unidad,
          precioUnitario: typeof concepto.precioUnitario === 'number' ? concepto.precioUnitario : 0,
          importe: subtotal,
        },
      ],
      metodoPago: formData.metodoPago,
      formaPago: formData.formaPago,
      usoCFDI: formData.usoCfdi,
      referenciaFactura: formData.referenciaFactura || undefined,
      motivo: formData.motivo || undefined,
    };
  
    try {
      setGenerando(true);
      const xmlContent = crearXMLNotaCredito(notaData);
      const xmlBlob = new Blob([xmlContent], { type: 'application/xml' });
      const url = window.URL.createObjectURL(xmlBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NotaCredito_${notaData.serie}-${notaData.folio}.xml`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      setMensaje({ tipo: 'success', texto: 'XML descargado correctamente' });
    } catch (e: any) {
      setMensaje({ tipo: 'error', texto: e?.message || 'Error al descargar XML' });
    } finally {
      setGenerando(false);
    }
  };

  const handleDescargarPDF = async () => {
    setMensaje(null);
    if (!validarCampos()) {
      setMensaje({ tipo: 'error', texto: 'Completa los datos fiscales obligatorios' });
      return;
    }
    if (concepto.descripcion === 'OTRO' && !descripcionLibre.trim()) {
      setMensaje({ tipo: 'error', texto: 'Especifica la descripción libre del concepto' });
      return;
    }
  
    const rfcReceptor = `${formData.rfcIniciales}${formData.rfcFecha}${formData.rfcHomoclave}`;
    const { subtotal, iva, total } = calcularImportes();
  
    const uuidInfo = await obtenerUuidNotaCredito(formData.referenciaFactura);
  
    const notaData = {
      uuid: uuidInfo?.uuidNc || '',
      rfcEmisor: empresaInfo.rfc,
      nombreEmisor: empresaInfo.nombre,
      rfcReceptor,
      nombreReceptor: formData.razonSocial || `${formData.nombre} ${formData.paterno} ${formData.materno}`.trim(),
      serie: (formData.serie || uuidInfo?.serie || 'NC'),
      folio: (formData.folio || uuidInfo?.folio || new Date().getTime().toString().slice(-6)),
      fechaEmision: new Date().toISOString(),
      importe: total,
      subtotal,
      iva,
      ieps: undefined,
      conceptos: [
        {
          descripcion: (concepto.descripcion === 'OTRO'
            ? descripcionLibre
            : (CONCEPTO_DESC_OPTIONS.find(o => o.value === concepto.descripcion)?.label || concepto.descripcion)),
          cantidad: typeof concepto.cantidad === 'number' ? concepto.cantidad : 0,
          unidad: concepto.unidad,
          precioUnitario: typeof concepto.precioUnitario === 'number' ? concepto.precioUnitario : 0,
          importe: subtotal,
        },
      ],
      metodoPago: formData.metodoPago,
      formaPago: formData.formaPago,
      usoCFDI: formData.usoCfdi,
      referenciaFactura: formData.referenciaFactura || undefined,
      motivo: formData.motivo || undefined,
    };
  
    // Obtener configuración de logos del backend con fallback al tema
    let logoConfigFinal: any = { logoUrl, customColors };
    try {
      const logosResp = await facturaService.obtenerConfiguracionLogos();
      if ((logosResp as any)?.exitoso) {
        logoConfigFinal = {
          logoUrl: logosResp.logoUrl,
          logoBase64: logosResp.logoBase64,
          customColors: logosResp.customColors
        };
      }
    } catch {}
  
    try {
      setGenerando(true);
      // Guardar en BD antes de generar PDF
      await guardarNotaCreditoEnBD(notaData, rfcReceptor);
      const facturaData = convertirANotaDataParaPDF(notaData as any);
      const response = await fetch(apiUrl('/factura/generar-pdf'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facturaData, logoConfig: logoConfigFinal })
      });
      if (!response.ok) throw new Error('Error al generar PDF en el servidor');
      const pdfBlob = await response.blob();
      pdfService.descargarPDF(pdfBlob, `NotaCredito_${notaData.serie}-${notaData.folio}.pdf`);
      setMensaje({ tipo: 'success', texto: 'PDF descargado correctamente' });
    } catch (e: any) {
      setMensaje({ tipo: 'error', texto: e?.message || 'Error al descargar PDF' });
    } finally {
      setGenerando(false);
    }
  };

  const handleEnviarCorreo = async () => {
    setMensaje(null);
    if (!validarCampos()) {
      setMensaje({ tipo: 'error', texto: 'Completa los datos fiscales obligatorios' });
      return;
    }
    if (concepto.descripcion === 'OTRO' && !descripcionLibre.trim()) {
      setMensaje({ tipo: 'error', texto: 'Especifica la descripción libre del concepto' });
      return;
    }

    const rfcReceptor = `${formData.rfcIniciales}${formData.rfcFecha}${formData.rfcHomoclave}`;
    const { subtotal, iva, total } = calcularImportes();

    // Intentar obtener uuid de la nota de crédito vinculada a la factura origen
    const uuidInfo = await obtenerUuidNotaCredito(formData.referenciaFactura);

    const notaData = {
      uuid: uuidInfo?.uuidNc || '',
      rfcEmisor: empresaInfo.rfc,
      nombreEmisor: empresaInfo.nombre,
      rfcReceptor,
      nombreReceptor: formData.razonSocial || `${formData.nombre} ${formData.paterno} ${formData.materno}`.trim(),
      serie: (formData.serie || uuidInfo?.serie || 'NC'),
      folio: (formData.folio || uuidInfo?.folio || new Date().getTime().toString().slice(-6)),
      fechaEmision: new Date().toISOString(),
      importe: total,
      subtotal,
      iva,
      ieps: undefined,
      conceptos: [
        {
          descripcion: (concepto.descripcion === 'OTRO'
            ? descripcionLibre
            : (CONCEPTO_DESC_OPTIONS.find(o => o.value === concepto.descripcion)?.label || concepto.descripcion)),
          cantidad: typeof concepto.cantidad === 'number' ? concepto.cantidad : 0,
          unidad: concepto.unidad,
          precioUnitario: typeof concepto.precioUnitario === 'number' ? concepto.precioUnitario : 0,
          importe: subtotal,
        },
      ],
      metodoPago: formData.metodoPago,
      formaPago: formData.formaPago,
      usoCFDI: formData.usoCfdi,
      referenciaFactura: formData.referenciaFactura || undefined,
      motivo: formData.motivo || undefined,
    } as any;

    // Obtener configuración de logos del backend con fallback al tema
    let logoConfigFinal: any = { logoUrl, customColors };
    try {
      const logosResp = await facturaService.obtenerConfiguracionLogos();
      if ((logosResp as any)?.exitoso) {
        logoConfigFinal = {
          logoUrl: logosResp.logoUrl,
          logoBase64: logosResp.logoBase64,
          customColors: logosResp.customColors
        };
      }
    } catch {}

    try {
      setEnviandoCorreo(true);
      // Guardar en BD antes de enviar correo
      await guardarNotaCreditoEnBD(notaData, rfcReceptor);
      const facturaData = convertirANotaDataParaPDF(notaData);
      const response = await fetch(apiUrl('/factura/generar-pdf'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facturaData, logoConfig: logoConfigFinal })
      });

      if (!response.ok) {
        throw new Error('Error al generar PDF en el servidor');
      }

      const pdfBlob = await response.blob();
      const pdfBase64 = await blobToBase64(pdfBlob);

      // Construir asunto y mensaje usando configuración
      const configMensaje = await configuracionCorreoService.obtenerMensajeParaEnvio();
      const facturaInfo = `${notaData.serie}-${notaData.folio}`;
      let asunto = (configMensaje?.asunto || 'Nota de Crédito - {facturaInfo}');
      asunto = configuracionCorreoService.procesarMensaje(asunto, {
        facturaInfo,
        serie: notaData.serie,
        folio: notaData.folio,
        uuid: notaData.uuid || '',
        rfcEmisor: empresaInfo.rfc,
        rfcReceptor
      });

      // Preparar variables para plantilla en backend
      const templateVars = {
        facturaInfo,
        serie: notaData.serie,
        folio: notaData.folio,
        uuid: notaData.uuid || '',
        rfcEmisor: empresaInfo.rfc,
        rfcReceptor
      } as Record<string, string>;

      // Mensaje base (se aplicará formato en backend)
      const mensajeBase = configMensaje?.mensajePersonalizado || configMensaje?.mensaje || 'Se ha generado su nota de crédito.\n\nGracias por su preferencia.';

      const correoResp = await correoService.enviarPdfDirecto({
        pdfBase64,
        correoReceptor: formData.correoElectronico,
        asunto,
        mensaje: mensajeBase,
        nombreAdjunto: `NotaCredito_${notaData.serie}-${notaData.folio}.pdf`,
        templateVars
      });

      if (correoResp.success) {
        setMensaje({ tipo: 'success', texto: correoResp.message || 'Correo enviado exitosamente' });
        alert(`✅ PDF de nota de crédito enviado exitosamente al correo: ${formData.correoElectronico}`);
      } else {
        setMensaje({ tipo: 'error', texto: correoResp.message || 'Error al enviar el correo' });
      }
    } catch (e: any) {
      setMensaje({ tipo: 'error', texto: e?.message || 'Error al enviar el correo' });
    } finally {
      setEnviandoCorreo(false);
    }
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
      <DatosFiscalesSection
        formData={formData}
        handleChange={handleChange}
        isRFCRequired={true}
        isRazonSocialRequired={true}
        isDomicilioFiscalRequired={true}
        isRegimenFiscalRequired={true}
        isUsoCfdiRequired={true}
        isCorreoElectronicoRequired={true}
        fieldErrors={fieldErrors}
      />

      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Detalles de la Nota de crédito</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
          <FormField label="Referencia factura:" name="referenciaFactura" value={formData.referenciaFactura} onChange={handleChange} />
          <SelectField label="Motivo de la nota de crédito:" name="motivo" value={formData.motivo} onChange={handleChange} options={MOTIVO_NC_OPTIONS} />
          <FormField label="Serie:" name="serie" value={formData.serie} onChange={handleChange} />
          <FormField label="Folio:" name="folio" value={formData.folio} onChange={handleChange} />
          <SelectField label="Uso CFDI:" name="usoCfdi" value={formData.usoCfdi} onChange={handleChange} options={USO_CFDI_OPTIONS} />
          <SelectField label="Régimen Fiscal:" name="regimenFiscal" value={formData.regimenFiscal} onChange={handleChange} options={REGIMEN_FISCAL_OPTIONS} />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Concepto</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
          <SelectField label="Concepto / descripción:" name="descripcion" value={concepto.descripcion} onChange={handleConceptoChange} options={CONCEPTO_DESC_OPTIONS} />
          {concepto.descripcion === 'OTRO' && (
            <FormField label="Descripción libre:" name="descripcionLibre" value={descripcionLibre} onChange={handleConceptoChange} />
          )}
          <FormField label="Cantidad:" name="cantidad" type="number" value={concepto.cantidad} onChange={handleConceptoChange} />
          <FormField label="Unidad:" name="unidad" value={concepto.unidad} onChange={handleConceptoChange} />
          <FormField label="Precio Unitario:" name="precioUnitario" type="number" value={concepto.precioUnitario} onChange={handleConceptoChange} />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Los importes se calcularán automáticamente para el PDF de vista previa.
        </p>
      </Card>

      <div className="flex justify-end mt-4">
        <Button type="button" variant="secondary" onClick={handleGuardarFactura} disabled={generando || enviandoCorreo}>
          Guardar factura
        </Button>
        <Button type="button" variant="secondary" onClick={handleEnviarCorreo} disabled={generando || enviandoCorreo}>
          Enviar por correo
        </Button>
        <Button type="button" variant="secondary" onClick={handleDescargarXML} disabled={generando}>
          Descargar XML
        </Button>
        <Button type="button" variant="secondary" onClick={handleDescargarPDF} disabled={generando}>
          Descargar PDF
        </Button>
        <Button type="button" variant="primary" onClick={handleDescargarPDFyXML} disabled={generando}>
          Descargar PDF y XML
        </Button>
      </div>

      {mensaje && (
        <div
          className={
            mensaje.tipo === 'success'
              ? 'mt-4 rounded-md border border-green-200 bg-green-50 p-4 text-green-800'
              : 'mt-4 rounded-md border border-red-200 bg-red-50 p-4 text-red-800'
          }
        >
          <p className="font-semibold mb-1">
            {mensaje.tipo === 'success' ? 'Operación exitosa' : 'Error en operación'}
          </p>
          <p className="text-sm">{mensaje.texto}</p>
        </div>
      )}
    </form>
  );
};

// Opciones SAT para Motivo de Nota de Crédito (CFDI 4.0)
const MOTIVO_NC_OPTIONS = [
  { value: '01', label: '01 – Devolución de mercancías' },
  { value: '02', label: '02 – Descuento sobre factura' },
  { value: '03', label: '03 – Bonificación' },
  { value: '04', label: '04 – Disminución en el valor de la operación' },
  { value: '05', label: '05 – Cancelación por error en factura' },
];

// Opciones de concepto/descrición estándar para Nota de Crédito
const CONCEPTO_DESC_OPTIONS = [
  { value: 'DEVOLUCION_MERCANCIA', label: 'Devolución de mercancías' },
  { value: 'DESCUENTO_ERROR_PRECIO', label: 'Descuento aplicado por error en el precio unitario' },
  { value: 'BONIFICACION', label: 'Bonificación' },
  { value: 'DISMINUCION_VALOR', label: 'Disminución en el valor de la operación' },
  { value: 'CANCELACION_SERVICIO', label: 'Cancelación de servicio no realizado' },
  { value: 'AJUSTE_IVA_INCORRECTO', label: 'Ajuste por factura emitida con IVA incorrecto' },
  { value: 'OTRO', label: 'Otro (texto libre)' },
];