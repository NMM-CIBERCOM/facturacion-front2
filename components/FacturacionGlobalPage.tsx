import React, { useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { Button } from './Button';
import { TIENDA_OPTIONS, TIPO_FACTURA_OPTIONS, ESTATUS_FACTURA_OPTIONS } from '../constants';

interface FacturaGlobalFormData {
  fecha: string;
  tienda: string;
  tipoFactura: string;
  estatus: string;
}

const initialFacturaGlobalFormData: FacturaGlobalFormData = {
  fecha: new Date().toISOString().split('T')[0],
  tienda: TIENDA_OPTIONS[0]?.value || '',
  tipoFactura: TIPO_FACTURA_OPTIONS[0]?.value || '',
  estatus: ESTATUS_FACTURA_OPTIONS[0]?.value || '',
};

export const FacturacionGlobalPage: React.FC = () => {
  const [formData, setFormData] = useState<FacturaGlobalFormData>(initialFacturaGlobalFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Buscar Factura Global:', formData);
    alert('Buscando Factura Global (simulado). Ver consola para datos.');
  };

  const handleExcel = () => {
    console.log('Exportar a Excel:', formData);
    alert('Exportando a Excel (simulado).');
  };

  return (
    <form onSubmit={handleBuscar} className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">--Especificar búsqueda--</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 items-end">
          <FormField label="Fecha:" name="fecha" type="date" value={formData.fecha} onChange={handleChange} />
          <SelectField label="Tienda:" name="tienda" value={formData.tienda} onChange={handleChange} options={TIENDA_OPTIONS} />
          <SelectField label="Tipo de Factura:" name="tipoFactura" value={formData.tipoFactura} onChange={handleChange} options={TIPO_FACTURA_OPTIONS} />
          <SelectField label="Estatus:" name="estatus" value={formData.estatus} onChange={handleChange} options={ESTATUS_FACTURA_OPTIONS} />
        </div>
        <div className="mt-6 flex justify-end space-x-3">
            <Button type="submit" variant="primary">
                Buscar
            </Button>
            <Button type="button" onClick={handleExcel} variant="secondary">
                Excel
            </Button>
        </div>
      </Card>

      <div className="mt-6 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md min-h-[200px] flex items-center justify-center text-gray-400 dark:text-gray-500">
          Los resultados de la búsqueda aparecerán aquí.
      </div>
    </form>
  );
};
