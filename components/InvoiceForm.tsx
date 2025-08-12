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
  codigoFacturacion: string;
  tienda: string;
  fecha: string;
  terminal: string;
  boleta: string;
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
  fecha: new Date().toISOString().split('T')[0],
  terminal: '',
  boleta: '',
  medioPago: MEDIO_PAGO_OPTIONS[0].value,
  formaPago: FORMA_PAGO_OPTIONS[0].value,
  iepsDesglosado: false,
};

export const InvoiceForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8080/api/factura/procesar-frontend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Error al enviar los datos');
      const data = await response.json();
      console.log('Respuesta del servidor:', data);
      
      if (data.exitoso) {
        alert(`✅ ${data.mensaje}\nUUID: ${data.uuid}\nFactura guardada en base de datos`);
      } else {
        alert(`❌ ${data.mensaje}\nErrores: ${data.errores || data.error}`);
      }
    } catch (error) {
      console.error('Error en el envío:', error);
      alert('Hubo un error al enviar el formulario');
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    alert('Formulario reiniciado');
  };

  const handleAgregarBoleta = () => {
    alert(`Boleta agregada: Código ${formData.codigoFacturacion}, Tienda ${formData.tienda}, Fecha ${formData.fecha}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card title="Datos Fiscales">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField name="rfc" label="RFC *" value={formData.rfc} onChange={handleChange} required />
          <FormField name="correoElectronico" label="Correo Electrónico *" type="email" value={formData.correoElectronico} onChange={handleChange} required />
          <FormField name="razonSocial" label="Razón Social *" value={formData.razonSocial} onChange={handleChange} required />
          <FormField name="nombre" label="Nombre" value={formData.nombre} onChange={handleChange} />
          <FormField name="paterno" label="Paterno" value={formData.paterno} onChange={handleChange} />
          <FormField name="materno" label="Materno" value={formData.materno} onChange={handleChange} />
          <SelectField name="pais" label="País" value={formData.pais} onChange={handleChange} options={PAIS_OPTIONS} />
          <FormField name="noRegistroIdentidadTributaria" label="No. Registro Identidad Tributaria" value={formData.noRegistroIdentidadTributaria} onChange={handleChange} />
          <FormField name="domicilioFiscal" label="Domicilio Fiscal *" value={formData.domicilioFiscal} onChange={handleChange} required />
          <SelectField name="regimenFiscal" label="Régimen Fiscal *" value={formData.regimenFiscal} onChange={handleChange} options={REGIMEN_FISCAL_OPTIONS} required />
          <SelectField name="usoCfdi" label="Uso CFDI *" value={formData.usoCfdi} onChange={handleChange} options={USO_CFDI_OPTIONS} required />
        </div>
      </Card>

      <Card title="Consultar Boleta">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
          <FormField name="codigoFacturacion" label="Código de Facturación" value={formData.codigoFacturacion} onChange={handleChange} />
          <SelectField name="tienda" label="Tienda" value={formData.tienda} onChange={handleChange} options={TIENDA_OPTIONS} />
          <FormField name="fecha" label="Fecha" type="date" value={formData.fecha} onChange={handleChange} />
          <FormField name="terminal" label="Terminal" value={formData.terminal} onChange={handleChange} />
          <FormField name="boleta" label="Boleta" value={formData.boleta} onChange={handleChange} />
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="button" onClick={handleAgregarBoleta} variant="secondary">
            Agregar
          </Button>
        </div>
      </Card>

      <Card title="Forma de Pago">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SelectField name="medioPago" label="Medio de pago" value={formData.medioPago} onChange={handleChange} options={MEDIO_PAGO_OPTIONS} />
          <SelectField name="formaPago" label="Forma de pago" value={formData.formaPago} onChange={handleChange} options={FORMA_PAGO_OPTIONS} />
        </div>
        <div className="mt-4">
          <CheckboxField
            name="iepsDesglosado"
            label="IEPS desglosado"
            checked={formData.iepsDesglosado}
            onChange={handleChange}
          />
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
      <input
  type="file"
  accept=".xml"
  onChange={async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("archivo", file);

    try {
      const res = await fetch("http://localhost:8080/api/factura/upload-xml", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Error al subir XML");

      alert("✅ XML válido y guardado correctamente");

    } catch (error: any) {
      alert("❌ Error: " + error.message);
    }
  }}
/>

    </form>
  );
};
