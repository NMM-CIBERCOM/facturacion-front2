import React, { useState } from 'react';
import { facturaService } from '../services/facturaService';

const TestPdfPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const generarPDFPrueba = async () => {
    setLoading(true);
    setMessage('Generando PDF de prueba...');
    
    try {
      // Obtener configuración de logos
      const logoConfig = await facturaService.obtenerConfiguracionLogos();
      
      if (!logoConfig.exitoso) {
        throw new Error('No se pudo obtener la configuración de logos');
      }

      // Datos de factura de prueba
      const facturaDataPrueba = {
        uuid: 'TEST-UUID-' + Date.now(),
        serie: 'TEST',
        folio: '001',
        nombreEmisor: 'Empresa de Prueba',
        nombreReceptor: 'Cliente de Prueba',
        rfcEmisor: 'TEST123456789',
        rfcReceptor: 'XEXX010101000',
        fechaEmision: new Date().toISOString(),
        importe: 1000.00,
        subtotal: 862.07,
        iva: 137.93,
        conceptos: [{
          descripcion: 'Producto de prueba',
          cantidad: 1,
          unidad: 'PZA',
          precioUnitario: 1000.00,
          importe: 1000.00
        }],
        metodoPago: 'PUE',
        formaPago: '01',
        usoCFDI: 'G01'
      };

      // Generar PDF
      const response = await fetch('http://localhost:8080/api/factura/generar-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          facturaData: facturaDataPrueba,
          logoConfig: {
            logoUrl: logoConfig.logoUrl,
            logoBase64: logoConfig.logoBase64,
            customColors: logoConfig.customColors
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('Blob creado:', blob.size, 'bytes, tipo:', blob.type);
      
      if (blob.size === 0) {
        throw new Error('El PDF generado está vacío');
      }
      
      if (!blob.type.includes('pdf')) {
        console.warn('Tipo de contenido inesperado:', blob.type);
      }
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `PDF_Prueba_Logo_${Date.now()}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      setMessage(`✅ PDF generado exitosamente con logo (${logoConfig.logoBase64?.length || 0} caracteres base64)`);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const abrirPDFEnNuevaPestana = async () => {
    setLoading(true);
    setMessage('Generando PDF para abrir en nueva pestaña...');
    
    try {
      // Obtener configuración de logos
      const logoConfig = await facturaService.obtenerConfiguracionLogos();
      
      if (!logoConfig.exitoso) {
        throw new Error('No se pudo obtener la configuración de logos');
      }

      // Datos de factura de prueba
      const facturaDataPrueba = {
        uuid: 'TEST-UUID-' + Date.now(),
        serie: 'TEST',
        folio: '001',
        nombreEmisor: 'Empresa de Prueba',
        nombreReceptor: 'Cliente de Prueba',
        rfcEmisor: 'TEST123456789',
        rfcReceptor: 'XEXX010101000',
        fechaEmision: new Date().toISOString(),
        importe: 1000.00,
        subtotal: 862.07,
        iva: 137.93,
        conceptos: [{
          descripcion: 'Producto de prueba',
          cantidad: 1,
          unidad: 'PZA',
          precioUnitario: 1000.00,
          importe: 1000.00
        }],
        metodoPago: 'PUE',
        formaPago: '01',
        usoCFDI: 'G01'
      };

      // Generar PDF
      const response = await fetch('http://localhost:8080/api/factura/generar-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          facturaData: facturaDataPrueba,
          logoConfig: {
            logoUrl: logoConfig.logoUrl,
            logoBase64: logoConfig.logoBase64,
            customColors: logoConfig.customColors
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status}`);
      }

      const blob = await response.blob();
      console.log('Blob creado para nueva pestaña:', blob.size, 'bytes, tipo:', blob.type);
      
      if (blob.size === 0) {
        throw new Error('El PDF generado está vacío');
      }
      
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Limpiar la URL después de un tiempo
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 10000);

      setMessage(`✅ PDF abierto en nueva pestaña (${blob.size} bytes)`);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const probarEndpointLogo = async () => {
    setLoading(true);
    setMessage('Probando endpoint de logo...');
    
    try {
      const logoConfig = await facturaService.obtenerConfiguracionLogos();
      
      if (logoConfig.exitoso) {
        setMessage(`✅ Logo obtenido: ${logoConfig.logoBase64?.length || 0} caracteres, URL: ${logoConfig.logoUrl}`);
      } else {
        setMessage(`❌ Error obteniendo logo: ${logoConfig.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">🧪 Prueba de PDF con Logo</h1>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-blue-800 mb-2">Prueba de Logo</h2>
            <p className="text-blue-600 mb-4">Verifica que el endpoint de logos funcione correctamente</p>
            <button
              onClick={probarEndpointLogo}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? 'Probando...' : 'Probar Endpoint Logo'}
            </button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h2 className="text-lg font-semibold text-green-800 mb-2">Generar PDF de Prueba</h2>
            <p className="text-green-600 mb-4">Genera un PDF completo con datos de prueba y logo</p>
            <div className="space-y-2">
              <button
                onClick={generarPDFPrueba}
                disabled={loading}
                className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-4 py-2 rounded-lg transition-colors mr-2"
              >
                {loading ? 'Generando...' : 'Descargar PDF'}
              </button>
              <button
                onClick={abrirPDFEnNuevaPestana}
                disabled={loading}
                className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg transition-colors"
              >
                {loading ? 'Generando...' : 'Abrir en Nueva Pestaña'}
              </button>
            </div>
          </div>

          {message && (
            <div className={`p-4 rounded-lg ${
              message.includes('✅') 
                ? 'bg-green-100 border border-green-200 text-green-800'
                : message.includes('❌')
                ? 'bg-red-100 border border-red-200 text-red-800'
                : 'bg-yellow-100 border border-yellow-200 text-yellow-800'
            }`}>
              <p className="font-medium">{message}</p>
            </div>
          )}
        </div>

        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="text-md font-semibold text-gray-700 mb-2">Información Técnica</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Backend: http://localhost:8080</li>
            <li>• Endpoint PDF: /api/factura/generar-pdf</li>
            <li>• Endpoint Logo: /api/logos/configuracion</li>
            <li>• Formato: SVG en Base64</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TestPdfPage;