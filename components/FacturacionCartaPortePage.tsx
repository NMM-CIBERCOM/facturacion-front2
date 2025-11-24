import React, { useEffect, useRef, useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { Button } from './Button';
import { DatosFiscalesSection } from './DatosFiscalesSection';
import { TextareaField } from './TextareaField';
import { SelectField } from './SelectField';
import { PAIS_OPTIONS, REGIMEN_FISCAL_OPTIONS, USO_CFDI_OPTIONS } from '../constants';
import { useEmpresa } from '../context/EmpresaContext';
import {
  CartaPorteAutotransporteForm,
  CartaPorteFiguraForm,
  CartaPorteFormData,
  CartaPorteMercanciaForm,
  CartaPorteTransporteFerroviarioForm,
  CartaPorteUbicacionForm,
  generarYDescargarPDFCartaPorte,
  buildFacturaDataFromCartaPorte,
  normalizeCartaPortePayload,
  descargarXmlCartaPorte,
} from '../services/cartaPorteService';
import { facturaService } from '../services/facturaService';
import { correoService } from '../services/correoService';
import { apiUrl } from '../services/api';

const TIPO_TRANSPORTE_OPTIONS = [
  { value: '01', label: 'Autotransporte' },
  { value: '04', label: 'Transporte ferroviario' },
];

const TIPO_ESTACION_OPTIONS = [
  { value: '01', label: '01 - Estación de origen' },
  { value: '02', label: '02 - Estación intermedia' },
  { value: '03', label: '03 - Estación destino' },
];

const VERSION_CP_OPTIONS = [{ value: '3.1', label: 'Carta Porte 3.1 (Vigente)' }];

const nowLocal = () => new Date().toISOString().slice(0, 16);

const normalizeTipoEstacionValue = (value?: string | null) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (!trimmed) return '';
  if (/^\d+$/.test(trimmed)) {
    return trimmed.padStart(2, '0').slice(-2);
  }
  return trimmed.toUpperCase();
};

const defaultAutotransporte = (): CartaPorteAutotransporteForm => ({
  permSct: '',
  numPermisoSct: '',
  identificacionVehicular: {
    configVehicular: '',
    pesoBrutoVehicular: '',
    placaVm: '',
    anioModeloVm: '',
  },
  seguros: {
    aseguraRespCivil: '',
    polizaRespCivil: '',
  },
  remolques: [],
});

const defaultTransporteFerroviario = (): CartaPorteTransporteFerroviarioForm => ({
  tipoDeServicio: 'TS01',
  tipoDeTrafico: 'TT01',
  derechosDePaso: [],
  carros: [
    {
      tipoCarro: 'TC01',
      matriculaCarro: '',
      guiaCarro: '',
      toneladasNetasCarro: '',
    },
  ],
});

const createInitialComplemento = () => ({
  version: '3.1' as const,
  transpInternac: 'No' as const,
  totalDistRec: '', // Se calculará automáticamente desde las distancias recorridas
  regimenesAduaneros: [],
  ubicaciones: [
    {
      tipoUbicacion: 'Origen',
      idUbicacion: 'ORIGEN1',
      rfcRemitenteDestinatario: '',
      nombreRemitenteDestinatario: '',
      fechaHoraSalidaLlegada: nowLocal(),
      tipoEstacion: '01',
      domicilio: null,
    },
    {
      tipoUbicacion: 'Destino',
      idUbicacion: 'DESTINO1',
      rfcRemitenteDestinatario: '',
      nombreRemitenteDestinatario: '',
      fechaHoraSalidaLlegada: nowLocal(),
      tipoEstacion: '03',
      distanciaRecorrida: '', // Opcional, pero si se incluye debe ser >= 0.01
      domicilio: null,
    },
  ] as CartaPorteUbicacionForm[],
  mercancias: {
    pesoBrutoTotal: '0.001', // Mínimo válido según XSD (>= 0.001)
    unidadPeso: 'KGM',
    numTotalMercancias: '1',
    mercancias: [
      {
        bienesTransp: '',
        descripcion: '',
        cantidad: '1.000000', // Formato con 6 decimales según XSD
        claveUnidad: 'H87',
        pesoEnKg: '0.001', // Mínimo válido según XSD (>= 0.001)
      },
    ] as CartaPorteMercanciaForm[],
    autotransporte: defaultAutotransporte(),
    transporteFerroviario: undefined,
  },
  figuraTransporte: {
    tiposFigura: [
      {
        tipoFigura: '01',
        nombreFigura: '',
        rfcFigura: '',
        partesTransporte: [],
        domicilio: null,
      },
    ] as CartaPorteFiguraForm[],
  },
});

const createInitialFormData = (): CartaPorteFormData => ({
  versionCartaPorte: '3.1',
  rfcIniciales: '',
  rfcFecha: '',
  rfcHomoclave: '',
  correoElectronico: '',
  razonSocial: '',
  nombre: '',
  paterno: '',
  materno: '',
  pais: PAIS_OPTIONS[0]?.value || 'México',
  noRegistroIdentidadTributaria: '',
  domicilioFiscal: '',
  regimenFiscal: REGIMEN_FISCAL_OPTIONS[0]?.value || '',
  usoCfdi: USO_CFDI_OPTIONS[0]?.value || '',
  descripcion: '',
  fechaInformacion: new Date().toISOString().split('T')[0].replace(/-/g, ''),
  numeroSerie: '',
  precio: '',
  personaAutoriza: '',
  puesto: '',
  tipoTransporte: '01',
  tipoPersona: null,
  complemento: createInitialComplemento(),
});

const blobToBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

export const FacturacionCartaPortePage: React.FC = () => {
  const { empresaInfo } = useEmpresa();
  const [formData, setFormData] = useState<CartaPorteFormData>(createInitialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [enviandoCorreo, setEnviandoCorreo] = useState(false);
  const [guardandoBD, setGuardandoBD] = useState(false);
  const [tipoPersona, setTipoPersona] = useState<'fisica' | 'moral' | null>(null);
  const tipoPersonaAnteriorRef = useRef<'fisica' | 'moral' | null>(null);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      razonSocial: empresaInfo?.nombre || prev.razonSocial,
      complemento: {
        ...prev.complemento,
        ubicaciones: prev.complemento.ubicaciones.map((u, idx) =>
          idx === 0
            ? {
                ...u,
                rfcRemitenteDestinatario: empresaInfo?.rfc || u.rfcRemitenteDestinatario,
                nombreRemitenteDestinatario: empresaInfo?.nombre || u.nombreRemitenteDestinatario,
              }
            : u
        ),
      },
    }));
  }, [empresaInfo]);

  useEffect(() => {
    const rfc = `${formData.rfcIniciales}${formData.rfcFecha}${formData.rfcHomoclave}`.trim().toUpperCase();
    let nuevoTipo: 'fisica' | 'moral' | null = null;
    if (rfc.length === 12) nuevoTipo = 'moral';
    if (rfc.length === 13) nuevoTipo = 'fisica';
    if (nuevoTipo !== tipoPersonaAnteriorRef.current) {
      tipoPersonaAnteriorRef.current = nuevoTipo;
      setTipoPersona(nuevoTipo);
      setFormData((prev) => {
        const next = { ...prev, tipoPersona: nuevoTipo };
        if (nuevoTipo === 'moral') {
          next.nombre = '';
          next.paterno = '';
          next.materno = '';
        } else if (nuevoTipo === 'fisica') {
          next.razonSocial = '';
        }
        return next;
      });
    }
  }, [formData.rfcIniciales, formData.rfcFecha, formData.rfcHomoclave]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateComplemento = <K extends keyof CartaPorteFormData['complemento']>(
    key: K,
    value: CartaPorteFormData['complemento'][K]
  ) => {
    setFormData((prev) => ({
      ...prev,
      complemento: {
        ...prev.complemento,
        [key]: value,
      },
    }));
  };

  const updateUbicacion = (index: number, updates: Partial<CartaPorteUbicacionForm>) => {
    updateComplemento(
      'ubicaciones',
      formData.complemento.ubicaciones.map((ubicacion, idx) => (idx === index ? { ...ubicacion, ...updates } : ubicacion))
    );
  };

  const addUbicacion = () => {
    updateComplemento('ubicaciones', [
      ...formData.complemento.ubicaciones,
      {
        tipoUbicacion: 'Intermedia',
        idUbicacion: `UBI-${Date.now()}`,
        rfcRemitenteDestinatario: '',
        fechaHoraSalidaLlegada: nowLocal(),
        tipoEstacion: '02',
        domicilio: null,
      },
    ]);
  };

  const removeUbicacion = (index: number) => {
    if (formData.complemento.ubicaciones.length <= 2) return;
    updateComplemento(
      'ubicaciones',
      formData.complemento.ubicaciones.filter((_, idx) => idx !== index)
    );
  };

  const updateMercancia = (index: number, updates: Partial<CartaPorteMercanciaForm>) => {
    updateComplemento('mercancias', {
      ...formData.complemento.mercancias,
      mercancias: formData.complemento.mercancias.mercancias.map((m, idx) => (idx === index ? { ...m, ...updates } : m)),
    });
  };

  const addMercancia = () => {
    updateComplemento('mercancias', {
      ...formData.complemento.mercancias,
      mercancias: [
        ...formData.complemento.mercancias.mercancias,
        {
          bienesTransp: '',
          descripcion: '',
          cantidad: '1',
          claveUnidad: 'H87',
          pesoEnKg: '0',
        },
      ],
    });
  };

  const removeMercancia = (index: number) => {
    if (formData.complemento.mercancias.mercancias.length <= 1) return;
    updateComplemento('mercancias', {
      ...formData.complemento.mercancias,
      mercancias: formData.complemento.mercancias.mercancias.filter((_, idx) => idx !== index),
    });
  };

  const updateAutotransporte = (updates: Partial<CartaPorteAutotransporteForm>) => {
    updateComplemento('mercancias', {
      ...formData.complemento.mercancias,
      autotransporte: { ...formData.complemento.mercancias.autotransporte!, ...updates },
    });
  };

  const updateTransporteFerroviario = (updates: Partial<CartaPorteTransporteFerroviarioForm>) => {
    updateComplemento('mercancias', {
      ...formData.complemento.mercancias,
      transporteFerroviario: { ...formData.complemento.mercancias.transporteFerroviario!, ...updates },
    });
  };

  const updateFigura = (index: number, updates: Partial<CartaPorteFiguraForm>) => {
    updateComplemento('figuraTransporte', {
      tiposFigura: formData.complemento.figuraTransporte.tiposFigura.map((figura, idx) =>
        idx === index ? { ...figura, ...updates } : figura
      ),
    });
  };

  const addFigura = () => {
    updateComplemento('figuraTransporte', {
      tiposFigura: [
        ...formData.complemento.figuraTransporte.tiposFigura,
        { tipoFigura: '01', nombreFigura: '', rfcFigura: '', partesTransporte: [], domicilio: null },
      ],
    });
  };

  const removeFigura = (index: number) => {
    if (formData.complemento.figuraTransporte.tiposFigura.length <= 1) return;
    updateComplemento('figuraTransporte', {
      tiposFigura: formData.complemento.figuraTransporte.tiposFigura.filter((_, idx) => idx !== index),
    });
  };

  const handleTipoTransporteChange = (value: string) => {
    setFormData((prev) => {
      const next = { ...prev, tipoTransporte: value as any };
      if (value === '01') {
        next.complemento.mercancias.autotransporte = prev.complemento.mercancias.autotransporte || defaultAutotransporte();
        next.complemento.mercancias.transporteFerroviario = undefined;
      } else if (value === '04') {
        next.complemento.mercancias.transporteFerroviario =
          prev.complemento.mercancias.transporteFerroviario || defaultTransporteFerroviario();
      }
      return next;
    });
  };

  const cargarEjemplo = () => {
    const ejemplo = createInitialFormData();
    ejemplo.versionCartaPorte = '3.1';
    ejemplo.rfcIniciales = 'CUSC';
    ejemplo.rfcFecha = '850516';
    ejemplo.rfcHomoclave = '316';
    ejemplo.correoElectronico = 'demo@cibercom.mx';
    ejemplo.nombre = 'CESAR OSBALDO';
    ejemplo.paterno = 'CRUZ';
    ejemplo.materno = 'SOLORZANO';
    ejemplo.razonSocial = '';
    ejemplo.descripcion = 'Transporte de mercancía electrónica';
    ejemplo.fechaInformacion = '20251120';
    ejemplo.numeroSerie = 'CP-DEMORFC';
    ejemplo.precio = '29000';
    ejemplo.personaAutoriza = 'CESAR OSBALDO CRUZ SOLORZANO';
    ejemplo.puesto = 'Coordinador de Logística';
    ejemplo.tipoTransporte = '01';
    ejemplo.complemento.ubicaciones = [
      {
        tipoUbicacion: 'Origen',
        idUbicacion: 'OR000001',
        rfcRemitenteDestinatario: empresaInfo?.rfc || 'IVD920810GU2',
        nombreRemitenteDestinatario: empresaInfo?.nombre || 'INNOVACION VALOR Y DESARROLLO SA',
        fechaHoraSalidaLlegada: '2025-11-20T09:00',
        tipoEstacion: '01',
        distanciaRecorrida: '125.50', // Distancia válida >= 0.01
        domicilio: {
          calle: 'Av. Ejemplo',
          numeroExterior: '123',
          colonia: 'Centro',
          municipio: 'Ciudad de México',
          estado: 'Ciudad de México',
          pais: 'MEX',
          codigoPostal: '06000',
        },
      },
      {
        tipoUbicacion: 'Destino',
        idUbicacion: 'DE000001',
        rfcRemitenteDestinatario: 'CUSC850516316',
        nombreRemitenteDestinatario: 'CESAR OSBALDO CRUZ SOLORZANO',
        fechaHoraSalidaLlegada: '2025-11-20T11:30',
        tipoEstacion: '03',
        distanciaRecorrida: '125.50', // Misma distancia (suma total será 251.00)
        domicilio: {
          calle: 'Calle Destino',
          numeroExterior: '456',
          colonia: 'Industrial',
          municipio: 'Tlalnepantla',
          estado: 'Estado de México',
          pais: 'MEX',
          codigoPostal: '54000',
        },
      },
    ];
    ejemplo.complemento.totalDistRec = '251.00'; // Suma de las distancias recorridas (125.50 + 125.50)
    ejemplo.complemento.mercancias = {
      pesoBrutoTotal: '150.000',
      unidadPeso: 'KGM',
      numTotalMercancias: '1',
      mercancias: [
        {
          bienesTransp: '25101500',
          descripcion: 'Mercancía electrónica',
          cantidad: '1.000000',
          claveUnidad: 'H87',
          pesoEnKg: '150.000',
          valorMercancia: '29000',
        },
      ],
      autotransporte: {
        permSct: 'TPAF01',
        numPermisoSct: '000000',
        identificacionVehicular: {
          configVehicular: 'VL',
          pesoBrutoVehicular: '12000',
          placaVm: 'AGU123C',
          anioModeloVm: '2022',
        },
        seguros: {
          aseguraRespCivil: 'Seguros Demo',
          polizaRespCivil: 'CP123456',
        },
        remolques: [],
      },
      transporteFerroviario: undefined,
    };
    ejemplo.complemento.figuraTransporte = {
      tiposFigura: [
        {
          tipoFigura: '01',
          nombreFigura: 'INNOVACION VALOR Y DESARROLLO SA',
          rfcFigura: 'IVD920810GU2',
          numLicencia: 'LIC123456',
          partesTransporte: [],
          domicilio: null,
        },
      ],
    };
    setFormData(ejemplo);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await generarYDescargarPDFCartaPorte(formData, empresaInfo);
      alert('PDF de Carta Porte generado y descargado.');
    } catch (err) {
      console.error('Error generando Carta Porte:', err);
      alert(`Error al generar Carta Porte: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDescargarXML = async () => {
    try {
      const xml = await descargarXmlCartaPorte(formData);
      const blob = new Blob([xml], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CartaPorte_${formData.numeroSerie || 'CP001'}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar XML:', err);
      alert(err instanceof Error ? err.message : 'No se pudo generar el XML');
    }
  };

  const handleEnviarCorreo = async () => {
    try {
      setEnviandoCorreo(true);
      const correo = formData.correoElectronico?.trim();
      if (!correo || !correoService.validarEmail(correo)) {
        alert('Captura un correo electrónico válido.');
        return;
      }

      const logoConfig = await facturaService.obtenerConfiguracionLogos();
      if (!logoConfig.exitoso) {
        throw new Error('No se pudo obtener configuración de logos');
      }

      const payloadNormalizado = normalizeCartaPortePayload(formData);
      const facturaData = buildFacturaDataFromCartaPorte(payloadNormalizado, empresaInfo);

      const resp = await fetch(apiUrl('/factura/generar-pdf'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          facturaData,
          logoConfig: {
            logoUrl: logoConfig.logoUrl,
            logoBase64: logoConfig.logoBase64,
            customColors: logoConfig.customColors,
          },
        }),
      });
      if (!resp.ok) {
        throw new Error(`Error al generar PDF: ${resp.status}`);
      }
      const pdfBlob = await resp.blob();
      const pdfBase64 = await blobToBase64(pdfBlob);

      const xmlString = await descargarXmlCartaPorte(formData);
      const xmlBase64 = await blobToBase64(new Blob([xmlString], { type: 'application/xml' }));
      const asunto = `Carta Porte ${facturaData.serie}-${facturaData.folio}`;
      const mensaje = `Estimado(a),\n\nAdjuntamos la Carta Porte generada.\n\nSaludos.`;

      await correoService.enviarPdfDirecto({
        pdfBase64,
        correoReceptor: correo,
        asunto,
        mensaje,
        nombreAdjunto: `CartaPorte_${facturaData.serie}-${facturaData.folio}.pdf`,
        xmlBase64,
        nombreAdjuntoXml: `CartaPorte_${facturaData.serie}-${facturaData.folio}.xml`,
      });

      alert('Carta Porte enviada por correo con PDF y XML adjuntos.');
    } catch (err) {
      console.error('Error enviando Carta Porte por correo:', err);
      alert(`Error enviando por correo: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setEnviandoCorreo(false);
    }
  };

  const validarFormulario = (): boolean => {
    const requerido = (valor: string | undefined, mensaje: string) => {
      if (!valor || !valor.trim()) {
        alert(mensaje);
        return false;
      }
      return true;
    };
    if (!requerido(formData.rfcIniciales, 'RFC iniciales es requerido')) return false;
    if (!requerido(formData.rfcFecha, 'RFC fecha es requerida')) return false;
    if (!requerido(formData.rfcHomoclave, 'RFC homoclave es requerida')) return false;
    if (!requerido(formData.correoElectronico, 'Correo electrónico es requerido')) return false;
    if (tipoPersona !== 'fisica' && !requerido(formData.razonSocial, 'Razón social es requerida')) return false;
    if (tipoPersona === 'fisica') {
      if (!requerido(formData.nombre, 'Nombre es requerido')) return false;
      if (!requerido(formData.paterno, 'Apellido paterno es requerido')) return false;
    }
    if (!requerido(formData.domicilioFiscal, 'Domicilio fiscal es requerido')) return false;
    if (!requerido(formData.descripcion, 'Descripción es requerida')) return false;
    if (!requerido(formData.numeroSerie, 'Número de serie es requerido')) return false;
    if (!requerido(formData.precio, 'Precio es requerido')) return false;

    if (formData.complemento.ubicaciones.length < 2) {
      alert('Debes capturar al menos una ubicación de origen y una de destino');
      return false;
    }
    const ubicacionInvalida = formData.complemento.ubicaciones.find(
      (u) => !u.rfcRemitenteDestinatario || !u.fechaHoraSalidaLlegada
    );
    if (ubicacionInvalida) {
      alert('Cada ubicación debe tener RFC y fecha/hora');
      return false;
    }
    if (!formData.complemento.mercancias.mercancias.length) {
      alert('Captura al menos una mercancía');
      return false;
    }
    if (formData.tipoTransporte === '01' && !formData.complemento.mercancias.autotransporte) {
      alert('Completa la sección de Autotransporte');
      return false;
    }
    if (formData.tipoTransporte === '04' && !formData.complemento.mercancias.transporteFerroviario) {
      alert('Completa la sección de Transporte Ferroviario');
      return false;
    }
    return true;
  };

  const handleGuardarEnBD = async () => {
    try {
      if (!validarFormulario()) return;
      setGuardandoBD(true);
      const payload = normalizeCartaPortePayload(formData);
      const response = await fetch(apiUrl('/carta-porte/guardar'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      const result = await response.json();
      alert(`✅ Carta Porte timbrada exitosamente\nUUID: ${result.uuid || 'N/A'}`);
      if (confirm('¿Desea enviar los archivos timbrados al correo del receptor?')) {
        handleEnviarCorreo();
      }
    } catch (err) {
      console.error('Error guardando Carta Porte en BD:', err);
      alert(`Error al guardar en base de datos: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setGuardandoBD(false);
    }
  };

  const handleRfcSearch = () => {
    const rfc = `${formData.rfcIniciales}${formData.rfcFecha}${formData.rfcHomoclave}`.toUpperCase();
    alert(`Buscando RFC: ${rfc}`);
  };

  const renderUbicacion = (ubicacion: CartaPorteUbicacionForm, index: number) => {
    const esAutotransporte = formData.tipoTransporte === '01';
    const tipoEstacionNormalizada = normalizeTipoEstacionValue(ubicacion.tipoEstacion);
    const showDomicilioWarning = formData.tipoTransporte === '04' && tipoEstacionNormalizada === '02';
    return (
      <Card key={ubicacion.idUbicacion || index}>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-primary dark:text-secondary">
            Ubicación {index + 1} ({ubicacion.tipoUbicacion})
          </h4>
          {formData.complemento.ubicaciones.length > 2 && (
            <Button type="button" variant="neutral" onClick={() => removeUbicacion(index)}>
              Eliminar
            </Button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField
            label="Tipo de Ubicación"
            name={`ubicacion-tipo-${index}`}
            value={ubicacion.tipoUbicacion}
            onChange={(e) => updateUbicacion(index, { tipoUbicacion: e.target.value as any })}
            options={[
              { value: 'Origen', label: 'Origen' },
              { value: 'Destino', label: 'Destino' },
              { value: 'Intermedia', label: 'Intermedia' },
            ]}
          />
          <FormField
            label="ID Ubicación"
            name={`ubicacion-id-${index}`}
            value={ubicacion.idUbicacion || ''}
            onChange={(e) => updateUbicacion(index, { idUbicacion: e.target.value })}
          />
          <FormField
            label="RFC Remitente/Destinatario"
            name={`ubicacion-rfc-${index}`}
            value={ubicacion.rfcRemitenteDestinatario}
            onChange={(e) => updateUbicacion(index, { rfcRemitenteDestinatario: e.target.value })}
            required
          />
          <FormField
            label="Nombre"
            name={`ubicacion-nombre-${index}`}
            value={ubicacion.nombreRemitenteDestinatario || ''}
            onChange={(e) => updateUbicacion(index, { nombreRemitenteDestinatario: e.target.value })}
          />
          <FormField
            label="Fecha / Hora"
            type="datetime-local"
            name={`ubicacion-fecha-${index}`}
            value={ubicacion.fechaHoraSalidaLlegada}
            onChange={(e) => updateUbicacion(index, { fechaHoraSalidaLlegada: e.target.value })}
            required
          />
          <SelectField
            label="Tipo de estación"
            name={`ubicacion-tipoEstacion-${index}`}
            value={
              esAutotransporte
                ? ubicacion.tipoUbicacion === 'Origen'
                  ? '01'
                  : '03'
                : tipoEstacionNormalizada
            }
            disabled={esAutotransporte}
            onChange={(e) => updateUbicacion(index, { tipoEstacion: e.target.value })}
            options={TIPO_ESTACION_OPTIONS}
          />
          <FormField
            label="Distancia Recorrida"
            name={`ubicacion-distancia-${index}`}
            type="number"
            value={ubicacion.distanciaRecorrida || ''}
            onChange={(e) => updateUbicacion(index, { distanciaRecorrida: e.target.value })}
          />
        </div>
        {showDomicilioWarning && (
          <div className="mt-2 text-sm text-red-600 dark:text-red-300">
            ⚠️ Con Tipo Estación "02" en transporte ferroviario el domicilio se omitirá automáticamente.
          </div>
        )}
        {!showDomicilioWarning && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <FormField
              label="Calle"
              name={`dom-calle-${index}`}
              value={ubicacion.domicilio?.calle || ''}
              onChange={(e) =>
                updateUbicacion(index, {
                  domicilio: { ...(ubicacion.domicilio || { estado: '', pais: 'MEX', codigoPostal: '' }), calle: e.target.value },
                })
              }
            />
            <FormField
              label="Estado"
              name={`dom-estado-${index}`}
              value={ubicacion.domicilio?.estado || ''}
              onChange={(e) =>
                updateUbicacion(index, {
                  domicilio: { ...(ubicacion.domicilio || { pais: 'MEX', codigoPostal: '' }), estado: e.target.value },
                })
              }
            />
            <FormField
              label="Código Postal"
              name={`dom-cp-${index}`}
              value={ubicacion.domicilio?.codigoPostal || ''}
              onChange={(e) =>
                updateUbicacion(index, {
                  domicilio: { ...(ubicacion.domicilio || { estado: '', pais: 'MEX' }), codigoPostal: e.target.value },
                })
              }
            />
          </div>
        )}
      </Card>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <SelectField
            label="Versión Carta Porte"
            name="versionCartaPorte"
            value={formData.versionCartaPorte}
            options={VERSION_CP_OPTIONS}
            onChange={() => undefined}
            disabled
          />
          <FormField label="Número de Serie" name="numeroSerie" value={formData.numeroSerie} onChange={handleChange} required />
          <FormField label="Precio" name="precio" type="number" value={formData.precio} onChange={handleChange} required />
        </div>
      </Card>

      <DatosFiscalesSection
        formData={formData}
        handleChange={handleChange}
        onRfcSearchClick={handleRfcSearch}
        mostrarRazonSocial={tipoPersona === 'moral' || tipoPersona === null}
        mostrarNombreCompleto={tipoPersona === 'fisica' || tipoPersona === null}
      />

      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Información general</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextareaField label="Descripción" name="descripcion" rows={3} value={formData.descripcion} onChange={handleChange} required />
          <FormField label="Fecha (AAAAMMDD)" name="fechaInformacion" value={formData.fechaInformacion} onChange={handleChange} required />
          <FormField label="Persona que autoriza" name="personaAutoriza" value={formData.personaAutoriza} onChange={handleChange} required />
          <FormField label="Puesto" name="puesto" value={formData.puesto} onChange={handleChange} required />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Ubicaciones</h3>
        <div className="space-y-4">
          {formData.complemento.ubicaciones.map((ubicacion, index) => renderUbicacion(ubicacion, index))}
        </div>
        <div className="mt-4">
          <Button type="button" variant="neutral" onClick={addUbicacion}>
            Agregar ubicación intermedia
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Mercancías</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <FormField
            label="Peso Bruto Total (kg)"
            name="pesoBrutoTotal"
            type="number"
            value={formData.complemento.mercancias.pesoBrutoTotal}
            onChange={(e) =>
              updateComplemento('mercancias', { ...formData.complemento.mercancias, pesoBrutoTotal: e.target.value })
            }
          />
          <FormField
            label="Unidad de Peso"
            name="unidadPeso"
            value={formData.complemento.mercancias.unidadPeso}
            onChange={(e) =>
              updateComplemento('mercancias', { ...formData.complemento.mercancias, unidadPeso: e.target.value })
            }
          />
          <FormField
            label="Total de Mercancías"
            name="numTotalMercancias"
            type="number"
            value={formData.complemento.mercancias.numTotalMercancias}
            onChange={(e) =>
              updateComplemento('mercancias', { ...formData.complemento.mercancias, numTotalMercancias: e.target.value })
            }
          />
        </div>
        <div className="space-y-4">
          {formData.complemento.mercancias.mercancias.map((mercancia, index) => (
            <Card key={`mercancia-${index}`} className="border border-dashed">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-primary dark:text-secondary">Mercancía {index + 1}</h4>
                {formData.complemento.mercancias.mercancias.length > 1 && (
                  <Button type="button" variant="neutral" onClick={() => removeMercancia(index)}>
                    Eliminar
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Clave BienesTransp"
                  name={`mercancia-bienes-${index}`}
                  value={mercancia.bienesTransp}
                  onChange={(e) => updateMercancia(index, { bienesTransp: e.target.value })}
                  required
                />
                <FormField
                  label="Descripción"
                  name={`mercancia-descripcion-${index}`}
                  value={mercancia.descripcion}
                  onChange={(e) => updateMercancia(index, { descripcion: e.target.value })}
                  required
                />
                <FormField
                  label="Cantidad"
                  type="number"
                  name={`mercancia-cantidad-${index}`}
                  value={mercancia.cantidad}
                  onChange={(e) => updateMercancia(index, { cantidad: e.target.value })}
                  required
                />
                <FormField
                  label="Clave Unidad"
                  name={`mercancia-clave-${index}`}
                  value={mercancia.claveUnidad}
                  onChange={(e) => updateMercancia(index, { claveUnidad: e.target.value })}
                  required
                />
                <FormField
                  label="Peso En Kg"
                  type="number"
                  name={`mercancia-peso-${index}`}
                  value={mercancia.pesoEnKg}
                  onChange={(e) => updateMercancia(index, { pesoEnKg: e.target.value })}
                  required
                />
                <FormField
                  label="Valor Mercancía"
                  type="number"
                  name={`mercancia-valor-${index}`}
                  value={mercancia.valorMercancia || ''}
                  onChange={(e) => updateMercancia(index, { valorMercancia: e.target.value })}
                />
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-4">
          <Button type="button" variant="neutral" onClick={addMercancia}>
            Agregar mercancía
          </Button>
        </div>
      </Card>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <SelectField
            label="Tipo de Transporte"
            name="tipoTransporte"
            value={formData.tipoTransporte}
            onChange={(e) => handleTipoTransporteChange(e.target.value)}
            options={TIPO_TRANSPORTE_OPTIONS}
          />
        </div>
        {formData.tipoTransporte === '01' && formData.complemento.mercancias.autotransporte && (
          <div className="space-y-4">
            <h4 className="font-semibold text-primary dark:text-secondary">Autotransporte</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Permiso SCT"
                name="autotransporte-permiso"
                value={formData.complemento.mercancias.autotransporte.permSct}
                onChange={(e) => updateAutotransporte({ permSct: e.target.value })}
                required
              />
              <FormField
                label="Número Permiso SCT"
                name="autotransporte-numpermiso"
                value={formData.complemento.mercancias.autotransporte.numPermisoSct}
                onChange={(e) => updateAutotransporte({ numPermisoSct: e.target.value })}
                required
              />
              <FormField
                label="Config. Vehicular"
                name="autotransporte-config"
                value={formData.complemento.mercancias.autotransporte.identificacionVehicular.configVehicular}
                onChange={(e) =>
                  updateAutotransporte({
                    identificacionVehicular: {
                      ...formData.complemento.mercancias.autotransporte!.identificacionVehicular,
                      configVehicular: e.target.value,
                    },
                  })
                }
                required
              />
              <FormField
                label="Placa"
                name="autotransporte-placa"
                value={formData.complemento.mercancias.autotransporte.identificacionVehicular.placaVm}
                onChange={(e) =>
                  updateAutotransporte({
                    identificacionVehicular: {
                      ...formData.complemento.mercancias.autotransporte!.identificacionVehicular,
                      placaVm: e.target.value,
                    },
                  })
                }
                required
              />
              <FormField
                label="Peso Bruto Vehicular"
                type="number"
                name="autotransporte-peso"
                value={formData.complemento.mercancias.autotransporte.identificacionVehicular.pesoBrutoVehicular}
                onChange={(e) =>
                  updateAutotransporte({
                    identificacionVehicular: {
                      ...formData.complemento.mercancias.autotransporte!.identificacionVehicular,
                      pesoBrutoVehicular: e.target.value,
                    },
                  })
                }
                required
              />
              <FormField
                label="Año Modelo"
                name="autotransporte-anio"
                value={formData.complemento.mercancias.autotransporte.identificacionVehicular.anioModeloVm}
                onChange={(e) =>
                  updateAutotransporte({
                    identificacionVehicular: {
                      ...formData.complemento.mercancias.autotransporte!.identificacionVehicular,
                      anioModeloVm: e.target.value,
                    },
                  })
                }
                required
              />
              <FormField
                label="Aseguradora RC"
                name="autotransporte-aseguradora"
                value={formData.complemento.mercancias.autotransporte.seguros.aseguraRespCivil}
                onChange={(e) =>
                  updateAutotransporte({
                    seguros: {
                      ...formData.complemento.mercancias.autotransporte!.seguros,
                      aseguraRespCivil: e.target.value,
                    },
                  })
                }
                required
              />
              <FormField
                label="Póliza RC"
                name="autotransporte-poliza"
                value={formData.complemento.mercancias.autotransporte.seguros.polizaRespCivil}
                onChange={(e) =>
                  updateAutotransporte({
                    seguros: {
                      ...formData.complemento.mercancias.autotransporte!.seguros,
                      polizaRespCivil: e.target.value,
                    },
                  })
                }
                required
              />
            </div>
          </div>
        )}

        {formData.tipoTransporte === '04' && formData.complemento.mercancias.transporteFerroviario && (
          <div className="space-y-4">
            <h4 className="font-semibold text-primary dark:text-secondary">Transporte ferroviario</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                label="Tipo de Servicio"
                name="ferro-servicio"
                value={formData.complemento.mercancias.transporteFerroviario.tipoDeServicio}
                onChange={(e) => updateTransporteFerroviario({ tipoDeServicio: e.target.value })}
                required
              />
              <FormField
                label="Tipo de Tráfico"
                name="ferro-trafico"
                value={formData.complemento.mercancias.transporteFerroviario.tipoDeTrafico}
                onChange={(e) => updateTransporteFerroviario({ tipoDeTrafico: e.target.value })}
                required
              />
              <FormField
                label="Nombre Aseguradora"
                name="ferro-aseguradora"
                value={formData.complemento.mercancias.transporteFerroviario.nombreAseg || ''}
                onChange={(e) => updateTransporteFerroviario({ nombreAseg: e.target.value })}
              />
              <FormField
                label="Póliza Seguro"
                name="ferro-poliza"
                value={formData.complemento.mercancias.transporteFerroviario.numPolizaSeguro || ''}
                onChange={(e) => updateTransporteFerroviario({ numPolizaSeguro: e.target.value })}
              />
            </div>
            <h5 className="font-semibold">Carros</h5>
            <div className="space-y-3">
              {formData.complemento.mercancias.transporteFerroviario.carros.map((carro, index) => (
                <div key={`carro-${index}`} className="grid grid-cols-1 md:grid-cols-4 gap-4 border border-dashed p-3 rounded">
                  <FormField
                    label="Tipo Carro"
                    name={`ferro-carro-tipo-${index}`}
                    value={carro.tipoCarro}
                    onChange={(e) =>
                      updateTransporteFerroviario({
                        carros: formData.complemento.mercancias.transporteFerroviario!.carros.map((c, idx) =>
                          idx === index ? { ...c, tipoCarro: e.target.value } : c
                        ),
                      })
                    }
                    required
                  />
                  <FormField
                    label="Matrícula"
                    name={`ferro-carro-matricula-${index}`}
                    value={carro.matriculaCarro}
                    onChange={(e) =>
                      updateTransporteFerroviario({
                        carros: formData.complemento.mercancias.transporteFerroviario!.carros.map((c, idx) =>
                          idx === index ? { ...c, matriculaCarro: e.target.value } : c
                        ),
                      })
                    }
                    required
                  />
                  <FormField
                    label="Guía"
                    name={`ferro-carro-guia-${index}`}
                    value={carro.guiaCarro}
                    onChange={(e) =>
                      updateTransporteFerroviario({
                        carros: formData.complemento.mercancias.transporteFerroviario!.carros.map((c, idx) =>
                          idx === index ? { ...c, guiaCarro: e.target.value } : c
                        ),
                      })
                    }
                    required
                  />
                  <FormField
                    label="Toneladas Netas"
                    name={`ferro-carro-toneladas-${index}`}
                    value={carro.toneladasNetasCarro}
                    onChange={(e) =>
                      updateTransporteFerroviario({
                        carros: formData.complemento.mercancias.transporteFerroviario!.carros.map((c, idx) =>
                          idx === index ? { ...c, toneladasNetasCarro: e.target.value } : c
                        ),
                      })
                    }
                    required
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">Figuras de transporte</h3>
        <div className="space-y-4">
          {formData.complemento.figuraTransporte.tiposFigura.map((figura, index) => (
            <Card key={`figura-${index}`} className="border border-dashed">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold text-primary dark:text-secondary">Figura {index + 1}</h4>
                {formData.complemento.figuraTransporte.tiposFigura.length > 1 && (
                  <Button type="button" variant="neutral" onClick={() => removeFigura(index)}>
                    Eliminar
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  label="Tipo Figura"
                  name={`figura-tipo-${index}`}
                  value={figura.tipoFigura}
                  onChange={(e) => updateFigura(index, { tipoFigura: e.target.value })}
                  required
                />
                <FormField
                  label="Nombre"
                  name={`figura-nombre-${index}`}
                  value={figura.nombreFigura}
                  onChange={(e) => updateFigura(index, { nombreFigura: e.target.value })}
                  required
                />
                <FormField
                  label="RFC"
                  name={`figura-rfc-${index}`}
                  value={figura.rfcFigura || ''}
                  onChange={(e) => updateFigura(index, { rfcFigura: e.target.value })}
                />
                <FormField
                  label="Número Licencia"
                  name={`figura-licencia-${index}`}
                  value={figura.numLicencia || ''}
                  onChange={(e) => updateFigura(index, { numLicencia: e.target.value })}
                />
              </div>
            </Card>
          ))}
        </div>
        <div className="mt-4">
          <Button type="button" variant="neutral" onClick={addFigura}>
            Agregar figura
          </Button>
        </div>
      </Card>

      <div className="flex flex-col md:flex-row justify-end gap-3">
        <Button type="button" onClick={cargarEjemplo}>
          Cargar ejemplo
        </Button>
        <Button type="button" variant="secondary" onClick={handleDescargarXML} disabled={submitting || guardandoBD}>
          Descargar XML
        </Button>
        <Button type="button" variant="primary" onClick={handleGuardarEnBD} disabled={guardandoBD || enviandoCorreo || submitting}>
          {guardandoBD ? 'Timbrando...' : 'Timbrar y guardar'}
        </Button>
        <Button type="button" variant="primary" onClick={handleEnviarCorreo} disabled={enviandoCorreo || guardandoBD || submitting}>
          {enviandoCorreo ? 'Enviando…' : 'Enviar al correo'}
        </Button>
        <Button type="submit" variant="primary" disabled={submitting || enviandoCorreo || guardandoBD}>
          {submitting ? 'Generando...' : 'Generar Carta Porte'}
        </Button>
      </div>
    </form>
  );
};