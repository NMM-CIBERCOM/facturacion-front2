import React from 'react';
import { Card } from './Card';
import { useEmpresa } from '../context/EmpresaContext';

export const ConfiguracionEmpresaPage: React.FC = () => {
  const { empresaInfo, setEmpresaInfo } = useEmpresa();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ahora los cambios se guardarán en localStorage automáticamente
    console.log('Guardando cambios:', empresaInfo);
  };

  return (
    <div className="animate-fadeIn p-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-6">
        Configuración de la Empresa
      </h2>
      
      <Card className="max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="nombre" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Nombre de la Empresa
            </label>
            <input
              type="text"
              id="nombre"
              value={empresaInfo.nombre}
              onChange={(e) => setEmpresaInfo({ ...empresaInfo, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label 
              htmlFor="rfc" 
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              RFC
            </label>
            <input
              type="text"
              id="rfc"
              value={empresaInfo.rfc}
              onChange={(e) => setEmpresaInfo({ ...empresaInfo, rfc: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
              pattern="^[A-ZÑ&]{3,4}\d{6}[A-V1-9][A-Z1-9][0-9A]$"
              title="Ingrese un RFC válido"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary dark:bg-primary-dark dark:hover:bg-primary"
            >
              Guardar Cambios
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};