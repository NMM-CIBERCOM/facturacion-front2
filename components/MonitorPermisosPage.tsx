import React, { useState } from 'react';
import { Select } from './common/Select';

export const MonitorPermisosPage: React.FC = () => {
  const [selectedProfile, setSelectedProfile] = useState('');
  const [permissionValues, setPermissionValues] = useState<Record<string, string>>({});

  const profiles = [
    { value: 'administrador', label: 'Administrador' },
    { value: 'usuario_cancelado', label: 'Usuario Cancelado' },
    { value: 'jefe_credito', label: 'Jefe de Crédito' },
    { value: 'operador_credito', label: 'Operador de Crédito' },
    { value: 'usuario_consulta', label: 'Usuario de Consulta' },
    { value: 'jefe_credito_sfera', label: 'Jefe de Crédito SFERA' },
    { value: 'operador_credito_sfera', label: 'Operador de Crédito SFERA' },
    { value: 'produccion', label: 'Producción' },
    { value: 'soporte_operativo', label: 'Soporte Operativo Crédito' },
    { value: 'usuario_consulta_ci', label: 'Usuario de Consulta CI' },
    { value: 'ventas_institucionales', label: 'Ventas Institucionales' },
  ];

  const permissions = [
    { id: 'graficas', label: 'Permiso de Gráficas' },
    { id: 'bitacoras', label: 'Permiso de Bitácoras' },
    { id: 'permisos', label: 'Permiso de Permisos' },
    { id: 'disponibilidad', label: 'Permiso de Disponibilidad' },
    { id: 'logs', label: 'Permiso de Logs' },
    { id: 'decodificador', label: 'Permiso del decodificador de facturas' },
  ];

  const handlePermissionChange = (permissionId: string, value: string) => {
    setPermissionValues(prev => ({
      ...prev,
      [permissionId]: value
    }));
  };

  const handleUpdatePermissions = () => {
    console.log('Updating permissions:', {
      profile: selectedProfile,
      permissions: permissionValues
    });
    // Here you would typically make an API call to update the permissions
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-primary dark:text-secondary mb-6">Lista de Permisos</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Perfil:
            </label>
            <Select
              value={selectedProfile}
              onChange={(value) => setSelectedProfile(value)}
              options={[
                { value: '', label: 'Seleccionar perfil' },
                ...profiles
              ]}
              className="w-64"
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg">
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-primary dark:bg-secondary text-white p-3 grid grid-cols-2 rounded-t-lg">
                <div>Permiso</div>
                <div className="text-right">Valor</div>
              </div>
              
              {permissions.map((permission) => (
                <div 
                  key={permission.id}
                  className="grid grid-cols-2 p-3 items-center border-b border-gray-200 dark:border-gray-700"
                >
                  <div className="text-gray-700 dark:text-gray-300">{permission.label}</div>
                  <div className="text-right">
                    <Select
                      value={permissionValues[permission.id] || ''}
                      onChange={(value) => handlePermissionChange(permission.id, value)}
                      options={[
                        { value: 'permitido', label: 'Permitido' },
                        { value: 'denegado', label: 'Denegado' }
                      ]}
                      className="w-32 ml-auto"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button 
              onClick={handleUpdatePermissions}
              className="px-6 py-2 bg-primary dark:bg-secondary text-white rounded hover:bg-primary-dark dark:hover:bg-secondary-dark transition-colors"
            >
              Actualizar Permisos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};