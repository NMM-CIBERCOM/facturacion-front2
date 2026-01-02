import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { ChartBarIcon, DocumentTextIcon, CogIcon } from './icons';
import { dashboardService, DatoGrafico, EstadisticasRapidas, FacturaResumen } from '../services/dashboardService';

// Componente para gráfico de barras con colores múltiples
interface GraficoBarrasMulticolorProps {
  datos: DatoGrafico[];
}

const GraficoBarrasMulticolor: React.FC<GraficoBarrasMulticolorProps> = ({ datos }) => {
  // Eliminamos boletas ya que no se usan
  const categorias = ['facturas', 'notas', 'tickets'];
  const colores = ['#3B82F6', '#F59E0B', '#EF4444']; // Azul, Amarillo, Rojo

  if (!datos || datos.length === 0) {
    return (
      <div className="w-full text-center py-8 text-gray-500 dark:text-gray-400">
        No hay datos disponibles para mostrar
      </div>
    );
  }

  // Calcular altura máxima considerando la suma de todas las categorías
  const alturaMaxima = Math.max(...datos.flatMap(d => [
    (d.facturas || 0) + (d.notas || 0) + (d.tickets || 0)
  ]));

  return (
    <div className="w-full">
      <div className="flex items-center justify-center mb-4 space-x-6 flex-wrap">
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
        {datos.map((dato, index) => {
          const facturas = dato.facturas || 0;
          const notas = dato.notas || 0;
          const tickets = dato.tickets || 0;
          
          // Calcular el total para este mes
          const totalMes = facturas + notas + tickets;
          
          // Calcular alturas como porcentaje del total del mes respecto al máximo
          const alturaTotal = alturaMaxima > 0 ? (totalMes / alturaMaxima) * 100 : 0;
          
          // Calcular alturas individuales como porcentaje del total del mes
          const alturaFacturas = totalMes > 0 ? (facturas / totalMes) * alturaTotal : 0;
          const alturaNotas = totalMes > 0 ? (notas / totalMes) * alturaTotal : 0;
          const alturaTickets = totalMes > 0 ? (tickets / totalMes) * alturaTotal : 0;
          
          // Calcular posición bottom de cada barra (apiladas desde abajo)
          const bottomFacturas = 0;
          const bottomNotas = alturaFacturas;
          const bottomTickets = alturaFacturas + alturaNotas;

          return (
            <div key={index} className="flex flex-col items-center" style={{ width: `${100 / datos.length}%` }}>
              <div className="relative w-full flex flex-col items-center justify-end h-56">
                {/* Barra para facturas (base) */}
                {facturas > 0 && (
                  <div
                    className="w-5/6 absolute rounded-t-sm transition-all duration-300 hover:opacity-90"
                    style={{
                      height: `${alturaFacturas}%`,
                      bottom: `${bottomFacturas}%`,
                      backgroundColor: colores[0],
                      zIndex: 3
                    }}
                    title={`Facturas: ${facturas}`}
                  ></div>
                )}

                {/* Barra para notas (encima de facturas) */}
                {notas > 0 && (
                  <div
                    className="w-5/6 absolute rounded-t-sm transition-all duration-300 hover:opacity-90"
                    style={{
                      height: `${alturaNotas}%`,
                      bottom: `${bottomNotas}%`,
                      backgroundColor: colores[1],
                      zIndex: 2
                    }}
                    title={`Notas de Crédito: ${notas}`}
                  ></div>
                )}

                {/* Barra para tickets (encima de notas) */}
                {tickets > 0 && (
                  <div
                    className="w-5/6 absolute rounded-t-sm transition-all duration-300 hover:opacity-90"
                    style={{
                      height: `${alturaTickets}%`,
                      bottom: `${bottomTickets}%`,
                      backgroundColor: colores[2],
                      zIndex: 1
                    }}
                    title={`Tickets: ${tickets}`}
                  ></div>
                )}
              </div>
              <span className="text-xs mt-2 text-gray-600 dark:text-gray-300 text-center">
                {dato.mes}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export interface DashboardPageProps {
  setActivePage: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ setActivePage }) => {
  const [estadisticasRapidas, setEstadisticasRapidas] = useState<EstadisticasRapidas | null>(null);
  const [datosGrafico, setDatosGrafico] = useState<DatoGrafico[]>([]);
  const [ultimasFacturas, setUltimasFacturas] = useState<FacturaResumen[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      setCargando(true);
      try {
        const response = await dashboardService.obtenerEstadisticas();
        if (response.exitoso) {
          setEstadisticasRapidas(response.estadisticasRapidas || null);
          setDatosGrafico(response.datosGrafico || []);
          setUltimasFacturas(response.ultimasFacturas || []);
        } else {
          console.error('Error cargando estadísticas:', response.mensaje);
        }
      } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  const handleNuevaFacturaArticulos = () => {
    setActivePage('Artículos');
  };

  const formatearMoneda = (valor: number | undefined): string => {
    if (valor === undefined || valor === null) return '$0.00';
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(valor);
  };

  const formatearFecha = (fecha: string | undefined): string => {
    if (!fecha) return '';
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return fecha;
    }
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
            {cargando ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">Cargando...</div>
            ) : estadisticasRapidas ? (
              <div className="mt-4">
                <dl className="space-y-2">
                  <div className="flex justify-between py-1">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Facturas Hoy:</dt>
                    <dd className="text-sm font-medium text-gray-700 dark:text-gray-200">{estadisticasRapidas.facturasHoy || 0}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Facturas del Mes:</dt>
                    <dd className="text-sm font-medium text-gray-700 dark:text-gray-200">{estadisticasRapidas.facturasMes || 0}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Facturas del Año:</dt>
                    <dd className="text-sm font-medium text-gray-700 dark:text-gray-200">{estadisticasRapidas.facturasAnio || 0}</dd>
                  </div>
                  <div className="flex justify-between py-1 border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Ingresos Hoy:</dt>
                    <dd className="text-sm font-medium text-gray-700 dark:text-gray-200">{formatearMoneda(estadisticasRapidas.ingresosHoy)}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Ingresos del Mes:</dt>
                    <dd className="text-sm font-medium text-gray-700 dark:text-gray-200">{formatearMoneda(estadisticasRapidas.ingresosMes)}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-sm text-gray-500 dark:text-gray-400">Ingresos del Año:</dt>
                    <dd className="text-sm font-medium text-gray-700 dark:text-gray-200">{formatearMoneda(estadisticasRapidas.ingresosAnio)}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">No hay datos disponibles</div>
            )}
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
            {cargando ? (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">Cargando...</div>
            ) : ultimasFacturas.length > 0 ? (
              <ul className="space-y-2 mt-2">
                {ultimasFacturas.map((factura, index) => (
                  <li 
                    key={factura.uuid || index}
                    className="text-sm text-gray-600 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">
                          {factura.serie && factura.folio 
                            ? `Factura ${factura.serie}-${factura.folio}`
                            : factura.uuid ? `Factura ${factura.uuid.substring(0, 8)}...` 
                            : `Factura #${index + 1}`}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {factura.receptorRazonSocial || 'Sin receptor'}
                        </div>
                        {factura.fechaFactura && (
                          <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {formatearFecha(factura.fechaFactura)}
                          </div>
                        )}
                      </div>
                      <div className="font-semibold text-gray-700 dark:text-gray-200 ml-2">
                        {formatearMoneda(factura.total)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">No hay facturas recientes</div>
            )}
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
          {cargando ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">Cargando datos del gráfico...</div>
          ) : (
            <>
              <GraficoBarrasMulticolor datos={datosGrafico} />
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Comparativa mensual de documentos generados en el sistema (Facturas, Notas de Crédito y Tickets)
                </p>
              </div>
            </>
          )}
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
