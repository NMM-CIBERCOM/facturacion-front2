import React from 'react';
import { Card } from './Card';
import { ChartBarIcon, DocumentTextIcon, CubeIcon, CogIcon } from './icons';

export interface DashboardPageProps {
  setActivePage: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActivePage }) => {
  const handleNuevaFacturaArticulos = () => {
    setActivePage('Artículos');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
      <Card title="Resumen General">
        <div className="p-4">
          <div className="flex items-center mb-3">
            <ChartBarIcon className="w-8 h-8 mr-3 text-primary dark:text-secondary" />
            <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Estadísticas Rápidas</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Visualiza el rendimiento clave.</p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Aquí se mostrarán gráficos interactivos y datos consolidados sobre la facturación, ventas y actividad general del sistema.
          </p>
           <div className="mt-4">
            <dl>
              <div className="flex justify-between py-1">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Facturas Hoy:</dt>
                <dd className="text-sm font-medium text-gray-700 dark:text-gray-200">125</dd>
              </div>
              <div className="flex justify-between py-1">
                <dt className="text-sm text-gray-500 dark:text-gray-400">Ingresos del Mes:</dt>
                <dd className="text-sm font-medium text-gray-700 dark:text-gray-200">$45,678.90</dd>
              </div>
            </dl>
          </div>
        </div>
      </Card>

      <Card title="Facturas Recientes">
        <div className="p-4">
          <div className="flex items-center mb-3">
            <DocumentTextIcon className="w-8 h-8 mr-3 text-primary dark:text-secondary" />
             <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Últimas Facturas</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Generadas recientemente.</p>
            </div>
          </div>
          <ul className="space-y-2 mt-2">
            <li className="text-sm text-gray-600 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">Factura #12345 - Cliente A - $250.00</li>
            <li className="text-sm text-gray-600 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">Factura #12346 - Cliente B - $1320.50</li>
            <li className="text-sm text-gray-600 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">Factura #12347 - Cliente C - $75.20</li>
          </ul>
           <button className="mt-4 text-sm text-primary dark:text-secondary-dark hover:underline">Ver todas las facturas</button>
        </div>
      </Card>

      <Card title="Acciones Rápidas">
         <div className="p-4">
           <div className="flex items-center mb-3">
            <CogIcon className="w-8 h-8 mr-3 text-primary dark:text-secondary" />
            <div>
                <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Accesos Directos</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tareas comunes.</p>
            </div>
          </div>
          <div className="space-y-2 mt-2">
            <button
              className="w-full text-left p-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              onClick={handleNuevaFacturaArticulos}
            >
              Nueva Factura de Artículos
            </button>
            <button className="w-full text-left p-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">Buscar Cliente</button>
            <button className="w-full text-left p-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">Ver Reporte Mensual</button>
          </div>
        </div>
      </Card>
       <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};