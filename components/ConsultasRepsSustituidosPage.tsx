import React, { useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { CheckboxField } from './CheckboxField';
import { Button } from './Button';
import { TextareaField } from './TextareaField';
import { MES_OPTIONS, EMPRESA_OPTIONS_CONSULTAS, TIENDA_OPTIONS } from '../constants';

interface RepsSustituidosFormData {
  mes: string;
  porOperacion: boolean;
  anio: string;
  empresa: string;
  fechaOperacion: string;
  prioridadFechaOperacion: string;
  fechaFacturacion: string;
  prioridadFechaFacturacion: string;
  tienda: string;
  todasTiendas: boolean;
  uuidReps: string;
  prioridadUuid: string;
}

const initialFormData: RepsSustituidosFormData = {
  mes: MES_OPTIONS[MES_OPTIONS.length-1]?.value || '',
  porOperacion: false,
  anio: new Date().getFullYear().toString(),
  empresa: EMPRESA_OPTIONS_CONSULTAS[EMPRESA_OPTIONS_CONSULTAS.length-1]?.value || '',
  fechaOperacion: '',
  prioridadFechaOperacion: 'prioridad 3',
  fechaFacturacion: '',
  prioridadFechaFacturacion: 'prioridad 3',
  tienda: TIENDA_OPTIONS[0]?.value || '',
  todasTiendas: false,
  uuidReps: '',
  prioridadUuid: 'prioridad 5',
};

export const ConsultasRepsSustituidosPage: React.FC = () => {
  const [formData, setFormData] = useState<RepsSustituidosFormData>(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Buscando REPs Sustituidos:', formData);
    alert('Búsqueda de REPs Sustituidos simulada. Ver consola.');
  };

  const handleExcel = () => {
    console.log('Exportando REPs Sustituidos a Excel:', formData);
    alert('Exportación a Excel de REPs Sustituidos simulada.');
  };

  return (
    <form onSubmit={handleBuscar} className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">
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
          <div className="flex items-center space-x-2">
            <FormField label="Fecha Operación:" name="fechaOperacion" type="date" value={formData.fechaOperacion} onChange={handleChange} className="flex-grow"/>
            <FormField label="" name="prioridadFechaOperacion" value={formData.prioridadFechaOperacion} onChange={handleChange} disabled className="w-24 text-xs mt-6"/>
          </div>
           <SelectField label="Tienda:" name="tienda" value={formData.tienda} onChange={handleChange} options={TIENDA_OPTIONS} /> {/* Simple select for now */}


          {/* Row 2 */}
          <FormField label="Año:" name="anio" value={formData.anio} onChange={handleChange} placeholder="AAAA" maxLength={4}/>
          <div className="flex items-center space-x-2">
            <FormField label="Fecha Facturación:" name="fechaFacturacion" type="date" value={formData.fechaFacturacion} onChange={handleChange} className="flex-grow"/>
            <FormField label="" name="prioridadFechaFacturacion" value={formData.prioridadFechaFacturacion} onChange={handleChange} disabled className="w-24 text-xs mt-6"/>
          </div>
          <CheckboxField label="Todas" name="todasTiendas" checked={formData.todasTiendas} onChange={handleChange} className="mt-7"/> {/* For "Todas" Tiendas */}
          

          {/* Row 3 */}
          <SelectField label="*Empresa:" name="empresa" value={formData.empresa} onChange={handleChange} options={EMPRESA_OPTIONS_CONSULTAS} required />
          <div></div> {/* Spacer */}
          <div></div> {/* Spacer */}


          {/* Row 4 for UUIDs */}
          <div className="lg:col-span-3 flex items-start space-x-2">
            <TextareaField label="UUID REPs:" name="uuidReps" value={formData.uuidReps} onChange={handleChange} rows={3} className="flex-grow" />
             <FormField label="" name="prioridadUuid" value={formData.prioridadUuid} onChange={handleChange} disabled className="w-24 text-xs mt-6"/>
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
        Los resultados del reporte de REPs Sustituidos aparecerán aquí.
      </div>
    </form>
  );
};
