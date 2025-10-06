import axios from 'axios';

const API_URL = 'http://localhost:8080/api/formato-correo';

export interface FormatoCorreoConfig {
  id?: number;
  tipoFuente: string;
  tamanoFuente: number;
  esCursiva: boolean;
  esSubrayado: boolean;
  colorTexto: string;
  activo?: boolean;
}

export interface FormatoCorreoDto {
  id?: number;
  tipoFuente: string;
  tamanoFuente: number;
  esCursiva: boolean;
  colorTexto: string;
  activo: boolean;
  fechaCreacion?: string;
  fechaModificacion?: string;
}

export interface FormatoCorreoResponse {
  exitoso: boolean;
  mensaje?: string;
  configuracion?: FormatoCorreoConfig;
}

const formatoCorreoService = {
  obtenerConfiguracionActiva: async (): Promise<FormatoCorreoResponse> => {
    try {
      // Validar conexión al servidor
      const response = await axios.get<FormatoCorreoDto>(`${API_URL}/activa`);
      
      if (!response.data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      return {
        exitoso: true,
        configuracion: {
          id: response.data.id,
          tipoFuente: response.data.tipoFuente,
          tamañoFuente: response.data.tamanoFuente,
          esCursiva: response.data.esCursiva,
          colorTexto: response.data.colorTexto,
          activo: response.data.activo
        }
      };
    } catch (error) {
      console.error('Error al obtener configuración activa:', error);
      let mensajeError = 'Error al obtener la configuración activa';
      
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return {
            exitoso: true,
            configuracion: {
              tipoFuente: 'Arial',
              tamanoFuente: 14,
              esCursiva: false,
              colorTexto: '#000000',
              activo: true
            }
          };
        }
        
        if (error.response?.data?.message) {
          mensajeError = error.response.data.message;
        } else if (error.message) {
          mensajeError = error.message;
        }
      } else if (error instanceof Error) {
        mensajeError = error.message;
      }
      
      return {
        exitoso: false,
        mensaje: mensajeError,
        configuracion: {
          tipoFuente: 'Arial',
          tamanoFuente: 14,
          esCursiva: false,
          colorTexto: '#000000',
          activo: true
        }
      };
    }
  },

  guardarConfiguracionFormato: async (config: FormatoCorreoConfig): Promise<FormatoCorreoResponse> => {
    try {
      // Validar datos de entrada
      if (!config.tipoFuente?.trim()) {
        return {
          exitoso: false,
          mensaje: 'El tipo de fuente es requerido'
        };
      }
      // No bloquear por tamaño inválido: el backend validará y aquí aplicamos un valor por defecto seguro
      const tamano = Number(config.tamanoFuente);
      const tamanoSeguro = Number.isFinite(tamano) && tamano > 0 ? tamano : 14;
      if (!Number.isFinite(tamano) || tamano <= 0) {
        console.warn('tamanoFuente inválido recibido en frontend, se usará valor por defecto 14:', config.tamanoFuente);
      }
      if (!config.colorTexto?.match(/^#[0-9A-Fa-f]{6}$/)) {
        return {
          exitoso: false,
          mensaje: 'El color de texto debe ser un código hexadecimal válido (ej: #000000)'
        };
      }

      // Asegurarse de que el campo tamanoFuente (sin ñ) se envía correctamente al backend
      const backendConfig = {
        tipoFuente: config.tipoFuente,
        tamanoFuente: tamanoSeguro,
        esCursiva: config.esCursiva,
        esSubrayado: config.esSubrayado,
        colorTexto: config.colorTexto,
        activo: true
      };

      try {
        // Validar conexión al servidor
        // Asegurarse de que el objeto enviado al backend es correcto
        console.log('Enviando al backend:', JSON.stringify(backendConfig));
        const response = await axios.post<FormatoCorreoDto>(`${API_URL}`, backendConfig);
        if (!response.data) {
          return {
            exitoso: false,
            mensaje: 'No se recibió respuesta del servidor'
          };
        }
        // Convertir la respuesta del backend a nuestro formato
        return {
          exitoso: true,
          mensaje: 'Configuración guardada correctamente',
          configuracion: {
            tipoFuente: response.data.tipoFuente,
            tamanoFuente: response.data.tamanoFuente,
            esCursiva: response.data.esCursiva,
            colorTexto: response.data.colorTexto,
            activo: response.data.activo
          }
        };
      } catch (error: any) {
        console.error('Error al guardar configuración de formato:', error);
        return {
          exitoso: false,
          mensaje: `Error al guardar configuración: ${error.message || 'Error desconocido'}`
        };
      }


    } catch (error) {
      console.error('Error al guardar configuración de formato:', error);
      let mensajeError = 'Error al guardar la configuración de formato';
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          mensajeError = error.response.data.message;
        } else if (error.message) {
          mensajeError = error.message;
        }
        // Si es un error de validación del backend
        if (error.response?.status === 400) {
          return {
            exitoso: false,
            mensaje: mensajeError
          };
        }
      } else if (error instanceof Error) {
        mensajeError = error.message;
      }
      return {
        exitoso: false,
        mensaje: mensajeError
      };
    }
  },

  actualizarConfiguracionFormato: async (config: FormatoCorreoConfig): Promise<FormatoCorreoResponse> => {
    try {
      // Validar datos de entrada
      if (!config.id) {
        return {
          exitoso: false,
          mensaje: 'Se requiere el ID de la configuración para actualizarla'
        };
      }
      if (!config.tipoFuente?.trim()) {
        return {
          exitoso: false,
          mensaje: 'El tipo de fuente es requerido'
        };
      }
      if (!config.tamañoFuente || config.tamañoFuente <= 0) {
        return {
          exitoso: false,
          mensaje: 'El tamaño de fuente debe ser mayor a 0'
        };
      }
      if (!config.colorTexto?.match(/^#[0-9A-Fa-f]{6}$/)) {
        return {
          exitoso: false,
          mensaje: 'El color de texto debe ser un código hexadecimal válido (ej: #000000)'
        };
      }

      const backendConfig: FormatoCorreoDto = {
        tipoFuente: config.tipoFuente,
        tamanoFuente: config.tamañoFuente,
        esCursiva: config.esCursiva,
        esSubrayado: config.esSubrayado,
        colorTexto: config.colorTexto,
        activo: true
      };

      // Validar conexión al servidor
      const response = await axios.put<FormatoCorreoDto>(`${API_URL}/${config.id}`, backendConfig);
      
      if (!response.data) {
        throw new Error('No se recibió respuesta del servidor');
      }

      return {
          exitoso: true,
          mensaje: 'Configuración de formato actualizada correctamente',
          configuracion: {
            id: response.data.id,
            tipoFuente: response.data.tipoFuente,
            tamanoFuente: response.data.tamanoFuente,
            esCursiva: response.data.esCursiva,
            esSubrayado: response.data.esSubrayado,
            colorTexto: response.data.colorTexto,
            activo: response.data.activo
          }
        };
    } catch (error) {
      console.error('Error al actualizar configuración de formato:', error);
      let mensajeError = 'Error al actualizar la configuración de formato';
      
      if (axios.isAxiosError(error)) {
        if (error.response?.data?.message) {
          mensajeError = error.response.data.message;
        } else if (error.message) {
          mensajeError = error.message;
        }

        // Si es un error de validación del backend
        if (error.response?.status === 400) {
          return {
            exitoso: false,
            mensaje: mensajeError
          };
        }

        // Si la configuración no existe
        if (error.response?.status === 404) {
          return {
            exitoso: false,
            mensaje: 'La configuración que intenta actualizar no existe'
          };
        }
      } else if (error instanceof Error) {
        mensajeError = error.message;
      }
      
      return {
        exitoso: false,
        mensaje: mensajeError
      };
    }
  }
};

export default formatoCorreoService;