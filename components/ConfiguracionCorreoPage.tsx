import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { Button } from './Button';
import { ProtectedMessageEditor } from './ProtectedMessageEditor';
import { configuracionCorreoService } from '../services/configuracionCorreoService';
import formatoCorreoService from '../services/formatoCorreoService';

interface ConfiguracionCorreo {
  asunto: string;
  mensaje: string;
  mensajePersonalizado?: string;
  esPersonalizado: boolean;
}

interface FormatoCorreo {
  tipoFuente: string;
  tamanoFuente: number;
  esCursiva: boolean;
  esSubrayado: boolean;
  esNegrita: boolean;
  colorTexto: string;
}

export const ConfiguracionCorreoPage: React.FC = () => {
  const [configuracion, setConfiguracion] = useState<ConfiguracionCorreo>({
    asunto: '',
    mensaje: '',
    mensajePersonalizado: '',
    esPersonalizado: false
  });
  
  const [configuracionOriginal, setConfiguracionOriginal] = useState<ConfiguracionCorreo>({
    asunto: '',
    mensaje: '',
    mensajePersonalizado: '',
    esPersonalizado: false
  });

  const [formatoCorreo, setFormatoCorreo] = useState<FormatoCorreo>({
    tipoFuente: 'Arial',
    tamanoFuente: 14,
    esCursiva: false,
    esSubrayado: false,
    esNegrita: false,
    colorTexto: '#000000'
  });
  const [formatoOriginal, setFormatoOriginal] = useState<FormatoCorreo>({
    tipoFuente: 'Arial',
    tamanoFuente: 14,
    esCursiva: false,
    esSubrayado: false,
    esNegrita: false,
    colorTexto: '#000000'
  });
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error'; texto: string } | null>(null);

  useEffect(() => {
    cargarConfiguraciones();
  }, []);

  const cargarConfiguraciones = async () => {
    try {
      setCargando(true);
      
      // Cargar configuración de mensaje
      const configMensaje = await configuracionCorreoService.obtenerConfiguracionMensaje();
      if (configMensaje.exitoso && configMensaje.configuracion) {
        const nuevaConfig = {
          asunto: configMensaje.configuracion.asunto || 'Factura Electrónica - {facturaInfo}',
          mensaje: configMensaje.configuracion.mensaje || '',
          esPersonalizado: configMensaje.configuracion.esPersonalizado || false
        };
        setConfiguracion(nuevaConfig);
        setConfiguracionOriginal(nuevaConfig);
      }

      // Cargar configuración de formato
      const configFormatoResponse = await formatoCorreoService.obtenerConfiguracionActiva();
      if (configFormatoResponse.exitoso && configFormatoResponse.configuracion) {
        const nuevoFormato = {
          tipoFuente: configFormatoResponse.configuracion.tipoFuente,
          tamanoFuente: configFormatoResponse.configuracion.tamanoFuente,
          esCursiva: configFormatoResponse.configuracion.esCursiva,
          esSubrayado: configFormatoResponse.configuracion.esSubrayado,
          colorTexto: configFormatoResponse.configuracion.colorTexto
        };
        setFormatoCorreo(nuevoFormato);
        setFormatoOriginal(nuevoFormato);
      }
    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
      setMensaje({ tipo: 'error', texto: 'Error al cargar las configuraciones' });
    } finally {
      setCargando(false);
    }
  };

  // Función para combinar el mensaje protegido con el mensaje personalizado
  const combinarMensajes = () => {
    let mensajeCombinado = configuracion.mensaje;
    
    // Si hay un mensaje personalizado, añadirlo después del mensaje principal
    if (configuracion.mensajePersonalizado && configuracion.mensajePersonalizado.trim() !== '') {
      mensajeCombinado += '\n\n' + configuracion.mensajePersonalizado;
    }
    
    return mensajeCombinado;
  };

  const handleGuardarConfiguracion = async () => {
    setGuardando(true);
    setMensaje(null);

    try {
      // Combinar los mensajes antes de guardar
      const mensajeCombinado = combinarMensajes();
      
      // Guardar configuración de mensaje y formato en una sola petición
      const responseMensaje = await configuracionCorreoService.guardarConfiguracionMensaje({
        asunto: configuracion.asunto,
        mensaje: mensajeCombinado,
        esPersonalizado: configuracion.esPersonalizado,
        formatoCorreo: formatoCorreo
      });

      if (responseMensaje.exitoso) {
        setConfiguracionOriginal({ ...configuracion });
        setFormatoOriginal({ ...formatoCorreo });
        setMensaje({ tipo: 'success', texto: 'Configuraciones guardadas correctamente' });
        setTimeout(() => setMensaje(null), 3000);
      } else {
        let mensajeError = responseMensaje.mensaje || 'Error al guardar la configuración del mensaje';
        setMensaje({ tipo: 'error', texto: mensajeError });
      }
    } catch (error) {
      console.error('Error al guardar configuraciones:', error);
      setMensaje({ tipo: 'error', texto: 'Error al guardar las configuraciones' });
    } finally {
      setGuardando(false);
    }
  };

  const handleRestaurarPredeterminado = async () => {
    try {
      const response = await configuracionCorreoService.restaurarMensajePredeterminado();
      if (response.exitoso && response.configuracion) {
        const nuevaConfig = {
          asunto: response.configuracion.asunto || 'Factura Electrónica - {facturaInfo}',
          mensaje: response.configuracion.mensaje || '',
          esPersonalizado: false
        };
        setConfiguracion(nuevaConfig);
        setMensaje({ tipo: 'success', texto: 'Mensaje predeterminado restaurado' });
        setTimeout(() => setMensaje(null), 3000);
      }
    } catch (error) {
      console.error('Error al restaurar mensaje predeterminado:', error);
      setMensaje({ tipo: 'error', texto: 'Error al restaurar el mensaje predeterminado' });
    }
  };

  const handleCancelar = () => {
    setConfiguracion({ ...configuracionOriginal });
    setFormatoCorreo({ ...formatoOriginal });
    setMensaje(null);
  };

  const hayChangios = () => {
    return configuracion.asunto !== configuracionOriginal.asunto ||
           configuracion.mensaje !== configuracionOriginal.mensaje ||
           configuracion.mensajePersonalizado !== configuracionOriginal.mensajePersonalizado ||
           configuracion.esPersonalizado !== configuracionOriginal.esPersonalizado ||
           formatoCorreo.tipoFuente !== formatoOriginal.tipoFuente ||
           formatoCorreo.tamanoFuente !== formatoOriginal.tamanoFuente ||
           formatoCorreo.esCursiva !== formatoOriginal.esCursiva ||
           formatoCorreo.esSubrayado !== formatoOriginal.esSubrayado ||
           formatoCorreo.esNegrita !== formatoOriginal.esNegrita ||
           formatoCorreo.colorTexto !== formatoOriginal.colorTexto;
  };


  if (cargando) {
    return (
      <div className="animate-fadeIn p-6">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
          Configuración de Mensajes de Correo
        </h2>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando configuración...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
        Configuración de Mensajes de Correo
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel de configuración */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Configurar Mensaje de Facturación
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mensaje Principal (Datos de Factura - Protegido)
              </label>
              <ProtectedMessageEditor
                value={configuracion.mensaje}
                onChange={(value) => setConfiguracion({
                  ...configuracion, 
                  mensaje: value,
                  esPersonalizado: true
                })}
                placeholder="Contenido del mensaje que se enviará con las facturas"
                rows={8}
                required
                isProtected={true}
              />
            </div>
            
            <div className="space-y-2 mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Mensaje Personalizado (Opcional)
              </label>
              <textarea
                value={configuracion.mensajePersonalizado || ''}
                onChange={(e) => setConfiguracion({
                  ...configuracion, 
                  mensajePersonalizado: e.target.value,
                  esPersonalizado: true
                })}
                placeholder="Añada un mensaje personalizado (ej. Feliz Navidad, Felices Fiestas, etc.)"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Selector de tipo de fuente */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tipo de fuente
              </label>
              <select
                value={formatoCorreo.tipoFuente}
                onChange={e => {
                  setFormatoCorreo({
                    ...formatoCorreo,
                    tipoFuente: e.target.value
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="Arial">Arial</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Courier New">Courier New</option>
              </select>
            </div>

            {/* Input para tamaño de fuente */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tamaño de fuente (px)
              </label>
              <input
                type="number"
                min={8}
                max={48}
                step={1}
                value={formatoCorreo.tamanoFuente}
                onChange={e => {
                  const value = Number(e.target.value);
                  setFormatoCorreo({
                    ...formatoCorreo,
                    tamanoFuente: Number.isFinite(value) && value > 0 ? value : 14
                  });
                }}
                className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">Entre 8 y 48 px. Si se deja vacío o inválido, se usará 14 px por defecto.</span>
            </div>
            
            {/* Opciones de estilo de texto */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Estilo de texto
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formatoCorreo.esNegrita}
                    onChange={e => {
                      setFormatoCorreo({
                        ...formatoCorreo,
                        esNegrita: e.target.checked
                      });
                    }}
                    className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-sm font-bold">Negrita</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formatoCorreo.esCursiva}
                    onChange={e => {
                      setFormatoCorreo({
                        ...formatoCorreo,
                        esCursiva: e.target.checked
                      });
                    }}
                    className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-sm italic">Cursiva</span>
                </label>
                
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    checked={formatoCorreo.esSubrayado}
                    onChange={e => {
                      setFormatoCorreo({
                        ...formatoCorreo,
                        esSubrayado: e.target.checked
                      });
                    }}
                    className="form-checkbox h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-sm underline">Subrayado</span>
                </label>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span className={`inline-block w-2 h-2 rounded-full ${configuracion.esPersonalizado ? 'bg-blue-500' : 'bg-green-500'}`}></span>
              <span>
                {configuracion.esPersonalizado ? 'Mensaje personalizado' : 'Mensaje predeterminado del sistema'}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="primary"
                onClick={handleGuardarConfiguracion}
                disabled={guardando || !hayChangios()}
                className="flex-1"
              >
                {guardando ? 'Guardando...' : 'Guardar Configuración'}
              </Button>
              
              {hayChangios() && (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleCancelar}
                  className="flex-1"
                >
                  Cancelar
                </Button>
              )}
            </div>
            
            <Button
              type="button"
              variant="outline"
              onClick={handleRestaurarPredeterminado}
              className="w-full"
            >
              Restaurar Mensaje Predeterminado
            </Button>
          </div>
        </Card>

        {/* Panel de vista previa */}
        <Card>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Vista Previa del Mensaje
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Vista previa del mensaje final:
              </label>
              <div 
                className="p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-sm whitespace-pre-wrap min-h-[200px]"
                style={{
                  fontFamily: formatoCorreo.tipoFuente,
                  fontSize: `${formatoCorreo.tamanoFuente}px`,
                  fontStyle: formatoCorreo.esCursiva ? 'italic' : 'normal',
                  color: formatoCorreo.colorTexto
                }}
              >
                {combinarMensajes() || 'Sin mensaje configurado'}
              </div>
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <p className="font-medium mb-2">Variables disponibles:</p>
              <div className="space-y-1">
                <div><code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{'{facturaInfo}'}</code> - Serie y folio de la factura</div>
                <div><code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{'{serie}'}</code> - Serie de la factura</div>
                <div><code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{'{folio}'}</code> - Folio de la factura</div>
                <div><code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{'{uuid}'}</code> - UUID de la factura</div>
                <div><code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">{'{rfcEmisor}'}</code> - RFC del emisor</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {mensaje && (
        <div className={`mt-4 p-3 rounded-md text-sm ${
          mensaje.tipo === 'success' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
        }`}>
          {mensaje.texto}
        </div>
      )}
    </div>
  );
};