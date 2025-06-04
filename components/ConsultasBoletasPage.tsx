import React, { useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { Button } from './Button';
import { FileInputField } from './FileInputField';
import { TIENDA_OPTIONS } from '../constants';

interface ConsultaIndividualFormData {
  tienda: string;
  fecha: string;
  terminal: string;
  boleta: string;
  codigoFacturacion: string;
}

const initialIndividualFormData: ConsultaIndividualFormData = {
  tienda: TIENDA_OPTIONS[0]?.value || '',
  fecha: new Date().toISOString().split('T')[0],
  terminal: '',
  boleta: '',
  codigoFacturacion: '',
};

export const ConsultasBoletasPage: React.FC = () => {
  const [individualFormData, setIndividualFormData] = useState<ConsultaIndividualFormData>(initialIndividualFormData);
  const [massFile, setMassFile] = useState<File | null>(null);

  const handleIndividualChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setIndividualFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setMassFile(file);
  };

  const handleIndividualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Consultando Boleta Individual:', individualFormData);
    alert('Consulta individual de boleta simulada. Ver consola.');
  };

  const handleMassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (massFile) {
      console.log('Consultando Boletas Masiva, Archivo:', massFile.name);
      alert(`Consulta masiva de boletas con archivo ${massFile.name} simulada.`);
    } else {
      alert('Por favor, seleccione un archivo para la consulta masiva.');
    }
  };
  
  const fileHelpText = "El archivo debe ser .xlsx o .csv y contener los datos de las boletas a consultar.";


  return (
    <div className="space-y-8">
      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">
          --Ingresa los datos para consulta:--
        </h3>
        <form onSubmit={handleIndividualSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-2 items-end">
            <SelectField label="Tienda:" name="tienda" value={individualFormData.tienda} onChange={handleIndividualChange} options={TIENDA_OPTIONS} className="lg:col-span-1" />
            <FormField label="Fecha:" name="fecha" type="date" value={individualFormData.fecha} onChange={handleIndividualChange} className="lg:col-span-1" />
            <FormField label="Terminal:" name="terminal" value={individualFormData.terminal} onChange={handleIndividualChange} className="lg:col-span-1" />
            <FormField label="Boleta:" name="boleta" value={individualFormData.boleta} onChange={handleIndividualChange} className="lg:col-span-1" />
            <div></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-2 items-end">
            <FormField label="Código de facturación:" name="codigoFacturacion" value={individualFormData.codigoFacturacion} onChange={handleIndividualChange} className="lg:col-span-2" />
            <div className="lg:col-span-2"></div>
            <div className="flex justify-start lg:justify-end pt-1">
                <Button type="submit" variant="primary">
                    Consultar
                </Button>
            </div>
          </div>
        </form>
      </Card>

      <Card>
        <form onSubmit={handleMassSubmit} className="space-y-4">
           <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">
            Consulta Masiva
            </h3>
          <FileInputField
            label="Archivo para Consulta Masiva:"
            name="consultaMasivaFile"
            onChange={handleFileChange}
            accept=".xlsx, .csv"
            helpText={fileHelpText}
          />
          <div className="mt-4 flex justify-start">
            <Button type="submit" variant="primary">
              Consulta Masiva
            </Button>
          </div>
        </form>
      </Card>

      <div className="mt-6 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md min-h-[200px] flex items-center justify-center text-gray-400 dark:text-gray-500">
        Los resultados de la consulta de boletas aparecerán aquí.
      </div>
    </div>
  );
};
