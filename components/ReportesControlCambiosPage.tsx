import React, { useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { TextareaField } from './TextareaField';
import { Button } from './Button';
import { TrashIcon } from './icons';
import { dummyControlCambiosData } from '../constants';

interface VersionData {
  id: string;
  versionSistema: string;
  versionBroker: string;
  descripcion: string;
  fechaVersion: string;
}

interface NewVersionFormData {
  versionSistemaFacturacion: string;
  descripcionNuevaVersion: string;
  versionBroker: string;
  fechaVersion: string;
}

const initialNewVersionFormData: NewVersionFormData = {
  versionSistemaFacturacion: '',
  descripcionNuevaVersion: '',
  versionBroker: '',
  fechaVersion: new Date().toISOString().split('T')[0],
};

export const ReportesControlCambiosPage: React.FC = () => {
  const [newVersion, setNewVersion] = useState<NewVersionFormData>(initialNewVersionFormData);
  const [versions, setVersions] = useState<VersionData[]>(dummyControlCambiosData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setNewVersion({ ...newVersion, [e.target.name]: e.target.value });
  };

  const handleCrearVersion = (e: React.FormEvent) => {
    e.preventDefault();
    const newVersionData: VersionData = {
        id: `v${versions.length + 1}-${Date.now()}`,
        versionSistema: newVersion.versionSistemaFacturacion,
        versionBroker: newVersion.versionBroker,
        descripcion: newVersion.descripcionNuevaVersion,
        fechaVersion: new Date(newVersion.fechaVersion).toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.0' // Format to match dummy data
    };
    setVersions([newVersionData, ...versions]);
    setNewVersion(initialNewVersionFormData);
    alert('Nueva versión creada (simulado).');
  };

  const handleDeleteVersion = (id: string) => {
    setVersions(versions.filter(v => v.id !== id));
    alert(`Versión ${id} eliminada (simulado).`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">
          --Crear nueva versión--
        </h3>
        <form onSubmit={handleCrearVersion} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <FormField label="Versión del sistema de facturación:" name="versionSistemaFacturacion" value={newVersion.versionSistemaFacturacion} onChange={handleChange} required />
              <FormField label="Versión del broker:" name="versionBroker" value={newVersion.versionBroker} onChange={handleChange} required className="mt-4"/>
              <FormField label="Fecha de la versión:" name="fechaVersion" type="date" value={newVersion.fechaVersion} onChange={handleChange} required className="mt-4"/>
            </div>
            <TextareaField label="Descripción de la nueva versión:" name="descripcionNuevaVersion" value={newVersion.descripcionNuevaVersion} onChange={handleChange} rows={6} required />
          </div>
          <div className="flex justify-end">
            <Button type="submit" variant="primary">
              Crear
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">
          Historial de Cambios
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Identificador</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Versión Sistema Facturación</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Versión Broker</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Descripción de cambios</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha Versión</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Eliminar</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {versions.map((version) => (
                <tr key={version.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{version.id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{version.versionSistema}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{version.versionBroker}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-200 max-w-xs truncate hover:whitespace-normal" title={version.descripcion}>{version.descripcion}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{version.fechaVersion}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button onClick={() => handleDeleteVersion(version.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 p-1" aria-label={`Eliminar versión ${version.id}`}>
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
         {versions.length === 0 && (
            <p className="text-center py-4 text-gray-500 dark:text-gray-400">No hay versiones registradas.</p>
        )}
      </Card>
    </div>
  );
};
