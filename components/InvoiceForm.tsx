
import React, { useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { CheckboxField } from './CheckboxField';
import { Button } from './Button';
import { 
    PAIS_OPTIONS, 
    REGIMEN_FISCAL_OPTIONS, 
    USO_CFDI_OPTIONS, 
    TIENDA_OPTIONS,
    MEDIO_PAGO_OPTIONS,
    FORMA_PAGO_OPTIONS
} from '../constants';

interface FormData {
  // Datos Fiscales
  rfc: string;
  correoElectronico: string;
  razonSocial: string;
  nombre: string;
  paterno: string;
  materno: string;
  pais: string;
  noRegistroIdentidadTributaria: string;
  domicilioFiscal: string;
  regimenFiscal: string;
  usoCfdi: string;
  // Consultar Boleta
  codigoFacturacion: string;
  tienda: string;
  fecha: string;
  terminal: string;
  boleta: string;
  // Forma de pago
  medioPago: string;
  formaPago: string;
  iepsDesglosado: boolean;
}

const initialFormData: FormData = {
  rfc: '',
  correoElectronico: '',
  razonSocial: '',
  nombre: '',
  paterno: '',
  materno: '',
  pais: PAIS_OPTIONS[0].value,
  noRegistroIdentidadTributaria: '',
  domicilioFiscal: '',
  regimenFiscal: REGIMEN_FISCAL_OPTIONS[0].value,
  usoCfdi: USO_CFDI_OPTIONS[0].value,
  codigoFacturacion: '',
  tienda: TIENDA_OPTIONS[0].value,
  fecha: new Date().toISOString().split('T')[0], // Defaults to today
  terminal: '',
  boleta: '',
  medioPago: MEDIO_PAGO_OPTIONS[0].value,
  formaPago: FORMA_PAGO_OPTIONS[0].value,
  iepsDesglosado: false,
};

export const InvoiceForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        const { checked } = e.target as HTMLInputElement;
        setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Handle form submission, e.g., send data to an API
    console.log('Form submitted:', formData);
    alert('Factura guardada (simulado). Ver consola para datos.');
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    alert('Formulario cancelado y reiniciado.');
  };

  const handleAgregarBoleta = () => {
    // TODO: Logic for "Agregar Boleta"
    alert(`Boleta agregada (simulado): Código ${formData.codigoFacturacion}, Tienda ${formData.tienda}, Fecha ${formData.fecha}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card title="Datos Fiscales">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField label="RFC *" name="rfc" value={formData.rfc} onChange={handleChange} required />
          <FormField label="Correo Electrónico *" name="correoElectronico" type="email" value={formData.correoElectronico} onChange={handleChange} required />
          <FormField label="Razón Social *" name="razonSocial" value={formData.razonSocial} onChange={handleChange} required />
          <FormField label="Nombre" name="nombre" value={formData.nombre} onChange={handleChange} />
          <FormField label="Paterno" name="paterno" value={formData.paterno} onChange={handleChange} />
          <FormField label="Materno" name="materno" value={formData.materno} onChange={handleChange} />
          <SelectField label="País" name="pais" value={formData.pais} onChange={handleChange} options={PAIS_OPTIONS} />
          <FormField label="No. Registro Identidad Tributaria" name="noRegistroIdentidadTributaria" value={formData.noRegistroIdentidadTributaria} onChange={handleChange} />
          <FormField label="Domicilio Fiscal *" name="domicilioFiscal" value={formData.domicilioFiscal} onChange={handleChange} required className="md:col-span-2 lg:col-span-1" />
          <SelectField label="Régimen Fiscal *" name="regimenFiscal" value={formData.regimenFiscal} onChange={handleChange} options={REGIMEN_FISCAL_OPTIONS} required />
          <SelectField label="Uso CFDI *" name="usoCfdi" value={formData.usoCfdi} onChange={handleChange} options={USO_CFDI_OPTIONS} required />
        </div>
      </Card>

      <Card title="Consultar Boleta">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
          <FormField label="Código de Facturación" name="codigoFacturacion" value={formData.codigoFacturacion} onChange={handleChange} />
          <SelectField label="Tienda" name="tienda" value={formData.tienda} onChange={handleChange} options={TIENDA_OPTIONS} />
          <FormField label="Fecha" name="fecha" type="date" value={formData.fecha} onChange={handleChange} />
          <FormField label="Terminal" name="terminal" value={formData.terminal} onChange={handleChange} />
          <FormField label="Boleta" name="boleta" value={formData.boleta} onChange={handleChange} />
        </div>
        <div className="mt-6 flex justify-end">
            <Button type="button" onClick={handleAgregarBoleta} variant="secondary">
            Agregar
            </Button>
        </div>
      </Card>

      <Card title="Forma de pago">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <SelectField label="Medio de pago" name="medioPago" value={formData.medioPago} onChange={handleChange} options={MEDIO_PAGO_OPTIONS} />
          <SelectField label="Forma de pago" name="formaPago" value={formData.formaPago} onChange={handleChange} options={FORMA_PAGO_OPTIONS} />
        </div>
        <div className="mt-4">
            <CheckboxField label="IEPS desglosado" name="iepsDesglosado" checked={formData.iepsDesglosado} onChange={handleChange} />
        </div>
      </Card>

      <div className="flex justify-end space-x-4 mt-8">
        <Button type="button" onClick={handleCancel} variant="neutral">
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          Guardar
        </Button>
      </div>
    </form>
  );
};
    