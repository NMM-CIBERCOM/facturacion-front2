import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { Button } from './Button';
import { MEDIO_PAGO_OPTIONS } from '../constants';
import { pagosService } from '../services/pagosService';
import { apiUrl } from '../services/api';

type PagoDetalle = {
  id: string;
  fechaPago: string;
  formaPago: string;
  moneda: string;
  monto: string;
};

type ComplementoPagoFormData = {
  facturaUuid: string;
  facturaId: string;
  usuarioRegistro: string;
  correoReceptor: string;
};

const MONEDA_OPTIONS = [
  { value: 'MXN', label: 'MXN - Peso mexicano' },
  { value: 'USD', label: 'USD - Dólar estadounidense' },
  { value: 'EUR', label: 'EUR - Euro' },
];

const initialPago: PagoDetalle = {
  id: '',
  fechaPago: '',
  formaPago: '',
  moneda: 'MXN',
  monto: '',
};

export const FacturacionComplementoPagosPage: React.FC = () => {
  const [formData, setFormData] = useState<ComplementoPagoFormData>({
    facturaUuid: '',
    facturaId: '',
    usuarioRegistro: '',
  correoReceptor: '',
  });
  const [pagoDraft, setPagoDraft] = useState<PagoDetalle>(initialPago);
  const [pagos, setPagos] = useState<PagoDetalle[]>([]);
  const [selectedPagoId, setSelectedPagoId] = useState<string | null>(null);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSearchingFactura, setIsSearchingFactura] = useState<boolean>(false);
  const [uuidComplementoPreparado, setUuidComplementoPreparado] = useState<string | null>(null);
  const [pagosPreparados, setPagosPreparados] = useState<PagoDetalle[]>([]);
  const [facturaUuidPreparada, setFacturaUuidPreparada] = useState<string>('');
  const [isGenerandoPdf, setIsGenerandoPdf] = useState<boolean>(false);
  const [isGenerandoXml, setIsGenerandoXml] = useState<boolean>(false);
  const [isEnviandoCorreo, setIsEnviandoCorreo] = useState<boolean>(false);
  const [xmlComplementoTimbrado, setXmlComplementoTimbrado] = useState<string | null>(null);

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

  const totalesPorMoneda = useMemo(() => {
    return pagos.reduce<Record<string, number>>((acc, pago) => {
      const moneda = (pago.moneda || 'MXN').toUpperCase();
      const monto = parseFloat(pago.monto);
      if (Number.isNaN(monto)) {
        return acc;
      }
      acc[moneda] = (acc[moneda] || 0) + monto;
      return acc;
    }, {});
  }, [pagos]);

  const handleFormChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ...(name === 'facturaUuid' ? { facturaId: '' } : {}),
      }));
    },
    [],
  );

  const handlePagoInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = event.target;
      setPagoDraft((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    [],
  );

  const resetAlerts = useCallback(() => {
    setErrorMessages([]);
    setSuccessMessage(null);
  }, []);

  const handleBuscarFactura = useCallback(async () => {
    resetAlerts();
    const uuid = formData.facturaUuid.trim();
    if (!uuid) {
      setErrorMessages(['Captura el UUID de la factura que deseas relacionar.']);
      return;
    }
    try {
      setIsSearchingFactura(true);
      const resultado = await pagosService.buscarFacturaPorUuid(uuid);
      if (resultado.success && typeof resultado.facturaId === 'number') {
        setFormData((prev) => ({
          ...prev,
          facturaId: String(resultado.facturaId),
        }));
        setSuccessMessage(`Factura localizada. ID_FACTURA: ${resultado.facturaId}.`);
      } else {
        setFormData((prev) => ({
          ...prev,
          facturaId: '',
        }));
        setErrorMessages([
          resultado.message || 'No se encontró FACTURA_ID para el UUID especificado.',
        ]);
      }
    } catch (error) {
      setFormData((prev) => ({
        ...prev,
        facturaId: '',
      }));
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo consultar la factura por UUID.';
      setErrorMessages([message]);
    } finally {
      setIsSearchingFactura(false);
    }
  }, [formData.facturaUuid, resetAlerts]);

  const validarFormulario = useCallback(() => {
    const errores: string[] = [];

    if (!formData.facturaUuid.trim()) {
      errores.push('Captura el UUID de la factura que deseas relacionar.');
    }
    if (!formData.correoReceptor.trim()) {
      errores.push('Captura el correo del receptor.');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correoReceptor.trim())) {
      errores.push('El correo del receptor no tiene un formato válido.');
    }
    if (pagos.length === 0) {
      errores.push('Agrega al menos un pago a la relación.');
    }

    return errores;
  }, [formData, pagos.length]);

  const validarPagoDraft = useCallback(() => {
    const errores: string[] = [];
    if (!pagoDraft.fechaPago) {
      errores.push('Selecciona la fecha de pago.');
    }
    if (!pagoDraft.formaPago) {
      errores.push('Selecciona la forma de pago.');
    }
    if (!pagoDraft.moneda) {
      errores.push('Selecciona la moneda del pago.');
    }
    if (!pagoDraft.monto || Number.isNaN(parseFloat(pagoDraft.monto))) {
      errores.push('Captura un monto válido.');
    }
    return errores;
  }, [pagoDraft.fechaPago, pagoDraft.formaPago, pagoDraft.moneda, pagoDraft.monto]);

  const handleAgregarPago = useCallback(() => {
    resetAlerts();
    const errores = validarPagoDraft();
    if (errores.length > 0) {
      setErrorMessages(errores);
      return;
    }

    const nuevoPago: PagoDetalle = {
      ...pagoDraft,
      id: selectedPagoId ?? crypto.randomUUID(),
    };

    setPagos((prev) => {
      const filtered = prev.filter((pago) => pago.id !== nuevoPago.id);
      return [...filtered, nuevoPago].sort((a, b) => a.fechaPago.localeCompare(b.fechaPago));
    });

    setPagoDraft(initialPago);
    setSelectedPagoId(null);
    setSuccessMessage('Pago agregado a la relación.');
  }, [pagoDraft, resetAlerts, selectedPagoId, validarPagoDraft]);

  const handleSeleccionarPago = useCallback(
    (id: string) => {
      const pago = pagos.find((item) => item.id === id);
      if (pago) {
        setPagoDraft(pago);
        setSelectedPagoId(id);
        resetAlerts();
      }
    },
    [pagos, resetAlerts],
  );

  const handleEliminarPago = useCallback(
    (id: string) => {
      resetAlerts();
      setPagos((prev) => prev.filter((pago) => pago.id !== id));
      if (selectedPagoId === id) {
        setPagoDraft(initialPago);
        setSelectedPagoId(null);
      }
      setSuccessMessage('Pago eliminado.');
    },
    [resetAlerts, selectedPagoId],
  );

  const handleLimpiarFormulario = useCallback(() => {
    resetAlerts();
    setFormData((prev) => ({
      facturaUuid: '',
      facturaId: '',
      usuarioRegistro: prev.usuarioRegistro,
      correoReceptor: '',
    }));
    setPagos([]);
    setPagoDraft(initialPago);
    setSelectedPagoId(null);
    setUuidComplementoPreparado(null);
    setPagosPreparados([]);
    setFacturaUuidPreparada('');
    setXmlComplementoTimbrado(null);
  }, [resetAlerts]);

  const handleEnviarComplemento = useCallback(async () => {
    resetAlerts();
    const errores = validarFormulario();
    if (errores.length > 0) {
      setErrorMessages(errores);
      return;
    }

    try {
      setIsSubmitting(true);
      setXmlComplementoTimbrado(null);
      const payload = {
        facturaUuid: formData.facturaUuid.trim(),
        facturaId:
          formData.facturaId && !Number.isNaN(Number(formData.facturaId))
            ? Number(formData.facturaId)
            : undefined,
        usuarioRegistro: formData.usuarioRegistro?.trim() || undefined,
        correoReceptor: formData.correoReceptor.trim(),
        pagos: pagos.map((pago) => ({
          fechaPago: pago.fechaPago,
          formaPago: pago.formaPago,
          moneda: pago.moneda,
          monto: Number(pago.monto),
        })),
      };

      const resultado = await pagosService.registrarComplemento(payload);
      if (resultado.success) {
        const mensajeBase = resultado.message || 'Pagos registrados correctamente.';
        const mensajeUuid =
          resultado.uuidComplemento && resultado.uuidComplemento.trim().length > 0
            ? `${mensajeBase} (UUID complemento: ${resultado.uuidComplemento})`
            : mensajeBase;
        setSuccessMessage(mensajeUuid);
        let uuidComplemento = resultado.uuidComplemento?.trim() || '';
        if (resultado.uuidComplemento && resultado.uuidComplemento.trim().length > 0) {
          window.alert(`✅ Complemento de pago timbrado exitosamente\nUUID: ${resultado.uuidComplemento}`);
        } else {
          window.alert('✅ Complemento de pago timbrado exitosamente');
        }

        const deseaEnviar = window.confirm('¿Deseas enviar el PDF del complemento al correo registrado?');
        if (deseaEnviar) {
          if (!uuidComplemento) {
            window.alert('⚠️ No se cuenta con UUID del complemento para enviar el PDF.');
          } else {
            try {
              const totalPagadoCalculado = payload.pagos.reduce(
                (acc, pago) => acc + (Number.isFinite(Number(pago.monto)) ? Number(pago.monto) : 0),
                0,
              );
              const monedaPrimerPago = payload.pagos[0]?.moneda ?? 'MXN';
              await pagosService.enviarComplementoPorCorreo({
                uuidComplemento,
                facturaUuid: formData.facturaUuid.trim(),
                correoReceptor: formData.correoReceptor.trim(),
                serieComplemento: resultado.serieComplemento ?? undefined,
                folioComplemento: resultado.folioComplemento ?? undefined,
                fechaTimbrado: resultado.fechaTimbrado ?? undefined,
                rfcReceptor: resultado.rfcReceptor ?? undefined,
                rfcEmisor: resultado.rfcEmisor ?? undefined,
                nombreReceptor: resultado.rfcReceptor ?? undefined,
                nombreEmisor: resultado.rfcEmisor ?? undefined,
                metodoCfdi: 'PPD',
                formaCfdi: '99',
                totalPagado: resultado.totalPagado ?? totalPagadoCalculado,
                moneda: monedaPrimerPago,
                pagos: payload.pagos,
              });
              window.alert(`📧 Complemento de pago enviado al correo: ${formData.correoReceptor.trim()}`);
            } catch (envioError) {
              const mensajeEnvio =
                envioError instanceof Error ? envioError.message : 'No se pudo enviar el correo.';
              window.alert(`⚠️ Error al enviar el complemento por correo: ${mensajeEnvio}`);
            }
          }
        }
        if (typeof resultado.facturaId === 'number') {
          setFormData((prev) => ({
            ...prev,
            facturaId: String(resultado.facturaId),
          }));
        }
        // Guardar UUID del complemento preparado y datos para acciones posteriores
        if (uuidComplemento) {
          setUuidComplementoPreparado(uuidComplemento);
          setPagosPreparados([...pagos]); // Guardar copia de los pagos antes de limpiarlos
          setFacturaUuidPreparada(formData.facturaUuid.trim());
          setXmlComplementoTimbrado(resultado.xmlTimbrado || null);
        }
        
        setPagos([]);
        setPagoDraft(initialPago);
        setSelectedPagoId(null);
      } else {
        const erroresResp = resultado.errors && resultado.errors.length > 0
          ? resultado.errors
          : [resultado.message || 'No se pudo registrar el complemento de pagos.'];
        setErrorMessages(erroresResp);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'No se pudo registrar el complemento de pagos.';
      setErrorMessages([message]);
    } finally {
      setIsSubmitting(false);
    }
  }, [formData.facturaId, formData.facturaUuid, formData.usuarioRegistro, formData.correoReceptor, pagos, resetAlerts, validarFormulario]);

  const handleGenerarPdf = useCallback(async () => {
    if (!uuidComplementoPreparado) {
      window.alert('⚠️ Primero debes preparar el complemento para generar el PDF.');
      return;
    }

    try {
      setIsGenerandoPdf(true);
      resetAlerts();
      
      const response = await fetch(apiUrl(`/consulta-facturas/descargar-pdf/${uuidComplementoPreparado}`));
      
      if (!response.ok) {
        throw new Error('No se pudo generar el PDF del complemento.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ComplementoPago-${uuidComplementoPreparado}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccessMessage('PDF generado y descargado correctamente.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al generar el PDF.';
      setErrorMessages([message]);
      window.alert(`⚠️ ${message}`);
    } finally {
      setIsGenerandoPdf(false);
    }
  }, [uuidComplementoPreparado, xmlComplementoTimbrado, resetAlerts]);

  const handleGenerarXml = useCallback(async () => {
    if (!uuidComplementoPreparado) {
      window.alert('⚠️ Primero debes preparar el complemento para generar el XML.');
      return;
    }

    try {
      setIsGenerandoXml(true);
      resetAlerts();

      if (xmlComplementoTimbrado) {
        const blob = new Blob([xmlComplementoTimbrado], { type: 'application/xml;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `ComplementoPago-${uuidComplementoPreparado}.xml`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        setSuccessMessage('XML generado y descargado correctamente.');
        return;
      }
      
      const response = await fetch(apiUrl(`/consulta-facturas/timbrado/status/${uuidComplementoPreparado}`));
      
      if (!response.ok) {
        throw new Error('No se pudo generar el XML del complemento.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `ComplementoPago-${uuidComplementoPreparado}.xml`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccessMessage('XML generado y descargado correctamente.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al generar el XML.';
      setErrorMessages([message]);
      window.alert(`⚠️ ${message}`);
    } finally {
      setIsGenerandoXml(false);
    }
  }, [uuidComplementoPreparado, resetAlerts]);

  const handleEnviarPorCorreo = useCallback(async () => {
    if (!uuidComplementoPreparado) {
      window.alert('⚠️ Primero debes preparar el complemento para enviarlo por correo.');
      return;
    }

    if (!formData.correoReceptor || !formData.correoReceptor.trim()) {
      window.alert('⚠️ El campo "Correo del receptor" es obligatorio para enviar por correo.');
      return;
    }

    if (pagosPreparados.length === 0) {
      window.alert('⚠️ No hay información de pagos disponible. Debes preparar el complemento primero.');
      return;
    }

    try {
      setIsEnviandoCorreo(true);
      resetAlerts();
      
      // Usar los pagos preparados (guardados cuando se preparó el complemento)
      const totalPagadoCalculado = pagosPreparados.reduce(
        (acc, pago) => acc + (Number.isFinite(Number(pago.monto)) ? Number(pago.monto) : 0),
        0,
      );
      const monedaPrimerPago = pagosPreparados[0]?.moneda ?? 'MXN';
      
      await pagosService.enviarComplementoPorCorreo({
        uuidComplemento: uuidComplementoPreparado,
        facturaUuid: facturaUuidPreparada || formData.facturaUuid.trim(),
        correoReceptor: formData.correoReceptor.trim(),
        serieComplemento: undefined,
        folioComplemento: undefined,
        fechaTimbrado: undefined,
        rfcReceptor: undefined,
        rfcEmisor: undefined,
        nombreReceptor: undefined,
        nombreEmisor: undefined,
        metodoCfdi: 'PPD',
        formaCfdi: '99',
        totalPagado: totalPagadoCalculado,
        moneda: monedaPrimerPago,
        pagos: pagosPreparados.map((pago) => ({
          fechaPago: pago.fechaPago,
          formaPago: pago.formaPago,
          moneda: pago.moneda,
          monto: Number(pago.monto),
        })),
      });
      
      setSuccessMessage(`Correo enviado exitosamente a ${formData.correoReceptor.trim()}`);
      window.alert(`📧 Complemento de pago enviado al correo: ${formData.correoReceptor.trim()}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al enviar por correo.';
      setErrorMessages([message]);
      window.alert(`⚠️ ${message}`);
    } finally {
      setIsEnviandoCorreo(false);
    }
  }, [uuidComplementoPreparado, formData.correoReceptor, formData.facturaUuid, pagosPreparados, facturaUuidPreparada, resetAlerts]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Complemento de Pagos (REP)
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Registra pagos relacionados a CFDI emitidos y prepara la información para timbrar un complemento de pago.
        </p>
      </div>

      {(errorMessages.length > 0 || successMessage) && (
        <div>
          {errorMessages.length > 0 && (
            <div className="mb-2 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500 dark:bg-red-900/30 dark:text-red-200">
              <p className="font-semibold">Corrige los siguientes puntos:</p>
              <ul className="list-disc pl-5">
                {errorMessages.map((mensaje) => (
                  <li key={mensaje}>{mensaje}</li>
                ))}
              </ul>
            </div>
          )}
          {successMessage && (
            <div className="rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700 dark:border-green-500 dark:bg-green-900/30 dark:text-green-200">
              {successMessage}
            </div>
          )}
        </div>
      )}

      <Card title="Factura a relacionar">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[2fr_auto]">
          <FormField
            label="UUID de factura"
            name="facturaUuid"
            value={formData.facturaUuid}
            onChange={handleFormChange}
            placeholder="Ej. 123e4567-e89b-12d3-a456-426614174000"
            required
          />
          <Button
            className="self-end"
            variant="secondary"
            type="button"
            onClick={handleBuscarFactura}
            disabled={isSearchingFactura || !formData.facturaUuid.trim()}
          >
            {isSearchingFactura ? 'Buscando…' : 'Buscar factura'}
          </Button>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Ingresa el UUID del CFDI original. Al buscar, el sistema obtendrá el `ID_FACTURA` correspondiente
          para registrar el pago en la tabla `PAGOS`.
        </p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          {formData.facturaId
            ? `ID_FACTURA localizado: ${formData.facturaId}`
            : 'ID_FACTURA aún no establecido. Realiza la búsqueda para obtenerlo.'}
        </p>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          El UUID del CFDI de pago lo generará el PAC al timbrar el complemento; no es necesario capturarlo en esta etapa.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Correo del receptor"
            name="correoReceptor"
            type="email"
            value={formData.correoReceptor}
            onChange={handleFormChange}
            placeholder="cliente@correo.com"
            required
          />
        </div>
      </Card>

      <Card title="Detalle del pago">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label="Fecha de pago"
            name="fechaPago"
            type="date"
            value={pagoDraft.fechaPago}
            onChange={handlePagoInputChange}
            required
          />
          <SelectField
            label="Forma de pago"
            name="formaPago"
            value={pagoDraft.formaPago}
            onChange={handlePagoInputChange}
            options={MEDIO_PAGO_OPTIONS}
            required
          />
          <SelectField
            label="Moneda"
            name="moneda"
            value={pagoDraft.moneda}
            onChange={handlePagoInputChange}
            options={MONEDA_OPTIONS}
            required
          />
          <FormField
            label="Monto pagado"
            name="monto"
            type="number"
            value={pagoDraft.monto}
            onChange={handlePagoInputChange}
            required
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={handleAgregarPago}>
            {selectedPagoId ? 'Actualizar pago' : 'Agregar pago'}
          </Button>
          <Button
            variant="neutral"
            onClick={() => {
              setPagoDraft(initialPago);
              setSelectedPagoId(null);
              resetAlerts();
            }}
          >
            Limpiar captura
          </Button>
        </div>
      </Card>

      <Card title="Pagos registrados">
        {pagos.length === 0 ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            No hay pagos agregados. Captura la información y presiona &quot;Agregar pago&quot; para listarlos aquí.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Fecha
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Forma
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Moneda
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                    Monto
                  </th>
                  <th className="px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {pagos.map((pago) => (
                  <tr key={pago.id} className="bg-white dark:bg-gray-800">
                    <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
                      {pago.fechaPago}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
                      {pago.formaPago}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
                      {pago.moneda}
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-200">
                      {Number.parseFloat(pago.monto || '0').toLocaleString('es-MX', {
                        style: 'currency',
                        currency: pago.moneda || 'MXN',
                      })}
                    </td>
                    <td className="px-3 py-2 text-sm text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="neutral"
                          size="sm"
                          onClick={() => handleSeleccionarPago(pago.id)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleEliminarPago(pago.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Totales por moneda:{' '}
            {Object.keys(totalesPorMoneda).length === 0
              ? '—'
              : Object.entries(totalesPorMoneda)
                  .map(([moneda, monto]) =>
                    monto.toLocaleString('es-MX', {
                      style: 'currency',
                      currency: moneda || 'MXN',
                    }),
                  )
                  .join(' • ')}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button variant="neutral" onClick={handleLimpiarFormulario}>
              Reiniciar formulario
            </Button>
            <Button onClick={handleEnviarComplemento} disabled={isSubmitting}>
              {isSubmitting ? 'Preparando…' : 'Preparar complemento'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleGenerarPdf}
              disabled={isGenerandoPdf || !uuidComplementoPreparado}
              title={!uuidComplementoPreparado ? 'Primero debes preparar el complemento' : 'Generar PDF del complemento'}
            >
              {isGenerandoPdf ? 'Generando PDF…' : 'Generar PDF'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleGenerarXml}
              disabled={isGenerandoXml || !uuidComplementoPreparado}
              title={!uuidComplementoPreparado ? 'Primero debes preparar el complemento' : 'Generar XML del complemento'}
            >
              {isGenerandoXml ? 'Generando XML…' : 'Generar XML'}
            </Button>
            <Button
              variant="secondary"
              onClick={handleEnviarPorCorreo}
              disabled={isEnviandoCorreo || !uuidComplementoPreparado || !formData.correoReceptor.trim()}
              title={!uuidComplementoPreparado ? 'Primero debes preparar el complemento' : !formData.correoReceptor.trim() ? 'El correo del receptor es obligatorio' : 'Enviar complemento por correo'}
            >
              {isEnviandoCorreo ? 'Enviando…' : 'Enviar por correo'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FacturacionComplementoPagosPage;

