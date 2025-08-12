import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MainContent } from './components/MainContent';
import { InvoiceForm } from './components/InvoiceForm'; // Facturacion Articulos
import { LoginPage } from './components/LoginPage';
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
import { FacturacionCartaFacturaPage } from './components/FacturacionCartaFacturaPage';
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

// Monitor Pages
import { MonitorGraficasPage } from './components/MonitorGraficasPage';
import { MonitorBitacoraPage } from './components/MonitorBitacoraPage';
import { MonitorPermisosPage } from './components/MonitorPermisosPage';
import { MonitorDisponibilidadPage } from './components/MonitorDisponibilidadPage';
import { MonitorLogsPage } from './components/MonitorLogsPage';
import { MonitorDecodificadorPage } from './components/MonitorDecodificadorPage';
import { ProfileSelectorPage } from './components/ProfileSelectorPage';

const PROFILE_OPTIONS = [
  "Administrador",
  "Jefe de Credito",
  "Operador de Credito",
];

// Define la interfaz EmpresaInfo para corregir error TS
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
  logoUrl: '/images/Logo Cibercom.png',
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

  const [activePage, setActivePage] = useState<string>('Dashboard');
  const [activePageIcon, setActivePageIcon] = useState<React.FC<React.SVGProps<SVGSVGElement>>>(() => HomeIcon);

  const [customColors, setCustomColors] = useState<CustomColors>(() => {
    const storedColors = localStorage.getItem('customColors');
    return storedColors ? JSON.parse(storedColors) : DEFAULT_COLORS;
  });

  const [logoUrl, setLogoUrl] = useState<string>(() => {
    const storedLogoUrl = localStorage.getItem('logoUrl');
    return storedLogoUrl || '/images/Logo Cibercom.png';
  });

  const [profileSelected, setProfileSelected] = useState<string | null>(() => {
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


  const handleLogin = useCallback((usernameInput: string, passwordInput: string): boolean => {
    if (usernameInput === DUMMY_CREDENTIALS.username && passwordInput === DUMMY_CREDENTIALS.password) {
      localStorage.setItem('isAuthenticated', 'true');
      setIsAuthenticated(true);
      setProfileSelected(null);

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
      return true;
    }
    return false;
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('profileSelected');
    setIsAuthenticated(false);
    setProfileSelected(null);
    setActivePage('Dashboard');
    setActivePageIcon(() => HomeIcon);
  }, []);

  const handleProfileSelect = (profile: string) => {
    setProfileSelected(profile);
    localStorage.setItem('profileSelected', profile);
  };

  const getFilteredNavItems = () => {
    if (profileSelected === "Administrador") {
      return NAV_ITEMS; // Muestra todo
    }
    // Para operadores y jefes de crédito, solo mostrar secciones clave
    if (profileSelected === "Operador de Credito") {
      return NAV_ITEMS.filter(item =>
        ["Facturación", "Consultas", "Reportes Facturación Fiscal"].includes(item.label)
      );
    }
    if (profileSelected === "Jefe de Credito") {
      return NAV_ITEMS.filter(item =>
        ["Facturación", "Consultas", "Reportes Facturación Fiscal", "Administración"].includes(item.label)
      );
    }
    // Por defecto, muestra todo
    return NAV_ITEMS;
  };

  if (!isAuthenticated) {
    return (
      <ThemeContext.Provider value={{ theme, toggleTheme, customColors, setCustomColors, logoUrl, setLogoUrl }}>
        <LoginPage onLogin={handleLogin} logoUrl={logoUrl} appName="Cibercom" />
      </ThemeContext.Provider>
    );
  }

  if (!profileSelected) {
    return (
      <ThemeContext.Provider value={{ theme, toggleTheme, customColors, setCustomColors, logoUrl, setLogoUrl }}>
        <ProfileSelectorPage profiles={PROFILE_OPTIONS} onSelect={handleProfileSelect} />
      </ThemeContext.Provider>
    );
  }

  const renderPageContent = () => {
    // Dashboard
    if (activePage === 'Dashboard') return <DashboardPage setActivePage={setActivePage} />;
    // Facturación
    if (activePage === 'Artículos') return <InvoiceForm />;
    if (activePage === 'Intereses') return <FacturacionInteresesPage />;
    if (activePage === 'Carta Factura') return <FacturacionCartaFacturaPage />;
    if (activePage === 'Factura Global') return <FacturacionGlobalPage />;
    if (activePage === 'Monederos') return <FacturacionMonederosPage />;
    if (activePage === 'Captura Libre') return <FacturacionCapturaLibrePage />;
    if (activePage === 'Motos') return <FacturacionMotosPage />;
    if (activePage === 'Cancelación Masiva') return <FacturacionCancelacionMasivaPage />;
    if (activePage === 'Nóminas') return <FacturacionNominasPage />;

    // Consultas
    if (activePage === 'Facturas') return <ConsultasFacturasPage />;
    if (activePage === 'SKU') return <ConsultasSkuPage />;
    if (activePage === 'Boletas') return <ConsultasBoletasPage />;
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

    // Monitor
    if (activePage === 'Gráficas') return <MonitorGraficasPage />;
    if (activePage === 'Bitácora') return <MonitorBitacoraPage />;
    if (activePage === 'Permisos') return <MonitorPermisosPage />;
    if (activePage === 'Disponibilidad') return <MonitorDisponibilidadPage />;
    if (activePage === 'Logs') return <MonitorLogsPage />;
    if (activePage === 'Decodificador') return <MonitorDecodificadorPage />;

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
