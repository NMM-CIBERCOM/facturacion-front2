import React, { useState } from 'react';

export const MonitorGraficasPage: React.FC = () => {
  const [searchDate, setSearchDate] = useState('');
  const [refreshTime, setRefreshTime] = useState('5');

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow space-y-6">
      {/* Search Options */}
      <div className="bg-white dark:bg-gray-800 border-2 border-primary dark:border-secondary p-4 rounded-lg">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-primary dark:text-secondary whitespace-nowrap">Fecha de Gráficas:</label>
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="px-2 py-1 border border-primary dark:border-secondary rounded-md focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-primary dark:text-secondary whitespace-nowrap">Tiempo de refresco:</label>
            <select
              value={refreshTime}
              onChange={(e) => setRefreshTime(e.target.value)}
              className="px-2 py-1 border border-primary dark:border-secondary rounded-md focus:ring-primary dark:focus:ring-secondary focus:border-primary dark:focus:border-secondary bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-16"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="30">30</option>
            </select>
          </div>
          <button className="px-4 py-1 bg-primary dark:bg-secondary text-white rounded-md hover:bg-primary-dark dark:hover:bg-secondary-dark">
            Actualizar
          </button>
        </div>
      </div>

      {/* Generated Bitacoras Graph */}
      <div className="bg-white dark:bg-gray-800 border-2 border-primary dark:border-secondary p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-primary dark:text-secondary">Gráfica de Bitácoras Generados</h2>
        <div className="h-64 w-full bg-white dark:bg-gray-700 rounded-lg p-4 border border-primary dark:border-secondary">
          {/* Here you would integrate your actual graph component */}
        </div>
      </div>

      {/* Graphs Grid */}
      <div className="grid grid-cols-2 gap-6">
        {/* Cancelled Bitacoras Graph */}
        <div className="bg-white dark:bg-gray-800 border-2 border-primary dark:border-secondary p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-primary dark:text-secondary">Gráfica de Bitácoras Cancelados</h2>
          <div className="h-48 w-full bg-white dark:bg-gray-700 rounded-lg p-4 border border-primary dark:border-secondary">
            {/* Here you would integrate your actual graph component */}
          </div>
        </div>

        {/* Substituted Bitacoras Graph */}
        <div className="bg-white dark:bg-gray-800 border-2 border-primary dark:border-secondary p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4 text-primary dark:text-secondary">Gráfica de Bitácoras Sustituidos</h2>
          <div className="h-48 w-full bg-white dark:bg-gray-700 rounded-lg p-4 border border-primary dark:border-secondary">
            {/* Here you would integrate your actual graph component */}
          </div>
        </div>
      </div>
    </div>
  );
};