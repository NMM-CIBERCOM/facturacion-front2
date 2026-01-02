import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import * as XLSX from 'xlsx';
import { apiUrl, pacUrl } from '../services/api';
import { facturaService } from '../services/facturaService';
// import { correoService } from '../services/correoService'; // No utilizado
import { EnviarCorreoModal } from './EnviarCorreoModal';

interface FacturaCancelacion {
  uuid: string;
  folio: string;
  tienda: string;
  fecha: string;
  estado?: string;
  mensaje?: string;
  estatusAnterior?: string;
  estatusNuevo?: string;
}

interface FacturaResultado {
  uuid: string;
  folio: string;
  tienda: string;
  fecha: string;
  estado: 'success' | 'error' | 'en_proceso';
  mensaje: string;
  estatusAnterior?: string;
  estatusNuevo?: string;
  error?: string;
}

export const FacturacionCancelacionMasivaPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<FacturaResultado[]>([]);
  const [summary, setSummary] = useState('');
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
  const [vistaPreviaUuid, setVistaPreviaUuid] = useState<string | null>(null);
  const [descargandoPdf, setDescargandoPdf] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files ? e.target.files[0] : null);
    setResults([]);
    setSummary('');
  };

  // Convertir fecha de Excel (número serial) a formato YYYY-MM-DD
  const convertirFechaExcel = (valor: any): string => {
    if (!valor) return '';
    
    // Si es un número (serial de Excel)
    if (typeof valor === 'number') {
      // Excel cuenta los días desde el 1 de enero de 1900
      // Pero hay un bug: Excel piensa que 1900 fue año bisiesto, así que hay que ajustar
      const fechaBase = new Date(1899, 11, 30); // 30 de diciembre de 1899
      const fecha = new Date(fechaBase.getTime() + valor * 86400000);
      return fecha.toISOString().split('T')[0];
    }
    
    // Si ya es una fecha en formato string, intentar parsearla
    const str = String(valor).trim();
    if (str.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return str; // Ya está en formato YYYY-MM-DD
    }
    
    // Intentar parsear otras fechas comunes
    const fechaParsed = new Date(str);
    if (!isNaN(fechaParsed.getTime())) {
      return fechaParsed.toISOString().split('T')[0];
    }
    
    return str; // Retornar como está si no se puede parsear
  };

  // Leer archivo XLSX/CSV y parsear datos
  const leerArchivo = async (file: File): Promise<FacturaCancelacion[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          let jsonData: any[][];
          
          if (file.name.endsWith('.csv')) {
            // Leer CSV como texto
            const text = e.target?.result as string;
            const lines = text.split('\n').map(line => line.trim()).filter(line => line);
            jsonData = lines.map(line => {
              // Manejar CSV con comas o punto y coma como separador
              const separator = line.includes(';') ? ';' : ',';
              return line.split(separator).map(cell => cell.trim().replace(/^"|"$/g, ''));
            });
          } else {
            // Leer XLSX con opciones para manejar fechas
            const data = new Uint8Array(e.target?.result as ArrayBuffer);
            const workbook = XLSX.read(data, { 
              type: 'array',
              cellDates: false, // Mantener números para fechas, los convertiremos manualmente
              raw: false
            });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' }) as any[][];
          }

          if (jsonData.length < 2) {
            reject(new Error('El archivo debe contener al menos una fila de datos (además del encabezado)'));
            return;
          }

          // Buscar índices de columnas (case-insensitive)
          const headers = (jsonData[0] || []).map((h: any) => String(h || '').toUpperCase().trim());
          const uuidIdx = headers.findIndex(h => h.includes('UUID'));
          const folioIdx = headers.findIndex(h => h.includes('FOLIO'));
          const tiendaIdx = headers.findIndex(h => h.includes('TIENDA'));
          const fechaIdx = headers.findIndex(h => h.includes('FECHA'));

          if (uuidIdx === -1 || folioIdx === -1 || tiendaIdx === -1 || fechaIdx === -1) {
            reject(new Error('El archivo debe contener las columnas: UUID, Folio, Tienda, Fecha'));
            return;
          }

          const facturas: FacturaCancelacion[] = [];
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            const uuid = String(row[uuidIdx] || '').trim();
            const folio = String(row[folioIdx] || '').trim();
            const tienda = String(row[tiendaIdx] || '').trim();
            let fecha = row[fechaIdx];
            
            // Convertir fecha si es necesario
            fecha = convertirFechaExcel(fecha);

            if (uuid) {
              facturas.push({ uuid, folio, tienda, fecha: String(fecha) });
            }
          }

          if (facturas.length === 0) {
            reject(new Error('No se encontraron facturas válidas en el archivo'));
            return;
          }

          resolve(facturas);
        } catch (error: any) {
          reject(new Error(`Error al procesar el archivo: ${error?.message || 'Error desconocido'}`));
        }
      };
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      
      // Leer como texto para CSV, como ArrayBuffer para XLSX
      if (file.name.endsWith('.csv')) {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  // Consultar estado en PAC (intenta múltiples endpoints, silenciosamente)
  // Esta función no genera errores visibles en la consola
  const consultarEstatusPac = async (uuid: string): Promise<string> => {
    const uuidNormalizado = uuid.toLowerCase().trim();
    
    // Función auxiliar para hacer fetch sin generar errores en consola
    const fetchSilencioso = async (url: string, signal: AbortSignal): Promise<Response | null> => {
      try {
        // Usar fetch con manejo silencioso de errores
        const response = await fetch(url, { 
          signal,
          // No mostrar errores en la consola del navegador
        });
        return response.ok ? response : null;
      } catch (e: any) {
        // Ignorar todos los errores silenciosamente (404, timeout, network, etc.)
        return null;
      }
    };
    
    // Intentar primero con /pac/status/
    const controller1 = new AbortController();
    const timeoutId1 = setTimeout(() => controller1.abort(), 2000);
    try {
      const response1 = await fetchSilencioso(
        pacUrl(`/pac/status/${encodeURIComponent(uuidNormalizado)}`),
        controller1.signal
      );
      clearTimeout(timeoutId1);
      if (response1) {
        try {
          const data = await response1.json();
          if (data?.status) return data.status;
        } catch {
          // Ignorar errores de parsing
        }
      }
    } catch {
      clearTimeout(timeoutId1);
    }
    
    // Intentar con /pac/stamp/status/
    const controller2 = new AbortController();
    const timeoutId2 = setTimeout(() => controller2.abort(), 2000);
    try {
      const response2 = await fetchSilencioso(
        pacUrl(`/pac/stamp/status/${encodeURIComponent(uuidNormalizado)}`),
        controller2.signal
      );
      clearTimeout(timeoutId2);
      if (response2) {
        try {
          const data = await response2.json();
          if (data?.status || data?.codigo) return data.status || data.codigo;
        } catch {
          // Ignorar errores de parsing
        }
      }
    } catch {
      clearTimeout(timeoutId2);
    }
    
    // Si ambos fallan, retornar DESCONOCIDO sin error
    return 'DESCONOCIDO';
  };

  // Cancelar una factura individual
  const cancelarFactura = async (factura: FacturaCancelacion): Promise<FacturaResultado> => {
    try {
      // Consultar estado actual (no crítico si falla, sin logs)
      let estatusAnterior = 'DESCONOCIDO';
      try {
        estatusAnterior = await consultarEstatusPac(factura.uuid);
      } catch {
        // Ignorar silenciosamente
      }

      // Si ya está cancelada, retornar resultado
      // Estatus 2 = CANCELADA EN SAT
      if (estatusAnterior === 'CANCELADA' || estatusAnterior === '2' || estatusAnterior === 'CANCELADA EN SAT') {
        return {
          uuid: factura.uuid,
          folio: factura.folio,
          tienda: factura.tienda,
          fecha: factura.fecha,
          estado: 'error',
          mensaje: 'La factura ya se encontraba cancelada',
          estatusAnterior: estatusAnterior,
          estatusNuevo: estatusAnterior,
        };
      }
      
      // Si ya está en proceso de cancelación (estatus 1), informar
      if (estatusAnterior === '1' || estatusAnterior === 'EN PROCESO DE CANCELACION' || estatusAnterior === 'EN_PROCESO') {
        return {
          uuid: factura.uuid,
          folio: factura.folio,
          tienda: factura.tienda,
          fecha: factura.fecha,
          estado: 'en_proceso',
          mensaje: 'La factura ya está en proceso de cancelación',
          estatusAnterior: estatusAnterior,
          estatusNuevo: estatusAnterior,
        };
      }

      // Obtener usuario real del sistema
      const username = localStorage.getItem('username') || 'sistema';
      const perfilData = localStorage.getItem('perfil');
      let perfilUsuario = 'ADMINISTRADOR';
      try {
        if (perfilData) {
          const perfil = JSON.parse(perfilData);
          perfilUsuario = perfil?.nombrePerfil || 'ADMINISTRADOR';
        }
      } catch {
        // Usar valor por defecto
      }

      // Llamar al endpoint de cancelación
      const payload = {
        uuid: factura.uuid,
        motivo: '02', // Por defecto motivo 02 (Por errores relacionados con el receptor)
        usuario: username,
        perfilUsuario: perfilUsuario,
      };

      // Hacer la petición con manejo silencioso de errores HTTP
      let response: Response;
      try {
        response = await fetch(apiUrl('/consulta-facturas/cancelar'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (error: any) {
        // Error de red (sin conexión, timeout, etc.)
        return {
          uuid: factura.uuid,
          folio: factura.folio,
          tienda: factura.tienda,
          fecha: factura.fecha,
          estado: 'error',
          mensaje: `Error de conexión: ${error?.message || 'No se pudo conectar al servidor'}`,
          estatusAnterior: estatusAnterior,
          error: error?.message,
        };
      }

      let data;
      try {
        data = await response.json();
      } catch (e) {
        const text = await response.text().catch(() => 'Error desconocido');
        return {
          uuid: factura.uuid,
          folio: factura.folio,
          tienda: factura.tienda,
          fecha: factura.fecha,
          estado: 'error',
          mensaje: `Error HTTP ${response.status}: ${text}`,
          estatusAnterior: estatusAnterior,
          error: text,
        };
      }

      // Verificar si la respuesta es exitosa o si hay un error específico que indica proceso
      const mensajeRespuesta = data.mensaje || data.error || '';
      const esEnProceso = mensajeRespuesta.includes('EN_PROCESO') || 
                         mensajeRespuesta.includes('marcar') ||
                         mensajeRespuesta.includes('proceso');

      if (response.ok && data.exitoso) {
        // Éxito: consultar nuevo estado después de un breve delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        let estatusNuevo = 'DESCONOCIDO';
        try {
          estatusNuevo = await consultarEstatusPac(factura.uuid);
        } catch {
          // Ignorar silenciosamente
        }

        // Estatus según FEC_CAT_ESTATUS:
        // 0 = EMITIDA, 1 = EN PROCESO DE CANCELACION, 2 = CANCELADA EN SAT
        // 4 = EN PROCESO DE EMISION, 66 = POR TIMBRAR, 67 = EN ESPERA DE CANCELACION BOLETA QUE SUSTITUYE
        if (estatusNuevo === 'CANCELADA' || estatusNuevo === '2' || estatusNuevo === 'CANCELADA EN SAT') {
          return {
            uuid: factura.uuid,
            folio: factura.folio,
            tienda: factura.tienda,
            fecha: factura.fecha,
            estado: 'success',
            mensaje: 'Cancelada exitosamente',
            estatusAnterior: estatusAnterior,
            estatusNuevo: estatusNuevo,
          };
        } else if (estatusNuevo === '1' || estatusNuevo === 'EN_PROCESO' || estatusNuevo === '4' || 
                   estatusNuevo === 'EN_PROCESO_CANCELACION' || estatusNuevo === 'EN PROCESO DE CANCELACION' ||
                   estatusNuevo === '67' || estatusNuevo === 'EN ESPERA DE CANCELACION BOLETA QUE SUSTITUYE') {
          return {
            uuid: factura.uuid,
            folio: factura.folio,
            tienda: factura.tienda,
            fecha: factura.fecha,
            estado: 'en_proceso',
            mensaje: 'En proceso de cancelación',
            estatusAnterior: estatusAnterior,
            estatusNuevo: estatusNuevo,
          };
        } else {
          return {
            uuid: factura.uuid,
            folio: factura.folio,
            tienda: factura.tienda,
            fecha: factura.fecha,
            estado: 'success',
            mensaje: data.mensaje || `Estado cambiado: ${estatusAnterior} → ${estatusNuevo}`,
            estatusAnterior: estatusAnterior,
            estatusNuevo: estatusNuevo,
          };
        }
      } else if (esEnProceso || response.status === 400) {
        // El PAC procesó la cancelación pero hubo un problema al actualizar BD
        // O el backend retornó 400 pero con mensaje de proceso
        // Esto se trata como "en proceso" porque la cancelación fue iniciada
        const mensajeFinal = esEnProceso 
          ? 'Cancelación iniciada (en proceso, verificar estado en BD)'
          : (mensajeRespuesta || 'Cancelación en proceso (verificar estado en BD)');
        
        return {
          uuid: factura.uuid,
          folio: factura.folio,
          tienda: factura.tienda,
          fecha: factura.fecha,
          estado: 'en_proceso',
          mensaje: mensajeFinal,
          estatusAnterior: estatusAnterior,
          estatusNuevo: 'EN_PROCESO',
          error: mensajeRespuesta,
        };
      } else {
        // Error real en la cancelación (solo si no es 400)
        return {
          uuid: factura.uuid,
          folio: factura.folio,
          tienda: factura.tienda,
          fecha: factura.fecha,
          estado: 'error',
          mensaje: mensajeRespuesta || `Error HTTP ${response.status}`,
          estatusAnterior: estatusAnterior,
          error: mensajeRespuesta,
        };
      }
    } catch (error: any) {
      return {
        uuid: factura.uuid,
        folio: factura.folio,
        tienda: factura.tienda,
        fecha: factura.fecha,
        estado: 'error',
        mensaje: `Error de conexión: ${error?.message || 'Error desconocido'}`,
        error: error?.message,
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Por favor, seleccione un archivo para la cancelación masiva.');
      return;
    }

      setIsLoading(true);
      setResults([]);
    setSummary('Leyendo archivo...');

    try {
      // Leer y parsear archivo
      const facturas = await leerArchivo(selectedFile);
      setSummary(`Procesando ${facturas.length} factura(s)...`);

      // Cancelar cada factura secuencialmente
      const resultados: FacturaResultado[] = [];
      for (let i = 0; i < facturas.length; i++) {
        setSummary(`Procesando factura ${i + 1} de ${facturas.length}...`);
        const resultado = await cancelarFactura(facturas[i]);
        resultados.push(resultado);
        setResults([...resultados]); // Actualizar en tiempo real
      }

      // Resumen final
      const successCount = resultados.filter(r => r.estado === 'success').length;
      const errorCount = resultados.filter(r => r.estado === 'error').length;
      const enProcesoCount = resultados.filter(r => r.estado === 'en_proceso').length;

      setSummary(
        `Proceso finalizado. ${successCount} canceladas, ${enProcesoCount} en proceso, ${errorCount} con error.`
      );
    } catch (error: any) {
      setSummary(`Error: ${error?.message || 'Error al procesar el archivo'}`);
      alert(error?.message || 'Error al procesar el archivo');
    } finally {
        setIsLoading(false);
    }
  };

  const handleExcel = () => {
    if (results.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
    // Preparar datos para exportar incluyendo estado y mensaje
    const datosExportar = results.map(r => ({
      UUID: r.uuid,
      Folio: r.folio,
      Tienda: r.tienda,
      Fecha: r.fecha,
      Estado: r.estado === 'success' ? 'Cancelada' : r.estado === 'en_proceso' ? 'En Proceso' : 'Error',
      Mensaje: r.mensaje,
      'Estatus Anterior': r.estatusAnterior || '',
      'Estatus Nuevo': r.estatusNuevo || '',
    }));
    const ws = XLSX.utils.json_to_sheet(datosExportar);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CancelacionMasiva');
    XLSX.writeFile(wb, 'cancelacion_masiva_resultados.xlsx');
  };

  // Descargar PDF de una factura
  const handleDescargarPDF = async (uuid: string, _folio: string) => {
    try {
      setDescargandoPdf(uuid);
      await facturaService.generarYDescargarPDF(uuid);
    } catch (error: any) {
      console.error('Error descargando PDF:', error);
      alert(`Error al descargar PDF: ${error?.message || 'Error desconocido'}`);
    } finally {
      setDescargandoPdf(null);
    }
  };

  // Vista previa de factura
  const handleVistaPrevia = async (uuid: string) => {
    try {
      setVistaPreviaUuid(uuid);
      // const factura = await facturaService.obtenerFacturaPorUUID(uuid); // No utilizado
      // Aquí podrías abrir un modal con los datos de la factura
      // Por ahora, abrimos el PDF en una nueva ventana
      const pdfUrl = apiUrl(`/factura/descargar-pdf/${uuid}`);
      window.open(pdfUrl, '_blank');
    } catch (error: any) {
      console.error('Error obteniendo vista previa:', error);
      alert(`Error al obtener vista previa: ${error?.message || 'Error desconocido'}`);
    } finally {
      setVistaPreviaUuid(null);
    }
  };

  // Enviar correo Gmail
  const handleEnviarCorreo = async (resultado: FacturaResultado) => {
    try {
      // Obtener factura para datos del receptor
      const factura = await facturaService.obtenerFacturaPorUUID(resultado.uuid);
      setModalCorreo({
        isOpen: true,
        facturaUuid: resultado.uuid,
        facturaInfo: `${resultado.folio} - ${resultado.tienda}`,
        correoInicial: '',
        rfcReceptor: factura.rfcReceptor || '',
      });
    } catch (error: any) {
      console.error('Error obteniendo datos de factura:', error);
      // Aún así abrir el modal
      setModalCorreo({
        isOpen: true,
        facturaUuid: resultado.uuid,
        facturaInfo: `${resultado.folio} - ${resultado.tienda}`,
        correoInicial: '',
        rfcReceptor: '',
      });
    }
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

  const fileHelpText = "El archivo debe ser .xlsx o .csv y contener las siguientes columnas: UUID, Folio, Tienda, Fecha. La primera fila se considera encabezado.";

  return (
    <div className="space-y-6 p-4">
      <div className='flex items-center space-x-3'>
        <div className="bg-pink-100 p-2 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Cancelación Masiva
        </h1>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <h2 className="text-xl font-semibold text-primary dark:text-secondary mb-2">
            Cancelación de Facturas Masiva
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            {fileHelpText}
          </p>
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Archivo de Cancelación Masiva:</label>
              <input type="file" accept=".xlsx,.csv" onChange={handleFileChange} className="block w-full text-sm text-gray-700 dark:text-gray-100 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark" />
            </div>
            <Button type="submit" variant="primary" disabled={isLoading || !selectedFile}>
              {isLoading ? 'Procesando...' : 'Cancelar Masiva'}
            </Button>
          </div>
          {selectedFile && (
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Archivo seleccionado: <span className="font-semibold">{selectedFile.name}</span>
            </div>
          )}
        </Card>
      </form>
      <div className="mt-6 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md min-h-[100px]">
        {results.length > 0 ? (
          <div className="space-y-4">
            <p className="font-semibold text-gray-700 dark:text-gray-100">{summary}</p>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left">
                <thead>
                  <tr>
                    <th className="px-2 py-1 text-gray-700 dark:text-gray-100">UUID</th>
                    <th className="px-2 py-1 text-gray-700 dark:text-gray-100">Folio</th>
                    <th className="px-2 py-1 text-gray-700 dark:text-gray-100">Tienda</th>
                    <th className="px-2 py-1 text-gray-700 dark:text-gray-100">Fecha</th>
                    <th className="px-2 py-1 text-gray-700 dark:text-gray-100">Estado</th>
                    <th className="px-2 py-1 text-gray-700 dark:text-gray-100">Mensaje</th>
                    <th className="px-2 py-1 text-gray-700 dark:text-gray-100">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((res, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-2 py-1 font-mono text-xs truncate max-w-xs text-gray-700 dark:text-gray-100" title={res.uuid}>
                        {res.uuid}
                      </td>
                      <td className="px-2 py-1 text-gray-700 dark:text-gray-100">{res.folio}</td>
                      <td className="px-2 py-1 text-gray-700 dark:text-gray-100">{res.tienda}</td>
                      <td className="px-2 py-1 text-gray-700 dark:text-gray-100">{res.fecha}</td>
                      <td className="px-2 py-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          res.estado === 'success' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                            : res.estado === 'en_proceso'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        }`}>
                          {res.estado === 'success' ? 'Cancelada' : res.estado === 'en_proceso' ? 'En Proceso' : 'Error'}
                        </span>
                      </td>
                      <td className="px-2 py-1 text-gray-700 dark:text-gray-100 text-xs">
                        <div className="max-w-xs truncate" title={res.mensaje}>
                          {res.mensaje}
                        </div>
                        {res.estatusAnterior && res.estatusNuevo && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {res.estatusAnterior} → {res.estatusNuevo}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-1">
                        <div className="flex flex-wrap gap-1">
                          <button
                            onClick={() => handleDescargarPDF(res.uuid, res.folio)}
                            disabled={descargandoPdf === res.uuid}
                            className="text-xs px-2 py-1 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 disabled:opacity-50"
                            title="Descargar PDF"
                          >
                            {descargandoPdf === res.uuid ? '...' : 'PDF'}
                          </button>
                          <button
                            onClick={() => handleVistaPrevia(res.uuid)}
                            disabled={vistaPreviaUuid === res.uuid}
                            className="text-xs px-2 py-1 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 disabled:opacity-50"
                            title="Vista Previa"
                          >
                            {vistaPreviaUuid === res.uuid ? '...' : 'Ver'}
                          </button>
                          <button
                            onClick={() => handleEnviarCorreo(res)}
                            className="text-xs px-2 py-1 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200"
                            title="Enviar Gmail"
                          >
                            Gmail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={handleExcel} variant="secondary">
                Excel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 dark:text-gray-500">
              {summary || 'Los resultados del proceso de cancelación aparecerán aquí.'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de envío de correo */}
      <EnviarCorreoModal
        isOpen={modalCorreo.isOpen}
        onClose={cerrarModalCorreo}
        facturaUuid={modalCorreo.facturaUuid}
        facturaInfo={modalCorreo.facturaInfo}
        correoInicial={modalCorreo.correoInicial}
        rfcReceptor={modalCorreo.rfcReceptor}
      />
    </div>
  );
};