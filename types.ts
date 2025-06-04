
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
    