import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { Button } from './Button';
import { ALMACEN_OPTIONS, MOTIVO_SUSTITUCION_OPTIONS, TIENDA_OPTIONS } from '../constants';
import { facturaService } from '../services/facturaService';
import { ArrowDownTrayIcon } from './icons/ArrowDownTrayIcon';

interface ConsultaFacturasFormData {
  rfcReceptor: string;
  nombreCliente: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  razonSocial: string;
  almacen: string;
  usuario: string;
  serie: string;
  folio: string;
  uuid: string;
  fechaInicio: string;
  fechaFin: string;
  tienda: string;
  te: string;
  tr: string;
  fechaTienda: string;
  codigoFacturacion: string;
  motivoSustitucion: string;
}

interface Factura {
  uuid: string;
  rfcEmisor: string;
  rfcReceptor: string;
  serie: string;
  folio: string;
  fechaEmision: string;
  importe: number;
  estatusFacturacion: string;
  estatusSat: string;
  tienda: string;
  almacen: string;
  usuario: string;
  permiteCancelacion: boolean;
  motivoNoCancelacion?: string;
}

interface ConsultaFacturaResponse {
  exitoso: boolean;
  mensaje: string;
  timestamp: string;
  facturas: Factura[];
  totalFacturas: number;
  error?: string;
}

const initialFormData: ConsultaFacturasFormData = {
  rfcReceptor: '',
  nombreCliente: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  razonSocial: '',
  almacen: ALMACEN_OPTIONS[ALMACEN_OPTIONS.length-1]?.value || '',
  usuario: '',
  serie: '',
  folio: '',
  uuid: '',
  fechaInicio: '',
  fechaFin: '',
  tienda: TIENDA_OPTIONS[0]?.value || '',
  te: '',
  tr: '',
  fechaTienda: '',
  codigoFacturacion: '',
  motivoSustitucion: MOTIVO_SUSTITUCION_OPTIONS[0]?.value || '',
};

export const ConsultasFacturasPage: React.FC = () => {
  const [formData, setFormData] = useState<ConsultaFacturasFormData>(initialFormData);
  const [resultados, setResultados] = useState<Factura[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [perfilUsuario] = useState<string>('OPERADOR');
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [actualizando, setActualizando] = useState(false);
  const [facturasSeleccionadas, setFacturasSeleccionadas] = useState<Set<string>>(new Set());
  const [descargandoPDF, setDescargandoPDF] = useState<string | null>(null);
  const [descargandoZIP, setDescargandoZIP] = useState(false);
  const [descargandoXML, setDescargandoXML] = useState<string | null>(null);
  
  // Limpiar el intervalo cuando el componente se desmonte
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

  // Estado del modal de cancelación
  const [cancelModal, setCancelModal] = useState<{ open: boolean; uuid: string | null; motivo: string; loading: boolean; error?: string }>(
    { open: false, uuid: null, motivo: '02', loading: false }
  );

  // Funciones para manejar selección de facturas
  const toggleSeleccionFactura = (uuid: string) => {
    const nuevasSeleccionadas = new Set(facturasSeleccionadas);
    if (nuevasSeleccionadas.has(uuid)) {
      nuevasSeleccionadas.delete(uuid);
    } else {
      nuevasSeleccionadas.add(uuid);
    }
    setFacturasSeleccionadas(nuevasSeleccionadas);
  };

  const seleccionarTodasFacturas = () => {
    if (facturasSeleccionadas.size === resultados.length) {
      setFacturasSeleccionadas(new Set());
    } else {
      setFacturasSeleccionadas(new Set(resultados.map(f => f.uuid)));
    }
  };

  // Funciones para descargas
  const descargarPDFFactura = async (uuid: string) => {
    try {
      setDescargandoPDF(uuid);
      await facturaService.generarYDescargarPDF(uuid);
    } catch (error) {
      console.error('Error descargando PDF:', error);
      alert(`Error al descargar PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setDescargandoPDF(null);
    }
  };

  const descargarZIPFactura = async (uuid: string) => {
    try {
      setDescargandoPDF(uuid);
      await facturaService.generarYDescargarZIP(uuid);
    } catch (error) {
      console.error('Error descargando ZIP:', error);
      alert(`Error al descargar ZIP: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setDescargandoPDF(null);
    }
  };

  const descargarXMLFactura = async (uuid: string) => {
    try {
      setDescargandoXML(uuid);
      await facturaService.generarYDescargarXML(uuid);
    } catch (error) {
      console.error('Error descargando XML:', error);
      alert(`Error al descargar XML: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setDescargandoXML(null);
    }
  };

  const descargarZIPSeleccionadas = async () => {
    if (facturasSeleccionadas.size === 0) {
      alert('Por favor selecciona al menos una factura');
      return;
    }

    try {
      setDescargandoZIP(true);
      const uuidsSeleccionados = Array.from(facturasSeleccionadas);
      await facturaService.generarYDescargarZIPMultiple(uuidsSeleccionados);
    } catch (error) {
      console.error('Error descargando ZIP múltiple:', error);
      alert(`Error al descargar ZIP: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setDescargandoZIP(false);
    }
  };

  const openCancelModal = (factura: Factura) => {
    setCancelModal({ open: true, uuid: factura.uuid, motivo: '02', loading: false });
  };

  const closeCancelModal = () => {
    setCancelModal({ open: false, uuid: null, motivo: '02', loading: false });
    // Iniciar el refresh automático después de cerrar el modal
    startAutoRefresh();
  };
  
  // Función para refrescar los datos de facturas
  const refreshFacturas = async () => {
    if (!mostrarResultados || !formData) return;
    
    setActualizando(true);
    try {
      const requestData = {
        ...formData,
        perfilUsuario: perfilUsuario,
        fechaInicio: formData.fechaInicio && formData.fechaInicio.trim() ? new Date(formData.fechaInicio).toISOString().split('T')[0] : null,
        fechaFin: formData.fechaFin && formData.fechaFin.trim() ? new Date(formData.fechaFin).toISOString().split('T')[0] : null,
        fechaTienda: formData.fechaTienda && formData.fechaTienda.trim() ? new Date(formData.fechaTienda).toISOString().split('T')[0] : null
      };

      const response = await fetch('http://localhost:8080/api/consulta-facturas/buscar', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(requestData)
      });

      const data: ConsultaFacturaResponse = await response.json();
      if (data.exitoso) {
        setResultados(data.facturas || []);
      }
    } catch (err) {
      console.error('Error al refrescar facturas:', err);
    } finally {
      setActualizando(false);
    }
  };
  
  // Iniciar el intervalo de actualización automática
  const startAutoRefresh = () => {
    // Limpiar cualquier intervalo existente
    if (refreshInterval) {
      clearInterval(refreshInterval);
    }
    
    // Crear un nuevo intervalo que refresca cada 5 segundos
    const interval = setInterval(refreshFacturas, 5000);
    setRefreshInterval(interval);
    
    // Detener el intervalo después de 30 segundos (6 actualizaciones)
    setTimeout(() => {
      clearInterval(interval);
      setRefreshInterval(null);
    }, 30000);
  };

  const consultarEstatusPac = async (uuid: string): Promise<string | null> => {
    try {
      const resp = await fetch(`http://localhost:8085/api/pac/status/${uuid}`);
      if (!resp.ok) return null;
      const data = await resp.json();
      return data?.status || null;
    } catch {
      return null;
    }
  };

  const iniciarPollingPac = (uuid: string) => {
    const interval = setInterval(async () => {
      const status = await consultarEstatusPac(uuid);
      if (!status || status === 'EN_PROCESO') return;
      // Resuelto
      setResultados(prev => prev.map(f => {
        if (f.uuid !== uuid) return f;
        if (status === 'CANCELADA') {
          return { ...f, estatusFacturacion: 'Cancelada', estatusSat: 'Cancelada', permiteCancelacion: false };
        }
        // RECHAZADA u otro
        return { ...f, estatusFacturacion: f.estatusFacturacion, estatusSat: f.estatusSat, permiteCancelacion: true };
      }));
      clearInterval(interval);
    }, 3000);
  };

  const submitCancel = async () => {
    if (!cancelModal.uuid) return;
    try {
      setCancelModal(prev => ({ ...prev, loading: true, error: undefined }));
      const payload = {
        uuid: cancelModal.uuid,
        motivo: cancelModal.motivo,
        usuario: formData.usuario || 'operador',
        perfilUsuario,
      };
      const resp = await fetch('http://localhost:8080/api/consulta-facturas/cancelar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await resp.json();
      if (resp.ok && data.exitoso) {
        // Consultar estado en PAC para decidir si es inmediata o en proceso
        const uuid = cancelModal.uuid;
        const status = await consultarEstatusPac(uuid);
        if (status === 'CANCELADA') {
          setResultados(prev => prev.map(f =>
            f.uuid === uuid
              ? { ...f, estatusFacturacion: 'Cancelada', estatusSat: 'Cancelada', permiteCancelacion: false }
              : f
          ));
          closeCancelModal();
        } else {
          // EN_PROCESO o desconocido: marcar en proceso y comenzar polling
          setResultados(prev => prev.map(f =>
            f.uuid === uuid
              ? { ...f, estatusFacturacion: 'En proceso', estatusSat: 'En proceso', permiteCancelacion: false }
              : f
          ));
          closeCancelModal();
          iniciarPollingPac(uuid);
        }
      } else {
        setCancelModal(prev => ({ ...prev, error: data.mensaje || 'No se pudo cancelar', loading: false }));
      }
    } catch (e) {
      console.error('Error al cancelar:', e);
      setCancelModal(prev => ({ ...prev, error: 'Error de conexión al cancelar', loading: false }));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const validarFormulario = (): { valido: boolean; mensaje?: string } => {
    const tieneCampo = 
      formData.rfcReceptor.trim() ||
      formData.nombreCliente.trim() ||
      formData.apellidoPaterno.trim() ||
      formData.razonSocial.trim() ||
      (formData.almacen && formData.almacen !== 'todos') ||
      formData.usuario.trim() ||
      formData.serie.trim() ||
      (formData.fechaInicio && formData.fechaFin);

    if (!tieneCampo) {
      return { valido: false, mensaje: "Es necesario seleccionar RFC receptor o Nombre y Apellido Paterno o Razón Social o Almacén o Usuario o Serie" };
    }

    if (formData.fechaInicio && formData.fechaFin) {
      const fechaInicio = new Date(formData.fechaInicio);
      const fechaFin = new Date(formData.fechaFin);
      const dias = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
      if (dias < 0) return { valido: false, mensaje: "La fecha de inicio no puede ser posterior a la fecha fin" };
      if (dias > 365) return { valido: false, mensaje: "El rango máximo permitido es de 365 días. Reintente" };
    }

    return { valido: true };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validacion = validarFormulario();
    if (!validacion.valido) { setError(validacion.mensaje || 'Error de validación'); return; }

    setCargando(true);
    setError(null);

    try {
      const requestData = {
        ...formData,
        perfilUsuario: perfilUsuario,
        fechaInicio: formData.fechaInicio && formData.fechaInicio.trim() ? new Date(formData.fechaInicio).toISOString().split('T')[0] : null,
        fechaFin: formData.fechaFin && formData.fechaFin.trim() ? new Date(formData.fechaFin).toISOString().split('T')[0] : null,
        fechaTienda: formData.fechaTienda && formData.fechaTienda.trim() ? new Date(formData.fechaTienda).toISOString().split('T')[0] : null
      };

      const response = await fetch('http://localhost:8080/api/consulta-facturas/buscar', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(requestData)
      });

      const data: ConsultaFacturaResponse = await response.json();
      if (data.exitoso) {
        setResultados(data.facturas || []);
        setMostrarResultados(true);
        setError(null);
      } else {
        setError(data.mensaje || 'Error en la consulta');
        setResultados([]);
        setMostrarResultados(false);
      }
    } catch (err) {
      console.error('Error al consultar facturas:', err);
      setError('Error de conexión con el servidor');
      setResultados([]);
      setMostrarResultados(false);
    } finally {
      setCargando(false);
    }
  };

  const formatearMoneda = (valor: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(valor);

  const formatearFecha = (fecha: string) => {
    try { return new Date(fecha).toLocaleDateString('es-MX'); } catch { return fecha; }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">--Ingresa los datos para consulta (por grupo):--</h3>
        {error && (<div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>)}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
          <FormField label="RFC Receptor:" name="rfcReceptor" value={formData.rfcReceptor} onChange={handleChange} />
          <FormField label="Nombre del Cliente:" name="nombreCliente" value={formData.nombreCliente} onChange={handleChange} />
          <FormField label="Apellido Paterno:" name="apellidoPaterno" value={formData.apellidoPaterno} onChange={handleChange} />
          <FormField label="Apellido Materno:" name="apellidoMaterno" value={formData.apellidoMaterno} onChange={handleChange} />
          <FormField label="Razón Social:" name="razonSocial" value={formData.razonSocial} onChange={handleChange} />
          <SelectField label="Almacén:" name="almacen" value={formData.almacen} onChange={handleChange} options={ALMACEN_OPTIONS} />
          <FormField label="Usuario:" name="usuario" value={formData.usuario} onChange={handleChange} />
          <FormField label="Serie:" name="serie" value={formData.serie} onChange={handleChange} />
          <FormField label="Folio:" name="folio" value={formData.folio} onChange={handleChange} />
          <FormField label="UUID:" name="uuid" value={formData.uuid} onChange={handleChange} />
          <FormField label="Fecha Inicio:" name="fechaInicio" type="date" value={formData.fechaInicio} onChange={handleChange} />
          <FormField label="Fecha Fin:" name="fechaFin" type="date" value={formData.fechaFin} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-2 mt-4 items-end">
          <SelectField label="Tienda:" name="tienda" value={formData.tienda} onChange={handleChange} options={TIENDA_OPTIONS} className="lg:col-span-1"/>
          <FormField label="TE:" name="te" value={formData.te} onChange={handleChange} className="lg:col-span-1"/>
          <FormField label="TR:" name="tr" value={formData.tr} onChange={handleChange} className="lg:col-span-1"/>
          <FormField label="Fecha:" name="fechaTienda" type="date" value={formData.fechaTienda} onChange={handleChange} className="lg:col-span-1"/>
          <FormField label="Código de facturación:" name="codigoFacturacion" value={formData.codigoFacturacion} onChange={handleChange} className="lg:col-span-1"/>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 mt-4">
          <SelectField label="Motivo Sustitución:" name="motivoSustitucion" value={formData.motivoSustitucion} onChange={handleChange} options={MOTIVO_SUSTITUCION_OPTIONS} />
        </div>
        <div className="mt-6 flex justify-start">
          <Button type="submit" variant="primary" disabled={cargando}>{cargando ? 'Buscando...' : 'Buscar'}</Button>
        </div>
      </Card>

      {!mostrarResultados ? (
        <div className="mt-6 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md min-h-[200px] flex items-center justify-center text-gray-400 dark:text-gray-500">Los resultados de la búsqueda de facturas aparecerán aquí.</div>
      ) : (
        <Card className="mt-6">
          <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Resultados de la búsqueda</h3>
          {resultados.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">No se encontraron facturas que coincidan con los criterios de búsqueda.</div>
          ) : (
            <>
              <div className="mb-4 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <Button 
                    variant="primary" 
                    onClick={descargarZIPSeleccionadas}
                    disabled={facturasSeleccionadas.size === 0 || descargandoZIP}
                    className="flex items-center space-x-2"
                  >
                    {descargandoZIP ? (
                      <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    ) : (
                      <ArrowDownTrayIcon className="h-4 w-4" />
                    )}
                    <span>{descargandoZIP ? 'Generando...' : `Descargar ZIP (${facturasSeleccionadas.size})`}</span>
                  </Button>
                  {facturasSeleccionadas.size > 0 && (
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {facturasSeleccionadas.size} factura(s) seleccionada(s)
                    </span>
                  )}
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                        <input
                          type="checkbox"
                          checked={resultados.length > 0 && facturasSeleccionadas.size === resultados.length}
                          onChange={seleccionarTodasFacturas}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">UUID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">RFC Emisor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">RFC Receptor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Serie</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Folio</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha Emisión</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Importe</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estatus Facturación</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estatus SAT</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tienda</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Almacén</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {resultados.map((factura, index) => (
                      <tr key={index} className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        facturasSeleccionadas.has(factura.uuid) ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                      }`}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={facturasSeleccionadas.has(factura.uuid)}
                            onChange={() => toggleSeleccionFactura(factura.uuid)}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200 truncate max-w-xs" title={factura.uuid}>{factura.uuid}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{factura.rfcEmisor}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{factura.rfcReceptor}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{factura.serie}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{factura.folio}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{formatearFecha(factura.fechaEmision)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{formatearMoneda(factura.importe)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            factura.estatusFacturacion === 'Vigente' || factura.estatusFacturacion === 'Activa' || factura.estatusFacturacion === 'Emitida'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>{factura.estatusFacturacion}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            factura.estatusSat === 'Vigente' || factura.estatusSat === 'Activa' || factura.estatusSat === 'Emitida'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>{factura.estatusSat}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{factura.tienda}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{factura.almacen}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                          <div className="flex items-center space-x-2">
                            {/* Botón PDF */}
                            <button
                              onClick={() => descargarPDFFactura(factura.uuid)}
                              disabled={descargandoPDF === factura.uuid}
                              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50"
                              title="Descargar PDF"
                            >
                              {descargandoPDF === factura.uuid ? (
                                <div className="h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                              ) : (
                                <ArrowDownTrayIcon className="h-4 w-4" />
                              )}
                            </button>
                            
                            {/* Botón ZIP */}
                            <button
                              onClick={() => descargarZIPFactura(factura.uuid)}
                              disabled={descargandoPDF === factura.uuid}
                              className="p-1 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                              title="Descargar ZIP (XML + PDF)"
                            >
                              {descargandoPDF === factura.uuid ? (
                                <div className="h-4 w-4 rounded-full border-2 border-green-600 border-t-transparent animate-spin" />
                              ) : (
                                <ArrowDownTrayIcon className="h-4 w-4" />
                              )}
                            </button>
                            
                            {/* Botón XML */}
                            <button
                              onClick={() => descargarXMLFactura(factura.uuid)}
                              disabled={descargandoXML === factura.uuid}
                              className="p-1 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300 disabled:opacity-50"
                              title="Descargar XML"
                            >
                              {descargandoXML === factura.uuid ? (
                                <div className="h-4 w-4 rounded-full border-2 border-orange-600 border-t-transparent animate-spin" />
                              ) : (
                                <ArrowDownTrayIcon className="h-4 w-4" />
                              )}
                            </button>
                            
                            {/* Botón Cancelar */}
                            {factura.permiteCancelacion ? (
                              <Button variant="secondary" size="sm" onClick={() => openCancelModal(factura)}>Cancelar</Button>
                            ) : (
                              <span className="text-xs text-gray-500 cursor-help" title={factura.motivoNoCancelacion || 'No permite cancelación'}>No cancelable</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-600 dark:text-gray-400">Mostrando {resultados.length} facturas</div>
                {actualizando && (
                  <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                    <div className="mr-2 h-4 w-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
                    Actualizando datos...
                  </div>
                )}
              </div>
            </>
          )}
        </Card>
      )}

      {cancelModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={closeCancelModal} />
          <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Cancelar factura</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Motivo de cancelación</label>
                <select
                  className="w-full border rounded px-3 py-2 bg-white dark:bg-gray-900 dark:text-gray-100"
                  value={cancelModal.motivo}
                  onChange={(e) => setCancelModal(prev => ({ ...prev, motivo: e.target.value }))}
                >
                  <option value="01">01 - Comprobante emitido con errores con relación</option>
                  <option value="02">02 - Comprobante emitido con errores sin relación</option>
                  <option value="03">03 - No se llevó a cabo la operación</option>
                  <option value="04">04 - Operación nominativa relacionada en factura global</option>
                </select>
              </div>
              {cancelModal.error && (<div className="text-sm text-red-600 dark:text-red-400">{cancelModal.error}</div>)}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <Button variant="neutral" onClick={closeCancelModal} disabled={cancelModal.loading}>Cerrar</Button>
              <Button variant="secondary" onClick={submitCancel} disabled={cancelModal.loading}>{cancelModal.loading ? 'Cancelando...' : 'Confirmar cancelación'}</Button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}