import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { FileInputField } from './FileInputField';

export const FacturacionCancelacionMasivaPage: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      console.log('Procesando cancelación masiva para el archivo:', selectedFile.name);
      alert(`Procesando cancelación masiva para: ${selectedFile.name} (simulado).`);
    } else {
      alert('Por favor, seleccione un archivo para la cancelación masiva.');
    }
  };

  const fileHelpText = "El archivo debe ser .xlsx o .csv y contener las siguientes columnas en este orden: UUID, Folio, Tienda, Fecha. La primera fila se considera encabezado y será ignorada.";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
        Cancelación de Facturas Masiva
      </h2>
      
      <Card className="bg-accent/10 dark:bg-accent-dark/10 border-accent dark:border-accent-dark">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-3">
          Ingresa los datos para la Cancelación de Facturas:
        </h3>
        <FileInputField
          label="Archivo de Cancelación Masiva:"
          name="cancelacionMasivaFile"
          onChange={handleFileChange}
          accept=".xlsx, .csv"
          required
          helpText={fileHelpText}
          className="mb-4"
        />
        <div className="flex justify-end mt-6">
          <Button type="submit" variant="primary">
            Cancelar Masiva
          </Button>
        </div>
      </Card>

      <div className="mt-6 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md min-h-[100px] flex items-center justify-center text-gray-400 dark:text-gray-500">
          Los resultados del proceso de cancelación aparecerán aquí.
      </div>
    </form>
  );
};
