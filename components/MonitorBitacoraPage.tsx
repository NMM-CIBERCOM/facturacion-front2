import React, { useState } from 'react';
import { Select } from './common/Select';

export const MonitorBitacoraPage: React.FC = () => {
  const [formData, setFormData] = useState({
    uuid: '',
    fechaFinal: '',
    fechaInicial: '',
    modulo: '',
    operacion: '',
    folio: ''
  });

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              UUID:
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              value={formData.uuid}
              onChange={(e) => setFormData({...formData, uuid: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha Final:
            </label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              value={formData.fechaFinal}
              onChange={(e) => setFormData({...formData, fechaFinal: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Fecha Inicial:
            </label>
            <input
              type="datetime-local"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              value={formData.fechaInicial}
              onChange={(e) => setFormData({...formData, fechaInicial: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Módulo:
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              value={formData.modulo}
              onChange={(e) => setFormData({...formData, modulo: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Operación:
            </label>
            <Select
              value={formData.operacion}
              onChange={(value) => setFormData({...formData, operacion: value})}
              options={[
                { value: '', label: 'Seleccionar operación' },
                { value: 'crear', label: 'Crear' },
                { value: 'actualizar', label: 'Actualizar' },
                { value: 'eliminar', label: 'Eliminar' }
              ]}
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Folio:
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              value={formData.folio}
              onChange={(e) => setFormData({...formData, folio: e.target.value})}
            />
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Buscar
          </button>
        </div>

        <div className="mt-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Elementos: 15
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Más
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Módulo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Operación
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {/* Aquí irían los registros de la bitácora */}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};