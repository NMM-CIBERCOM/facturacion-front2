// Servicio para gestionar el logo de la empresa en los correos electrónicos
export const logoService = {
  // Clave para almacenar el logo en localStorage
  LOGO_STORAGE_KEY: 'facturacion_cibercom_logo',
  
  // Guardar el logo en localStorage
  guardarLogo: (logoBase64: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(logoService.LOGO_STORAGE_KEY, logoBase64);
    }
  },
  
  // Obtener el logo desde localStorage
  obtenerLogo: (): string => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(logoService.LOGO_STORAGE_KEY) || '';
    }
    return '';
  },
  
  // Eliminar el logo de localStorage
  eliminarLogo: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(logoService.LOGO_STORAGE_KEY);
    }
  }
};