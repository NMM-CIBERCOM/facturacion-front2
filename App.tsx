import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MainContent } from './components/MainContent';
import { InvoiceForm } from './components/InvoiceForm'; // Facturacion Articulos
import { LoginPage } from './components/LoginPage';
import { TwoFactorAuthPage } from './components/TwoFactorAuthPage';
import { NAV_ITEMS, DEFAULT_USER, DEFAULT_COLORS, DUMMY_CREDENTIALS } from './constants';
import type { Theme, CustomColors, User } from './types';

// Icons
import { SunIcon } from './components/icons/SunIcon';
import { MoonIcon } from './components/icons/MoonIcon';
import CubeIcon from './components/icons/CubeIcon';
import { HomeIcon } from './components/icons/HomeIcon';

// Page Components
import { DashboardPage } from './components/DashboardPage';

// Facturacion Pages
import { FacturacionInteresesPage } from './components/FacturacionInteresesPage';
import { NotasCreditoPage } from './components/NotasCreditoPage';
import { FacturacionCartaPortePage } from './components/FacturacionCartaPortePage';
import { FacturacionGlobalPage } from './components/FacturacionGlobalPage';
import { FacturacionMonederosPage } from './components/FacturacionMonederosPage';
import { FacturacionCapturaLibrePage } from './components/FacturacionCapturaLibrePage';
import { FacturacionMotosPage } from './components/FacturacionMotosPage';
import { FacturacionCancelacionMasivaPage } from './components/FacturacionCancelacionMasivaPage';
import { FacturacionNominasPage } from './components/FacturacionNominasPage';

// Consultas Pages
import { ConsultasFacturasPage } from './components/ConsultasFacturasPage';
import { ConsultasSkuPage } from './components/ConsultasSkuPage';
import { ConsultasBoletasPage } from './components/ConsultasBoletasPage';
import { ConsultasReportesPage } from './components/ConsultasReportesPage';
import { ConsultasRepsSustituidosPage } from './components/ConsultasRepsSustituidosPage';

// Administracion Pages
import { AdminEmpleadosPage } from './components/AdminEmpleadosPage';
import { AdminTiendasPage } from './components/AdminTiendasPage';
import { AdminPeriodosPerfilPage } from './components/AdminPeriodosPerfilPage';
import { AdminPeriodosPlataformaPage } from './components/AdminPeriodosPlataformaPage';
import { AdminKioscosPage } from './components/AdminKioscosPage';
import { AdminExcepcionesPage } from './components/AdminExcepcionesPage';
import { AdminSeccionesPage } from './components/AdminSeccionesPage';

// Reportes Fiscales Pages
import { ReportesBoletasNoAuditadasPage } from './components/ReportesBoletasNoAuditadasPage';
import { ReportesIngresoFacturacionPage } from './components/ReportesIngresoFacturacionPage';
import { ReportesIntegracionFacturaGlobalPage } from './components/ReportesIntegracionFacturaGlobalPage';
import { ReportesIntegracionClientesPage } from './components/ReportesIntegracionClientesPage';
import { ReportesFacturacionClientesGlobalPage } from './components/ReportesFacturacionClientesGlobalPage';
import { ReportesIntegracionSustitucionCfdiPage } from './components/ReportesIntegracionSustitucionCfdiPage';
import { ReportesControlEmisionRepPage } from './components/ReportesControlEmisionRepPage';
import { ReportesRepgcpPage } from './components/ReportesRepgcpPage';
import { ReportesControlCambiosPage } from './components/ReportesControlCambiosPage';
import { ReportesConciliacionPage } from './components/ReportesConciliacionPage';
import { ReportesFiscalesRepsSustituidosPage } from './components/ReportesFiscalesRepsSustituidosPage';

// Configuracion Pages
import { ConfiguracionTemasPage } from './components/ConfiguracionTemasPage';
import { ConfiguracionEmpresaPage } from './components/ConfiguracionEmpresaPage';
import { ConfiguracionCorreoPage } from './components/ConfiguracionCorreoPage';
import ConfiguracionMenusPage from './components/ConfiguracionMenusPage';

// Monitor Pages
import { MonitorGraficasPage } from './components/MonitorGraficasPage';
import { MonitorBitacoraPage } from './components/MonitorBitacoraPage';
import { MonitorPermisosPage } from './components/MonitorPermisosPage';
import { MonitorDisponibilidadPage } from './components/MonitorDisponibilidadPage';
import { MonitorLogsPage } from './components/MonitorLogsPage';
import { MonitorDecodificadorPage } from './components/MonitorDecodificadorPage';
import TestPdfPage from './components/TestPdfPage';
import ITextPdfTest from './components/ITextPdfTest';
import RegistroCFDIPage from './components/RegistroCFDIPage';

interface EmpresaInfo {
  nombre: string;
  rfc: string;
}

export const ThemeContext = React.createContext<{
  theme: Theme;
  toggleTheme: () => void;
  customColors: CustomColors;
  setCustomColors: React.Dispatch<React.SetStateAction<CustomColors>>;
  logoUrl: string;
  setLogoUrl: React.Dispatch<React.SetStateAction<string>>;
}>({
  theme: 'light',
  toggleTheme: () => {},
  customColors: DEFAULT_COLORS,
  setCustomColors: () => {},
  logoUrl: '/images/cibercom-logo.svg',
  setLogoUrl: () => {},
});

export const EmpresaContext = React.createContext<{
  empresaInfo: EmpresaInfo;
  setEmpresaInfo: React.Dispatch<React.SetStateAction<EmpresaInfo>>;
}>({
  empresaInfo: {
    nombre: 'Empresa Ejemplo S.A. de C.V.',
    rfc: 'EEJ920629TE3',
  },
  setEmpresaInfo: () => {},
});

import { EmpresaProvider } from './context/EmpresaContext';
import ErrorBoundary from './components/ErrorBoundary';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [theme, setTheme] = useState<Theme>('light');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  // Quitamos setCurrentUser para evitar warning porque no se usa
  const [currentUser] = useState<User>(DEFAULT_USER);

  // Estados para 2FA
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState<{
    username: string;
    sessionToken: string;
    qrCodeUrl?: string;
    secretKey?: string;
  } | null>(null);

  const [activePage, setActivePage] = useState<string>('Dashboard');
  const [activePageIcon, setActivePageIcon] = useState<React.FC<React.SVGProps<SVGSVGElement>>>(() => HomeIcon);

  const [customColors, setCustomColors] = useState<CustomColors>(() => {
    const storedColors = localStorage.getItem('customColors');
    return storedColors ? JSON.parse(storedColors) : DEFAULT_COLORS;
  });

  const [logoUrl, setLogoUrl] = useState<string>(() => {
    const storedLogoUrl = localStorage.getItem('logoUrl');
    return storedLogoUrl || '/images/cibercom-logo.svg';
  });

  const [profileSelected, setProfileSelected] = useState<string | null>(() => {
    const perfilData = localStorage.getItem('perfil');
    if (perfilData) {
      try {
        const perfil = JSON.parse(perfilData);
        if (perfil && perfil.nombrePerfil) return perfil.nombrePerfil;
      } catch {}
    }
    return localStorage.getItem('profileSelected');
  });

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(prefersDark ? 'dark' : 'light');
    }

    // Inicializar favicon al cargar la aplicación (usa el mismo logo del sistema)
    const updateFavicon = () => {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      const storedLogo = localStorage.getItem('logoUrl');
      favicon.href = storedLogo || '/images/cibercom-logo.svg';
    };
    updateFavicon();
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', customColors.primary);
    root.style.setProperty('--color-primary-dark', customColors.primaryDark);
    root.style.setProperty('--color-secondary', customColors.secondary);
    root.style.setProperty('--color-secondary-dark', customColors.secondaryDark);
    root.style.setProperty('--color-accent', customColors.accent);
    root.style.setProperty('--color-accent-dark', customColors.accentDark);
    localStorage.setItem('customColors', JSON.stringify(customColors));
  }, [customColors]);

  useEffect(() => {
    localStorage.setItem('logoUrl', logoUrl);
    // Actualizar favicon cuando cambia el logo del sistema
    const updateFavicon = () => {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = logoUrl;
    };
    updateFavicon();
  }, [logoUrl]);

  useEffect(() => {
    if (isAuthenticated) {
      const dashboardItem = NAV_ITEMS.find(item => item.label === 'Dashboard');
      if (dashboardItem) {
        setActivePage(dashboardItem.label);
        setActivePageIcon(() => dashboardItem.icon as React.FC<React.SVGProps<SVGSVGElement>>);
      }
    }
  }, [isAuthenticated]);

  const toggleTheme = useCallback(() => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const handleNavItemClick = useCallback(
  (label: string, icon?: React.FC<React.SVGProps<SVGSVGElement>>) => {
    setActivePage(label);

    if (icon && typeof icon === 'function') {
      setActivePageIcon(() => icon);
    } else {
      const allItems = NAV_ITEMS.flatMap(i =>
        i.children ? [i, ...i.children] : [i]
      );
      const found = allItems.find(i => i.label === label);

      if (found && typeof found.icon === 'function') {
        setActivePageIcon(() => found.icon);
      } else {
        const topLevel = NAV_ITEMS.find(i => i.label === label);
        if (topLevel && typeof topLevel.icon === 'function') {
          setActivePageIcon(() => topLevel.icon);
        } else {
          setActivePageIcon(() => CubeIcon); // fallback seguro
        }
      }
    }

    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  },
  []
);


  const handleLogin = useCallback(async (usernameInput: string, passwordInput: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usuario: usernameInput,
          password: passwordInput
        })
      });
      const data = await response.json();

      if (data.success && data.usuario) {
        // Si el backend indica que requiere 2FA, no completar login aún
        if (data.requiresTwoFactor) {
          setTwoFactorData({
            username: usernameInput,
            sessionToken: data.token,
            qrCodeUrl: data.qrCodeUrl,
            secretKey: data.secretKey,
          });
          setRequiresTwoFactor(true);
          return true;
        }

        // Login completo sin 2FA
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', data.usuario.noUsuario);
        localStorage.setItem('nombreEmpleado', data.usuario.nombreEmpleado);
        
        // Crear objeto perfil con la estructura correcta
        const perfilData = {
          idPerfil: data.usuario.idPerfil,
          nombrePerfil: data.usuario.nombrePerfil || 'Sin perfil'
        };
        localStorage.setItem('perfil', JSON.stringify(perfilData));

        setIsAuthenticated(true);
        setProfileSelected(data.usuario.nombrePerfil || 'Administrador');

        const dashboardItem = NAV_ITEMS.find(item => item.label === 'Dashboard');
        if (dashboardItem) {
          setActivePage(dashboardItem.label);
          setActivePageIcon(() => dashboardItem.icon as React.FC<React.SVGProps<SVGSVGElement>>);
        } else {
          setActivePage('Dashboard');
          setActivePageIcon(() => HomeIcon);
        }

        if (window.innerWidth >= 768) {
          setIsSidebarOpen(true);
        }
        
        // Autorefresh después de login exitoso
        setTimeout(() => {
          window.location.reload();
        }, 100);
        
        return true;
      } else {
        console.error('Login failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error durante el login:', error);
      return false;
    }
  }, []);

  const handleTwoFactorVerify = useCallback(async (code: string, sessionToken: string): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: twoFactorData?.username,
          code,
          sessionToken
        })
      });
      const data = await response.json();

      if (data.success && data.usuario) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('username', data.usuario.noUsuario);
        localStorage.setItem('nombreEmpleado', data.usuario.nombreEmpleado);
        
        // Crear objeto perfil con la estructura correcta
        const perfilData = {
          idPerfil: data.usuario.idPerfil,
          nombrePerfil: data.usuario.nombrePerfil || 'Sin perfil'
        };
        localStorage.setItem('perfil', JSON.stringify(perfilData));

        setIsAuthenticated(true);
        setProfileSelected(data.usuario.nombrePerfil || 'Administrador');
        setRequiresTwoFactor(false);
        setTwoFactorData(null);

        const dashboardItem = NAV_ITEMS.find(item => item.label === 'Dashboard');
        if (dashboardItem) {
          setActivePage(dashboardItem.label);
          setActivePageIcon(() => dashboardItem.icon as React.FC<React.SVGProps<SVGSVGElement>>);
        } else {
          setActivePage('Dashboard');
          setActivePageIcon(() => HomeIcon);
        }

        if (window.innerWidth >= 768) {
          setIsSidebarOpen(true);
        }
        
        // Autorefresh después de verificación 2FA exitosa
        setTimeout(() => {
          window.location.reload();
        }, 100);
        
        return true;
      } else {
        console.error('2FA verification failed:', data.message);
        return false;
      }
    } catch (error) {
      console.error('Error durante la verificación 2FA:', error);
      return false;
    }
  }, [twoFactorData]);

  const handleTwoFactorCancel = useCallback(() => {
    setRequiresTwoFactor(false);
    setTwoFactorData(null);
  }, []);

  const handleLogout = useCallback(() => {
    // Guardar preferencias del usuario antes de limpiar
    const theme = localStorage.getItem('theme');
    const customColors = localStorage.getItem('customColors');
    const logoUrl = localStorage.getItem('logoUrl');
    
    // Limpiar datos de autenticación
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('profileSelected');
    localStorage.removeItem('username');
    localStorage.removeItem('nombreEmpleado');
    localStorage.removeItem('perfil');
    localStorage.removeItem('menuConfigUpdated');
    
    // Restaurar preferencias después de limpiar
    if (theme) localStorage.setItem('theme', theme);
    if (customColors) localStorage.setItem('customColors', customColors);
    if (logoUrl) localStorage.setItem('logoUrl', logoUrl);
    
    setIsAuthenticated(false);
    setProfileSelected(null);
    setActivePage('Dashboard');
    setActivePageIcon(() => HomeIcon);
    
    // Autorefresh después de logout
    setTimeout(() => {
      window.location.reload();
    }, 100);
  }, []);

  // Sincronizar profileSelected desde localStorage/perfil al estar autenticado
  useEffect(() => {
    if (isAuthenticated) {
      const perfilData = localStorage.getItem('perfil');
      if (perfilData) {
        try {
          const perfil = JSON.parse(perfilData);
          if (perfil?.nombrePerfil && perfil.nombrePerfil !== profileSelected) {
            setProfileSelected(perfil.nombrePerfil);
          }
        } catch {}
      }
    }
  }, [isAuthenticated, profileSelected]);

  // Configuración dinámica de menús desde backend
  const [menuConfig, setMenuConfig] = useState<any[]>([]);
  const [pantallasConfig, setPantallasConfig] = useState<any[]>([]);

  const cargarConfiguracionMenus = async () => {
    try {
      const perfilData = localStorage.getItem('perfil');
      if (!perfilData) {
        console.warn('No hay datos de perfil en localStorage');
        setMenuConfig([]);
        setPantallasConfig([]);
        return;
      }
      
      let perfil;
      try {
        perfil = JSON.parse(perfilData);
      } catch (parseError) {
        console.error('Error al parsear perfil desde localStorage:', parseError);
        setMenuConfig([]);
        setPantallasConfig([]);
        return;
      }
      
      const idPerfil = perfil?.idPerfil;
      if (!idPerfil) {
        console.warn('No se encontró idPerfil en los datos del perfil:', perfil);
        setMenuConfig([]);
        setPantallasConfig([]);
        return;
      }

      // Pestañas principales (sin menuPath)
      const urlPestanas = `http://localhost:8080/api/menu-config/perfil/${idPerfil}`;
      const respTabs = await fetch(urlPestanas);
      if (respTabs.ok) {
        const tabs = await respTabs.json();
        const principales = tabs.filter((item: any) => !item.menuPath);
        setMenuConfig(principales);
      } else {
        console.warn('Error al cargar pestañas principales:', respTabs.status);
        setMenuConfig([]);
      }

      // Pantallas específicas (con menuPath)
      const urlPantallas = `http://localhost:8080/api/menu-config/pantallas/${idPerfil}`;
      const respScreens = await fetch(urlPantallas);
      if (respScreens.ok) {
        const screens = await respScreens.json();
        
        // Mapeo de pantallas a sus pestañas padre (basado en ConfiguracionMenusPage.tsx)
        const mapeoPestañas: { [key: string]: string } = {
          // Facturación
          'Artículos': 'Facturación',
          'Intereses': 'Facturación',
          'Carta Factura': 'Facturación',
          'Global': 'Facturación',
          'Monederos': 'Facturación',
          'Captura Libre': 'Facturación',
          'Cancelación Masiva': 'Facturación',
          'Nóminas': 'Facturación',
          // Consultas
          'Facturas': 'Consultas',
          'SKU': 'Consultas',
          'Boletas': 'Consultas',
          'Tickets': 'Consultas',
          // Administración
          'Empleados': 'Administración',
          'Tiendas': 'Administración',
          'Períodos Perfil': 'Administración',
          'Períodos Plataforma': 'Administración',
          'Kioscos': 'Administración',
          'Excepciones': 'Administración',
          'Secciones': 'Administración',
          // Reportes Facturación Fiscal
          'Boletas No Auditadas': 'Reportes Facturación Fiscal',
          'Reporte Ingreso-Facturación': 'Reportes Facturación Fiscal',
          'Integración Factura Global': 'Reportes Facturación Fiscal',
          'Integración Clientes': 'Reportes Facturación Fiscal',
          'Facturación clientes posterior a Global': 'Reportes Facturación Fiscal',
          'Integración Sustitución CFDI': 'Reportes Facturación Fiscal',
          'Control de emisión de REP': 'Reportes Facturación Fiscal',
          'Reportes REPgcp': 'Reportes Facturación Fiscal',
          'Control de cambios': 'Reportes Facturación Fiscal',
          'Conciliación': 'Reportes Facturación Fiscal',
          'REPs Sustituidos (Fiscal)': 'Reportes Facturación Fiscal',
          'Reporte de Consulta Monederos': 'Reportes Facturación Fiscal',
          'Reporte de Ventas Máquina Corporativas Serely Polu': 'Reportes Facturación Fiscal',
          'Régimen de Facturación No Misma Boleta': 'Reportes Facturación Fiscal',
          'Doble Facturación Pendiente por Defencia': 'Reportes Facturación Fiscal',
          'Sustitución en Proceso': 'Reportes Facturación Fiscal',
          'Cancelación Sustitución de Facturación': 'Reportes Facturación Fiscal',
          'Saldo a Favor de Clientes': 'Reportes Facturación Fiscal',
          'Orden de Módulos y Facturación': 'Reportes Facturación Fiscal',
          'Consulta de Usuarios': 'Reportes Facturación Fiscal',
          'Consulta Tiendas de Total de Facturas Diarias': 'Reportes Facturación Fiscal',
          'Validación por Importe Intereses': 'Reportes Facturación Fiscal',
          'Conciliación Cambio de Sistema de Facturación': 'Reportes Facturación Fiscal',
          'Control de Complementos de Pago (REP) Generados por Ventas Corporativas': 'Reportes Facturación Fiscal',
          'Reporte por Factura de Mercancía de Monederos': 'Reportes Facturación Fiscal',
          'Ventas Corporativas vs SAT': 'Reportes Facturación Fiscal',
          'Captura Libre Complemento de Pago (REP)': 'Reportes Facturación Fiscal',
          'Conciliación Sistema de Facturación de Boletas vs SAT': 'Reportes Facturación Fiscal',
          'Reporte de Trazabilidad de Boletas Canceladas': 'Reportes Facturación Fiscal',
          'Estatus Actualizar SAT de CFDI por Petición': 'Reportes Facturación Fiscal',
          // Registro CFDI
          'Registro de Constancias': 'Registro CFDI',
          // Monitor
          'Gráficas': 'Monitor',
          'Bitácora': 'Monitor',
          'Disponibilidad': 'Monitor',
          'Logs': 'Monitor',
          'Permisos': 'Monitor',
          'Decodificador': 'Monitor',
          // Configuración
          'Configuración de Correo': 'Configuración',
          'Configuración de Empresa': 'Configuración',
          'Configuración de Temas': 'Configuración',
          'Configuración de Menús': 'Configuración',
          'Mensajes de Correo': 'Configuración',
          'Empresa': 'Configuración',
          'Temas': 'Configuración',
        };
        
        // Agregar parentLabel a cada pantalla
        const screensConParent = screens.map((screen: any) => ({
          ...screen,
          parentLabel: mapeoPestañas[screen.menuLabel] || null
        }));
        
        console.log('📋 Pantallas cargadas con parentLabel:', screensConParent);
        setPantallasConfig(screensConParent);
      } else {
        console.warn('Error al cargar pantallas:', respScreens.status);
        setPantallasConfig([]);
      }
    } catch (e) {
      console.error('Error al cargar configuración de menús:', e);
      // En caso de error, mantener configuración por defecto
      setMenuConfig([]);
      setPantallasConfig([]);
    }
  };

  useEffect(() => {
    if (isAuthenticated && profileSelected) {
      cargarConfiguracionMenus();
    }
  }, [isAuthenticated, profileSelected]);

  // Mapeo de nombres de BD a nombres de NAV_ITEMS
  // Este mapeo es necesario porque los nombres en la BD pueden diferir de los nombres en NAV_ITEMS
  const mapeoPantallas: { [key: string]: string } = {
    'Intereses': 'Notas de crédito',
    'Carta Factura': 'Carta Porte',
    'Global': 'Factura Global',
    'Monederos': 'Monederos',
    'Captura Libre': 'Captura Libre',
    'Cancelación Masiva': 'Cancelación Masiva',
    'Artículos': 'Artículos',
    'Nóminas': 'Nóminas',
    'Boletas': 'Tickets', // Mapeo de Boletas (BD) a Tickets (NAV_ITEMS)
    'Tickets': 'Tickets',
    'Facturas': 'Facturas',
    'SKU': 'SKU',
    'Reportes': 'Reportes',
    'REPs Sustituidos': 'REPs Sustituidos',
    // Mapeo para Configuración
    'Configuración de Correo': 'Mensajes de Correo',
    'Configuración de Empresa': 'Empresa',
    'Configuración de Temas': 'Temas',
    'Configuración de Menús': 'Configuración de Menús',
    'Mensajes de Correo': 'Mensajes de Correo',
    'Empresa': 'Empresa',
    'Temas': 'Temas',
  };

  const getFilteredNavItems = () => {
    // Si no hay configuración cargada, usar la lógica actual por perfil
    if (menuConfig.length === 0) {
      if (profileSelected === 'Administrador') {
        return NAV_ITEMS;
      }
      if (profileSelected === 'Operador de Credito') {
        return NAV_ITEMS.filter(item =>
          ['Facturación', 'Consultas', 'Reportes Facturación Fiscal'].includes(item.label)
        );
      }
      if (profileSelected === 'Jefe de Credito') {
        return NAV_ITEMS.filter(item =>
          ['Facturación', 'Consultas', 'Reportes Facturación Fiscal', 'Administración'].includes(item.label)
        );
      }
      return NAV_ITEMS;
    }

    // Usar configuración dinámica de BD
    const menuLabelsVisibles = menuConfig
      .filter((c: any) => c.isVisible)
      .map((c: any) => c.menuLabel);

    // Asegurar que "Configuración" solo esté disponible para Administrador
    // Esto permite que los administradores siempre puedan acceder a la configuración de menús
    if (profileSelected === 'Administrador' && !menuLabelsVisibles.includes('Configuración')) {
      menuLabelsVisibles.push('Configuración');
      console.log('✅ Agregando "Configuración" a menús visibles (solo para Administrador)');
    }

    // Crear un mapa de pantallas visibles (mapeando nombres de BD a nombres de NAV_ITEMS)
    const pantallasVisiblesSet = new Set(
      pantallasConfig
        .filter((p: any) => p.isVisible)
        .map((p: any) => {
          // Mapear nombre de BD a nombre de NAV_ITEMS
          return mapeoPantallas[p.menuLabel] || p.menuLabel;
        })
    );

    // Crear un mapa de todas las pantallas configuradas (mapeando nombres de BD a nombres de NAV_ITEMS)
    const todasPantallasConfiguradasSet = new Set(
      pantallasConfig.map((p: any) => {
        // Mapear nombre de BD a nombre de NAV_ITEMS
        return mapeoPantallas[p.menuLabel] || p.menuLabel;
      })
    );

    console.log('🔍 Debug filtrado:', {
      pantallasConfig: pantallasConfig.map((p: any) => `${p.menuLabel} (${p.isVisible ? 'visible' : 'oculta'})`),
      pantallasVisibles: Array.from(pantallasVisiblesSet),
      todasPantallasConfiguradas: Array.from(todasPantallasConfiguradasSet),
      menuLabelsVisibles: menuLabelsVisibles,
    });

    // Filtrar pestañas y pantallas
    const filtrados = NAV_ITEMS
      .filter(item => menuLabelsVisibles.includes(item.label))
      .map(item => {
        if (item.children && Array.isArray(item.children)) {
          // Obtener todas las pantallas configuradas para esta pestaña específica
          // Buscar por parentLabel
          const pantallasDeEstaPestaña = pantallasConfig.filter((p: any) => 
            p.parentLabel === item.label
          );
          
          const hayConfiguracionParaEstaPestaña = pantallasDeEstaPestaña.length > 0;
          
          // Excepciones especiales: siempre mostrar estas pantallas
          const pantallasSiempreVisibles = ['Tickets', 'Mensajes de Correo', 'Empresa', 'Temas', 'Configuración de Menús'];
          
          // Filtrar hijos basándose en la configuración
          const hijos = item.children.filter(ch => {
            // Solo mostrar "Configuración de Menús" para Administrador
            if (ch.label === 'Configuración de Menús') {
              const esAdmin = profileSelected === 'Administrador';
              console.log(`Pantalla "${ch.label}": ${esAdmin ? 'VISIBLE (solo Administrador)' : 'OCULTA (no es Administrador)'}`);
              return esAdmin;
            }
            
            // Si hay configuración específica para esta pestaña en BD
            if (hayConfiguracionParaEstaPestaña) {
              // Si la pantalla está configurada en BD, usar su configuración de visibilidad
              if (todasPantallasConfiguradasSet.has(ch.label)) {
                // Solo mostrar si está visible
                const esVisible = pantallasVisiblesSet.has(ch.label);
                console.log(`Pantalla "${ch.label}": ${esVisible ? 'VISIBLE' : 'OCULTA'}`);
                return esVisible;
              }
              // Excepciones: siempre mostrar estas pantallas aunque no estén configuradas
              if (pantallasSiempreVisibles.includes(ch.label)) {
                console.log(`Pantalla "${ch.label}": SIEMPRE VISIBLE (excepción)`);
                return true;
              }
              // Si NO está configurada en BD pero hay configuración para esta pestaña, ocultarla
              console.log(`Pantalla "${ch.label}": NO CONFIGURADA EN BD para pestaña "${item.label}", OCULTANDO`);
              return false;
            } else {
              // Si NO hay configuración para esta pestaña, mostrar todas por defecto
              // Esto asegura que pantallas como las de Configuración se muestren si no están configuradas
              console.log(`Pantalla "${ch.label}": NO HAY CONFIGURACIÓN para pestaña "${item.label}", mostrando por defecto`);
              return true;
            }
          });
          
          console.log(`Pestaña "${item.label}": ${item.children.length} originales -> ${hijos.length} filtradas (config: ${hayConfiguracionParaEstaPestaña})`);
          
          return { ...item, children: hijos };
        }
        return item;
      });

    // Si la config no devolvió nada visible, usar fallback por perfil
    return filtrados.length > 0 ? filtrados : NAV_ITEMS;
  };

  if (!isAuthenticated) {
    return (
      <ThemeContext.Provider value={{ theme, toggleTheme, customColors, setCustomColors, logoUrl, setLogoUrl }}>
        <LoginPage onLogin={handleLogin} logoUrl={logoUrl} appName="Cibercom" />
      </ThemeContext.Provider>
    );
  }

  // Mostrar pantalla de 2FA si aplica
  if (requiresTwoFactor && twoFactorData) {
    return (
      <ThemeContext.Provider value={{ theme, toggleTheme, customColors, setCustomColors, logoUrl, setLogoUrl }}>
        <TwoFactorAuthPage
          onVerify={handleTwoFactorVerify}
          onCancel={handleTwoFactorCancel}
          username={twoFactorData.username}
          sessionToken={twoFactorData.sessionToken}
          qrCodeUrl={twoFactorData.qrCodeUrl}
          secretKey={twoFactorData.secretKey}
        />
      </ThemeContext.Provider>
    );
  }

  // Establecer perfil automáticamente si está autenticado pero no hay perfil seleccionado
  useEffect(() => {
    if (isAuthenticated && !profileSelected) {
      const perfilData = localStorage.getItem('perfil');
      if (perfilData) {
        try {
          const perfil = JSON.parse(perfilData);
          if (perfil?.nombrePerfil) {
            setProfileSelected(perfil.nombrePerfil);
            return;
          }
        } catch {
          // Si no se puede parsear, usar perfil por defecto
        }
      }
      // Si no hay perfil en localStorage, usar perfil por defecto
      setProfileSelected('Administrador');
    }
  }, [isAuthenticated, profileSelected]);

  const renderPageContent = () => {
    // Dashboard
    if (activePage === 'Dashboard') return <DashboardPage setActivePage={setActivePage} />;
    // Facturación
    if (activePage === 'Artículos') return <InvoiceForm />;
    if (activePage === 'Intereses') return <FacturacionInteresesPage />;
    if (activePage === 'Notas de crédito') return <NotasCreditoPage />;
    if (activePage === 'Carta Porte') return <FacturacionCartaPortePage />;
    if (activePage === 'Factura Global') return <FacturacionGlobalPage />;
    if (activePage === 'Monederos') return <FacturacionMonederosPage />;
    if (activePage === 'Captura Libre') return <FacturacionCapturaLibrePage />;
    if (activePage === 'Motos') return <FacturacionMotosPage />;
    if (activePage === 'Cancelación Masiva') return <FacturacionCancelacionMasivaPage />;
    if (activePage === 'Nóminas') return <FacturacionNominasPage />;

    // Consultas
    if (activePage === 'Facturas') return <ConsultasFacturasPage />;
    if (activePage === 'SKU') return <ConsultasSkuPage />;
    if (activePage === 'Tickets') return <ConsultasBoletasPage />;
    if (activePage === 'Reportes') return <ConsultasReportesPage />;
    if (activePage === 'REPs Sustituidos') return <ConsultasRepsSustituidosPage />;

    // Administración
    if (activePage === 'Empleados') return <AdminEmpleadosPage />;
    if (activePage === 'Tiendas') return <AdminTiendasPage />;
    if (activePage === 'Periodos por Perfil') return <AdminPeriodosPerfilPage />;
    if (activePage === 'Periodos Plataforma') return <AdminPeriodosPlataformaPage />;
    if (activePage === 'Kioscos') return <AdminKioscosPage />;
    if (activePage === 'Excepciones') return <AdminExcepcionesPage />;
    if (activePage === 'Secciones') return <AdminSeccionesPage />;

    // Reportes Facturación Fiscal
    if (activePage === 'Boletas No Auditadas') return <ReportesBoletasNoAuditadasPage />;
    if (activePage === 'Reporte Ingreso-Facturación') return <ReportesIngresoFacturacionPage />;
    if (activePage === 'Integración Factura Global') return <ReportesIntegracionFacturaGlobalPage />;
    if (activePage === 'Integración Clientes') return <ReportesIntegracionClientesPage />;
    if (activePage === 'Facturación clientes posterior a Global') return <ReportesFacturacionClientesGlobalPage />;
    if (activePage === 'Integración Sustitución CFDI') return <ReportesIntegracionSustitucionCfdiPage />;
    if (activePage === 'Control de emisión de REP') return <ReportesControlEmisionRepPage />;
    if (activePage === 'Reportes REPgcp') return <ReportesRepgcpPage />;
    if (activePage === 'Control de cambios') return <ReportesControlCambiosPage />;
    if (activePage === 'Conciliación') return <ReportesConciliacionPage />;
    if (activePage === 'REPs Sustituidos (Fiscal)') return <ReportesFiscalesRepsSustituidosPage />;

    // Configuracion
    if (activePage === 'Temas') return <ConfiguracionTemasPage />;
    if (activePage === 'Empresa') return <ConfiguracionEmpresaPage />;
    if (activePage === 'Mensajes de Correo') return <ConfiguracionCorreoPage />;
    if (activePage === 'Configuración de Menús') return <ConfiguracionMenusPage />;
    // Registro CFDI
    if (activePage === 'Registro de Constancias') return <RegistroCFDIPage />;

    // Monitor
    if (activePage === 'Gráficas') return <MonitorGraficasPage />;
    if (activePage === 'Bitácora') return <MonitorBitacoraPage />;
    if (activePage === 'Permisos') return <MonitorPermisosPage />;
    if (activePage === 'Disponibilidad') return <MonitorDisponibilidadPage />;
    if (activePage === 'Logs') return <MonitorLogsPage />;
    if (activePage === 'Decodificador') return <MonitorDecodificadorPage />;

    // Pruebas
    if (activePage === 'Test PDF') return <TestPdfPage />;
    if (activePage === 'Test iText PDF') return <ITextPdfTest />;

    const navItemExists = NAV_ITEMS.flatMap(item => item.children ? [item, ...item.children] : [item]).some(nav => nav.label === activePage);
    if (navItemExists) {
      return (
        <div className="p-6 text-gray-700 dark:text-gray-300">
          Contenido para "{activePage}" aún no implementado.
        </div>
      );
    }

    return <DashboardPage setActivePage={setActivePage} />;
  };

  return (
    <ErrorBoundary>
      <ThemeContext.Provider value={{ theme, toggleTheme, customColors, setCustomColors, logoUrl, setLogoUrl }}>
        <EmpresaProvider>
          <div className="flex h-screen bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
            <Sidebar
              navItems={getFilteredNavItems()}
              isOpen={isSidebarOpen}
              toggleSidebar={toggleSidebar}
              onNavItemClick={handleNavItemClick}
              logoUrl={logoUrl}
              appName="Cibercom"
            />
            <div className="flex-1 flex flex-col overflow-hidden">
              <Header
                user={currentUser}
                toggleSidebar={toggleSidebar}
                onLogout={handleLogout}
                isSidebarOpen={isSidebarOpen}
                isAuthenticated={isAuthenticated}
                ThemeToggleButton={
                  <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                    aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
                  >
                    {theme === 'light' ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
                  </button>
                }
              />
              <ErrorBoundary>
                <MainContent pageTitle={activePage} PageIcon={activePageIcon}>
                  {renderPageContent()}
                </MainContent>
              </ErrorBoundary>
            </div>
          </div>
        </EmpresaProvider>
      </ThemeContext.Provider>
    </ErrorBoundary>
  );
};

export default App;
