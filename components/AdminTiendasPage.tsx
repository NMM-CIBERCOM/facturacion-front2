import React from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { PlusCircleIcon, PencilSquareIcon } from './icons';

const dummyStores = [
  { id: '001', empresa: 'LIV', nombre: 'INSTITUCIONAL CENTRO', formato: 'LIV', domicilio: 'Mario Pani No. 200', no: 'S/N', colonia: 'Santa Fe Cuajimalpa', delegacion: 'Cuajimalpa de Morelos', cp: '05348', entidad: 'Ciudad de México', pais: 'México', zonaEstatus: '1', tieneQmenor: 'NA', numFolioSerie: '0', folioInferior: 'LVC', folioSuperior: 'QALIV1', rangoInferior: '0', rangoSuperior: '20300000', vigencia: '2020-02-11', numAdicionales: '1', contador: '687', dirServidorSec: '172.20.101.21', zonaHoraria: 'Centro', modificar: true },
  { id: '002', empresa: 'LIV', nombre: 'LIVERPOOL INSURGENTES', formato: 'LIV', domicilio: 'Av. Insurgentes Sur No. 1310', no: 'S/N', colonia: 'Del Valle', delegacion: 'Benito Juárez', cp: '03100', entidad: 'Ciudad de México', pais: 'México', zonaEstatus: '1', tieneQmenor: 'FACTURAS', numFolioSerie: '0', folioInferior: 'LVS', folioSuperior: 'QALIV2', rangoInferior: '0', rangoSuperior: '20300000', vigencia: '2020-04-08', numAdicionales: '0', contador: '2014', dirServidorSec: '172.20.0.40', zonaHoraria: 'Centro', modificar: true },
  { id: '003', empresa: 'LIV', nombre: 'LIVERPOOL POLANCO', formato: 'LIV', domicilio: 'Mariano Escobedo No. 425', no: '425', colonia: 'Chapultepec Morales', delegacion: 'Miguel Hidalgo', cp: '11570', entidad: 'Ciudad de México', pais: 'México', zonaEstatus: '1', tieneQmenor: 'FACTURAS', numFolioSerie: '0', folioInferior: 'LVP', folioSuperior: 'QALIV3', rangoInferior: '0', rangoSuperior: '20300000', vigencia: '2020-11-16', numAdicionales: '4', contador: '739', dirServidorSec: '172.20.2.40', zonaHoraria: 'Centro', modificar: true },
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


export const AdminTiendasPage: React.FC = () => {
  const handleAddStore = () => {
    alert('Abrir formulario para agregar nueva tienda (simulado).');
  };

  const handleModifyStore = (storeId: string) => {
    alert(`Modificar tienda con ID: ${storeId} (simulado).`);
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
            {dummyStores.map((store) => (
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
      {dummyStores.length === 0 && (
        <p className="text-center py-4 text-gray-500 dark:text-gray-400">No hay tiendas registradas.</p>
      )}
    </Card>
  );
};