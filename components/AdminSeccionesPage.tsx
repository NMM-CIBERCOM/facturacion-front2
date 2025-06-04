import React, { useState } from 'react';
import { Card } from './Card';
import { SelectField } from './SelectField';
import { Button } from './Button';
import { TrashIcon } from './icons';
import { ORIGEN_OPTIONS_ADMIN, SECCIONES_FACTURABLES_OPTIONS } from '../constants';

interface SeccionNoFacturable {
  id: string;
  origen: string;
  noSeccionViajero: string;
  nombreSeccionViajero: string;
}

const initialNewSeccionData: Omit<SeccionNoFacturable, 'id' | 'nombreSeccionViajero'> = {
  origen: ORIGEN_OPTIONS_ADMIN[0]?.value || '',
  noSeccionViajero: SECCIONES_FACTURABLES_OPTIONS[0]?.value || '',
};

const dummySecciones: SeccionNoFacturable[] = [
  { id: '1', origen: 'web', noSeccionViajero: '700', nombreSeccionViajero: 'CONFIRMAR 16 20 NOVIEMBRE' },
  { id: '2', origen: 'web', noSeccionViajero: '104', nombreSeccionViajero: 'KRISPY KREME' },
  { id: '3', origen: 'web', noSeccionViajero: '207', nombreSeccionViajero: 'MOTOS' },
];

export const AdminSeccionesPage: React.FC = () => {
  const [newSeccion, setNewSeccion] = useState(initialNewSeccionData);
  const [secciones, setSecciones] = useState<SeccionNoFacturable[]>(dummySecciones);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewSeccion(prev => ({ ...prev, [name]: value }));
  };

  const handleAddSeccion = (e: React.FormEvent) => {
    e.preventDefault();
    const seccionLabel = SECCIONES_FACTURABLES_OPTIONS.find(s => s.value === newSeccion.noSeccionViajero)?.label || newSeccion.noSeccionViajero;
    const nuevaSeccionConId: SeccionNoFacturable = { 
        ...newSeccion, 
        nombreSeccionViajero: seccionLabel, 
        id: Date.now().toString() 
    };
    setSecciones(prev => [...prev, nuevaSeccionConId]);
    setNewSeccion(initialNewSeccionData);
    alert('Sección no facturable agregada (simulado).');
  };

  const handleDeleteSeccion = (id: string) => {
    setSecciones(prev => prev.filter(s => s.id !== id));
    alert(`Sección con ID ${id} eliminada (simulado).`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleAddSeccion} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <SelectField 
                label="Origen:" 
                name="origen" 
                value={newSeccion.origen} 
                onChange={handleChange} 
                options={ORIGEN_OPTIONS_ADMIN} 
                required 
            />
            <SelectField 
                label="Secciones:" 
                name="noSeccionViajero" 
                value={newSeccion.noSeccionViajero} 
                onChange={handleChange} 
                options={SECCIONES_FACTURABLES_OPTIONS} 
                required
            />
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <Button type="button" variant="secondary" onClick={() => alert('Nueva Sección (simulado)')}>Nueva Sección</Button>
            <Button type="submit" variant="primary">Agregar Sección</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">
          Lista de secciones no facturables
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Origen</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">No. Sección viajero</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nombre Sección viajero</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Eliminar</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {secciones.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{ORIGEN_OPTIONS_ADMIN.find(o => o.value === s.origen)?.label || s.origen}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{s.noSeccionViajero}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{s.nombreSeccionViajero}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button onClick={() => handleDeleteSeccion(s.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 p-1" aria-label={`Eliminar sección ${s.nombreSeccionViajero}`}>
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {secciones.length === 0 && (
            <p className="text-center py-4 text-gray-500 dark:text-gray-400">No hay secciones no facturables definidas.</p>
        )}
      </Card>
    </div>
  );
};