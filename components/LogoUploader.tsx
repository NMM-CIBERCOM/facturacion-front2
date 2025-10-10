import React, { useState, useEffect } from 'react';
import { Button } from './Button';
import { Card } from './Card';

interface LogoUploaderProps {
  onLogoChange: (logoBase64: string) => void;
  initialLogo?: string;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({ onLogoChange, initialLogo }) => {
  const [logo, setLogo] = useState<string | null>(initialLogo || null);
  const [error, setError] = useState<string | null>(null);

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    
    if (!file) return;
    
    // Validar tipo de archivo
    if (!file.type.match('image.*')) {
      setError('Por favor selecciona una imagen válida');
      return;
    }
    
    // Validar tamaño (máximo 1MB)
    if (file.size > 1024 * 1024) {
      setError('La imagen debe ser menor a 1MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setLogo(base64);
      onLogoChange(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogo(null);
    onLogoChange('');
  };

  return (
    <Card className="mb-4">
      <h3 className="text-lg font-medium mb-2">Logo para correos electrónicos</h3>
      <p className="text-sm text-gray-600 mb-4">
        Este logo aparecerá en los correos electrónicos enviados con las facturas.
      </p>
      
      {logo && (
        <div className="mb-4">
          <div className="border p-4 rounded-md bg-blue-50 flex justify-center mb-2">
            <img 
              src={logo} 
              alt="Logo para correos" 
              className="max-h-24 max-w-full object-contain" 
            />
          </div>
          <Button 
            onClick={handleRemoveLogo}
            variant="secondary"
            className="text-sm"
          >
            Eliminar logo
          </Button>
        </div>
      )}
      
      <div className="mt-2">
        <label className="block mb-2 text-sm font-medium">
          {logo ? 'Cambiar logo' : 'Subir logo'}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <p className="mt-1 text-sm text-gray-500">
          PNG, JPG o SVG (máx. 1MB)
        </p>
      </div>
    </Card>
  );
};