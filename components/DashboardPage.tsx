import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { ChartBarIcon, DocumentTextIcon, CubeIcon, CogIcon } from './icons';

// Componente para gráfico de barras simple
const GraficoBarrasSimple: React.FC<{ datos: number[], etiquetas: string[], color: string }> = ({ datos, etiquetas, color }) => {
  const alturaMaxima = Math.max(...datos);
  
  return (
    <div className="flex items-end justify-between h-full w-full">
      {datos.map((valor, index) => {
        const alturaRelativa = (valor / alturaMaxima) * 100;
        return (
          <div key={index} className="flex flex-col items-center" style={{ width: `${100 / datos.length}%` }}>
            <div 
              className={`w-3/4 ${color}`} 
              style={{ height: `${alturaRelativa}%` }}
              title={`${etiquetas[index]}: ${valor}`}
            ></div>
            <span className="text-xs mt-1 text-gray-600 dark:text-gray-300 truncate w-full text-center">
              {etiquetas[index]}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// Componente para gráfico de barras con colores múltiples
const GraficoBarrasMulticolor: React.FC = () => {
  // Datos de ejemplo para el gráfico
  const datos = [
    { mes: 'Ene', facturas: 65, boletas: 40, notas: 25 },
    { mes: 'Feb', facturas: 59, boletas: 45, notas: 30 },
    { mes: 'Mar', facturas: 80, boletas: 55, notas: 35 },
    { mes: 'Abr', facturas: 81, boletas: 60, notas: 40 },
    { mes: 'May', facturas: 56, boletas: 45, notas: 30 },
    { mes: 'Jun', facturas: 55, boletas: 40, notas: 25 },
    { mes: 'Jul', facturas: 40, boletas: 35, notas: 20 },
  ];

  const categorias = ['facturas', 'boletas', 'notas'];
  const colores = ['#3B82F6', '#10B981', '#F59E0B']; // Azul, Verde, Amarillo
  
  const alturaMaxima = Math.max(...datos.flatMap(d => [d.facturas, d.boletas, d.notas]));
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-center mb-4 space-x-6">
        {categorias.map((categoria, idx) => (
          <div key={idx} className="flex items-center">
            <div 
              className="w-4 h-4 mr-2 rounded-sm" 
              style={{ backgroundColor: colores[idx] }}
            ></div>
            <span className="text-sm capitalize text-gray-700 dark:text-gray-300">{categoria}</span>
          </div>
        ))}
      </div>
      
      <div className="flex items-end justify-between h-64 w-full">
        {datos.map((dato, index) => (
          <div key={index} className="flex flex-col items-center" style={{ width: `${100 / datos.length}%` }}>
            <div className="relative w-full flex flex-col items-center justify-end h-56">
              {/* Barra para facturas */}
              <div 
                className="w-5/6 rounded-t-sm transition-all duration-300 hover:opacity-90"
                style={{ 
                  height: `${(dato.facturas / alturaMaxima) * 100}%`,
                  backgroundColor: colores[0],
                  zIndex: 3
                }}
                title={`Facturas: ${dato.facturas}`}
              ></div>
              
              {/* Barra para boletas */}
              <div 
                className="w-5/6 absolute bottom-0 rounded-t-sm transition-all duration-300 hover:opacity-90"
                style={{ 
                  height: `${(dato.boletas / alturaMaxima) * 100}%`,
                  backgroundColor: colores[1],
                  zIndex: 2
                }}
                title={`Boletas: ${dato.boletas}`}
              ></div>
              
              {/* Barra para notas */}
              <div 
                className="w-5/6 absolute bottom-0 rounded-t-sm transition-all duration-300 hover:opacity-90"
                style={{ 
                  height: `${(dato.notas / alturaMaxima) * 100}%`,
                  backgroundColor: colores[2],
                  zIndex: 1
                }}
                title={`Notas: ${dato.notas}`}
              ></div>
            </div>
            <span className="text-xs mt-2 text-gray-600 dark:text-gray-300 text-center">
              {dato.mes}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export interface DashboardPageProps {
  setActivePage: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActivePage }) => {
  const handleNuevaFacturaArticulos = () => {
    setActivePage('Artículos');
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
      </div>
      
      {/* Gráfico grande en la parte inferior */}
      <Card title="Estadísticas de Facturación por Mes">
        <div className="p-6">
          <GraficoBarrasMulticolor />
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Comparativa mensual de documentos generados en el sistema
            </p>
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