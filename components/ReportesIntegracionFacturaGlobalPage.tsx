import React, { useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { CheckboxField } from './CheckboxField';
import { Button } from './Button';
import { TIENDA_OPTIONS_REPORTS, TIPO_FACTURA_GLOBAL_OPTIONS_REPORTS, EMPRESA_OPTIONS_CONSULTAS } from '../constants';

interface IntegracionFacturaGlobalFormData {
  fecha: string;
  tiendas: string[];
  todasTiendas: boolean;
  tiposFacturaGlobal: string[];
  todosTiposFactura: boolean;
  empresa: string;
}

const initialFormData: IntegracionFacturaGlobalFormData = {
  fecha: '',
  tiendas: [],
  todasTiendas: false,
  tiposFacturaGlobal: [],
  todosTiposFactura: false,
  empresa: EMPRESA_OPTIONS_CONSULTAS[EMPRESA_OPTIONS_CONSULTAS.length - 1]?.value || '',
};

export const ReportesIntegracionFacturaGlobalPage: React.FC = () => {
  const [formData, setFormData] = useState<IntegracionFacturaGlobalFormData>(initialFormData);

  const handleCheckboxGroupChange = (
    groupName: keyof Pick<IntegracionFacturaGlobalFormData, 'tiendas' | 'tiposFacturaGlobal'>,
    itemName: string,
    isChecked: boolean
  ) => {
    setFormData(prev => {
      const currentGroup = prev[groupName] as string[];
      const newGroup = isChecked
        ? [...currentGroup, itemName]
        : currentGroup.filter(item => item !== itemName);
      return { ...prev, [groupName]: newGroup };
    });
  };

  const handleSelectAllChange = (
    groupName: keyof Pick<IntegracionFacturaGlobalFormData, 'tiendas' | 'tiposFacturaGlobal'>,
    allFlagName: keyof Pick<IntegracionFacturaGlobalFormData, 'todasTiendas' | 'todosTiposFactura'>,
    options: {value: string, label: string}[],
    isChecked: boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [allFlagName]: isChecked,
      [groupName]: isChecked ? options.map(opt => opt.value) : [],
    }));
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Buscar Integración Factura Global (Rep. 2):', formData);
    alert('Búsqueda (Rep. 2) simulada. Ver consola.');
  };

  const handleExcel = () => {
    console.log('Exportar Integración Factura Global (Rep. 2) a Excel:', formData);
    alert('Exportación a Excel (Rep. 2) simulada.');
  };

  return (
    <form onSubmit={handleBuscar} className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-2">
          Integración Factura Global (Rep. 2)
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          --Ingresa los datos para consulta:--
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <FormField label="*Fecha:" name="fecha" type="date" value={formData.fecha} onChange={handleChange} required/>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tienda:</label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-md p-2 h-32 overflow-y-auto">
              {TIENDA_OPTIONS_REPORTS.map(option => (
                <CheckboxField
                  key={option.value}
                  label={option.label}
                  name={`tienda-${option.value}`}
                  checked={formData.tiendas.includes(option.value)}
                  onChange={(e) => handleCheckboxGroupChange('tiendas', option.value, e.target.checked)}
                />
              ))}
            </div>
            <CheckboxField label="Todas" name="todasTiendas" checked={formData.todasTiendas} 
                           onChange={(e) => handleSelectAllChange('tiendas', 'todasTiendas', TIENDA_OPTIONS_REPORTS, e.target.checked)} className="mt-1"/>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo Factura Global:</label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-md p-2 h-32 overflow-y-auto">
              {TIPO_FACTURA_GLOBAL_OPTIONS_REPORTS.map(option => (
                <CheckboxField
                  key={option.value}
                  label={option.label}
                  name={`tipoFacturaGlobal-${option.value}`}
                  checked={formData.tiposFacturaGlobal.includes(option.value)}
                  onChange={(e) => handleCheckboxGroupChange('tiposFacturaGlobal', option.value, e.target.checked)}
                />
              ))}
            </div>
             <CheckboxField label="Todos" name="todosTiposFactura" checked={formData.todosTiposFactura} 
                           onChange={(e) => handleSelectAllChange('tiposFacturaGlobal', 'todosTiposFactura', TIPO_FACTURA_GLOBAL_OPTIONS_REPORTS, e.target.checked)} className="mt-1"/>
          </div>
          
          <SelectField label="*Empresa:" name="empresa" value={formData.empresa} onChange={handleChange} options={EMPRESA_OPTIONS_CONSULTAS} required className="self-start"/>
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
