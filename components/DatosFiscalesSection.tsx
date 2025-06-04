import React from 'react';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { RfcField } from './RfcField';
import { PAIS_OPTIONS, REGIMEN_FISCAL_OPTIONS, USO_CFDI_OPTIONS } from '../constants';

interface DatosFiscalesData {
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
}

interface DatosFiscalesSectionProps {
  formData: DatosFiscalesData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onRfcSearchClick?: () => void;
  isRFCRequired?: boolean;
  isRazonSocialRequired?: boolean;
  isDomicilioFiscalRequired?: boolean;
  isRegimenFiscalRequired?: boolean;
  isUsoCfdiRequired?: boolean;
  isCorreoElectronicoRequired?: boolean;
}

export const DatosFiscalesSection: React.FC<DatosFiscalesSectionProps> = ({
  formData,
  handleChange,
  onRfcSearchClick,
  isRFCRequired = true,
  isRazonSocialRequired = true,
  isDomicilioFiscalRequired = true,
  isRegimenFiscalRequired = true,
  isUsoCfdiRequired = true,
  isCorreoElectronicoRequired = true,
}) => {
  return (
    <>
      <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Datos fiscales:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
        <RfcField
          label="RFC:"
          namePrefix="rfc"
          values={{
            iniciales: formData.rfcIniciales,
            fecha: formData.rfcFecha,
            homoclave: formData.rfcHomoclave,
          }}
          onChange={handleChange}
          onSearchClick={onRfcSearchClick}
          required={isRFCRequired}
          className="lg:col-span-2"
        />
        <div></div>
        
        <FormField label="Correo Electrónico:" name="correoElectronico" type="email" value={formData.correoElectronico} onChange={handleChange} required={isCorreoElectronicoRequired} />
        <FormField label="Razón Social:" name="razonSocial" value={formData.razonSocial} onChange={handleChange} required={isRazonSocialRequired} />
        <FormField label="Nombre:" name="nombre" value={formData.nombre} onChange={handleChange} />
        <FormField label="Paterno:" name="paterno" value={formData.paterno} onChange={handleChange} />
        <FormField label="Materno:" name="materno" value={formData.materno} onChange={handleChange} />
        <SelectField label="País:" name="pais" value={formData.pais} onChange={handleChange} options={PAIS_OPTIONS} />
        <FormField label="No. Registro Identidad Tributaria:" name="noRegistroIdentidadTributaria" value={formData.noRegistroIdentidadTributaria} onChange={handleChange} />
        <FormField label="Domicilio Fiscal:" name="domicilioFiscal" value={formData.domicilioFiscal} onChange={handleChange} required={isDomicilioFiscalRequired} />
        <SelectField label="Régimen Fiscal:" name="regimenFiscal" value={formData.regimenFiscal} onChange={handleChange} options={REGIMEN_FISCAL_OPTIONS} required={isRegimenFiscalRequired} />
        <SelectField label="Uso CFDI:" name="usoCfdi" value={formData.usoCfdi} onChange={handleChange} options={USO_CFDI_OPTIONS} required={isUsoCfdiRequired} />
      </div>
    </>
  );
};
