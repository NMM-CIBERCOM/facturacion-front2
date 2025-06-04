import React, { useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { CheckboxField } from './CheckboxField';
import { Button } from './Button';
import { TextareaField } from './TextareaField';
import { MES_OPTIONS, EMPRESA_OPTIONS_CONSULTAS, TIENDA_OPTIONS_REPORTS, TIENDA_OPTIONS } from '../constants';

interface FiscalRepsSustituidosFormData {
  mes: string;
  porOperacion: boolean;
  anio: string;
  empresa: string;
  fechaOperacion: string;
  fechaFacturacion: string;
  tienda: string;
  todasTiendas: boolean;
  uuidReps: string;
}

const initialFormData: FiscalRepsSustituidosFormData = {
  mes: MES_OPTIONS[MES_OPTIONS.length - 1]?.value || '',
  porOperacion: false,
  anio: new Date().getFullYear().toString(),
  empresa: EMPRESA_OPTIONS_CONSULTAS[EMPRESA_OPTIONS_CONSULTAS.length - 1]?.value || '',
  fechaOperacion: '',
  fechaFacturacion: '',
  tienda: TIENDA_OPTIONS[0]?.value || '',
  todasTiendas: false,
  uuidReps: '',
};

export const ReportesFiscalesRepsSustituidosPage: React.FC = () => {
  const [formData, setFormData] = useState<FiscalRepsSustituidosFormData>(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  // If Tienda were a checkbox group
  /*
  const handleTiendaCheckboxChange = (tiendaValue: string, isChecked: boolean) => {
    setFormData(prev => {
        const currentTiendas = Array.isArray(prev.tienda) ? prev.tienda : (prev.tienda ? [prev.tienda] : []);
        const newTiendas = isChecked
            ? [...currentTiendas, tiendaValue]
            : currentTiendas.filter(t => t !== tiendaValue);
        return { ...prev, tienda: newTiendas, todasTiendas: false }; // Reset "todas" if individual changes
    });
  };

  const handleTodasTiendasChange = (isChecked: boolean) => {
    setFormData(prev => ({
        ...prev,
        todasTiendas: isChecked,
        tienda: isChecked ? TIENDA_OPTIONS_REPORTS.map(t => t.value) : []
    }));
  };
  */


  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Buscar REPs Sustituidos (Fiscal):', formData);
    alert('Búsqueda de REPs Sustituidos (Fiscal) simulada. Ver consola.');
  };

  const handleExcel = () => {
    console.log('Exportar REPs Sustituidos (Fiscal) a Excel:', formData);
    alert('Exportación a Excel de REPs Sustituidos (Fiscal) simulada.');
  };
  
  const checkboxContainerClass = "border border-gray-300 dark:border-gray-600 rounded-md p-2 h-32 overflow-y-auto text-sm";
  const prioridadClass = "w-24 text-xs mt-6 text-gray-500 dark:text-gray-400 self-end pb-1 px-1"; // For "prioridad x" text display


  return (
    <form onSubmit={handleBuscar} className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-2">
          Reporte de CFDI enviados para Timbrar (REPS Sustituidos)
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          --Ingresa los datos para consulta:--
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          {/* Row 1 */}
          <div className="flex items-end space-x-2">
            <SelectField label="Mes:" name="mes" value={formData.mes} onChange={handleChange} options={MES_OPTIONS} className="flex-grow"/>
            <CheckboxField label="por Operacion" name="porOperacion" checked={formData.porOperacion} onChange={handleChange} className="pb-1"/>
          </div>
          <div className="flex items-center space-x-1">
            <FormField label="Fecha Operación:" name="fechaOperacion" type="date" value={formData.fechaOperacion} onChange={handleChange} className="flex-grow"/>
            <span className={prioridadClass}>*prioridad 3</span>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tienda:</label>
             {/* Using SelectField as per ConsultasRepsSustituidosPage.tsx, not a listbox */}
            <SelectField label="" name="tienda" value={formData.tienda} onChange={handleChange} options={TIENDA_OPTIONS} />
          </div>

          {/* Row 2 */}
          <FormField label="Año:" name="anio" value={formData.anio} onChange={handleChange} placeholder="AAAA" maxLength={4}/>
          <div className="flex items-center space-x-1">
            <FormField label="Fecha Facturación:" name="fechaFacturacion" type="date" value={formData.fechaFacturacion} onChange={handleChange} className="flex-grow"/>
             <span className={prioridadClass}>*prioridad 3</span>
          </div>
           <CheckboxField label="Todas" name="todasTiendas" checked={formData.todasTiendas} onChange={handleChange} className="mt-7"/> {/* For "Todas" Tiendas with SelectField */}
          
          {/* Row 3 */}
          <SelectField label="*Empresa:" name="empresa" value={formData.empresa} onChange={handleChange} options={EMPRESA_OPTIONS_CONSULTAS} required />
          <div></div> {/* Spacer */}
          <div></div> {/* Spacer */}

          {/* Row 4 for UUIDs */}
          <div className="lg:col-span-2 flex items-start space-x-1">
            <TextareaField label="UUID REPs:" name="uuidReps" value={formData.uuidReps} onChange={handleChange} rows={3} className="flex-grow" placeholder="Ingrese UUID(s)"/>
            <span className={prioridadClass}>*prioridad 5</span>
          </div>
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
        Los resultados del reporte de REPs Sustituidos (Fiscal) aparecerán aquí.
      </div>
    </form>
  );
};
