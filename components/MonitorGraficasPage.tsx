import React, { useState } from 'react';
import { Card } from './Card';

export const MonitorGraficasPage: React.FC = () => {
  const [searchDate, setSearchDate] = useState('');
  const [refreshTime, setRefreshTime] = useState('5');

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <label className="text-sm font-medium text-gray-800 dark:text-gray-100">Fecha de Gráficas:</label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="w-full p-2 border rounded mt-1"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-800 dark:text-gray-100">Tiempo de refresco:</label>
            <select
              value={refreshTime}
              onChange={(e) => setRefreshTime(e.target.value)}
              className="w-full p-2 border rounded mt-1"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="30">30</option>
            </select>
          </div>
          <div className="md:col-span-2 flex justify-end mt-2">
            <button className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Actualizar</button>
          </div>
        </div>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Gráfica de Bitácoras Generados</h2>
          <div className="h-64 w-full bg-white dark:bg-gray-700 rounded-lg p-4 border border-primary dark:border-secondary"></div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Gráfica de Bitácoras Cancelados</h2>
          <div className="h-40 w-full bg-white dark:bg-gray-700 rounded-lg p-4 border border-primary dark:border-secondary"></div>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Gráfica de Bitácoras Sustituidos</h2>
          <div className="h-40 w-full bg-white dark:bg-gray-700 rounded-lg p-4 border border-primary dark:border-secondary"></div>
        </Card>
      </div>
    </div>
  );
};