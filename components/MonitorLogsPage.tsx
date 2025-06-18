// src/components/MonitorLogsPage.tsx
import React, { useState, useMemo } from 'react';
import { Card } from './Card';
import { SelectField } from './SelectField';
import { Button } from './Button';

// --- Icono de Descarga (Componente interno) ---
const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

// --- Opciones para los Selectores ---
const DIRECTORY_OPTIONS = [ { value: 'server_logs', label: 'Logs del servidor' } ];
const LINES_OPTIONS = [ { value: 'all', label: 'Todas' }, { value: '100', label: 'Últimas 100' } ];
const ITEMS_PER_PAGE_OPTIONS = [ { value: '15', label: '15' }, { value: '25', label: '25' }, { value: '50', label: '50' } ];

// --- Datos de ejemplo ---
const mockLogFiles = Array.from({ length: 35 }, (_, i) => ({
  id: i + 1,
  name: i < 2 ? (i === 0 ? 'fact_server.log' : 'server.log') : `server.log.2024-12-${18 - i}`,
}));

interface MonitorFilters {
  directory: string;
  lines: string;
  itemsPerPage: string;
}

// --- Componente Principal de la Página ---
export const MonitorLogsPage: React.FC = () => {
  const [filters, setFilters] = useState<MonitorFilters>({
    directory: 'server_logs',
    lines: 'all',
    itemsPerPage: '15',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
    if (name === 'itemsPerPage') {
      setCurrentPage(1);
    }
  };

  const paginatedLogs = useMemo(() => {
    const lastIndex = currentPage * parseInt(filters.itemsPerPage);
    const firstIndex = lastIndex - parseInt(filters.itemsPerPage);
    return mockLogFiles.slice(firstIndex, lastIndex);
  }, [currentPage, filters.itemsPerPage]);
  
  const totalPages = Math.ceil(mockLogFiles.length / parseInt(filters.itemsPerPage));

  const handleDownload = (fileName: string) => {
    alert(`Iniciando descarga de: ${fileName}`);
  };
  
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 items-end gap-x-6 gap-y-4">
          <SelectField label="Directorio:" name="directory" value={filters.directory} onChange={handleFilterChange} options={DIRECTORY_OPTIONS} />
          <p className="text-sm text-gray-800 dark:text-gray-200 self-center pt-6">
             <span className="font-semibold">Servidor:</span> Intranet_Apps_Server1
          </p>
          <SelectField label="Líneas a descargar:" name="lines" value={filters.lines} onChange={handleFilterChange} options={LINES_OPTIONS} />
          <SelectField 
            label="Elementos:" 
            name="itemsPerPage" 
            value={filters.itemsPerPage} 
            onChange={handleFilterChange} 
            options={ITEMS_PER_PAGE_OPTIONS} 
          />
        </div>
        <div className="mt-6 flex justify-start">
          <Button type="button" variant="primary">
            Mostrar Descargas
          </Button>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead style={{ backgroundColor: 'var(--color-primary)' }}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">Nombre</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-white uppercase tracking-wider">Descarga</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800">
              {paginatedLogs.map((file, index) => (
                <tr key={file.id} className={index % 2 !== 0 ? 'bg-pink-50 dark:bg-purple-900/20' : ''}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{file.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button onClick={() => handleDownload(file.name)} className="text-gray-600 hover:text-purple-700 dark:text-gray-400 dark:hover:text-white transition-colors">
                      <DownloadIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-center py-4">
          <nav className="flex items-center space-x-2">
            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </Button>
            
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Página {currentPage} de {totalPages}
            </span>

            <Button
              variant="secondary"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </Button>
          </nav>
        </div>
      </Card>
    </div>
  );
};