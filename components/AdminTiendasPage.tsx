import React, { useState, useMemo } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { PlusCircleIcon, PencilSquareIcon, MagnifyingGlassIcon } from './icons';

const dummyStores = [
  { id: '001', empresa: 'EMP-A', nombre: 'Sucursal 1', formato: 'GEN', domicilio: 'Calle 1', no: '100', colonia: 'Colonia Centro', delegacion: 'Delegación 1', cp: '01000', entidad: 'Ciudad A', pais: 'México', zonaEstatus: '1', tieneQmenor: 'NA', numFolioSerie: '0', folioInferior: 'GEN1', folioSuperior: 'GENA1', rangoInferior: '0', rangoSuperior: '100000', vigencia: '2022-01-01', numAdicionales: '1', contador: '100', dirServidorSec: '192.168.1.1', zonaHoraria: 'Centro', modificar: true },
  { id: '002', empresa: 'EMP-B', nombre: 'Sucursal 2', formato: 'GEN', domicilio: 'Calle 2', no: '200', colonia: 'Colonia Norte', delegacion: 'Delegación 2', cp: '02000', entidad: 'Ciudad B', pais: 'México', zonaEstatus: '1', tieneQmenor: 'FACTURAS', numFolioSerie: '0', folioInferior: 'GEN2', folioSuperior: 'GENB2', rangoInferior: '0', rangoSuperior: '200000', vigencia: '2022-02-01', numAdicionales: '0', contador: '200', dirServidorSec: '192.168.1.2', zonaHoraria: 'Centro', modificar: true },
  { id: '003', empresa: 'EMP-C', nombre: 'Sucursal 3', formato: 'GEN', domicilio: 'Calle 3', no: '300', colonia: 'Colonia Sur', delegacion: 'Delegación 3', cp: '03000', entidad: 'Ciudad C', pais: 'México', zonaEstatus: '1', tieneQmenor: 'FACTURAS', numFolioSerie: '0', folioInferior: 'GEN3', folioSuperior: 'GENC3', rangoInferior: '0', rangoSuperior: '300000', vigencia: '2022-03-01', numAdicionales: '2', contador: '300', dirServidorSec: '192.168.1.3', zonaHoraria: 'Centro', modificar: true },
];

const displayColumns = [
    { key: 'id', label: 'Id' },
    { key: 'empresa', label: 'Emp.' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'formato', label: 'Formato' },
    { key: 'domicilio', label: 'Domicilio' },
    { key: 'cp', label: 'CP' },
    { key: 'entidad', label: 'Entidad' },
    { key: 'folioSuperior', label: 'Folio Serie' },
];

const ITEMS_PER_PAGE = 10;

export const AdminTiendasPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEmpresa, setFilterEmpresa] = useState('');
  const [filterFormato, setFilterFormato] = useState('');

  // Obtener empresas y formatos únicos para los filtros
  const uniqueEmpresas = useMemo(() => [
    ...new Set(dummyStores.map(store => store.empresa))
  ], []);

  const uniqueFormatos = useMemo(() => [
    ...new Set(dummyStores.map(store => store.formato))
  ], []);

  // Filtrar tiendas
  const filteredStores = useMemo(() => {
    return dummyStores.filter(store => {
      const matchesSearch = searchTerm === '' || 
        Object.values(store).some(value => 
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
      const matchesEmpresa = filterEmpresa === '' || store.empresa === filterEmpresa;
      const matchesFormato = filterFormato === '' || store.formato === filterFormato;
      
      return matchesSearch && matchesEmpresa && matchesFormato;
    });
  }, [searchTerm, filterEmpresa, filterFormato]);

  // Calcular el total de páginas con las tiendas filtradas
  const totalPages = Math.ceil(filteredStores.length / ITEMS_PER_PAGE);

  // Restablecer la página actual cuando cambian los filtros
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterEmpresa, filterFormato]);

  // Obtener las tiendas para la página actual
  const getCurrentPageStores = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredStores.slice(startIndex, endIndex);
  };

  const handleAddStore = () => {
    alert('Abrir formulario para agregar nueva tienda (simulado).');
  };

  const handleModifyStore = (storeId: string) => {
    alert(`Modificar tienda con ID: ${storeId} (simulado).`);
  };

  // Manejadores de paginación
  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Generar array de números de página para mostrar
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary dark:text-secondary">
          Lista de Tiendas
        </h3>
        <Button onClick={handleAddStore} variant="primary" className="flex items-center">
          <PlusCircleIcon className="w-5 h-5 mr-2" />
          Agregar
        </Button>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Buscador general */}
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar en todos los campos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              />
              <MagnifyingGlassIcon className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
            </div>
          </div>

          {/* Filtro de Empresa */}
          <div className="w-48">
            <select
              value={filterEmpresa}
              onChange={(e) => setFilterEmpresa(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todas las tiendas</option>
              {uniqueEmpresas.map(empresa => (
                <option key={empresa} value={empresa}>{empresa}</option>
              ))}
            </select>
          </div>

          {/* Filtro de Formato */}
          <div className="w-48">
            <select
              value={filterFormato}
              onChange={(e) => setFilterFormato(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
            >
              <option value="">Todos los formatos</option>
              {uniqueFormatos.map(formato => (
                <option key={formato} value={formato}>{formato}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Resumen de filtros activos */}
        {(searchTerm || filterEmpresa || filterFormato) && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Filtros activos:</span>
            {searchTerm && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                Búsqueda: {searchTerm}
              </span>
            )}
            {filterEmpresa && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                Empresa: {filterEmpresa}
              </span>
            )}
            {filterFormato && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                Formato: {filterFormato}
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterEmpresa('');
                setFilterFormato('');
              }}
              className="text-primary dark:text-secondary hover:underline"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
      
      {/* Table and Pagination components remain the same, but use filteredStores instead of dummyStores */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              {displayColumns.map(col => (
                <th key={col.key} scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {col.label}
                </th>
              ))}
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Modificar
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {getCurrentPageStores().map((store) => (
              <tr key={store.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                {displayColumns.map(col => (
                  <td key={`${store.id}-${col.key}`} className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                    {(store as any)[col.key]}
                  </td>
                ))}
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  <button onClick={() => handleModifyStore(store.id)} className="text-primary dark:text-secondary hover:underline p-1" aria-label={`Modificar tienda ${store.nombre}`}>
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
          Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, dummyStores.length)} de {dummyStores.length} resultados
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
          >
            Anterior
          </button>
          
          {getPageNumbers().map(pageNumber => (
            <button
              key={pageNumber}
              onClick={() => handlePageChange(pageNumber)}
              className={`px-3 py-1 rounded-md ${pageNumber === currentPage ? 'bg-primary text-white dark:bg-secondary' : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
            >
              {pageNumber}
            </button>
          ))}

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500' : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'}`}
          >
            Siguiente
          </button>
        </div>
      </div>

      {dummyStores.length === 0 && (
        <p className="text-center py-4 text-gray-500 dark:text-gray-400">No hay tiendas registradas.</p>
      )}
    </Card>
  );
};