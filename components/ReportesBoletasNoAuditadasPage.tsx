import React, { useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { Button } from './Button';
import { TIENDA_OPTIONS } from '../constants';

interface BoletasNoAuditadasFormData {
  fecha: string;
  tienda: string;
}

const initialFormData: BoletasNoAuditadasFormData = {
  fecha: new Date().toISOString().split('T')[0],
  tienda: TIENDA_OPTIONS[0]?.value || '',
};

export const ReportesBoletasNoAuditadasPage: React.FC = () => {
  const [formData, setFormData] = useState<BoletasNoAuditadasFormData>(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Buscar Boletas No Auditadas:', formData);
    alert('Búsqueda de boletas no auditadas simulada. Ver consola.');
  };

  const handleAgregarTda = () => {
    alert('Funcionalidad "Agregar Tda" no implementada.');
  };

  const handleExcel = () => {
    console.log('Exportar Boletas No Auditadas a Excel:', formData);
    alert('Exportación a Excel simulada.');
  };

  return (
    <form onSubmit={handleBuscar} className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">
          --Especificar búsqueda--
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 items-end">
          <FormField label="Fecha:" name="fecha" type="date" value={formData.fecha} onChange={handleChange} />
          <SelectField label="Tienda:" name="tienda" value={formData.tienda} onChange={handleChange} options={TIENDA_OPTIONS} />
          {/* Empty divs for spacing if needed, or adjust grid-cols */}
          <div></div>
          <div></div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <Button type="button" onClick={handleAgregarTda} variant="neutral">
            Agregar Tda
          </Button>
          <Button type="submit" variant="primary">
            Buscar
          </Button>
          <Button type="button" onClick={handleExcel} variant="secondary">
            XLS
          </Button>
        </div>
      </Card>
      <div className="mt-6 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md min-h-[200px] flex items-center justify-center text-gray-400 dark:text-gray-500">
        Los resultados del reporte de Boletas No Auditadas aparecerán aquí.
      </div>
    </form>
  );
};
