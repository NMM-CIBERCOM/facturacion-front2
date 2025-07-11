import React, { useState, useEffect } from 'react';
import { Card } from './Card'; // O ajusta según tu estructura
import { Button } from './Button';

interface NominaFormData {
  rfcEmisor: string;
  rfcReceptor: string;
  nombre: string;
  curp: string;
  periodoPago: string;
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
}

const initialNominaFormData: NominaFormData = {
  rfcEmisor: '',
  rfcReceptor: '',
  nombre: '',
  curp: '',
  periodoPago: '',
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

  // Para la demo, pre-llenamos el ID del empleado al cargar el componente
  useEffect(() => {
    setEmployeeId('EMP123');
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Buscando facturación con:', { searchDate, employeeId });

    // Simulación: si el ID es el de nuestro empleado de prueba, llenamos los datos.
    if (employeeId === 'EMP123') {
      alert(`Empleado ${employeeId} encontrado. Cargando datos...`);
      setFormData(dummyEmployeeData);
      setHistory(dummyHistoryData);
    } else {
      alert(`Empleado con ID "${employeeId}" no encontrado.`);
      setFormData(initialNominaFormData);
      setHistory([]);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Factura de nómina generada (simulado). Revisa la consola.');
    console.log('Datos de nómina enviados:', formData);
  };
  
  const handleClear = () => {
    setSearchDate('');
    setEmployeeId('');
    setFormData(initialNominaFormData);
    setHistory([]);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
            {[
              { label: 'RFC Emisor', name: 'rfcEmisor', type: 'text', required: true },
              { label: 'RFC Receptor', name: 'rfcReceptor', type: 'text', required: true },
              { label: 'Nombre', name: 'nombre', type: 'text', required: true },
              { label: 'CURP', name: 'curp', type: 'text' },
              { label: 'Periodo de Pago', name: 'periodoPago', type: 'text', placeholder: 'Ej: 2024-06-01 al 2024-06-15' },
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
            <Button type="submit" variant="primary">Generar Factura</Button>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {history.length > 0 ? (
                history.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{record.fecha}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{record.idEmpleado}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        record.estado === 'Timbrada' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {record.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a href="#" className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">Ver</a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    No hay historial para mostrar. Realice una búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};