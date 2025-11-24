import { apiUrl } from './api';
import type { LoginResponse } from '../types';

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  let response: Response | null = null;
  try {
    response = await fetch(apiUrl('/auth/login'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        usuario: username,
        password,
      }),
    });
  } catch (error) {
    throw new Error('No se pudo conectar con el servidor de autenticación.');
  }

  let data: LoginResponse | null = null;
  try {
    data = (await response.json()) as LoginResponse;
  } catch (error) {
    if (!response.ok) {
      throw new Error('Respuesta inválida del servidor de autenticación.');
    }
  }

  if (!response.ok) {
    const message =
      data?.message ||
      (response.status === 401
        ? 'Usuario o contraseña incorrectos.'
        : `Error de autenticación (${response.status}).`);
    throw new Error(message);
  }

  if (!data?.success) {
    throw new Error(data?.message || 'Usuario o contraseña incorrectos.');
  }

  return data;
}

