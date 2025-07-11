import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { utils, writeFile } from 'xlsx';

const DUMMY_RESULTS = [
  { uuid: 'F1C2B3A4-1234-ABCD-5678-E9F0G1H2I3J4', folio: 'A-1025', tienda: 'Central', fecha: '2024-04-15', status: 'success', message: 'Cancelada Exitosamente' },
  { uuid: 'G2H3I4J5-5678-BCDE-9012-K3L4M5N6O7P8', folio: 'B-3452', tienda: 'Sucursal Norte', fecha: '2024-04-16', status: 'success', message: 'Cancelada Exitosamente' },
  { uuid: 'H3I4J5K6-9012-CDEF-3456-L4M5N6O7P8Q9', folio: 'C-8812', tienda: 'Sucursal Sur', fecha: '2024-04-17', status: 'error', message: 'Error: La factura ya se encontraba cancelada.' },
  { uuid: 'I4J5K6L7-3456-DEFG-7890-M5N6O7P8Q9R0', folio: 'D-5567', tienda: 'Bodega Principal', fecha: '2024-04-18', status: 'success', message: 'Cancelada Exitosamente' },
];

export const FacturacionCancelacionMasivaPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [summary, setSummary] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedFile(e.target.files ? e.target.files[0] : null);
    setResults([]);
    setSummary('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      setIsLoading(true);
      setResults([]);
      setSummary('Procesando archivo, por favor espere...');
      setTimeout(() => {
        const successCount = DUMMY_RESULTS.filter(r => r.status === 'success').length;
        const errorCount = DUMMY_RESULTS.length - successCount;
        setSummary(`Proceso finalizado. ${successCount} facturas canceladas, ${errorCount} con error.`);
        setResults(DUMMY_RESULTS);
        setIsLoading(false);
      }, 1500);
    } else {
      alert('Por favor, seleccione un archivo para la cancelación masiva.');
    }
  };

  const handleExcel = () => {
    if (results.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }
    const ws = utils.json_to_sheet(results);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, 'CancelacionMasiva');
    writeFile(wb, 'cancelacion_masiva_resultados.xlsx');
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
                  </tr>
                </thead>
                <tbody>
                  {results.map((res, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-2 py-1 font-mono truncate text-gray-700 dark:text-gray-100" title={res.uuid}>{res.uuid}</td>
                      <td className="px-2 py-1 text-gray-700 dark:text-gray-100">{res.folio}</td>
                      <td className="px-2 py-1 text-gray-700 dark:text-gray-100">{res.tienda}</td>
                      <td className="px-2 py-1 text-gray-700 dark:text-gray-100">{res.fecha}</td>
                      <td className={`px-2 py-1 font-medium ${res.status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{res.message}</td>
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
    </div>
  );
};