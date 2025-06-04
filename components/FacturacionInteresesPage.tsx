import React, { useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { Button } from './Button';
import { DatosFiscalesSection } from './DatosFiscalesSection';
import { PAIS_OPTIONS, REGIMEN_FISCAL_OPTIONS, USO_CFDI_OPTIONS } from '../constants';

interface InteresesFormData {
  rfcIniciales: string;
  rfcFecha: string;
  rfcHomoclave: string;
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
  cuenta: string;
  fechaConsulta: string;
}

const initialInteresesFormData: InteresesFormData = {
  rfcIniciales: '',
  rfcFecha: '',
  rfcHomoclave: '',
  correoElectronico: '',
  razonSocial: '',
  nombre: '',
  paterno: '',
  materno: '',
  pais: PAIS_OPTIONS[0]?.value || '',
  noRegistroIdentidadTributaria: '',
  domicilioFiscal: '',
  regimenFiscal: REGIMEN_FISCAL_OPTIONS[0]?.value || '',
  usoCfdi: USO_CFDI_OPTIONS[0]?.value || '',
  cuenta: '',
  fechaConsulta: new Date().toISOString().split('T')[0],
};

export const FacturacionInteresesPage: React.FC = () => {
  const [formData, setFormData] = useState<InteresesFormData>(initialInteresesFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRfcSearch = () => {
    // Placeholder for RFC search logic
    alert(`Buscando RFC: ${formData.rfcIniciales}${formData.rfcFecha}${formData.rfcHomoclave}`);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Consultar Intereses:', formData);
    alert('Consultando intereses (simulado). Ver consola para datos.');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DatosFiscalesSection
        formData={formData}
        handleChange={handleChange}
        onRfcSearchClick={handleRfcSearch}
        isRFCRequired={true}
        isRazonSocialRequired={true}
        isDomicilioFiscalRequired={true}
        isRegimenFiscalRequired={true}
        isUsoCfdiRequired={true}
        isCorreoElectronicoRequired={true}
      />

      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Consulta Factura:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
          <FormField label="Cuenta:" name="cuenta" value={formData.cuenta} onChange={handleChange} required />
          <FormField label="Fecha:" name="fechaConsulta" type="date" value={formData.fechaConsulta} onChange={handleChange} required />
        </div>
      </Card>

      <div className="flex justify-end mt-6">
        <Button type="submit" variant="primary"> 
          Consultar Intereses
        </Button>
      </div>
    </form>
  );
};
