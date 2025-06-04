import React, { useState } from 'react';
import { Card } from './Card';
import { Button } from './Button';
import { PlusCircleIcon, PencilSquareIcon } from './icons';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { TIENDA_OPTIONS } from '../constants';


interface Kiosco {
  id: string;
  tienda: string; // Store ID
  terminal: string;
  codigoPostal: string;
  ubicacion: string;
}

// Dummy data for kiosk list
const dummyKioscos: Kiosco[] = [
  { id: 'K001', tienda: '12', terminal: '1234', codigoPostal: '5501', ubicacion: 'M DEPA2' },
  { id: 'K002', tienda: '14', terminal: '3', codigoPostal: '28064', ubicacion: 'TUXTLA' },
  { id: 'K003', tienda: '72', terminal: '3', codigoPostal: '07141', ubicacion: 'Prueba de Kiosco' },
];

const initialKioscoData: Omit<Kiosco, 'id'> = {
    tienda: TIENDA_OPTIONS[0]?.value || '',
    terminal: '',
    codigoPostal: '',
    ubicacion: '',
};

export const AdminKioscosPage: React.FC = () => {
  const [kioscos, setKioscos] = useState<Kiosco[]>(dummyKioscos);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newKiosco, setNewKiosco] = useState(initialKioscoData);
  const [editingKiosco, setEditingKiosco] = useState<Kiosco | null>(null);


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (editingKiosco) {
        setEditingKiosco(prev => prev ? {...prev, [name]:value} : null);
    } else {
        setNewKiosco(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleAddKioscoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(editingKiosco) {
        setKioscos(kioscos.map(k => k.id === editingKiosco.id ? editingKiosco : k));
        alert(`Kiosco ${editingKiosco.id} actualizado (simulado).`);
        setEditingKiosco(null);
    } else {
        const kioscoToAdd: Kiosco = { ...newKiosco, id: `K${Date.now()}` };
        setKioscos(prev => [...prev, kioscoToAdd]);
        alert(`Kiosco ${kioscoToAdd.ubicacion} agregado (simulado).`);
    }
    setNewKiosco(initialKioscoData);
    setShowAddForm(false);
  };

  const handleModifyKiosco = (kiosco: Kiosco) => {
    setEditingKiosco(kiosco);
    setNewKiosco(kiosco); // Pre-fill form for editing
    setShowAddForm(true);
  };
  
  const toggleAddForm = () => {
    setEditingKiosco(null);
    setNewKiosco(initialKioscoData);
    setShowAddForm(!showAddForm);
  }


  const renderForm = () => (
     <Card className="mb-6">
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">
          {editingKiosco ? 'Modificar Kiosco' : 'Agregar Nuevo Kiosco'}
        </h3>
        <form onSubmit={handleAddKioscoSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField label="Tienda:" name="tienda" value={editingKiosco?.tienda || newKiosco.tienda} onChange={handleInputChange} options={TIENDA_OPTIONS.filter(t => t.value !== 'Todas')} required/>
            <FormField label="Terminal:" name="terminal" value={editingKiosco?.terminal || newKiosco.terminal} onChange={handleInputChange} required />
            <FormField label="Código Postal:" name="codigoPostal" value={editingKiosco?.codigoPostal || newKiosco.codigoPostal} onChange={handleInputChange} required />
            <FormField label="Ubicación:" name="ubicacion" value={editingKiosco?.ubicacion || newKiosco.ubicacion} onChange={handleInputChange} required />
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <Button type="button" variant="neutral" onClick={toggleAddForm}>Cancelar</Button>
            <Button type="submit" variant="primary">{editingKiosco ? 'Guardar Cambios' : 'Agregar Kiosco'}</Button>
          </div>
        </form>
      </Card>
  );


  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 sr-only">
          ADMINISTRACIÓN DE KIOSCOS
        </h2>
        <div></div> {/* Spacer */}
        {!showAddForm && (
            <Button onClick={toggleAddForm} variant="primary" className="flex items-center">
              <PlusCircleIcon className="w-5 h-5 mr-2" />
              Agregar
            </Button>
        )}
      </div>

      {showAddForm && renderForm()}

      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">
          Lista de Kiosco
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tienda</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Terminal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Código Postal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Ubicación</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Modificar</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {kioscos.map((kiosco) => (
                <tr key={kiosco.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{TIENDA_OPTIONS.find(t=>t.value === kiosco.tienda)?.label || kiosco.tienda}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{kiosco.terminal}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{kiosco.codigoPostal}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{kiosco.ubicacion}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button onClick={() => handleModifyKiosco(kiosco)} className="text-primary dark:text-secondary hover:underline p-1" aria-label={`Modificar kiosco ${kiosco.ubicacion}`}>
                      <PencilSquareIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {kioscos.length === 0 && (
            <p className="text-center py-4 text-gray-500 dark:text-gray-400">No hay kioscos registrados.</p>
        )}
      </Card>
    </div>
  );
};