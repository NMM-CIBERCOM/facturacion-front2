// Centraliza la URL base del backend para todo el frontend
// Usa variable de entorno VITE_API_BASE_URL y por defecto localhost
export const API_BASE_URL: string = (
  (import.meta as any)?.env?.VITE_API_BASE_URL || 'http://localhost:8080/api'
).replace(/\/+$/,'');

// Construye rutas asegurando que no haya dobles slashes
export function apiUrl(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${p}`;
}