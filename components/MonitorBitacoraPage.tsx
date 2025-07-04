import React, { useState } from 'react';
import { Card } from './Card';
import { Select } from './common/Select';
import { Button } from './Button';

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
    <div className="space-y-6">
      <Card>
        <form className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-primary dark:text-secondary">UUID:</label>
              <input
                type="text"
                className="w-full rounded-lg p-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100"
                value={formData.uuid}
                onChange={(e) => setFormData({...formData, uuid: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-primary dark:text-secondary">Fecha Final:</label>
              <input
                type="datetime-local"
                className="w-full rounded-lg p-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100"
                value={formData.fechaFinal}
                onChange={(e) => setFormData({...formData, fechaFinal: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-primary dark:text-secondary">Fecha Inicial:</label>
              <input
                type="datetime-local"
                className="w-full rounded-lg p-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100"
                value={formData.fechaInicial}
                onChange={(e) => setFormData({...formData, fechaInicial: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-primary dark:text-secondary">Módulo:</label>
              <input
                type="text"
                className="w-full rounded-lg p-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100"
                value={formData.modulo}
                onChange={(e) => setFormData({...formData, modulo: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-primary dark:text-secondary">Operación:</label>
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
              <label className="block text-sm font-semibold text-primary dark:text-secondary">Folio:</label>
              <input
                type="text"
                className="w-full rounded-lg p-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100"
                value={formData.folio}
                onChange={(e) => setFormData({...formData, folio: e.target.value})}
              />
            </div>
          </div>
          <div className="flex justify-end mt-6">
            <Button type="button" variant="primary">Buscar</Button>
          </div>
        </form>
      </Card>
      <Card>
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">Elementos: 15</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-primary dark:bg-secondary">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Más</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Módulo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Operación</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {/* Aquí irían los registros de la bitácora */}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};