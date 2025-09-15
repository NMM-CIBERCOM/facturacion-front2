import React, { useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { CheckboxField } from './CheckboxField';
import { Button } from './Button';
import { DatosFiscalesSection } from './DatosFiscalesSection';
import { TextareaField } from './TextareaField';
import { RadioGroupField } from './RadioGroupField';
import { 
    PAIS_OPTIONS, 
    REGIMEN_FISCAL_OPTIONS, 
    USO_CFDI_OPTIONS, 
    TIENDA_OPTIONS,
    MEDIO_PAGO_OPTIONS,
    FORMA_PAGO_OPTIONS,
    JUSTIFICACION_FUNCIONALIDAD_OPTIONS,
    UNIDAD_MEDIDA_OPTIONS,
    TASA_IVA_OPTIONS,
    TASA_IEPS_OPTIONS,
    EMISOR_OPTIONS,
    TIPO_DOCUMENTO_CAPTURA_LIBRE_OPTIONS
} from '../constants';

interface Concepto {
  sku: string;
  unidadMedida: string;
  descripcion: string;
  valorUnitario: string;
  descuentoConcepto: string;
  tasaIva: string;
  iva: string;
  tasaIeps: string;
  ieps: string;
  tasaIe: string;
  ie: string;
  noPedimento: string;
}

interface CapturaLibreFormData {
  // Datos Fiscales
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
  tiendaBoleta: string;
  terminalBoleta: string;
  numeroBoleta: string;
  justificacion: string;
  tipoDocumento: string;
  uuid: string;
  emisor: string;
  fechaEmision: string;  concepto: Concepto;
  medioPago: string;
  formaPago: string;
  descuentoTotal: string;
  subtotal: string;
  ivaTotal: string;
  iepsTotal: string;
  total: string;
  ivaDesglosado: boolean;
  iepsDesglosado: boolean;
  comentarios: string;
}

const initialConceptoData: Concepto = {
  sku: '',
  unidadMedida: UNIDAD_MEDIDA_OPTIONS[0]?.value || '',
  descripcion: '',
  valorUnitario: '',
  descuentoConcepto: '',
  tasaIva: TASA_IVA_OPTIONS[0]?.value || '',
  iva: '',
  tasaIeps: TASA_IEPS_OPTIONS[0]?.value || '',
  ieps: '',
  tasaIe: '0',
  ie: '',
  noPedimento: '',
};

const initialCapturaLibreFormData: CapturaLibreFormData = {
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
  tiendaBoleta: TIENDA_OPTIONS[0]?.value || '',
  terminalBoleta: '',
  numeroBoleta: '',
  justificacion: JUSTIFICACION_FUNCIONALIDAD_OPTIONS[0]?.value || '',
  tipoDocumento: TIPO_DOCUMENTO_CAPTURA_LIBRE_OPTIONS[0]?.value || 'I',
  uuid: '',
  emisor: EMISOR_OPTIONS[0]?.value || 'LPC',
  fechaEmision: new Date().toISOString().split('T')[0],
  concepto: initialConceptoData,
  medioPago: MEDIO_PAGO_OPTIONS[0]?.value || '',
  formaPago: FORMA_PAGO_OPTIONS[0]?.value || '',
  descuentoTotal: '',
  subtotal: '',
  ivaTotal: '',
  iepsTotal: '',
  total: '',
  ivaDesglosado: false,
  iepsDesglosado: false,
  comentarios: '',
};

export const FacturacionCapturaLibrePage: React.FC = () => {
  const [formData, setFormData] = useState<CapturaLibreFormData>(initialCapturaLibreFormData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (name.startsWith('concepto.')) {
        const conceptoField = name.split('.')[1] as keyof Concepto;
        setFormData(prev => ({
            ...prev,
            concepto: {
                ...prev.concepto,
                [conceptoField]: value
            }
        }));
    } else if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } 
    else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleRfcSearch = () => alert(`Buscando RFC: ${formData.rfcIniciales}${formData.rfcFecha}${formData.rfcHomoclave}`);
  const handleAgregarBoleta = () => alert('Boleta agregada (simulado)');
  const handleConsultarFactura = () => alert('Consultando Factura (simulado)');
  const handleAgregarConcepto = () => alert('Concepto agregado (simulado). En una implementación real, esto añadiría el concepto a una lista.');
  
  const handleFacturar = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Facturar (Captura Libre):', formData);
    alert('Facturando (Captura Libre - simulado). Ver consola.');
  };
  const handleEnviarCorreo = () => {
    console.log('Enviar por Correo (Captura Libre):', formData);
    alert('Enviando por correo (Captura Libre - simulado).');
  };

  return (
    <form onSubmit={handleFacturar} className="space-y-6">
      <DatosFiscalesSection
        formData={formData}
        handleChange={handleChange}
        onRfcSearchClick={handleRfcSearch}
      />

      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Boleta</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2 items-end">
          <SelectField label="Tienda:" name="tiendaBoleta" value={formData.tiendaBoleta} onChange={handleChange} options={TIENDA_OPTIONS} className="lg:col-span-1"/>
          <FormField label="Terminal:" name="terminalBoleta" value={formData.terminalBoleta} onChange={handleChange} className="lg:col-span-1"/>
          <FormField label="Número de Boleta:" name="numeroBoleta" value={formData.numeroBoleta} onChange={handleChange} className="lg:col-span-1"/>
          <Button type="button" onClick={handleAgregarBoleta} variant="primary" className="lg:self-end">Agregar</Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Justificación</h3>
        <SelectField label="Justificación para utilizar esta funcionalidad:" name="justificacion" value={formData.justificacion} onChange={handleChange} options={JUSTIFICACION_FUNCIONALIDAD_OPTIONS} />
      </Card>
      
      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Tipo documento</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start">
            <RadioGroupField label="Tipo de Documento:" name="tipoDocumento" options={TIPO_DOCUMENTO_CAPTURA_LIBRE_OPTIONS} selectedValue={formData.tipoDocumento} onChange={handleChange} inline />
            <FormField label="UUID:" name="uuid" value={formData.uuid} onChange={handleChange} placeholder="Ingrese UUID si aplica"/>
        </div>
        <div className="mt-4 flex justify-end">
            <Button type="button" onClick={handleConsultarFactura} variant="primary">Consultar Factura</Button>
        </div>
      </Card>

      <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 items-start">
            <RadioGroupField label="Emisor:" name="emisor" options={EMISOR_OPTIONS} selectedValue={formData.emisor} onChange={handleChange} inline />
            <FormField label="Fecha de Emisión:" name="fechaEmision" type="date" value={formData.fechaEmision} onChange={handleChange} />
          </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-2">Conceptos (Es necesario agregar al menos uno)</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Nota: Actualmente se permite un solo concepto. La funcionalidad para múltiples conceptos será implementada.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
            <FormField label="SKU o Clave SAT:" name="concepto.sku" value={formData.concepto.sku} onChange={handleChange} />
            <SelectField label="Unidad de Medida:" name="concepto.unidadMedida" value={formData.concepto.unidadMedida} onChange={handleChange} options={UNIDAD_MEDIDA_OPTIONS} />
            <FormField label="Descripción:" name="concepto.descripcion" value={formData.concepto.descripcion} onChange={handleChange} />
            <FormField label="Valor Unitario:" name="concepto.valorUnitario" type="number" value={formData.concepto.valorUnitario} onChange={handleChange} />
            <FormField label="Descuento:" name="concepto.descuentoConcepto" type="number" value={formData.concepto.descuentoConcepto} onChange={handleChange} />
            <SelectField label="Tasa IVA:" name="concepto.tasaIva" value={formData.concepto.tasaIva} onChange={handleChange} options={TASA_IVA_OPTIONS} />
            <FormField label="IVA:" name="concepto.iva" type="number" value={formData.concepto.iva} onChange={handleChange} />
            <SelectField label="Tasa IEPS:" name="concepto.tasaIeps" value={formData.concepto.tasaIeps} onChange={handleChange} options={TASA_IEPS_OPTIONS} />
            <FormField label="IEPS:" name="concepto.ieps" type="number" value={formData.concepto.ieps} onChange={handleChange} />
            <SelectField label="Tasa IE:" name="concepto.tasaIe" value={formData.concepto.tasaIe} onChange={handleChange} options={[{value: "0", label: "0%"}]} /> 
            <FormField label="IE:" name="concepto.ie" type="number" value={formData.concepto.ie} onChange={handleChange} />
            <FormField label="No. Pedimento:" name="concepto.noPedimento" value={formData.concepto.noPedimento} onChange={handleChange} />
        </div>
        <div className="mt-4 flex justify-end">
            <Button type="button" onClick={handleAgregarConcepto} variant="primary">Agregar Concepto</Button>
        </div>
      </Card>
      
      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Totales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
            <SelectField label="Medio de pago:" name="medioPago" value={formData.medioPago} onChange={handleChange} options={MEDIO_PAGO_OPTIONS} />
            <SelectField label="Forma de pago:" name="formaPago" value={formData.formaPago} onChange={handleChange} options={FORMA_PAGO_OPTIONS} />
            <FormField label="Descuento:" name="descuentoTotal" type="number" value={formData.descuentoTotal} onChange={handleChange} />
            <FormField label="Subtotal:" name="subtotal" type="number" value={formData.subtotal} onChange={handleChange} />
            <FormField label="IVA:" name="ivaTotal" type="number" value={formData.ivaTotal} onChange={handleChange} />
            <FormField label="IEPS:" name="iepsTotal" type="number" value={formData.iepsTotal} onChange={handleChange} />
            <FormField label="Total:" name="total" type="number" value={formData.total} onChange={handleChange} />
        </div>
        <div className="mt-4 space-y-2">
            <CheckboxField label="IVA desglosado" name="ivaDesglosado" checked={formData.ivaDesglosado} onChange={handleChange} />
            <CheckboxField label="IEPS desglosado" name="iepsDesglosado" checked={formData.iepsDesglosado} onChange={handleChange} />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Si el contribuyente requiere que se desglose el IEPS, deberá mostrar su cédula donde indique sea sujeto</p>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Comentarios</h3>
        <TextareaField label="" name="comentarios" value={formData.comentarios} onChange={handleChange} rows={3} />
      </Card>

      <div className="flex justify-end space-x-4 mt-8">
        <Button type="button" onClick={handleEnviarCorreo} variant="secondary">
          Enviar por Correo
        </Button>
        <Button type="submit" variant="primary">
          Facturar
        </Button>
      </div>
    </form>
  );
};
