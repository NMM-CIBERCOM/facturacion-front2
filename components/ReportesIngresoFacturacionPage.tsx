import React, { useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { Button } from './Button';
import { MES_OPTIONS, EMPRESA_OPTIONS_CONSULTAS, ALMACEN_OPTIONS } from '../constants';

interface IngresoFacturacionFormData {
  mes: string;
  almacen: string;
  fecha: string;
  empresa: string;
}

const initialFormData: IngresoFacturacionFormData = {
  mes: MES_OPTIONS[MES_OPTIONS.length - 1]?.value || '',
  almacen: '',
  fecha: '',
  empresa: EMPRESA_OPTIONS_CONSULTAS[EMPRESA_OPTIONS_CONSULTAS.length -1 ]?.value || '',
};

export const ReportesIngresoFacturacionPage: React.FC = () => {
  const [formData, setFormData] = useState<IngresoFacturacionFormData>(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Buscar Desglose Facturación de Ingresos:', formData);
    alert('Búsqueda de Desglose Facturación (Rep. 1) simulada. Ver consola.');
  };

  const handleExcel = () => {
    console.log('Exportar Desglose Facturación de Ingresos a Excel:', formData);
    alert('Exportación a Excel (Rep. 1) simulada.');
  };

  return (
    <form onSubmit={handleBuscar} className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-2">
          Desglose Facturación de Ingresos (Rep. 1)
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          --Ingresa los datos para consulta:--
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
          <SelectField label="Mes:" name="mes" value={formData.mes} onChange={handleChange} options={MES_OPTIONS} />
          <FormField label="Alm:" name="almacen" value={formData.almacen} onChange={handleChange} placeholder="Almacén" />
          <FormField label="Fecha:" name="fecha" type="date" value={formData.fecha} onChange={handleChange} />
          <SelectField label="*Empresa:" name="empresa" value={formData.empresa} onChange={handleChange} options={EMPRESA_OPTIONS_CONSULTAS} required/>
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
        Los resultados del reporte aparecerán aquí.
      </div>
    </form>
  );
};
