import React, { useCallback, useEffect, useState, useRef } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { Button } from './Button';
import { useEmpresa } from '../context/EmpresaContext';
import { retencionesService } from '../services/retencionesService';

type RetencionPagoFormData = {
  rfcEmisor: string;
  nombreEmisor: string;
  rfcReceptor: string;
  razonSocial: string; // Para persona moral
  nombre: string; // Para persona física
  paterno: string; // Para persona física
  materno: string; // Para persona física
  tipoRetencion: string;
  montoBase: string;
  isrRetenido: string;
  ivaRetenido: string;
  periodoMes: string;
  periodoAnio: string;
  fechaPago: string;
  concepto: string;
  correoReceptor: string;
  usuarioRegistro: string;
};

const TIPO_RETENCION_OPTIONS = [
  { value: 'ISR_SERVICIOS', label: 'ISR - Servicios profesionales (honorarios)' },
  { value: 'ISR_ARRENDAMIENTO', label: 'ISR - Arrendamiento' },
  { value: 'ISR_ENAJENACION', label: 'ISR - Enajenación de bienes' },
  { value: 'ISR_REGALIAS', label: 'ISR - Regalías' },
  { value: 'IVA', label: 'IVA - Retención de IVA' },
  { value: 'ISR_SUELDOS', label: 'ISR - Sueldos y salarios' },
  { value: 'DIVIDENDOS', label: 'Dividendos o utilidades distribuidas' },
  { value: 'INTERESES', label: 'Intereses' },
  { value: 'FIDEICOMISOS', label: 'Fideicomisos' },
  { value: 'REMANENTE', label: 'Remanente distribuible' },
  { value: 'PLANES_RETIRO', label: 'Planes de retiro' },
  { value: 'ENAJENACION_ACCIONES', label: 'Enajenación de acciones' },
  { value: 'OTROS', label: 'Otros ingresos regulados' },
];

const MESES_OPTIONS = [
  { value: '01', label: 'Enero' },
  { value: '02', label: 'Febrero' },
  { value: '03', label: 'Marzo' },
  { value: '04', label: 'Abril' },
  { value: '05', label: 'Mayo' },
  { value: '06', label: 'Junio' },
  { value: '07', label: 'Julio' },
  { value: '08', label: 'Agosto' },
  { value: '09', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

const ANIOS_OPTIONS = Array.from({ length: 10 }, (_, i) => {
  const anio = new Date().getFullYear() - 5 + i;
  return { value: String(anio), label: String(anio) };
});

export const FacturacionRetencionPagosPage: React.FC = () => {
  const { empresaInfo } = useEmpresa();
  const [tipoPersona, setTipoPersona] = useState<'fisica' | 'moral' | null>(null);
  const tipoPersonaAnteriorRef = useRef<'fisica' | 'moral' | null>(null);

  const [formData, setFormData] = useState<RetencionPagoFormData>({
    rfcEmisor: empresaInfo.rfc || '',
    nombreEmisor: empresaInfo.nombre || '',
    rfcReceptor: '',
    razonSocial: '',
    nombre: '',
    paterno: '',
    materno: '',
    tipoRetencion: '',
    montoBase: '',
    isrRetenido: '',
    ivaRetenido: '',
    periodoMes: '',
    periodoAnio: String(new Date().getFullYear()),
    fechaPago: new Date().toISOString().split('T')[0],
    concepto: '',
    correoReceptor: '',
    usuarioRegistro: '',
  });

  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uuidRetencionGuardado, setUuidRetencionGuardado] = useState<string | null>(null);

  // Funciones para determinar el tipo de persona según el RFC
  const esPersonaMoral = (rfc: string): boolean => {
    return rfc.length === 12;
  };

  const esPersonaFisica = (rfc: string): boolean => {
    return rfc.length === 13;
  };

  // Detectar tipo de persona cuando cambia el RFC del receptor
  useEffect(() => {
    const rfc = formData.rfcReceptor.trim().toUpperCase();
    let nuevoTipo: 'fisica' | 'moral' | null = null;
    
    if (rfc && rfc.length >= 12) {
      if (esPersonaMoral(rfc)) {
        nuevoTipo = 'moral';
      } else if (esPersonaFisica(rfc)) {
        nuevoTipo = 'fisica';
      }
    }
    
    // Solo actualizar si el tipo cambió
    if (nuevoTipo !== tipoPersonaAnteriorRef.current) {
      tipoPersonaAnteriorRef.current = nuevoTipo;
      setTipoPersona(nuevoTipo);
      
      // Limpiar campos según el nuevo tipo
      if (nuevoTipo === 'moral') {
        setFormData(prev => ({
          ...prev,
          nombre: '',
          paterno: '',
          materno: '',
        }));
      } else if (nuevoTipo === 'fisica') {
        setFormData(prev => ({
          ...prev,
          razonSocial: '',
        }));
      }
    }
  }, [formData.rfcReceptor]);

  // Actualizar RFC emisor cuando cambia la empresa
  useEffect(() => {
    if (empresaInfo.rfc) {
      setFormData((prev) => ({
        ...prev,
        rfcEmisor: empresaInfo.rfc,
        nombreEmisor: empresaInfo.nombre || prev.nombreEmisor,
      }));
    }
  }, [empresaInfo]);

  useEffect(() => {
    const storedUser =
      localStorage.getItem('session.idUsuario') ||
      localStorage.getItem('username') ||
      '';
    if (storedUser) {
      setFormData((prev) => ({
        ...prev,
        usuarioRegistro: storedUser,
      }));
    }
  }, []);

  // Calcular ISR retenido según el tipo de retención
  const calcularIsrRetenido = useCallback((montoBase: number, tipoRetencion: string): number => {
    if (!montoBase || montoBase <= 0) return 0;
    
    // Porcentajes de retención según el tipo
    const porcentajesIsr: Record<string, number> = {
      'ISR_SERVICIOS': 0.10,        // 10% para servicios profesionales
      'ISR_ARRENDAMIENTO': 0.10,    // 10% para arrendamiento
      'ISR_ENAJENACION': 0.10,      // 10% para enajenación
      'ISR_REGALIAS': 0.10,         // 10% para regalías
      'ISR_SUELDOS': 0.10,          // 10% para sueldos
      'DIVIDENDOS': 0.10,           // 10% para dividendos
      'INTERESES': 0.10,            // 10% para intereses
      'FIDEICOMISOS': 0.10,         // 10% para fideicomisos
      'REMANENTE': 0.10,            // 10% para remanente
      'PLANES_RETIRO': 0.10,        // 10% para planes de retiro
      'ENAJENACION_ACCIONES': 0.10, // 10% para enajenación de acciones
      'OTROS': 0.10,                // 10% para otros
    };
    
    const porcentaje = porcentajesIsr[tipoRetencion] || 0;
    return montoBase * porcentaje;
  }, []);

  // Calcular IVA retenido (2/3 del IVA total)
  const calcularIvaRetenido = useCallback((montoBase: number): number => {
    if (!montoBase || montoBase <= 0) return 0;
    
    // IVA = 16% del monto base
    const ivaTotal = montoBase * 0.16;
    // IVA retenido = 2/3 del IVA total
    const ivaRetenido = ivaTotal * (2 / 3);
    
    return ivaRetenido;
  }, []);

  const handleFormChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [],
  );

  const validarFormulario = useCallback((): string[] => {
    const errores: string[] = [];

    if (!formData.rfcEmisor || !formData.rfcEmisor.trim()) {
      errores.push('RFC del emisor es obligatorio');
    }
    if (!formData.nombreEmisor || !formData.nombreEmisor.trim()) {
      errores.push('Nombre del emisor es obligatorio');
    }
    if (!formData.rfcReceptor || !formData.rfcReceptor.trim()) {
      errores.push('RFC del receptor es obligatorio');
    }
    
    // Validar según el tipo de persona
    if (tipoPersona === 'moral') {
      if (!formData.razonSocial || !formData.razonSocial.trim()) {
        errores.push('Razón social es obligatoria para persona moral');
      }
    } else if (tipoPersona === 'fisica') {
      if (!formData.nombre || !formData.nombre.trim()) {
        errores.push('Nombre es obligatorio para persona física');
      }
      if (!formData.paterno || !formData.paterno.trim()) {
        errores.push('Apellido paterno es obligatorio para persona física');
      }
    } else {
      errores.push('El RFC del receptor debe tener 12 caracteres (moral) o 13 caracteres (física)');
    }
    if (!formData.tipoRetencion || !formData.tipoRetencion.trim()) {
      errores.push('Tipo de retención es obligatorio');
    }
    if (!formData.montoBase || !formData.montoBase.trim()) {
      errores.push('Monto base es obligatorio');
    } else {
      const monto = parseFloat(formData.montoBase);
      if (isNaN(monto) || monto <= 0) {
        errores.push('Monto base debe ser un número mayor a cero');
      }
    }
    if (!formData.periodoMes || !formData.periodoMes.trim()) {
      errores.push('Mes del período es obligatorio');
    }
    if (!formData.periodoAnio || !formData.periodoAnio.trim()) {
      errores.push('Año del período es obligatorio');
    }
    if (!formData.fechaPago || !formData.fechaPago.trim()) {
      errores.push('Fecha de pago es obligatoria');
    }
    if (!formData.concepto || !formData.concepto.trim()) {
      errores.push('Concepto es obligatorio');
    }
    if (!formData.correoReceptor || !formData.correoReceptor.trim()) {
      errores.push('Correo del receptor es obligatorio');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.correoReceptor.trim())) {
        errores.push('El correo del receptor no tiene un formato válido');
      }
    }

    // Validar montos de retención si están presentes
    if (formData.isrRetenido && formData.isrRetenido.trim()) {
      const isr = parseFloat(formData.isrRetenido);
      if (isNaN(isr) || isr < 0) {
        errores.push('ISR retenido debe ser un número mayor o igual a cero');
      }
    }
    if (formData.ivaRetenido && formData.ivaRetenido.trim()) {
      const iva = parseFloat(formData.ivaRetenido);
      if (isNaN(iva) || iva < 0) {
        errores.push('IVA retenido debe ser un número mayor o igual a cero');
      }
    }

    return errores;
  }, [formData, tipoPersona]);

  const resetAlerts = useCallback(() => {
    setErrorMessages([]);
    setSuccessMessage(null);
  }, []);

  const handleLimpiarFormulario = useCallback(() => {
    resetAlerts();
    setFormData({
      rfcEmisor: empresaInfo.rfc || '',
      nombreEmisor: empresaInfo.nombre || '',
      rfcReceptor: '',
      razonSocial: '',
      nombre: '',
      paterno: '',
      materno: '',
      tipoRetencion: '',
      montoBase: '',
      isrRetenido: '',
      ivaRetenido: '',
      periodoMes: '',
      periodoAnio: String(new Date().getFullYear()),
      fechaPago: new Date().toISOString().split('T')[0],
      concepto: '',
      correoReceptor: '',
      usuarioRegistro: formData.usuarioRegistro,
    });
    setTipoPersona(null);
    tipoPersonaAnteriorRef.current = null;
    setUuidRetencionGuardado(null);
  }, [formData.usuarioRegistro, empresaInfo, resetAlerts]);

  const handleGuardar = useCallback(async () => {
    resetAlerts();
    const errores = validarFormulario();
    if (errores.length > 0) {
      setErrorMessages(errores);
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Calcular monto retenido total
      const isrRetenido = parseFloat(formData.isrRetenido || '0');
      const ivaRetenido = parseFloat(formData.ivaRetenido || '0');
      const montoRetenido = isrRetenido + ivaRetenido;

      const payload = {
        rfcEmisor: formData.rfcEmisor.trim(),
        nombreEmisor: formData.nombreEmisor.trim(),
        rfcReceptor: formData.rfcReceptor.trim(),
        razonSocial: tipoPersona === 'moral' ? formData.razonSocial.trim() : undefined,
        nombre: tipoPersona === 'fisica' ? formData.nombre.trim() : undefined,
        paterno: tipoPersona === 'fisica' ? formData.paterno.trim() : undefined,
        materno: tipoPersona === 'fisica' ? formData.materno.trim() : undefined,
        tipoPersona: tipoPersona || 'moral',
        tipoRetencion: formData.tipoRetencion.trim(),
        montoBase: parseFloat(formData.montoBase),
        isrRetenido: isrRetenido,
        ivaRetenido: ivaRetenido,
        montoRetenido: montoRetenido,
        periodoMes: formData.periodoMes.trim(),
        periodoAnio: formData.periodoAnio.trim(),
        fechaPago: formData.fechaPago.trim(),
        concepto: formData.concepto.trim(),
        correoReceptor: formData.correoReceptor.trim(),
        usuarioRegistro: formData.usuarioRegistro?.trim() || undefined,
      };

      const resultado = await retencionesService.registrarRetencion(payload);
      
      if (resultado.success) {
        const mensajeBase = resultado.message || 'Retención registrada correctamente.';
        const mensajeUuid =
          resultado.uuidRetencion && resultado.uuidRetencion.trim().length > 0
            ? `${mensajeBase} (UUID: ${resultado.uuidRetencion})`
            : mensajeBase;
        setSuccessMessage(mensajeUuid);
        
        let uuidRetencion = resultado.uuidRetencion?.trim() || '';
        setUuidRetencionGuardado(uuidRetencion || null);
        
        if (resultado.uuidRetencion && resultado.uuidRetencion.trim().length > 0) {
          window.alert(`✅ Retención de pagos timbrada exitosamente\nUUID: ${resultado.uuidRetencion}`);
        } else {
          window.alert('✅ Retención de pagos timbrada exitosamente');
        }

        // Preguntar si desea enviar por correo
        const deseaEnviar = window.confirm('¿Deseas enviar el PDF de la retención al correo registrado?');
        if (deseaEnviar && uuidRetencion) {
          try {
            await retencionesService.enviarRetencionPorCorreo({
              uuidRetencion: uuidRetencion,
              correoReceptor: formData.correoReceptor.trim(),
              rfcReceptor: resultado.rfcReceptor || formData.rfcReceptor.trim(),
              rfcEmisor: resultado.rfcEmisor || formData.rfcEmisor.trim(),
              nombreReceptor: tipoPersona === 'moral' ? formData.razonSocial.trim() : 
                             `${formData.nombre.trim()} ${formData.paterno.trim()} ${formData.materno.trim()}`.trim(),
              nombreEmisor: formData.nombreEmisor.trim(),
              serieRetencion: resultado.serieRetencion || undefined,
              folioRetencion: resultado.folioRetencion || undefined,
              fechaTimbrado: resultado.fechaTimbrado || undefined,
              tipoRetencion: formData.tipoRetencion.trim(),
              montoRetenido: resultado.montoRetenido || montoRetenido,
              baseRetencion: resultado.baseRetencion || parseFloat(formData.montoBase),
            });
            window.alert(`📧 Retención enviada exitosamente al correo: ${formData.correoReceptor.trim()}`);
            setSuccessMessage(`Retención enviada por correo a ${formData.correoReceptor.trim()}`);
          } catch (error) {
            const mensajeError = error instanceof Error ? error.message : 'Error al enviar por correo.';
            setErrorMessages([mensajeError]);
            window.alert(`⚠️ ${mensajeError}`);
          }
        }
      } else {
        const erroresBackend = resultado.errors || [];
        const mensajeError = resultado.message || 'Error al registrar la retención.';
        setErrorMessages([mensajeError, ...erroresBackend]);
        window.alert(`⚠️ ${mensajeError}\n${erroresBackend.join('\n')}`);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo registrar la retención de pagos.';
      setErrorMessages([message]);
      window.alert(`⚠️ ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, tipoPersona, resetAlerts, validarFormulario, handleLimpiarFormulario]);

  // Calcular automáticamente las retenciones cuando cambia el monto base o tipo de retención
  useEffect(() => {
    const montoBase = parseFloat(formData.montoBase || '0');
    const tipoRetencion = formData.tipoRetencion?.trim() || '';
    
    // Solo calcular si hay monto base válido y tipo de retención seleccionado
    if (montoBase > 0 && tipoRetencion) {
      // Calcular ISR retenido
      const isrCalculado = calcularIsrRetenido(montoBase, tipoRetencion);
      
      // Calcular IVA retenido (solo si el tipo de retención aplica IVA)
      const tiposConIva = ['ISR_SERVICIOS', 'ISR_ARRENDAMIENTO', 'IVA'];
      const ivaCalculado = tiposConIva.includes(tipoRetencion) 
        ? calcularIvaRetenido(montoBase) 
        : 0;
      
      const isrFormateado = isrCalculado.toFixed(2);
      const ivaFormateado = ivaCalculado.toFixed(2);
      
      // Solo actualizar si los valores han cambiado para evitar loops infinitos
      setFormData((prev) => {
        if (prev.isrRetenido === isrFormateado && prev.ivaRetenido === ivaFormateado) {
          return prev; // No hay cambios, retornar el mismo estado
        }
        return {
          ...prev,
          isrRetenido: isrFormateado,
          ivaRetenido: ivaFormateado,
        };
      });
    } else if (montoBase === 0 || !tipoRetencion) {
      // Limpiar retenciones si no hay monto base o tipo de retención
      setFormData((prev) => {
        if (prev.isrRetenido === '' && prev.ivaRetenido === '') {
          return prev; // Ya están vacíos, no actualizar
        }
        return {
          ...prev,
          isrRetenido: '',
          ivaRetenido: '',
        };
      });
    }
  }, [formData.montoBase, formData.tipoRetencion, calcularIsrRetenido, calcularIvaRetenido]);

  const calcularTotalRetenido = useCallback(() => {
    const isr = parseFloat(formData.isrRetenido || '0');
    const iva = parseFloat(formData.ivaRetenido || '0');
    return isr + iva;
  }, [formData.isrRetenido, formData.ivaRetenido]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Retención de Pagos
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          CFDI de Retenciones e Información de Pagos según el SAT (Anexo 20, CFDI 2.0)
        </p>
      </div>

      {errorMessages.length > 0 && (
        <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
          <ul className="list-disc list-inside space-y-1 text-sm text-red-800 dark:text-red-200">
            {errorMessages.map((msg, idx) => (
              <li key={idx}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
          <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
        </div>
      )}

      <Card title="Datos del Receptor">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label="RFC del Receptor"
            name="rfcReceptor"
            value={formData.rfcReceptor}
            onChange={handleFormChange}
            placeholder="Ej. XAXX010101000 (13 chars) o ABC123456789 (12 chars)"
            required
          />
          {tipoPersona === 'moral' && (
            <FormField
              label="Razón Social"
              name="razonSocial"
              value={formData.razonSocial}
              onChange={handleFormChange}
              placeholder="Ej. Empresa Ejemplo S.A. de C.V."
              required
            />
          )}
          {tipoPersona === 'fisica' && (
            <>
              <FormField
                label="Nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleFormChange}
                placeholder="Ej. Juan"
                required
              />
              <FormField
                label="Apellido Paterno"
                name="paterno"
                value={formData.paterno}
                onChange={handleFormChange}
                placeholder="Ej. Pérez"
                required
              />
              <FormField
                label="Apellido Materno"
                name="materno"
                value={formData.materno}
                onChange={handleFormChange}
                placeholder="Ej. García"
              />
            </>
          )}
        </div>
        {!tipoPersona && formData.rfcReceptor.trim().length > 0 && (
          <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
            Ingresa un RFC válido (12 caracteres para persona moral, 13 para persona física)
          </p>
        )}
        {tipoPersona === 'moral' && (
          <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
            ✓ Persona Moral detectada (RFC de 12 caracteres)
          </p>
        )}
        {tipoPersona === 'fisica' && (
          <p className="mt-2 text-xs text-blue-600 dark:text-blue-400">
            ✓ Persona Física detectada (RFC de 13 caracteres)
          </p>
        )}
      </Card>

      <Card title="Información de la Retención">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField
            label="Tipo de Retención o Pago"
            name="tipoRetencion"
            value={formData.tipoRetencion}
            onChange={handleFormChange}
            options={TIPO_RETENCION_OPTIONS}
            required
          />
          <FormField
            label="Fecha de Pago"
            name="fechaPago"
            type="date"
            value={formData.fechaPago}
            onChange={handleFormChange}
            required
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <SelectField
            label="Mes del Período"
            name="periodoMes"
            value={formData.periodoMes}
            onChange={handleFormChange}
            options={MESES_OPTIONS}
            required
          />
          <SelectField
            label="Año del Período"
            name="periodoAnio"
            value={formData.periodoAnio}
            onChange={handleFormChange}
            options={ANIOS_OPTIONS}
            required
          />
        </div>
        <div className="mt-4">
          <FormField
            label="Concepto"
            name="concepto"
            value={formData.concepto}
            onChange={handleFormChange}
            placeholder="Descripción del pago o servicio"
            required
          />
        </div>
      </Card>

      <Card title="Montos">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label="Monto Base"
            name="montoBase"
            type="number"
            step="0.01"
            min="0"
            value={formData.montoBase}
            onChange={handleFormChange}
            placeholder="0.00"
            required
          />
          <div className="flex items-end">
            <div className="w-full rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <p className="text-xs text-blue-700 dark:text-blue-300">
                💡 Las retenciones se calculan automáticamente al ingresar el monto base y tipo de retención
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label="ISR Retenido"
            name="isrRetenido"
            type="number"
            step="0.01"
            min="0"
            value={formData.isrRetenido}
            onChange={handleFormChange}
            placeholder="0.00"
          />
          <FormField
            label="IVA Retenido"
            name="ivaRetenido"
            type="number"
            step="0.01"
            min="0"
            value={formData.ivaRetenido}
            onChange={handleFormChange}
            placeholder="0.00"
          />
        </div>
        <div className="mt-4">
          <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Total Retenido
            </label>
            <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">
              ${calcularTotalRetenido().toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Puedes modificar manualmente los valores de ISR e IVA retenido si es necesario. 
          Los valores se recalcularán automáticamente al cambiar el monto base o tipo de retención.
        </p>
      </Card>

      <Card title="Información Adicional">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label="Correo del Receptor"
            name="correoReceptor"
            type="email"
            value={formData.correoReceptor}
            onChange={handleFormChange}
            placeholder="ejemplo@dominio.com"
            required
          />
          <FormField
            label="Usuario que Registra"
            name="usuarioRegistro"
            value={formData.usuarioRegistro}
            onChange={handleFormChange}
            placeholder="Usuario del sistema"
            disabled
          />
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button variant="neutral" onClick={handleLimpiarFormulario}>
          Limpiar formulario
        </Button>
        <Button onClick={handleGuardar} disabled={isSubmitting}>
          {isSubmitting ? 'Guardando…' : 'Guardar Retención'}
        </Button>
        {uuidRetencionGuardado && formData.correoReceptor && (
          <Button
            variant="secondary"
            onClick={() => {
              const asunto = encodeURIComponent(`Retención de Pagos - UUID: ${uuidRetencionGuardado}`);
              const cuerpo = encodeURIComponent(
                `Se adjunta el CFDI de Retención de Pagos.\n\nUUID: ${uuidRetencionGuardado}\n` +
                `Tipo de Retención: ${formData.tipoRetencion}\n` +
                `Monto Base: $${formData.montoBase}\n` +
                `Monto Retenido: $${(parseFloat(formData.isrRetenido || '0') + parseFloat(formData.ivaRetenido || '0')).toFixed(2)}`
              );
              window.open(
                `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(formData.correoReceptor)}&su=${asunto}&body=${cuerpo}`,
                '_blank'
              );
            }}
          >
            📧 Enviar Gmail
          </Button>
        )}
      </div>
    </div>
  );
};

export default FacturacionRetencionPagosPage;

