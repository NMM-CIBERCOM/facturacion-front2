import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';

export const MonitorGraficasPage: React.FC = () => {
  const [searchDate, setSearchDate] = useState('');
  const [refreshTime, setRefreshTime] = useState('5');

  return (
    <div className="space-y-6">
      <Card>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-primary dark:text-secondary whitespace-nowrap mb-0">Fecha de Gráficas:</label>
              <input
                type="date"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                className="rounded-lg p-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-primary dark:text-secondary whitespace-nowrap mb-0">Tiempo de refresco:</label>
              <select
                value={refreshTime}
                onChange={(e) => setRefreshTime(e.target.value)}
                className="rounded-lg p-2 border border-gray-300 dark:bg-gray-700 dark:text-gray-100 w-24"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="30">30</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="primary">Actualizar</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Gráfica de Bitácoras Generados</h2>
        <div className="h-64 w-full bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-300 dark:border-gray-700">
          {/* Aquí iría el componente de gráfica real */}
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Gráfica de Bitácoras Cancelados</h2>
          <div className="h-48 w-full bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-300 dark:border-gray-700">
            {/* Aquí iría el componente de gráfica real */}
          </div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Gráfica de Bitácoras Sustituidos</h2>
          <div className="h-48 w-full bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-300 dark:border-gray-700">
            {/* Aquí iría el componente de gráfica real */}
          </div>
        </Card>
      </div>
    </div>
  );
};