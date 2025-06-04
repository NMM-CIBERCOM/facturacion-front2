import React, { useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { Button } from './Button';
import { ALMACEN_OPTIONS, MOTIVO_SUSTITUCION_OPTIONS, TIENDA_OPTIONS } from '../constants';

interface ConsultaFacturasFormData {
  rfcReceptor: string;
  nombreCliente: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  razonSocial: string;
  almacen: string;
  usuario: string;
  serie: string;
  folio: string;
  uuid: string;
  fechaInicio: string;
  fechaFin: string;
  tienda: string;
  te: string;
  tr: string;
  fechaTienda: string;
  codigoFacturacion: string;
  motivoSustitucion: string;
}

const initialFormData: ConsultaFacturasFormData = {
  rfcReceptor: '',
  nombreCliente: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  razonSocial: '',
  almacen: ALMACEN_OPTIONS[ALMACEN_OPTIONS.length-1]?.value || '',
  usuario: '',
  serie: '',
  folio: '',
  uuid: '',
  fechaInicio: '',
  fechaFin: '',
  tienda: TIENDA_OPTIONS[0]?.value || '',
  te: '',
  tr: '',
  fechaTienda: '',
  codigoFacturacion: '',
  motivoSustitucion: MOTIVO_SUSTITUCION_OPTIONS[0]?.value || '',
};

export const ConsultasFacturasPage: React.FC = () => {
  const [formData, setFormData] = useState<ConsultaFacturasFormData>(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Buscando Facturas:', formData);
    alert('Búsqueda de facturas simulada. Ver consola para detalles.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">
          --Ingresa los datos para consulta (por grupo):--
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
          <FormField label="RFC Receptor:" name="rfcReceptor" value={formData.rfcReceptor} onChange={handleChange} />
          <FormField label="Nombre del Cliente:" name="nombreCliente" value={formData.nombreCliente} onChange={handleChange} />
          <FormField label="Apellido Paterno:" name="apellidoPaterno" value={formData.apellidoPaterno} onChange={handleChange} />
          <FormField label="Apellido Materno:" name="apellidoMaterno" value={formData.apellidoMaterno} onChange={handleChange} />
          <FormField label="Razón Social:" name="razonSocial" value={formData.razonSocial} onChange={handleChange} />
          <SelectField label="Almacén:" name="almacen" value={formData.almacen} onChange={handleChange} options={ALMACEN_OPTIONS} />
          <FormField label="Usuario:" name="usuario" value={formData.usuario} onChange={handleChange} />
          <FormField label="Serie:" name="serie" value={formData.serie} onChange={handleChange} />
          <FormField label="Folio:" name="folio" value={formData.folio} onChange={handleChange} />
          <FormField label="UUID:" name="uuid" value={formData.uuid} onChange={handleChange} />
          <FormField label="Fecha Inicio:" name="fechaInicio" type="date" value={formData.fechaInicio} onChange={handleChange} />
          <FormField label="Fecha Fin:" name="fechaFin" type="date" value={formData.fechaFin} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-2 mt-4 items-end">
            <SelectField label="Tienda:" name="tienda" value={formData.tienda} onChange={handleChange} options={TIENDA_OPTIONS} className="lg:col-span-1"/>
            <FormField label="TE:" name="te" value={formData.te} onChange={handleChange} className="lg:col-span-1"/>
            <FormField label="TR:" name="tr" value={formData.tr} onChange={handleChange} className="lg:col-span-1"/>
            <FormField label="Fecha:" name="fechaTienda" type="date" value={formData.fechaTienda} onChange={handleChange} className="lg:col-span-1"/>
            <FormField label="Código de facturación:" name="codigoFacturacion" value={formData.codigoFacturacion} onChange={handleChange} className="lg:col-span-1"/>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 mt-4">
            <SelectField label="Motivo Sustitución:" name="motivoSustitucion" value={formData.motivoSustitucion} onChange={handleChange} options={MOTIVO_SUSTITUCION_OPTIONS} />
        </div>
        <div className="mt-6 flex justify-start">
          <Button type="submit" variant="primary">
            Buscar
          </Button>
        </div>
      </Card>

      <div className="mt-6 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md min-h-[200px] flex items-center justify-center text-gray-400 dark:text-gray-500">
        Los resultados de la búsqueda de facturas aparecerán aquí.
      </div>
    </form>
  );
};
