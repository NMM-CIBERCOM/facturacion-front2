// Centraliza URLs base para los servicios del backend
// Usa variables de entorno VITE_API_BASE_URL y VITE_PAC_BASE_URL con valores por defecto
export const API_BASE_URL: string = (
  (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:8080/api'
).replace(/\/+$/,'');

export const PAC_BASE_URL: string = (
  (import.meta as any)?.env?.VITE_PAC_BASE_URL || 'http://localhost:8085/api'
).replace(/\/+$/,'');

// Construye rutas asegurando que no haya dobles slashes
export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${p}`;
}

// URL builder para el PAC (simulador o servicio externo)
export function pacUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${PAC_BASE_URL}${p}`;
}