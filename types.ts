
import React from 'react';

export type Theme = 'light' | 'dark';

export interface User {
  name: string;
  storeId: string;
}

export interface NavItem {
  label: string;
  path?: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  children?: NavItem[];
}

export interface CustomColors {
  primary: string;
  primaryDark: string;
  secondary: string;
  secondaryDark: string;
  accent: string;
  accentDark: string;
}

export interface EmpresaInfo {
  nombre: string;
  rfc: string;
}

export interface UsuarioLogin {
  noUsuario: string;
  nombreEmpleado: string;
  nombrePerfil: string;
  idPerfil: number | null;
  estatusUsuario: string;
  idDfi: number | null;
  idEstacionamiento: number | null;
  modificaUbicacion: string | null;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string | null;
  usuario?: UsuarioLogin | null;
}
    