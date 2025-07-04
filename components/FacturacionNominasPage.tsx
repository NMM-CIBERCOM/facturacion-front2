import React, { useState } from 'react';
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

export const FacturacionNominasPage: React.FC = () => {
  const [searchDate, setSearchDate] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [formData, setFormData] = useState<NominaFormData>(initialNominaFormData);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Buscando facturación con:', { searchDate, employeeId });
    // Aquí iría tu lógica para buscar/historial
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Factura de nómina generada (simulado). Revisa la consola.');
    console.log('Datos de nómina:', formData);
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
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1">
            <label className="font-medium text-primary dark:text-secondary">Fecha de Nómina:</label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="rounded-lg p-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100"
              required
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
              onClick={() => {
                setSearchDate('');
                setEmployeeId('');
              }}
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
              { label: 'Total', name: 'total', type: 'number', required: true },
              { label: 'Deducciones', name: 'deducciones', type: 'number' },
              { label: 'Percepciones', name: 'percepciones', type: 'number' },
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
              {/* Aquí podrías mapear los registros del historial */}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
