// Centraliza URLs base para los servicios del backend
// Usa variables de entorno VITE_API_BASE_URL y VITE_PAC_BASE_URL con valores por defecto
// Si no está definida, detecta automáticamente si estamos en desarrollo local
function getDefaultApiBaseUrl(): string {
  // Si hay una variable de entorno, úsala
  const envUrl = (import.meta as any)?.env?.VITE_API_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // Detectar si estamos en localhost (desarrollo)
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname === '';
  
  if (isLocalhost) {
    // En desarrollo local, el backend no usa context-path
    return 'http://localhost:8080/api';
  }
  
  // Por defecto, usar producción
  return 'http://174.136.25.157:8080/facturacion-backend-0.0.1-SNAPSHOT/api';
}

export const API_BASE_URL: string = getDefaultApiBaseUrl().replace(/\/+$/,'');

function getDefaultPacBaseUrl(): string {
  // Si hay una variable de entorno, úsala
  const envUrl = (import.meta as any)?.env?.VITE_PAC_BASE_URL;
  if (envUrl) {
    return envUrl;
  }
  
  // Detectar si estamos en localhost (desarrollo)
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname === '';
  
  if (isLocalhost) {
    // En desarrollo local, el backend no usa context-path
    return 'http://localhost:8081/api';
  }
  
  // Por defecto, usar producción
  return 'http://174.136.25.157:8080/cib-ms-cdp/api';
}

export const PAC_BASE_URL: string = getDefaultPacBaseUrl().replace(/\/+$/,'');

// Construye rutas asegurando que no haya dobles slashes
export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${p}`;
}

// Obtiene el ID del usuario desde la sesión
// IMPORTANTE: Usa el idUsuario guardado en el perfil al hacer login
// Este ID se establece al hacer login: idDfi si está disponible, sino idPerfil
// NUNCA usar noUsuario como ID, aunque sea numérico
function getUsuarioId(): string {
  try {
    // PRIMERO: Intentar obtener idUsuario del perfil (establecido al hacer login)
    // Este es el ID que se determinó al hacer login: idDfi o idPerfil
    const perfilRaw = window.localStorage.getItem('perfil');
    if (perfilRaw) {
      try {
        const perfil = JSON.parse(perfilRaw);
        
        if (perfil?.idUsuario != null && perfil.idUsuario !== undefined && /^\d+$/.test(String(perfil.idUsuario))) {
          return String(perfil.idUsuario);
        }
        
        if (perfil?.idDfi != null && perfil.idDfi !== undefined && /^\d+$/.test(String(perfil.idDfi))) {
          return String(perfil.idDfi);
        }
        
        if (perfil?.idPerfil != null && perfil.idPerfil !== undefined && /^\d+$/.test(String(perfil.idPerfil))) {
          return String(perfil.idPerfil);
        }
        
        console.warn('No se encontró ID numérico válido en el perfil. Perfil:', perfil);
      } catch (error) {
        console.error('Error al parsear perfil:', error);
      }
    } else {
      console.warn('No se encontró perfil en localStorage');
    }
    
    // SEGUNDO: Intentar obtener de session.idUsuario (debe contener el ID real establecido al hacer login)
    const idUsuario = window.localStorage.getItem('session.idUsuario');
    if (idUsuario && /^\d+$/.test(idUsuario)) {
      // Verificar que no sea el noUsuario (aunque sea numérico)
      const perfilRaw2 = window.localStorage.getItem('perfil');
      if (perfilRaw2) {
        try {
          const perfil = JSON.parse(perfilRaw2);
          if (perfil?.noUsuario && String(perfil.noUsuario) === idUsuario) {
            console.warn('session.idUsuario contiene noUsuario, no se usará. Buscando ID real...');
            if (perfil?.idPerfil != null && /^\d+$/.test(String(perfil.idPerfil))) {
              return String(perfil.idPerfil);
            }
            return "0";
          }
        } catch {}
      }
      return idUsuario;
    }
    
    console.error('No se encontró ID numérico válido del usuario');
    return "0";
  } catch (error) {
    console.error('Error en getUsuarioId():', error);
    return "0";
  }
}

// Crea headers con el usuario incluido
export function getHeadersWithUsuario(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...additionalHeaders
  };
  
  const usuarioId = getUsuarioId();
  if (usuarioId && usuarioId !== "0") {
    headers['X-Usuario'] = usuarioId;
  }
  
  return headers;
}

// URL builder para el PAC (simulador o servicio externo)
export function pacUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${PAC_BASE_URL}${p}`;
}