import React, { useState, useEffect } from 'react';
import { Card } from './Card'; // O ajusta según tu estructura
import { Button } from './Button';
import { guardarNomina, NominaFormPayload, consultarHistorialNominas, NominaHistorialRecord } from '../services/nominaService';
import { facturaService } from '../services/facturaService';
import { apiUrl } from '../services/api';
import { correoService } from '../services/correoService';
import { usuarioService, EmpleadoConsulta } from '../services/usuarioService';
import { calcularDeduccionISR, formatMoney2 } from '../services/isrService';
import { calcularPeriodoLabel } from '../services/periodoPagoService';

interface NominaFormData {
  rfcEmisor: string;
  rfcReceptor: string;
  nombre: string;
  curp: string;
  periodoPago: string;
  periodicidad?: 'QUINCENAL' | 'MENSUAL';
  fechaPago: string;
  total: string;
  deducciones: string;
  percepciones: string;
  tipoNomina: string;
  usoCfdi: string;
  correo: string;
}

interface HistoryRecord {
  id: number;
  fecha: string;
  idEmpleado: string;
  estado: string;
  uuid?: string;
}

const initialNominaFormData: NominaFormData = {
  rfcEmisor: '',
  rfcReceptor: '',
  nombre: '',
  curp: '',
  periodoPago: '',
  periodicidad: 'QUINCENAL',
  fechaPago: new Date().toISOString().split('T')[0],
  total: '',
  deducciones: '',
  percepciones: '',
  tipoNomina: '',
  usoCfdi: '',
  correo: '',
};

// --- DATOS DUMMY PARA LA DEMOSTRACIÓN ---

// Datos del empleado que se cargarán en el formulario
const dummyEmployeeData: NominaFormData = {
  rfcEmisor: 'EJE900101M8A', // RFC de la empresa (tomado de la captura)
  rfcReceptor: 'VECJ880315H1A',
  nombre: 'JUAN CARLOS PEREZ GOMEZ',
  curp: 'PEGC880315HDFRZA05',
  periodoPago: '2024-06-01 al 2024-06-15',
  fechaPago: '2024-06-30', // Fecha en formato YYYY-MM-DD para el input type="date"
  percepciones: '10000.00',
  deducciones: '1500.50',
  total: '8499.50',
  tipoNomina: 'O', // 'O' para Ordinaria
  usoCfdi: 'CN01', // 'CN01' para Nómina
  correo: 'juan.perez@example.com',
};

// Historial de facturas para este empleado
const dummyHistoryData: HistoryRecord[] = [
  { id: 1, fecha: '2024-05-30', idEmpleado: 'EMP123', estado: 'Timbrada' },
  { id: 2, fecha: '2024-05-15', idEmpleado: 'EMP123', estado: 'Timbrada' },
  { id: 3, fecha: '2024-04-30', idEmpleado: 'EMP123', estado: 'Cancelada' },
];


export const FacturacionNominasPage: React.FC = () => {
  const [searchDate, setSearchDate] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [formData, setFormData] = useState<NominaFormData>(initialNominaFormData);
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // Estado para visor PDF
  const [pdfViewerOpen, setPdfViewerOpen] = useState<boolean>(false);
  const [pdfViewerUrl, setPdfViewerUrl] = useState<string | null>(null);
  const [pdfViewerLoading, setPdfViewerLoading] = useState<boolean>(false);

  const closePdfViewer = () => {
    if (pdfViewerUrl) {
      try { window.URL.revokeObjectURL(pdfViewerUrl); } catch {}
    }
    setPdfViewerUrl(null);
    setPdfViewerOpen(false);
  };

  // Para la demo, pre-llenamos el ID del empleado al cargar el componente
  useEffect(() => {
    setEmployeeId('EMP123');
  }, []);

  // Calcular automáticamente el periodo de pago cuando cambia periodicidad o fecha de pago
  useEffect(() => {
    const label = calcularPeriodoLabel(formData.periodicidad || 'QUINCENAL', formData.fechaPago);
    setFormData((prev) => ({ ...prev, periodoPago: label }));
  }, [formData.periodicidad, formData.fechaPago]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const id = (employeeId || '').trim();
    if (!id) {
      alert('Ingresa un ID de empleado para buscar.');
      return;
    }
    try {
      const empleados: EmpleadoConsulta[] = await usuarioService.consultarEmpleadosEspecificos(id);
      if (empleados && empleados.length > 0) {
        const emp = empleados[0];
        const salario = (emp as any).salarioBase;
        const percep = salario !== undefined && salario !== null ? Number(salario) : undefined;
        const ded = percep !== undefined ? calcularDeduccionISR(Number(percep)) : undefined;
        const totalCalc = percep !== undefined && ded !== undefined ? Math.max(0, Number(percep) - Number(ded)) : undefined;
        setFormData(prev => ({
          ...prev,
          nombre: emp.nombreEmpleado || prev.nombre,
          correo: (emp as any).correo || prev.correo,
          rfcReceptor: (emp as any).rfc || prev.rfcReceptor,
          curp: (emp as any).curp || prev.curp,
          percepciones: percep !== undefined ? formatMoney2(Number(percep)) : prev.percepciones,
          deducciones: ded !== undefined ? formatMoney2(Number(ded)) : prev.deducciones,
          total: totalCalc !== undefined ? formatMoney2(Number(totalCalc)) : prev.total,
          // Mantener RFCs manuales si no existen en catálogo; el emisor suele ser fijo.
          fechaPago: searchDate || prev.fechaPago,
          tipoNomina: prev.tipoNomina || 'O',
          usoCfdi: prev.usoCfdi || 'CN01',
          periodicidad: prev.periodicidad || 'QUINCENAL',
        }));
        alert(`Empleado ${emp.noUsuario} encontrado. Formulario actualizado.`);
        // Cargar historial real de nóminas del empleado
        try {
          const hist: NominaHistorialRecord[] = await consultarHistorialNominas(id);
          setHistory(hist.map(h => ({ id: h.id, fecha: h.fecha, idEmpleado: h.idEmpleado, estado: h.estado, uuid: h.uuid })));
        } catch (e) {
          console.error('Error consultando historial de nóminas:', e);
          setHistory([]);
        }
      } else {
        alert(`Empleado con ID "${id}" no encontrado.`);
        setFormData(initialNominaFormData);
        setHistory([]);
      }
    } catch (error) {
      console.error('Error al consultar empleado:', error);
      alert('Error al consultar empleado. Revisa la conexión con el backend.');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const fechaNomina = searchDate || new Date().toISOString().split('T')[0];
      const payload: NominaFormPayload = {
        rfcEmisor: formData.rfcEmisor,
        rfcReceptor: formData.rfcReceptor,
        nombre: formData.nombre,
        curp: formData.curp,
        periodoPago: formData.periodoPago,
        fechaPago: formData.fechaPago,
        percepciones: formData.percepciones,
        deducciones: formData.deducciones,
        total: formData.total,
        tipoNomina: formData.tipoNomina,
        usoCfdi: formData.usoCfdi,
        correoElectronico: formData.correo,
      };
      const resp = await guardarNomina(payload, employeeId, fechaNomina);
      if (resp.ok) {
        alert(`Guardado correctamente. UUID: ${resp.uuidFactura}\nID_FACTURA: ${resp.idFactura}\nID_FACTURA_NOMINA: ${resp.idFacturaNomina}`);
      } else {
        const msg = resp.message || 'Error al guardar nómina';
        alert(`Error: ${msg}`);
      }
    } catch (error: any) {
      alert(`Error inesperado al guardar: ${error?.message || error}`);
    }
  };
  
  const handleClear = () => {
    setSearchDate('');
    setEmployeeId('');
    setFormData(initialNominaFormData);
    setHistory([]);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Si cambia percepciones, recalcular deducciones y total automáticamente usando ISR
    if (name === 'percepciones') {
      const percepNum = Number(value || 0);
      const ded = calcularDeduccionISR(percepNum);
      const totalCalc = Math.max(0, percepNum - ded);
      setFormData((prev) => ({
        ...prev,
        percepciones: value,
        deducciones: formatMoney2(ded),
        total: formatMoney2(totalCalc),
      }));
      return;
    }
    if (name === 'periodicidad' || name === 'fechaPago') {
      // Actualizar y dejar que el useEffect recalcule periodoPago
      setFormData((prev) => ({ ...prev, [name]: value }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const enviarCorreoNomina = async (uuid: string) => {
    const correo = (formData.correo || '').trim();
    if (!uuid || !uuid.trim()) {
      alert('No hay UUID disponible para esta nómina.');
      return;
    }
    if (!correo) {
      alert('No hay correo del receptor. Ingrésalo en el formulario y vuelve a intentar.');
      return;
    }
    try {
      const asunto = `Recibo de Nómina ${formData.periodoPago ? '- ' + formData.periodoPago : ''}`.trim();
      const mensaje = `Estimado(a),\n\nSe adjunta el PDF de su recibo de nómina.\nUUID: ${uuid}`;
      const resp = await correoService.enviarCorreoConPdfAdjunto({
        uuidFactura: uuid,
        correoReceptor: correo,
        asunto,
        mensaje,
      });
      if (resp?.success) {
        alert(`Correo enviado exitosamente a: ${correo}`);
      } else {
        alert(`Error al enviar correo: ${resp?.message || 'Desconocido'}`);
      }
    } catch (error: any) {
      alert(`Error al enviar correo: ${error?.message || 'Error desconocido'}`);
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow space-y-6">
      
      {/* Sección de filtros */}
      <Card>
        <h2 className="text-xl font-semibold mb-4 text-primary dark:text-secondary">Filtro de Nómina</h2>
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="flex flex-col space-y-1">
            <label className="font-medium text-primary dark:text-secondary">Fecha de Nómina:</label>
            <input
              type="date" // Cambiado a 'date' para consistencia
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="rounded-lg p-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div className="flex flex-col space-y-1">
            <label className="font-medium text-primary dark:text-secondary">ID Empleado:</label>
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="Ingrese ID del empleado"
              className="rounded-lg p-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100"
            />
          </div>
          <div className="md:col-span-2 flex justify-end space-x-4 pt-2">
            <button
              type="button"
              className="px-4 py-2 border border-primary dark:border-secondary text-primary dark:text-secondary rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
              onClick={handleClear}
            >
              Limpiar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary dark:bg-secondary text-white rounded-md hover:bg-primary-dark dark:hover:bg-secondary-dark"
            >
              Buscar
            </button>
          </div>
        </form>
      </Card>

      {/* Sección del formulario de facturación */}
      <form onSubmit={handleFormSubmit}>
        <Card>
          <h2 className="text-xl font-semibold text-primary dark:text-secondary mb-6 text-center">Datos de Facturación de Nómina</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Selector de periodicidad (Quincenal/Mensual) */}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-black dark:text-white">Periodicidad:</label>
              <select
                name="periodicidad"
                value={formData.periodicidad || 'QUINCENAL'}
                onChange={handleFormChange}
                className="rounded-lg p-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="QUINCENAL">Quincenal</option>
                <option value="MENSUAL">Mensual</option>
              </select>
            </div>
            {[
              { label: 'RFC Emisor', name: 'rfcEmisor', type: 'text', required: true },
              { label: 'RFC Receptor', name: 'rfcReceptor', type: 'text', required: true },
              { label: 'Nombre', name: 'nombre', type: 'text', required: true },
              { label: 'CURP', name: 'curp', type: 'text' },
              { label: 'Periodo de Pago', name: 'periodoPago', type: 'text', placeholder: 'Ej: 01/10/2025 al 30/10/2025' },
              { label: 'Fecha de Pago', name: 'fechaPago', type: 'date', required: true },
              { label: 'Percepciones', name: 'percepciones', type: 'number' },
              { label: 'Deducciones', name: 'deducciones', type: 'number' },
              { label: 'Total', name: 'total', type: 'number', required: true },
            ].map(({ label, name, type, required, placeholder }) => (
              <div className="flex flex-col" key={name}>
                <label className="mb-1 font-semibold text-black dark:text-white">{label}:</label>
                <input
                  type={type}
                  name={name}
                  value={(formData as any)[name]}
                  onChange={handleFormChange}
                  required={required}
                  placeholder={placeholder}
                  className="rounded-lg p-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100"
                  step="0.01" // Para permitir decimales en los campos numéricos
                  readOnly={name === 'periodoPago'}
                />
              </div>
            ))}
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-black dark:text-white">Tipo de Nómina:</label>
              <select
                name="tipoNomina"
                value={formData.tipoNomina}
                onChange={handleFormChange}
                className="rounded-lg p-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100"
                required
              >
                <option value="">Selecciona...</option>
                <option value="O">Ordinaria</option>
                <option value="E">Extraordinaria</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="mb-1 font-semibold text-black dark:text-white">Uso CFDI:</label>
              <select
                name="usoCfdi"
                value={formData.usoCfdi}
                onChange={handleFormChange}
                className="rounded-lg p-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100"
                required
              >
                <option value="">Selecciona...</option>
                <option value="G01">G01 - Adquisición de mercancías</option>
                <option value="P01">P01 - Por definir</option>
                <option value="CN01">CN01 - Nómina</option>
              </select>
            </div>
            <div className="flex flex-col md:col-span-2">
              <label className="mb-1 font-semibold text-black dark:text-white">Correo electrónico:</label>
              <input
                type="email"
                name="correo"
                value={formData.correo}
                onChange={handleFormChange}
                className="rounded-lg p-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100"
                required
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button type="submit" variant="primary">Guardar Nómina</Button>
          </div>
        </Card>
      </form>

      {/* Historial de facturación */}
      <Card>
        <h3 className="text-lg font-semibold mb-4 text-primary dark:text-secondary">Historial de Facturación</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ID Empleado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {history.length > 0 ? (
                history.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{record.fecha}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{record.idEmpleado}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-3">
                        <button
                          type="button"
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200"
                          onClick={async () => {
                            if (!record.uuid || !record.uuid.trim()) {
                              alert('No hay UUID disponible para esta nómina.');
                              return;
                            }
                            try {
                              setPdfViewerLoading(true);
                              // Obtener PDF desde backend y abrir en visor modal
                              const response = await fetch(apiUrl(`/factura/descargar-pdf/${record.uuid}`));
                              if (!response.ok) {
                                const txt = await response.text().catch(() => '');
                                throw new Error(`Error al obtener PDF (HTTP ${response.status}) ${txt}`);
                              }
                              const blob = await response.blob();
                              const url = window.URL.createObjectURL(blob);
                              setPdfViewerUrl(url);
                              setPdfViewerOpen(true);
                            } catch (error: any) {
                              alert(`Error al visualizar PDF: ${error?.message || error}`);
                            } finally {
                              setPdfViewerLoading(false);
                            }
                          }}
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                          onClick={async () => {
                            if (!record.uuid || !record.uuid.trim()) {
                              alert('No hay UUID disponible para esta nómina.');
                              return;
                            }
                            try {
                              await facturaService.generarYDescargarPDF(record.uuid);
                            } catch (error: any) {
                              alert(`Error al descargar PDF: ${error?.message || error}`);
                            }
                          }}
                        >
                          PDF
                        </button>
                        <button
                          type="button"
                          className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                          onClick={async () => {
                            if (!record.uuid || !record.uuid.trim()) {
                              alert('No hay UUID disponible para esta nómina.');
                              return;
                            }
                            try {
                              await facturaService.generarYDescargarXML(record.uuid);
                            } catch (error: any) {
                              alert(`Error al descargar XML: ${error?.message || error}`);
                            }
                          }}
                        >
                          XML
                        </button>
                        <button
                          type="button"
                          className="text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-200"
                          onClick={async () => {
                            await enviarCorreoNomina(record.uuid || '');
                          }}
                        >
                          Correo
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No hay historial para mostrar. Realice una búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      {/* Modal visor PDF */}
      {pdfViewerOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-[95vw] max-w-5xl overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Vista previa PDF</h4>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-3 py-1 text-sm rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                  onClick={closePdfViewer}
                >
                  Cerrar
                </button>
              </div>
            </div>
            <div className="p-0">
              {pdfViewerLoading ? (
                <div className="p-6 text-center text-gray-700 dark:text-gray-200">Cargando PDF…</div>
              ) : (
                <iframe
                  src={pdfViewerUrl || ''}
                  title="Visor PDF"
                  className="w-full h-[80vh]"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};