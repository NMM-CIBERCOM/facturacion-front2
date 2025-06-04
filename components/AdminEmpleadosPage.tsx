import React, { useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { Button } from './Button';
import { FileInputField } from './FileInputField';

interface UserSearchData {
  usuario: string;
}

const initialUserSearchData: UserSearchData = {
  usuario: '',
};

export const AdminEmpleadosPage: React.FC = () => {
  const [userSearch, setUserSearch] = useState<UserSearchData>(initialUserSearchData);
  const [massDeleteFile, setMassDeleteFile] = useState<File | null>(null);

  const handleUserSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserSearch({ ...userSearch, [e.target.name]: e.target.value });
  };

  const handleConsultarUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Consultando usuario: ${userSearch.usuario} (simulado)`);
    // Logic to display user data would go here
  };

  const handleAltaUsuario = () => {
    alert('Redirigiendo a formulario de Alta de Usuario (simulado)');
    // Logic for new user registration form
  };

  const handleFileChange = (file: File | null) => {
    setMassDeleteFile(file);
  };

  const handleMassDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (massDeleteFile) {
      alert(`Procesando eliminación masiva con archivo: ${massDeleteFile.name} (simulado)`);
    } else {
      alert('Por favor, seleccione un archivo para la eliminación masiva.');
    }
  };
  
  const fileHelpText = "El archivo debe contener los identificadores de los usuarios a eliminar, uno por línea.";

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 sr-only">
        ADMINISTRACIÓN DE EMPLEADOS
      </h2>

      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">
          BUSCAR DATOS DE USUARIO
        </h3>
        <form onSubmit={handleConsultarUsuario} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-4">
            <FormField
              label="Usuario:"
              name="usuario"
              value={userSearch.usuario}
              onChange={handleUserSearchChange}
              className="md:col-span-2"
            />
            <div className="flex space-x-3">
              <Button type="submit" variant="primary" className="w-full md:w-auto">
                Consultar
              </Button>
              <Button type="button" onClick={handleAltaUsuario} variant="secondary" className="w-full md:w-auto">
                Alta
              </Button>
            </div>
          </div>
        </form>
      </Card>

      <Card className="bg-accent/10 dark:bg-accent-dark/10 border-accent dark:border-accent-dark">
        <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
          Dar de baja usuarios
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Ingresa los datos para eliminar permisos de usuario:
        </p>
        <form onSubmit={handleMassDeleteSubmit} className="space-y-4">
          <FileInputField
            label="Archivo de Eliminación Masiva:"
            name="massDeleteFile"
            onChange={handleFileChange}
            accept=".txt, .csv"
            helpText={fileHelpText}
          />
          <div className="flex justify-start">
            <Button type="submit" variant="primary">
              Eliminación Masiva
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};