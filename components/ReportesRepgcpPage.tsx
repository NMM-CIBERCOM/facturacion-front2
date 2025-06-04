import React, { useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { Button } from './Button';

interface RepgcpFormData {
  fechaSolicitud: string;
}

const initialFormData: RepgcpFormData = {
  fechaSolicitud: new Date().toISOString().split('T')[0],
};

export const ReportesRepgcpPage: React.FC = () => {
  const [formData, setFormData] = useState<RepgcpFormData>(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGuardarFecha = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Guardar Fecha REPgcp:', formData);
    alert('Guardar Fecha REPgcp simulado. Ver consola.');
  };

  return (
    <form onSubmit={handleGuardarFecha} className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">
          --Especificar Fecha--
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-end">
          <FormField label="Fecha de Solicitud:" name="fechaSolicitud" type="date" value={formData.fechaSolicitud} onChange={handleChange} />
          <div className="flex justify-start">
            <Button type="submit" variant="primary">
              Guardar Fecha
            </Button>
          </div>
        </div>
      </Card>
       <div className="mt-6 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md min-h-[200px] flex items-center justify-center text-gray-400 dark:text-gray-500">
        Los resultados o confirmaciones aparecerán aquí.
      </div>
    </form>
  );
};
