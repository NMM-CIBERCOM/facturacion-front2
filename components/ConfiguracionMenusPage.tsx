import React, { useState, useEffect, useContext } from 'react';
import { FaGripVertical, FaSpinner, FaCog, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import { ThemeContext } from '../App';
import { Card } from './Card';

// Mapeo de nombres de BD a nombres de UI para consistencia
const mapeoPantallasUI: { [key: string]: string } = {
  'Boletas': 'Tickets',
  'Tickets': 'Tickets',
  // Otros mapeos si es necesario
};

interface MenuConfig {
  idConfig: number;
  idPerfil: number;
  menuLabel: string;
  menuPath: string | null;
  isVisible: boolean;
  orden: number;
  nombrePerfil: string;
  children?: MenuConfig[];
}

interface Perfil {
  idPerfil: number;
  nombrePerfil: string;
}

interface PantallaConfig {
  idConfig: number;
  idPerfil: number;
  menuLabel: string;
  menuPath: string;
  isVisible: boolean;
  orden: number;
  parentLabel: string;
}

const ConfiguracionMenusPage: React.FC = () => {
  const { customColors } = useContext(ThemeContext);
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [configuraciones, setConfiguraciones] = useState<MenuConfig[]>([]);
  const [pantallasConfig, setPantallasConfig] = useState<PantallaConfig[]>([]);
  const [perfilSeleccionado, setPerfilSeleccionado] = useState<number | null>(null);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pestañaSeleccionada, setPestañaSeleccionada] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: 'success' | 'error', texto: string } | null>(null);

  useEffect(() => {
    cargarPerfiles();
  }, []);

  const cargarPerfiles = async () => {
    try {
      setIsLoading(true);
      setMensaje(null); // Limpiar mensajes previos
      const response = await fetch('http://localhost:8080/api/menu-config/perfiles');
      
      if (!response.ok) {
        let errorMessage = 'Error al cargar perfiles';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      
      if (!Array.isArray(data)) {
        throw new Error('El servidor devolvió un formato de datos inválido');
      }
      
      setPerfiles(data);
      if (data.length > 0) {
        setPerfilSeleccionado(data[0].idPerfil);
        cargarConfiguraciones(data[0].idPerfil);
      } else {
        setMensaje({ tipo: 'error', texto: 'No se encontraron perfiles disponibles' });
      }
    } catch (error) {
      console.error('Error al cargar perfiles:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar los perfiles. Verifique que el servidor esté ejecutándose.';
      setMensaje({ tipo: 'error', texto: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const cargarConfiguraciones = async (idPerfil: number) => {
    try {
      setIsLoading(true);
      // Cargar solo pestañas principales (MENU_PATH es NULL)
      const responsePestañas = await fetch(`http://localhost:8080/api/menu-config/perfil/${idPerfil}`);
      if (!responsePestañas.ok) {
        let errorMessage = 'Error al cargar pestañas';
        try {
          const errorData = await responsePestañas.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = `Error ${responsePestañas.status}: ${responsePestañas.statusText}`;
        }
        throw new Error(errorMessage);
      }
      const pestañasData = await responsePestañas.json();
      
      // Filtrar solo las pestañas principales (sin MENU_PATH)
      const pestañasPrincipales = Array.isArray(pestañasData) 
        ? pestañasData.filter((item: any) => !item.menuPath)
        : [];
      console.log('Pestañas principales:', pestañasPrincipales);
      setConfiguraciones(pestañasPrincipales);

      // Cargar pantallas específicas (con MENU_PATH)
      const responsePantallas = await fetch(`http://localhost:8080/api/menu-config/pantallas/${idPerfil}`);
      if (!responsePantallas.ok) {
        let errorMessage = 'Error al cargar pantallas';
        try {
          const errorData = await responsePantallas.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = `Error ${responsePantallas.status}: ${responsePantallas.statusText}`;
        }
        throw new Error(errorMessage);
      }
      const pantallasData = await responsePantallas.json();
      console.log('Pantallas específicas:', pantallasData);
      setPantallasConfig(Array.isArray(pantallasData) ? pantallasData : []);
    } catch (error) {
      console.error('Error al cargar configuraciones:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar las configuraciones';
      setMensaje({ tipo: 'error', texto: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePerfilChange = (idPerfil: number) => {
    setPerfilSeleccionado(idPerfil);
    cargarConfiguraciones(idPerfil);
  };

  const toggleVisibilidad = async (idConfig: number, isVisible: boolean) => {
    try {
      setIsSaving(true);
      setMensaje(null); // Limpiar mensajes previos
      
      const response = await fetch(`http://localhost:8080/api/menu-config/visibilidad/${idConfig}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Usuario': 'admin'
        },
        body: JSON.stringify({ isVisible })
      });

      if (!response.ok) {
        let errorMessage = 'Error al actualizar visibilidad';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.success) {
        // Actualizar el estado local
        setConfiguraciones(prev => 
          prev.map(config => 
            config.idConfig === idConfig 
              ? { ...config, isVisible } 
              : config
          )
        );
        
        // Si hay un perfil seleccionado, recargar las configuraciones para asegurar sincronización
        if (perfilSeleccionado) {
          await cargarConfiguraciones(perfilSeleccionado);
        }
        
        setMensaje({ tipo: 'success', texto: 'Visibilidad actualizada correctamente' });
        
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setMensaje(null);
        }, 3000);
      } else {
        setMensaje({ tipo: 'error', texto: data.message || 'Error al actualizar visibilidad' });
      }
    } catch (error) {
      console.error('Error al actualizar visibilidad:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la visibilidad';
      setMensaje({ tipo: 'error', texto: errorMessage });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVisibilidadPantalla = async (idConfig: number, isVisible: boolean) => {
    // Prevenir múltiples clics mientras se está guardando
    if (isSaving) {
      console.log('⏸️ Ya hay una operación en curso, ignorando clic');
      return;
    }
    
    try {
      setIsSaving(true);
      setMensaje(null); // Limpiar mensajes previos
      
      // Log para debug - CRÍTICO para verificar el valor que se envía
      console.log(`🔄 ACTUALIZANDO VISIBILIDAD - ID_CONFIG: ${idConfig}, isVisible: ${isVisible} (tipo: ${typeof isVisible})`);
      console.log(`📤 Valor booleano que se enviará: ${isVisible}`);
      console.log(`📤 Valor como string: ${String(isVisible)}`);
      
      // Asegurar que isVisible sea un booleano explícito
      const isVisibleBoolean = Boolean(isVisible);
      console.log(`📤 Valor booleano explícito: ${isVisibleBoolean}`);
      
      const requestBody = { isVisible: isVisibleBoolean };
      const requestBodyString = JSON.stringify(requestBody);
      console.log(`📤 Request body completo: ${requestBodyString}`);
      
      const response = await fetch(`http://localhost:8080/api/menu-config/pantalla-visibilidad/${idConfig}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Usuario': 'admin'
        },
        body: requestBodyString
      });

      console.log(`📡 Respuesta HTTP - Status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorMessage = 'Error al actualizar visibilidad de pantalla';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.error('❌ Error del backend:', errorData);
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
          console.error('❌ Error al parsear respuesta de error:', errorMessage);
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('📥 Respuesta completa del backend:', JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log(`✅ ÉXITO - ID_CONFIG: ${idConfig}, isVisible enviado: ${isVisibleBoolean}, isVisibleInt en BD: ${data.isVisibleInt}`);
        
        // Actualizar el estado local INMEDIATAMENTE
        setPantallasConfig(prev => {
          const updated = prev.map(config => 
            config.idConfig === idConfig 
              ? { ...config, isVisible: isVisibleBoolean } 
              : config
          );
          const updatedItem = updated.find(c => c.idConfig === idConfig);
          console.log('🔄 Estado local actualizado:', updatedItem);
          return updated;
        });
        
        // Disparar evento para que App.tsx recargue la configuración
        window.dispatchEvent(new CustomEvent('menuConfigUpdated'));
        localStorage.setItem('menuConfigUpdated', Date.now().toString());
        
        setMensaje({ tipo: 'success', texto: `Visibilidad actualizada: ${isVisibleBoolean ? 'Visible' : 'Oculto'}` });
        
        // Limpiar mensaje de éxito después de 3 segundos
        setTimeout(() => {
          setMensaje(null);
        }, 3000);
        
        // Recargar configuraciones en segundo plano (sin bloquear)
        if (perfilSeleccionado) {
          setTimeout(() => {
            cargarConfiguraciones(perfilSeleccionado, false).catch(error => {
              console.error('Error al recargar configuraciones:', error);
            });
          }, 500);
        }
      } else {
        console.error(`❌ FALLO - ID_CONFIG: ${idConfig}, mensaje: ${data.message}`);
        setMensaje({ tipo: 'error', texto: data.message || 'Error al actualizar visibilidad de pantalla' });
      }
    } catch (error) {
      console.error('❌ EXCEPCIÓN al actualizar visibilidad:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar la visibilidad de la pantalla';
      setMensaje({ tipo: 'error', texto: errorMessage });
    } finally {
      console.log('🔓 Finalizando - estableciendo isSaving en false');
      setIsSaving(false);
    }
  };


  const moverArriba = (index: number) => {
    if (index > 0) {
      const configuracionesOrdenadas = [...configuraciones];
      const temp = configuracionesOrdenadas[index];
      configuracionesOrdenadas[index] = configuracionesOrdenadas[index - 1];
      configuracionesOrdenadas[index - 1] = temp;
      
      // Actualizar órdenes
      configuracionesOrdenadas.forEach((config, i) => {
        config.orden = i + 1;
      });
      
      setConfiguraciones(configuracionesOrdenadas);
    }
  };

  const moverAbajo = (index: number) => {
    if (index < configuraciones.length - 1) {
      const configuracionesOrdenadas = [...configuraciones];
      const temp = configuracionesOrdenadas[index];
      configuracionesOrdenadas[index] = configuracionesOrdenadas[index + 1];
      configuracionesOrdenadas[index + 1] = temp;
      
      // Actualizar órdenes
      configuracionesOrdenadas.forEach((config, i) => {
        config.orden = i + 1;
      });
      
      setConfiguraciones(configuracionesOrdenadas);
    }
  };

  const abrirModalPantallas = (pestañaLabel: string) => {
    setPestañaSeleccionada(pestañaLabel);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setPestañaSeleccionada(null);
  };

  const getPantallasPorPestaña = (pestañaLabel: string) => {
    // Mapear nombres de pestañas a sus pantallas correspondientes
    const mapeoPestañas: { [key: string]: string[] } = {
      'Facturación': ['Artículos', 'Intereses', 'Carta Factura', 'Global', 'Monederos', 'Captura Libre', 'Cancelación Masiva', 'Nóminas'],
      'Consultas': ['Facturas', 'SKU', 'Boletas', 'Tickets'], // Incluir tanto 'Boletas' como 'Tickets' para compatibilidad
      'Administración': ['Empleados', 'Tiendas', 'Períodos Perfil', 'Períodos Plataforma', 'Kioscos', 'Excepciones', 'Secciones'],
      'Reportes Facturación Fiscal': [
        // 11 pantallas originales
        'Boletas No Auditadas',
        'Reporte Ingreso-Facturación',
        'Integración Factura Global',
        'Integración Clientes',
        'Facturación clientes posterior a Global',
        'Integración Sustitución CFDI',
        'Control de emisión de REP',
        'Reportes REPgcp',
        'Control de cambios',
        'Conciliación',
        'REPs Sustituidos (Fiscal)',
        // 19 pantallas nuevas
        'Reporte de Consulta Monederos',
        'Reporte de Ventas Máquina Corporativas Serely Polu',
        'Régimen de Facturación No Misma Boleta',
        'Doble Facturación Pendiente por Defencia',
        'Sustitución en Proceso',
        'Cancelación Sustitución de Facturación',
        'Saldo a Favor de Clientes',
        'Orden de Módulos y Facturación',
        'Consulta de Usuarios',
        'Consulta Tiendas de Total de Facturas Diarias',
        'Validación por Importe Intereses',
        'Conciliación Cambio de Sistema de Facturación',
        'Control de Complementos de Pago (REP) Generados por Ventas Corporativas',
        'Reporte por Factura de Mercancía de Monederos',
        'Ventas Corporativas vs SAT',
        'Captura Libre Complemento de Pago (REP)',
        'Conciliación Sistema de Facturación de Boletas vs SAT',
        'Reporte de Trazabilidad de Boletas Canceladas',
        'Estatus Actualizar SAT de CFDI por Petición'
      ],
      'Registro CFDI': [
        'Registro de Constancias'
      ],
      'Monitor': [
        'Gráficas',
        'Bitácora',
        'Disponibilidad',
        'Logs',
        'Permisos',
        'Decodificador'
      ],
      'Configuración': [
        'Configuración de Correo',
        'Configuración de Empresa',
        'Configuración de Temas',
        'Configuración de Menús'
      ]
    };

    const pantallasEsperadas = mapeoPestañas[pestañaLabel] || [];
    return pantallasConfig.filter(pantalla => 
      pantallasEsperadas.includes(pantalla.menuLabel)
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Configuración de Menús
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure qué menús son visibles para cada perfil de usuario
          </p>
        </div>

        {/* Mensaje de estado */}
        {mensaje && (
          <div className={`mb-6 p-4 rounded-lg flex items-center justify-between ${
            mensaje.tipo === 'success' 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}>
            <div className="flex-1">
              {mensaje.texto}
              {mensaje.tipo === 'error' && mensaje.texto.includes('perfiles') && (
                <p className="text-sm mt-2 opacity-90">
                  Verifique que el servidor backend esté ejecutándose en http://localhost:8080
                </p>
              )}
            </div>
            {mensaje.tipo === 'error' && mensaje.texto.includes('perfiles') && (
              <button
                onClick={() => cargarPerfiles()}
                disabled={isLoading}
                className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <FaSpinner className="animate-spin inline mr-2" />
                    Cargando...
                  </>
                ) : (
                  'Reintentar'
                )}
              </button>
            )}
          </div>
        )}

        {/* Selector de Perfil */}
        <Card title="Seleccionar Perfil" className="mb-8">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Perfil de Usuario
              </label>
              <select
                value={perfilSeleccionado || ''}
                onChange={(e) => handlePerfilChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isLoading}
              >
                <option value="">Seleccionar perfil...</option>
                {perfiles.map((perfil) => (
                  <option key={perfil.idPerfil} value={perfil.idPerfil}>
                    {perfil.nombrePerfil}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Configuración de Menús */}
        {perfilSeleccionado && (
          <Card title={`Configuración de Menús - ${perfiles.find(p => p.idPerfil === perfilSeleccionado)?.nombrePerfil}`}>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <FaSpinner className="animate-spin h-8 w-8 text-blue-500" />
                <span className="ml-2 text-gray-600 dark:text-gray-400">Cargando configuraciones...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {configuraciones.map((config, index) => {
                  const pantallasDePestaña = getPantallasPorPestaña(config.menuLabel);
                  
                  return (
                    <div key={config.idConfig} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center space-x-4">
                        {/* Botones de orden */}
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => moverArriba(index)}
                            disabled={index === 0 || isSaving}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaGripVertical className="h-4 w-4 rotate-90" />
                          </button>
                          <button
                            onClick={() => moverAbajo(index)}
                            disabled={index === configuraciones.length - 1 || isSaving}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaGripVertical className="h-4 w-4 -rotate-90" />
                          </button>
                        </div>

                        {/* Botón para configurar pantallas */}
                        <button
                          onClick={() => abrirModalPantallas(config.menuLabel)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                          disabled={pantallasDePestaña.length === 0}
                          title="Configurar pantallas"
                        >
                          <FaCog className={`h-4 w-4 ${pantallasDePestaña.length > 0 ? '' : 'opacity-50'}`} />
                        </button>

                        {/* Información del menú */}
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                            {config.menuLabel}
                          </h3>
                          {config.menuPath && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Ruta: {config.menuPath}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500">
                            Orden: {config.orden} | Pantallas: {pantallasDePestaña.length}
                          </p>
                        </div>
                      </div>

                      {/* Toggle de visibilidad */}
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {config.isVisible ? 'Visible' : 'Oculto'}
                        </span>
                        <button
                          onClick={() => toggleVisibilidad(config.idConfig, !config.isVisible)}
                          disabled={isSaving}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            config.isVisible
                              ? 'bg-blue-600'
                              : 'bg-gray-200 dark:bg-gray-700'
                          } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                          style={{
                            backgroundColor: config.isVisible ? customColors.primary : undefined
                          }}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              config.isVisible ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}

                {configuraciones.length === 0 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No hay configuraciones disponibles para este perfil.
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Información adicional */}
        <Card title="Información" className="mt-8">
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p>• <strong>Pestañas:</strong> Controla la visibilidad de las pestañas principales en el sidebar</p>
            <p>• <strong>Pantallas:</strong> Controla qué pantallas específicas están disponibles dentro de cada pestaña</p>
            <p>• <strong>Visible:</strong> El elemento será mostrado para este perfil</p>
            <p>• <strong>Oculto:</strong> El elemento no será visible para este perfil</p>
            <p>• <strong>Orden:</strong> Use los botones de flecha para cambiar el orden de los menús</p>
            <p>• <strong>Configurar:</strong> Haga clic en el engranaje para configurar las pantallas específicas</p>
            <p>• <strong>Nota:</strong> Los cambios se aplican inmediatamente y afectan a todos los usuarios con ese perfil</p>
          </div>
        </Card>

        {/* Modal para configurar pantallas */}
        {modalAbierto && pestañaSeleccionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
              {/* Header del Modal */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Configurar Pantallas - {pestañaSeleccionada}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Gestiona la visibilidad de las pantallas específicas dentro de esta pestaña
                  </p>
                </div>
                <button
                  onClick={cerrarModal}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <FaTimes className="h-5 w-5" />
                </button>
              </div>

              {/* Contenido del Modal */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {(() => {
                  const pantallasDePestaña = getPantallasPorPestaña(pestañaSeleccionada);
                  console.log(`Pantallas para ${pestañaSeleccionada}:`, pantallasDePestaña);
                  
                  if (pantallasDePestaña.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <FaCog className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>No hay pantallas configuradas para esta pestaña.</p>
                        <p className="text-xs mt-2">Pestaña: {pestañaSeleccionada}</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {pantallasDePestaña.map((pantalla) => (
                        <div
                          key={pantalla.idConfig}
                          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              {pantalla.isVisible ? (
                                <FaEye className="h-4 w-4 text-green-500" />
                              ) : (
                                <FaEyeSlash className="h-4 w-4 text-gray-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {mapeoPantallasUI[pantalla.menuLabel] || pantalla.menuLabel}
                              </h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Ruta: {pantalla.menuPath}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {pantalla.isVisible ? 'Visible' : 'Oculto'}
                            </span>
                            <button
                              onClick={() => toggleVisibilidadPantalla(pantalla.idConfig, !pantalla.isVisible)}
                              disabled={isSaving}
                              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                                pantalla.isVisible
                                  ? 'bg-blue-600'
                                  : 'bg-gray-200 dark:bg-gray-600'
                              } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                              style={{
                                backgroundColor: pantalla.isVisible ? customColors.primary : undefined
                              }}
                            >
                              <span
                                className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                  pantalla.isVisible ? 'translate-x-5' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Footer del Modal */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700">
                <button
                  onClick={cerrarModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded-md hover:bg-gray-50 dark:hover:bg-gray-500 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConfiguracionMenusPage;
