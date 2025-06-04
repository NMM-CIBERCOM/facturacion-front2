import React, { useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { Button } from './Button';

interface ConsultaSkuFormData {
  empresa: string;
  sector: string;
  nombreSector: string;
  seccion: string;
  divisionNegocio: string;
  facturableNoFacturable: string;
  sku: string;
  claveSat: string;
}

const initialFormData: ConsultaSkuFormData = {
  empresa: '',
  sector: '',
  nombreSector: '',
  seccion: '',
  divisionNegocio: '',
  facturableNoFacturable: '',
  sku: '',
  claveSat: '',
};

export const ConsultasSkuPage: React.FC = () => {
  const [formData, setFormData] = useState<ConsultaSkuFormData>(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Buscando SKU:', formData);
    alert('Búsqueda de SKU simulada. Ver consola para detalles.');
  };

  const handleExcel = () => {
    console.log('Exportando SKU a Excel:', formData);
    alert('Exportación a Excel de SKU simulada.');
  };

  return (
    <form onSubmit={handleBuscar} className="space-y-6">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField label="EMPRESA:" name="empresa" value={formData.empresa} onChange={handleChange} />
          <FormField label="DIVISION DEL NEGOCIO:" name="divisionNegocio" value={formData.divisionNegocio} onChange={handleChange} />
          <FormField label="SECTOR:" name="sector" value={formData.sector} onChange={handleChange} />
          <FormField label="FACTURABLE/NO FACTURABLE:" name="facturableNoFacturable" value={formData.facturableNoFacturable} onChange={handleChange} />
          <FormField label="NOMBRE DEL SECTOR:" name="nombreSector" value={formData.nombreSector} onChange={handleChange} />
          <FormField label="SKU:" name="sku" value={formData.sku} onChange={handleChange} />
          <FormField label="SECCION:" name="seccion" value={formData.seccion} onChange={handleChange} />
          <FormField label="CLAVE SAT:" name="claveSat" value={formData.claveSat} onChange={handleChange} />
        </div>
        <div className="mt-6 flex justify-start space-x-3">
          <Button type="submit" variant="primary">
            Buscar
          </Button>
          <Button type="button" onClick={handleExcel} variant="secondary">
            Excel
          </Button>
        </div>
      </Card>

      <div className="mt-6 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md min-h-[200px] flex items-center justify-center text-gray-400 dark:text-gray-500">
        Los resultados de la búsqueda de SKU aparecerán aquí.
      </div>
    </form>
  );
};
