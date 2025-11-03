import React, { useState, useEffect, useContext, useCallback } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { CheckboxField } from './CheckboxField';
import { Button } from './Button';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';
import { EnviarCorreoModal } from './EnviarCorreoModal';
import { useEmpresa } from '../context/EmpresaContext';
import { correoService } from '../services/correoService';
import { configuracionCorreoService } from '../services/configuracionCorreoService';
import { facturaService } from '../services/facturaService';
import { ticketService, Ticket, TicketSearchFilters } from '../services/ticketService';
import {
  PAIS_OPTIONS,
  REGIMEN_FISCAL_OPTIONS,
  USO_CFDI_OPTIONS,
  TIENDA_OPTIONS,
  MEDIO_PAGO_OPTIONS,
  FORMA_PAGO_OPTIONS
} from '../constants';
import { pacUrl } from '../services/api';

interface FormData {
  rfc: string;
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
  codigoFacturacion: string;
  tienda: string;
  fecha: string;
  terminal: string;
  boleta: string;
  medioPago: string;
  formaPago: string;
  iepsDesglosado: boolean;
  uuid: string;
}

interface Factura {
  uuid: string;
  codigoFacturacion: string;
  tienda: string;
  fechaFactura: string;
  terminal: string;
  boleta: string;
  razonSocial: string;
  rfc: string;
  total: number;
  estado: string;
  medioPago: string;
  formaPago: string;
  fechaGeneracion?: string;
  fechaTimbrado?: string;
  subtotal?: number;
  iva?: number;
  ieps?: number;
}

const initialFormData: FormData = {
  rfc: '',
  correoElectronico: '',
  razonSocial: '',
  nombre: '',
  paterno: '',
  materno: '',
  pais: PAIS_OPTIONS[0].value,
  noRegistroIdentidadTributaria: '',
  domicilioFiscal: '',
  regimenFiscal: REGIMEN_FISCAL_OPTIONS[0].value,
  usoCfdi: USO_CFDI_OPTIONS[0].value,
  codigoFacturacion: '',
  tienda: TIENDA_OPTIONS[0].value,
  fecha: new Date().toISOString().split('T')[0],
  terminal: '',
  boleta: '',
  medioPago: MEDIO_PAGO_OPTIONS[0].value,
  formaPago: FORMA_PAGO_OPTIONS[0].value,
  iepsDesglosado: false,
  uuid: '',
};

export const InvoiceForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [timbradoStatus, setTimbradoStatus] = useState<string | null>(null);
  const [timbradoIntervalId, setTimbradoIntervalId] = useState<number | null>(null);
  const [cargandoFacturas, setCargandoFacturas] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [cargandoTickets, setCargandoTickets] = useState(false);
  const [mostrarTabla, setMostrarTabla] = useState(false);
  const [ticketSeleccionado, setTicketSeleccionado] = useState<Ticket | null>(null);
  const [paginaActual, setPaginaActual] = useState(1);
  const [elementosPorPagina] = useState(5);
  const [modalCorreo, setModalCorreo] = useState<{
    isOpen: boolean;
    facturaUuid: string;
    facturaInfo: string;
    correoInicial: string;
    rfcReceptor: string;
  }>({
    isOpen: false,
    facturaUuid: '',
    facturaInfo: '',
    correoInicial: '',
    rfcReceptor: ''
  });
  const { empresaInfo } = useEmpresa();

  // Función para formatear fechas con milisegundos
  const formatearFechaConMilisegundos = (fecha: string | null): string => {
    if (!fecha) return 'N/A';
    try {
      console.log('🔍 Formateando fecha:', fecha, 'tipo:', typeof fecha);
      const date = new Date(fecha);
      console.log('🔍 Fecha parseada:', date);
      
      // Verificar si la fecha es válida
      if (isNaN(date.getTime())) {
        console.error('❌ Fecha inválida:', fecha);
        return 'N/A';
      }
      
      // Extraer milisegundos directamente del string si está disponible
      let milisegundos = '000';
      if (fecha.includes('.')) {
        const milisegundosPart = fecha.split('.')[1];
        if (milisegundosPart && milisegundosPart.length >= 3) {
          milisegundos = milisegundosPart.substring(0, 3);
        }
      } else {
        milisegundos = date.getMilliseconds().toString().padStart(3, '0');
      }
      
      const fechaFormateada = date.toLocaleString('es-MX', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      
      const resultado = `${fechaFormateada}.${milisegundos}`;
      console.log('✅ Fecha formateada:', resultado);
      return resultado;
    } catch (error) {
      console.error('❌ Error al formatear fecha:', error, 'fecha original:', fecha);
      return 'N/A';
    }
  };

  const cargarFacturas = useCallback(async () => {
    console.log('📥 Iniciando carga de facturas...');
    setCargandoFacturas(true);
    try {
      // Consulta todas las facturas usando el endpoint GET
      const response = await fetch(`http://localhost:8080/api/factura/consultar-por-empresa`);
      const data = await response.json();

      if (data.exitoso && data.facturas) {
        console.log(`📊 Facturas recibidas del servidor: ${data.facturas.length}`);
        console.log('🔍 Primera factura recibida:', data.facturas[0]);
        console.log('🔍 Tipos de fechas:', {
          fechaFactura: typeof data.facturas[0]?.fechaFactura,
          fechaGeneracion: typeof data.facturas[0]?.fechaGeneracion,
          fechaTimbrado: typeof data.facturas[0]?.fechaTimbrado
        });
        console.log('🔍 Valores de fechas:', {
          fechaFactura: data.facturas[0]?.fechaFactura,
          fechaGeneracion: data.facturas[0]?.fechaGeneracion,
          fechaTimbrado: data.facturas[0]?.fechaTimbrado
        });
        
        const facturasFormateadas = data.facturas.map((factura: any) => ({
          ...factura,
          // Mapear campos del backend nuevo a los usados en UI
          fechaFactura: formatearFechaConMilisegundos(
            factura.fechaFactura || factura.fechaGeneracion || factura.fechaTimbrado || factura.fechaEmision
          ),
          fechaGeneracion: formatearFechaConMilisegundos(factura.fechaGeneracion),
          fechaTimbrado: formatearFechaConMilisegundos(factura.fechaTimbrado),
          codigoFacturacion: factura.codigoFacturacion
            || `${factura.serie || ''}${factura.folio || ''}`.trim()
            || factura.uuid,
          total: typeof factura.total === 'number'
            ? factura.total
            : (typeof factura.importe === 'number' ? factura.importe : 0),
          estado: factura.estado || factura.estatusFacturacion || 'DESCONOCIDO',
          rfc: factura.rfc || factura.rfcReceptor || factura.rfcEmisor || '',
          razonSocial: factura.razonSocial || factura.nombreCliente || '',
          // Mantener fechas originales para ordenamiento
          fechaOriginal: factura.fechaFactura || factura.fechaGeneracion || factura.fechaTimbrado || factura.fechaEmision
        }));
        
        // Verificar duplicaciones por UUID
        const uuids = facturasFormateadas.map((f: any) => f.uuid);
        const uuidsUnicos = [...new Set(uuids)];
        console.log(`✅ Facturas formateadas: ${facturasFormateadas.length}`);
        console.log(`🔍 UUIDs únicos: ${uuidsUnicos.length}`);
        console.log(`⚠️ Duplicaciones detectadas: ${facturasFormateadas.length - uuidsUnicos.length}`);
        
        let facturasFinales = facturasFormateadas;
        
        if (uuids.length !== uuidsUnicos.length) {
          console.warn('🚨 DUPLICACIONES DETECTADAS - Eliminando duplicados');
          // Eliminar duplicados manteniendo solo la primera ocurrencia
          facturasFinales = facturasFormateadas.filter((factura: any, index: number, self: any[]) => 
            index === self.findIndex((f: any) => f.uuid === factura.uuid)
          );
          console.log(`✅ Facturas sin duplicados: ${facturasFinales.length}`);
        }
        
        // Ordenar facturas de la más reciente a la más antigua
        facturasFinales.sort((a: any, b: any) => {
          const fechaA = a.fechaOriginal;
          const fechaB = b.fechaOriginal;
          
          if (!fechaA && !fechaB) return 0;
          if (!fechaA) return 1;
          if (!fechaB) return -1;
          
          const dateA = new Date(fechaA);
          const dateB = new Date(fechaB);
          
          return dateB.getTime() - dateA.getTime(); // Orden descendente (más reciente primero)
        });
        
        console.log(`📅 Facturas ordenadas de más reciente a más antigua`);
        setFacturas(facturasFinales);
        
        setMostrarTabla(true);
        setPaginaActual(1); // Resetear a la primera página
      } else {
        console.error('❌ Error al cargar facturas:', data.error);
        setFacturas([]);
      }
    } catch (error) {
      console.error('❌ Error al cargar facturas:', error);
      setFacturas([]);
    } finally {
      setCargandoFacturas(false);
    }
  }, []);

  // Cargar facturas sólo bajo demanda desde el botón; evitar carga automática al montar
  // useEffect(() => {
  //   console.log('🔄 useEffect ejecutado - cargando facturas');
  //   cargarFacturas();
  // }, [cargarFacturas]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Transformar los datos del frontend al formato que espera el backend (FacturaFrontendRequest)
      const facturaRequest = {
        rfc: formData.rfc,
        correoElectronico: formData.correoElectronico,
        razonSocial: formData.razonSocial,
        nombre: formData.nombre,
        paterno: formData.paterno,
        materno: formData.materno,
        pais: formData.pais,
        noRegistroIdentidadTributaria: formData.noRegistroIdentidadTributaria,
        domicilioFiscal: formData.domicilioFiscal,
        regimenFiscal: formData.regimenFiscal,
        usoCfdi: formData.usoCfdi,
        codigoFacturacion: formData.codigoFacturacion,
        tienda: formData.tienda,
        fecha: formData.fecha,
        terminal: formData.terminal,
        boleta: formData.boleta,
        medioPago: formData.medioPago,
        formaPago: formData.formaPago,
        iepsDesglosado: formData.iepsDesglosado,
        guardarEnMongo: true,
      };

      console.log('📤 Enviando datos al backend (frontend):', facturaRequest);

      const response = await fetch('http://localhost:8080/api/factura/generar/frontend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(facturaRequest),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📥 Respuesta del servidor:', data);
      
      const uuid = data.uuid || data.datos?.folioFiscal || data.datosFactura?.uuid;

      if (data.exitoso) {
        alert(`✅ ${data.mensaje}\nUUID: ${uuid}\nFactura guardada en base de datos`);
        // Persistir el UUID en el formulario para acciones rápidas
        setFormData(prev => ({ ...prev, uuid: uuid || prev.uuid }));
        if (uuid) {
          setTimbradoStatus('4 - EN PROCESO DE EMISION');
          iniciarPollingTimbrado(uuid);
        }
        
        // Confirmación antes de enviar por correo
        if (formData.correoElectronico && formData.correoElectronico.trim()) {
          const confirmar = window.confirm('¿Desea enviar los archivos al correo del receptor?');
          if (confirmar) {
            await enviarCorreoDirectoConUuid(uuid);
          }
        }
        
        // Recargar facturas después de guardar una nueva
        console.log('🔄 Recargando facturas después de guardar nueva factura');
        cargarFacturas();
      } else {
        alert(`❌ ${data.mensaje}\nErrores: ${data.errores || data.error}`);
      }
    } catch (error) {
      console.error('❌ Error en el envío:', error);
      alert(`Hubo un error al enviar el formulario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  // Consulta estado de timbrado en PAC
  const consultarEstatusTimbrado = async (uuid: string): Promise<{ codigo: string; descripcion: string } | null> => {
    try {
      const resp = await fetch(pacUrl(`/pac/stamp/status/${encodeURIComponent(uuid)}`));
      if (!resp.ok) return null;
      const data = await resp.json().catch(() => null);
      const codigo = String(data?.status || data?.codigo || '');
      const descripcion = String(data?.descripcion || data?.statusDescripcion || '');
      if (!codigo) return null;
      return { codigo, descripcion };
    } catch {
      return null;
    }
  };

  // Inicia polling cada 3s hasta EMITIDA (0)
  const iniciarPollingTimbrado = (uuid: string) => {
    if (timbradoIntervalId) {
      window.clearInterval(timbradoIntervalId);
      setTimbradoIntervalId(null);
    }
    const id = window.setInterval(async () => {
      const est = await consultarEstatusTimbrado(uuid);
      if (!est) return;
      if (est.codigo === '0') {
        setTimbradoStatus('0 - EMITIDA');
        window.clearInterval(id);
        setTimbradoIntervalId(null);
      } else if (est.codigo === '4') {
        setTimbradoStatus('4 - EN PROCESO DE EMISION');
      } else if (est.codigo === '2') {
        setTimbradoStatus('2 - CANCELADA EN SAT');
        window.clearInterval(id);
        setTimbradoIntervalId(null);
      } else if (est.codigo === '66') {
        setTimbradoStatus('66 - POR TIMBRAR');
      }
    }, 3000);
    setTimbradoIntervalId(id);
  };

  // Limpieza de intervalos al desmontar
  useEffect(() => {
    return () => {
      if (timbradoIntervalId) {
        window.clearInterval(timbradoIntervalId);
      }
    };
  }, [timbradoIntervalId]);

  const handleCancel = () => {
    setFormData(initialFormData);
    alert('Formulario reiniciado');
  };

  const handleAgregarBoleta = () => {
    alert(`Boleta agregada: Código ${formData.codigoFacturacion}, Tienda ${formData.tienda}, Fecha ${formData.fecha}`);
  };

  const handleBuscarTicket = async () => {
    try {
      setCargandoTickets(true);
      const filtros: TicketSearchFilters = {
        codigoTienda: formData.tienda,
        terminalId: formData.terminal ? Number(formData.terminal) : undefined,
        fecha: formData.fecha,
        folio: formData.boleta ? Number(formData.boleta) : undefined,
      };
      const resultados = await ticketService.buscarTickets(filtros);
      setTickets(resultados);
      // Mostrar tabla solo si hay múltiples resultados
      setMostrarTabla(resultados && resultados.length > 1);
      if (!resultados || resultados.length === 0) {
        alert('No se encontraron tickets con los filtros proporcionados.');
      } else {
        if (resultados.length === 1) {
          setTicketSeleccionado(resultados[0]);
          rellenarFormularioConTicket(resultados[0]);
        } else {
          setTicketSeleccionado(null);
        }
      }
    } catch (error) {
      console.error('❌ Error al consultar tickets:', error);
      alert('Error al consultar tickets. Revisa la consola para más detalles.');
    } finally {
      setCargandoTickets(false);
    }
  };

  // Rellena las secciones del formulario usando los datos del ticket encontrado
  const rellenarFormularioConTicket = (t: Ticket) => {
    setFormData(prev => ({
      ...prev,
      tienda: t.codigoTienda ?? prev.tienda,
      fecha: t.fecha ?? prev.fecha,
      terminal: t.terminalId != null ? String(t.terminalId) : prev.terminal,
      boleta: t.folio != null ? String(t.folio) : prev.boleta,
      // El backend devuelve formaPago tipo SAT (01, 03, 28...). Lo mapeamos a Medio de Pago.
      medioPago: t.formaPago ?? prev.medioPago,
      // Suponemos PUE por defecto si no hay valor explícito
      formaPago: prev.formaPago || 'PUE',
    }));
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'TIMBRADA':
      case 'VIGENTE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'GENERADA':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'CANCELADA':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const descargarXml = async (uuid: string, codigoFacturacion: string) => {
    try {
      await facturaService.generarYDescargarXML(uuid);
    } catch (error) {
      console.error('❌ Error al descargar XML:', error);
      alert('Error al descargar el XML. Intenta nuevamente.');
    }
  };

  const descargarPdf = async (uuid: string) => {
    try {
      await facturaService.generarYDescargarPDF(uuid);
    } catch (error) {
      console.error('❌ Error al descargar PDF:', error);
      alert(`Error al descargar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  // Enviar correo directo (sin modal) usando el email del formulario
  const enviarCorreoDirectoConUuid = async (uuid: string) => {
    const correo = (formData.correoElectronico || '').trim();
    if (!correo || !correoService.validarEmail(correo)) {
      alert('Ingresa un correo electrónico válido en el formulario.');
      return;
    }

    let serieFactura = '';
    let folioFactura = '';
    try {
      const facturaCompleta = await facturaService.obtenerFacturaPorUUID(uuid);
      serieFactura = facturaCompleta.serie || '';
      folioFactura = facturaCompleta.folio || '';
    } catch {}

    const asunto = `Factura ${serieFactura || 'A'}${folioFactura || '1'} - ${empresaInfo?.nombre || 'Empresa'}`;
    const mensaje = `Estimado(a) cliente,\n\nSe ha generado su factura electrónica.\n\nGracias por su preferencia.`;

    try {
      const resp = await correoService.enviarCorreoConPdfAdjunto({
        uuidFactura: uuid,
        correoReceptor: correo,
        asunto,
        mensaje,
      });
      if (resp.success) {
        alert(`✅ Correo enviado exitosamente a: ${correo}`);
      } else {
        alert(`⚠️ Error al enviar correo: ${resp.message || 'Desconocido'}`);
      }
    } catch (error) {
      console.error('❌ Error al enviar correo:', error);
      alert(`Error al enviar correo: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  // Acciones rápidas junto a Guardar/Cancelar usando el UUID activo
  const descargarXmlActual = async () => {
    const uuidActivo = (formData.uuid || '').trim();
    if (!uuidActivo) {
      alert('Primero guarda o consulta una factura para obtener el UUID.');
      return;
    }
    await descargarXml(uuidActivo, formData.codigoFacturacion || 'Factura');
  };

  const descargarPdfActual = async () => {
    const uuidActivo = (formData.uuid || '').trim();
    if (!uuidActivo) {
      alert('Primero guarda o consulta una factura para obtener el UUID.');
      return;
    }
    await descargarPdf(uuidActivo);
  };

  const enviarCorreoActual = async () => {
    const uuidActivo = (formData.uuid || '').trim();
    if (!uuidActivo) {
      alert('Primero guarda o consulta una factura para obtener el UUID.');
      return;
    }
    await enviarCorreoDirectoConUuid(uuidActivo);
  };

  const enviarCorreoPorFactura = async (factura: Factura) => {
    const uuidActivo = (factura.uuid || '').trim();
    if (!uuidActivo) {
      alert('El UUID de la factura es inválido.');
      return;
    }
    await enviarCorreoDirectoConUuid(uuidActivo);
  };

  const cerrarModalCorreo = () => {
    setModalCorreo({
      isOpen: false,
      facturaUuid: '',
      facturaInfo: '',
      correoInicial: '',
      rfcReceptor: ''
    });
  };

  // Funciones de paginación
  const totalPaginas = Math.ceil(facturas.length / elementosPorPagina);
  const indiceInicio = (paginaActual - 1) * elementosPorPagina;
  const indiceFin = indiceInicio + elementosPorPagina;
  const facturasPaginadas = facturas.slice(indiceInicio, indiceFin);

  console.log(`�� Paginación - Total facturas: ${facturas.length}, Página actual: ${paginaActual}, Elementos por página: ${elementosPorPagina}`);
  console.log(`📄 Índices - Inicio: ${indiceInicio}, Fin: ${indiceFin}, Mostrando: ${facturasPaginadas.length}`);
  console.log(`📄 UUIDs de facturas paginadas:`, facturasPaginadas.map(f => f.uuid));

  const cambiarPagina = (nuevaPagina: number) => {
    console.log(`🔄 Cambiando de página ${paginaActual} a ${nuevaPagina}`);
    setPaginaActual(nuevaPagina);
  };

  const irAPrimeraPagina = () => {
    console.log('🔄 Yendo a primera página');
    setPaginaActual(1);
  };

  const irAUltimaPagina = () => {
    console.log(`🔄 Yendo a última página: ${totalPaginas}`);
    setPaginaActual(totalPaginas);
  };

  const irAPaginaAnterior = () => {
    if (paginaActual > 1) {
      console.log(`🔄 Yendo a página anterior: ${paginaActual - 1}`);
      setPaginaActual(paginaActual - 1);
    }
  };

  const irAPaginaSiguiente = () => {
    if (paginaActual < totalPaginas) {
      console.log(`🔄 Yendo a página siguiente: ${paginaActual + 1}`);
      setPaginaActual(paginaActual + 1);
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {formData.uuid && (
          <div className="p-2 rounded bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100">
            Estado de timbrado: {timbradoStatus || 'Desconocido'}
          </div>
        )}
        <Card title="Datos Fiscales">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FormField name="rfc" label="RFC *" value={formData.rfc} onChange={handleChange} required />
            <FormField name="correoElectronico" label="Correo Electrónico *" type="email" value={formData.correoElectronico} onChange={handleChange} required />
            <FormField name="razonSocial" label="Razón Social *" value={formData.razonSocial} onChange={handleChange} required />
            <FormField name="nombre" label="Nombre" value={formData.nombre} onChange={handleChange} />
            <FormField name="paterno" label="Paterno" value={formData.paterno} onChange={handleChange} />
            <FormField name="materno" label="Materno" value={formData.materno} onChange={handleChange} />
            <SelectField name="pais" label="País" value={formData.pais} onChange={handleChange} options={PAIS_OPTIONS} />
            <FormField name="noRegistroIdentidadTributaria" label="No. Registro Identidad Tributaria" value={formData.noRegistroIdentidadTributaria} onChange={handleChange} />
            <FormField name="domicilioFiscal" label="Domicilio Fiscal *" value={formData.domicilioFiscal} onChange={handleChange} required />
            <SelectField name="regimenFiscal" label="Régimen Fiscal *" value={formData.regimenFiscal} onChange={handleChange} options={REGIMEN_FISCAL_OPTIONS} required />
            <SelectField name="usoCfdi" label="Uso CFDI *" value={formData.usoCfdi} onChange={handleChange} options={USO_CFDI_OPTIONS} required />
          </div>
        </Card>

        {mostrarTabla && tickets.length > 1 && (
          <Card title="Tickets encontrados">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tienda</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terminal</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folio</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IVA</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forma Pago</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFC</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Factura</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((t) => (
                    <tr key={t.idTicket} className="cursor-pointer hover:bg-gray-50" onClick={() => { setTicketSeleccionado(t); rellenarFormularioConTicket(t); }}>
                      <td className="px-4 py-2">{t.codigoTienda}</td>
                      <td className="px-4 py-2">{new Date(t.fecha).toLocaleDateString()}</td>
                      <td className="px-4 py-2">{t.terminalId ?? '-'}</td>
                      <td className="px-4 py-2">{t.folio}</td>
                      <td className="px-4 py-2">{t.subtotal?.toFixed(2)}</td>
                      <td className="px-4 py-2">{t.iva?.toFixed(2)}</td>
                      <td className="px-4 py-2">{t.total?.toFixed(2)}</td>
                      <td className="px-4 py-2">{t.formaPago ?? '-'}</td>
                      <td className="px-4 py-2">{t.nombreCliente ?? '-'}</td>
                      <td className="px-4 py-2">{t.rfcCliente ?? '-'}</td>
                      <td className="px-4 py-2">{t.status === 1 ? 'Activo' : 'Cancelado'}</td>
                      <td className="px-4 py-2">{t.idFactura ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Card title="Consultar Ticket">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
            <FormField name="codigoFacturacion" label="Código de Facturación" value={formData.codigoFacturacion} onChange={handleChange} />
            <SelectField name="tienda" label="Tienda" value={formData.tienda} onChange={handleChange} options={TIENDA_OPTIONS} />
            <FormField name="fecha" label="Fecha" type="date" value={formData.fecha} onChange={handleChange} />
            <FormField name="terminal" label="Terminal" value={formData.terminal} onChange={handleChange} />
            <FormField name="boleta" label="Ticket (Folio)" value={formData.boleta} onChange={handleChange} />
          </div>
          <div className="mt-6 flex justify-end">
            <Button type="button" onClick={handleBuscarTicket} variant="secondary" disabled={cargandoTickets}>
              {cargandoTickets ? 'Buscando…' : 'Buscar Ticket'}
            </Button>
          </div>
        </Card>

        {ticketSeleccionado && (
          <Card title="Información del Ticket">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tienda</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Terminal</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Folio</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IVA</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forma Pago</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RFC</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estatus</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Factura</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-2">{ticketSeleccionado?.codigoTienda ?? '-'}</td>
                    <td className="px-4 py-2">{ticketSeleccionado ? new Date(ticketSeleccionado.fecha).toLocaleDateString() : '-'}</td>
                    <td className="px-4 py-2">{ticketSeleccionado?.terminalId ?? '-'}</td>
                    <td className="px-4 py-2">{ticketSeleccionado?.folio ?? '-'}</td>
                    <td className="px-4 py-2">{ticketSeleccionado?.subtotal != null ? ticketSeleccionado!.subtotal!.toFixed(2) : '-'}</td>
                    <td className="px-4 py-2">{ticketSeleccionado?.iva != null ? ticketSeleccionado!.iva!.toFixed(2) : '-'}</td>
                    <td className="px-4 py-2">{ticketSeleccionado?.total != null ? ticketSeleccionado!.total!.toFixed(2) : '-'}</td>
                    <td className="px-4 py-2">{ticketSeleccionado?.formaPago ?? '-'}</td>
                    <td className="px-4 py-2">{ticketSeleccionado?.nombreCliente ?? '-'}</td>
                    <td className="px-4 py-2">{ticketSeleccionado?.rfcCliente ?? '-'}</td>
                    <td className="px-4 py-2">{ticketSeleccionado?.status === 1 ? 'Activo' : 'Cancelado'}</td>
                    <td className="px-4 py-2">{ticketSeleccionado?.idFactura ?? '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <Card title="Forma de Pago">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SelectField name="medioPago" label="Medio de pago" value={formData.medioPago} onChange={handleChange} options={MEDIO_PAGO_OPTIONS} />
            <SelectField name="formaPago" label="Forma de pago" value={formData.formaPago} onChange={handleChange} options={FORMA_PAGO_OPTIONS} />
          </div>
          <div className="mt-4">
            <CheckboxField
              name="iepsDesglosado"
              label="IEPS desglosado"
              checked={formData.iepsDesglosado}
              onChange={handleChange}
            />
          </div>
        </Card>

        <div className="flex justify-end space-x-4 mt-8">
          <Button type="button" onClick={descargarXmlActual} variant="secondary">
            Descargar XML
          </Button>
          <Button type="button" onClick={descargarPdfActual} variant="secondary">
            Descargar PDF
          </Button>
          <Button type="button" onClick={enviarCorreoActual} variant="secondary">
            Enviar por Correo
          </Button>
          <Button type="button" onClick={handleCancel} variant="neutral">
            Cancelar
          </Button>
          <Button type="submit" variant="primary">
            Guardar
          </Button>
        </div>
      </form>

      {/* Tabla de Facturas Guardadas */}
      <Card title="Facturas Guardadas en Base de Datos" className="mt-6">
        <div className="mb-4">
          <Button 
            onClick={cargarFacturas} 
            disabled={cargandoFacturas}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            {cargandoFacturas ? 'Consultando...' : 'Consultar Facturas'}
          </Button>
        </div>

        {cargandoFacturas ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-2 text-gray-600">Consultando facturas en base de datos...</p>
            <p className="text-sm text-gray-500 mt-1">Esto puede tomar unos segundos</p>
          </div>
        ) : facturas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No se encontraron facturas</h3>
            <p className="text-gray-500 dark:text-gray-400">
              No hay facturas guardadas en la base de datos.
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Verifica que existan facturas en la base de datos configurada.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Código Fact.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tienda
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha Fact.
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Terminal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Boleta
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    RFC
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Medio Pago
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Forma Pago
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Descargar XML
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Enviar Correo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {facturasPaginadas.map((factura) => (
                  <tr key={factura.uuid} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                      {factura.codigoFacturacion}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                      {factura.tienda}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                      {factura.fechaFactura}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                      {factura.terminal}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                      {factura.boleta}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                      {factura.razonSocial}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                      {factura.rfc}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200 font-semibold">
                      {formatearMoneda(factura.total)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obtenerColorEstado(factura.estado)}`}>
                        {factura.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                      {factura.medioPago}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                      {factura.formaPago}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Button
                        onClick={() => descargarXml(factura.uuid, factura.codigoFacturacion)}
                        variant="secondary"
                        className="text-xs px-2 py-1"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" /> Descargar XML
                      </Button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Button
                        onClick={() => descargarPdf(factura.uuid)}
                        variant="secondary"
                        className="text-xs px-2 py-1"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" /> Descargar PDF
                      </Button>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Button
                        onClick={() => enviarCorreoPorFactura(factura)}
                        variant="primary"
                        className="text-xs px-2 py-1"
                      >
                        <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Enviar Correo
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Controles de Paginación */}
        {facturas.length > 0 && totalPaginas > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <span>
                Mostrando {indiceInicio + 1} a {Math.min(indiceFin, facturas.length)} de {facturas.length} facturas
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Botón Primera Página */}
              <Button
                onClick={irAPrimeraPagina}
                disabled={paginaActual === 1}
                variant="secondary"
                className="px-3 py-1 text-xs"
              >
                Primera
              </Button>
              
              {/* Botón Página Anterior */}
              <Button
                onClick={irAPaginaAnterior}
                disabled={paginaActual === 1}
                variant="secondary"
                className="px-3 py-1 text-xs"
              >
                Anterior
              </Button>
              
              {/* Números de Página */}
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPaginas) }, (_, i) => {
                  let numeroPagina;
                  if (totalPaginas <= 5) {
                    numeroPagina = i + 1;
                  } else if (paginaActual <= 3) {
                    numeroPagina = i + 1;
                  } else if (paginaActual >= totalPaginas - 2) {
                    numeroPagina = totalPaginas - 4 + i;
                  } else {
                    numeroPagina = paginaActual - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={numeroPagina}
                      onClick={() => cambiarPagina(numeroPagina)}
                      variant={paginaActual === numeroPagina ? "primary" : "secondary"}
                      className="px-3 py-1 text-xs min-w-[2rem]"
                    >
                      {numeroPagina}
                    </Button>
                  );
                })}
              </div>
              
              {/* Botón Página Siguiente */}
              <Button
                onClick={irAPaginaSiguiente}
                disabled={paginaActual === totalPaginas}
                variant="secondary"
                className="px-3 py-1 text-xs"
              >
                Siguiente
              </Button>
              
              {/* Botón Última Página */}
              <Button
                onClick={irAUltimaPagina}
                disabled={paginaActual === totalPaginas}
                variant="secondary"
                className="px-3 py-1 text-xs"
              >
                Última
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Modal de Envío de Correo */}
      <EnviarCorreoModal
        isOpen={modalCorreo.isOpen}
        onClose={cerrarModalCorreo}
        facturaUuid={modalCorreo.facturaUuid}
        facturaInfo={modalCorreo.facturaInfo}
        correoInicial={modalCorreo.correoInicial}
        rfcReceptor={modalCorreo.rfcReceptor}
      />
      {/* Modal eliminado: envío directo activo */}
    </div>
  );
};

// Dentro de handleSubmit, reemplazar envío automático por la confirmación
// ... existing code ...
