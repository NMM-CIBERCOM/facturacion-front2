import React, { useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { CheckboxField } from './CheckboxField';
import { Button } from './Button';
import { MES_OPTIONS, TIPO_FACTURA_GLOBAL_OPTIONS_REPORTS, TIPO_CFDI_OPTIONS_REPORTS, EMPRESA_OPTIONS_CONSULTAS, TIENDA_OPTIONS_REPORTS } from '../constants';

interface IntegracionClientesFormData {
  mes: string;
  porOperacion: boolean;
  anio: string;
  tiposFacturaGlobal: string[];
  todasTiposFacturaGlobal: boolean;
  tiposCfdi: string[];
  todosTiposCfdi: boolean;
  empresa: string;
  fechaOperacion: string;
  fechaFacturacion: string;
  tiendas: string[];
  todasTiendas: boolean;
}

const initialFormData: IntegracionClientesFormData = {
  mes: MES_OPTIONS[MES_OPTIONS.length - 1]?.value || '',
  porOperacion: false,
  anio: new Date().getFullYear().toString(),
  tiposFacturaGlobal: [],
  todasTiposFacturaGlobal: false,
  tiposCfdi: [],
  todosTiposCfdi: false,
  empresa: EMPRESA_OPTIONS_CONSULTAS[EMPRESA_OPTIONS_CONSULTAS.length - 1]?.value || '',
  fechaOperacion: '',
  fechaFacturacion: '',
  tiendas: [],
  todasTiendas: false,
};

export const ReportesIntegracionClientesPage: React.FC = () => {
  const [formData, setFormData] = useState<IntegracionClientesFormData>(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox' && name !== 'porOperacion' && !name.startsWith('todas')) {
    } else if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData(prev => ({ ...prev, [name]: checked }));
    }
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleCheckboxGroupChange = (
    groupName: keyof Pick<IntegracionClientesFormData, 'tiposFacturaGlobal' | 'tiposCfdi' | 'tiendas'>,
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
    groupName: keyof Pick<IntegracionClientesFormData, 'tiposFacturaGlobal' | 'tiposCfdi' | 'tiendas'>,
    allFlagName: keyof Pick<IntegracionClientesFormData, 'todasTiposFacturaGlobal' | 'todosTiposCfdi' | 'todasTiendas'>,
    options: {value: string, label: string}[],
    isChecked: boolean
  ) => {
    setFormData(prev => ({
      ...prev,
      [allFlagName]: isChecked,
      [groupName]: isChecked ? options.map(opt => opt.value) : [],
    }));
  };


  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Buscar Integración Clientes (Rep. 3):', formData);
    alert('Búsqueda (Rep. 3) simulada. Ver consola.');
  };

  const handleExcel = () => {
    console.log('Exportar Integración Clientes (Rep. 3) a Excel:', formData);
    alert('Exportación a Excel (Rep. 3) simulada.');
  };
  
  const checkboxContainerClass = "border border-gray-300 dark:border-gray-600 rounded-md p-2 h-24 overflow-y-auto text-sm";


  return (
    <form onSubmit={handleBuscar} className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-2">
          Integración Clientes (Rep. 3)
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          --Ingresa los datos para consulta:--
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          <div className="flex items-end space-x-2">
            <SelectField label="Mes:" name="mes" value={formData.mes} onChange={handleChange} options={MES_OPTIONS} className="flex-grow"/>
            <CheckboxField label="por Operacion" name="porOperacion" checked={formData.porOperacion} onChange={handleChange} className="pb-1"/>
          </div>
          <FormField label="Fecha Operación:" name="fechaOperacion" type="date" value={formData.fechaOperacion} onChange={handleChange} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tienda:</label>
            <div className={checkboxContainerClass}>
              {TIENDA_OPTIONS_REPORTS.map(option => (
                <CheckboxField key={option.value} label={option.label} name={`tienda-${option.value}`} checked={formData.tiendas.includes(option.value)} onChange={(e) => handleCheckboxGroupChange('tiendas', option.value, e.target.checked)} />
              ))}
            </div>
            <CheckboxField label="Todas" name="todasTiendas" checked={formData.todasTiendas} onChange={(e) => handleSelectAllChange('tiendas', 'todasTiendas', TIENDA_OPTIONS_REPORTS, e.target.checked)} className="mt-1"/>
          </div>

          <FormField label="Año:" name="anio" value={formData.anio} onChange={handleChange} placeholder="AAAA" maxLength={4}/>
          <FormField label="Fecha Facturación:" name="fechaFacturacion" type="date" value={formData.fechaFacturacion} onChange={handleChange} />
           <div></div>


          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo Factura Global:</label>
            <div className={checkboxContainerClass}>
              {TIPO_FACTURA_GLOBAL_OPTIONS_REPORTS.map(option => (
                <CheckboxField key={option.value} label={option.label} name={`tipoFacturaGlobal-${option.value}`} checked={formData.tiposFacturaGlobal.includes(option.value)} onChange={(e) => handleCheckboxGroupChange('tiposFacturaGlobal', option.value, e.target.checked)} />
              ))}
            </div>
            <CheckboxField label="Todos" name="todasTiposFacturaGlobal" checked={formData.todasTiposFacturaGlobal} onChange={(e) => handleSelectAllChange('tiposFacturaGlobal', 'todasTiposFacturaGlobal', TIPO_FACTURA_GLOBAL_OPTIONS_REPORTS, e.target.checked)} className="mt-1"/>
          </div>
           <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tipo CFDI:</label>
            <div className={checkboxContainerClass}>
              {TIPO_CFDI_OPTIONS_REPORTS.map(option => (
                <CheckboxField key={option.value} label={option.label} name={`tipoCfdi-${option.value}`} checked={formData.tiposCfdi.includes(option.value)} onChange={(e) => handleCheckboxGroupChange('tiposCfdi', option.value, e.target.checked)} />
              ))}
            </div>
            <CheckboxField label="Todos" name="todosTiposCfdi" checked={formData.todosTiposCfdi} onChange={(e) => handleSelectAllChange('tiposCfdi', 'todosTiposCfdi', TIPO_CFDI_OPTIONS_REPORTS, e.target.checked)} className="mt-1"/>
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
