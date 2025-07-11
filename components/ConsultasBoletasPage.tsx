import React, { useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { Button } from './Button';
import { FileInputField } from './FileInputField';
import { TIENDA_OPTIONS } from '../constants';

interface ConsultaIndividualFormData {
  tienda: string;
  fecha: string;
  terminal: string;
  boleta: string;
  codigoFacturacion: string;
}

interface Boleta {
  id: number;
  tienda: string;
  fecha: string;
  terminal: string;
  boleta: string;
  codigoFacturacion: string;
  total: number;
  estatus: string;
  cliente: string;
  articulos: number;
  hora: string;
  cajero: string;
}

const boletasMuestra: Boleta[] = [
  {
    id: 1,
    tienda: 'T001',
    fecha: '2023-10-15',
    terminal: 'TERM01',
    boleta: 'B001',
    codigoFacturacion: 'CF001',
    total: 1250.50,
    estatus: 'Disponible',
    cliente: 'Cliente General',
    articulos: 5,
    hora: '10:30',
    cajero: 'Juan Pérez'
  },
  {
    id: 2,
    tienda: 'T001',
    fecha: '2023-10-15',
    terminal: 'TERM01',
    boleta: 'B002',
    codigoFacturacion: 'CF002',
    total: 3450.75,
    estatus: 'Facturada',
    cliente: 'María Rodríguez',
    articulos: 8,
    hora: '11:45',
    cajero: 'Juan Pérez'
  },
  {
    id: 3,
    tienda: 'T002',
    fecha: '2023-10-16',
    terminal: 'TERM03',
    boleta: 'B003',
    codigoFacturacion: 'CF003',
    total: 5678.90,
    estatus: 'Disponible',
    cliente: 'Cliente General',
    articulos: 12,
    hora: '09:15',
    cajero: 'Ana López'
  },
  {
    id: 4,
    tienda: 'T002',
    fecha: '2023-10-16',
    terminal: 'TERM04',
    boleta: 'B004',
    codigoFacturacion: 'CF004',
    total: 1234.56,
    estatus: 'Cancelada',
    cliente: 'Pedro Sánchez',
    articulos: 3,
    hora: '14:20',
    cajero: 'Carlos Gómez'
  },
  {
    id: 5,
    tienda: 'T003',
    fecha: '2023-10-17',
    terminal: 'TERM05',
    boleta: 'B005',
    codigoFacturacion: 'CF005',
    total: 9876.54,
    estatus: 'Disponible',
    cliente: 'Empresa Ejemplo SA de CV',
    articulos: 20,
    hora: '16:30',
    cajero: 'Laura Martínez'
  }
];

const initialIndividualFormData: ConsultaIndividualFormData = {
  tienda: TIENDA_OPTIONS[0]?.value || '',
  fecha: new Date().toISOString().split('T')[0],
  terminal: '',
  boleta: '',
  codigoFacturacion: '',
};

export const ConsultasBoletasPage: React.FC = () => {
  const [individualFormData, setIndividualFormData] = useState<ConsultaIndividualFormData>(initialIndividualFormData);
  const [massFile, setMassFile] = useState<File | null>(null);
  const [resultados, setResultados] = useState<Boleta[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const handleIndividualChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setIndividualFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (file: File | null) => {
    setMassFile(file);
  };

  const handleIndividualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Consultando Boleta Individual:', individualFormData);
    
    // Filtrar boletas según los criterios de búsqueda
    let resultadosFiltrados = [...boletasMuestra];
    
    // Aplicar filtros basados en los campos del formulario que tengan valor
    if (individualFormData.tienda && individualFormData.tienda !== 'todas') {
      resultadosFiltrados = resultadosFiltrados.filter(boleta => 
        boleta.tienda === individualFormData.tienda
      );
    }
    
    if (individualFormData.fecha) {
      resultadosFiltrados = resultadosFiltrados.filter(boleta => 
        boleta.fecha === individualFormData.fecha
      );
    }
    
    if (individualFormData.terminal) {
      resultadosFiltrados = resultadosFiltrados.filter(boleta => 
        boleta.terminal.toLowerCase().includes(individualFormData.terminal.toLowerCase())
      );
    }
    
    if (individualFormData.boleta) {
      resultadosFiltrados = resultadosFiltrados.filter(boleta => 
        boleta.boleta.toLowerCase().includes(individualFormData.boleta.toLowerCase())
      );
    }
    
    if (individualFormData.codigoFacturacion) {
      resultadosFiltrados = resultadosFiltrados.filter(boleta => 
        boleta.codigoFacturacion.toLowerCase().includes(individualFormData.codigoFacturacion.toLowerCase())
      );
    }
    
    // Casos especiales para demostración
    // Si se busca específicamente la boleta B001
    if (individualFormData.boleta === 'B001') {
      resultadosFiltrados = boletasMuestra.filter(b => b.boleta === 'B001');
    }
    
    // Si se busca específicamente la terminal TERM01
    if (individualFormData.terminal === 'TERM01') {
      resultadosFiltrados = boletasMuestra.filter(b => b.terminal === 'TERM01');
    }
    
    // Si se busca específicamente la tienda T001
    if (individualFormData.tienda === 'T001') {
      resultadosFiltrados = boletasMuestra.filter(b => b.tienda === 'T001');
    }
    
    setResultados(resultadosFiltrados);
    setMostrarResultados(true);
  };

  const handleMassSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (massFile) {
      console.log('Consultando Boletas Masiva, Archivo:', massFile.name);
      // Simulamos que el archivo contiene todas las boletas de muestra
      setResultados(boletasMuestra);
      setMostrarResultados(true);
    } else {
      alert('Por favor, seleccione un archivo para la consulta masiva.');
    }
  };
  
  const fileHelpText = "El archivo debe ser .xlsx o .csv y contener los datos de las boletas a consultar.";

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  return (
    <div className="space-y-8">
      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">
          --Ingresa los datos para consulta:--
        </h3>
        <form onSubmit={handleIndividualSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-2 items-end">
            <SelectField label="Tienda:" name="tienda" value={individualFormData.tienda} onChange={handleIndividualChange} options={TIENDA_OPTIONS} className="lg:col-span-1" />
            <FormField label="Fecha:" name="fecha" type="date" value={individualFormData.fecha} onChange={handleIndividualChange} className="lg:col-span-1" />
            <FormField label="Terminal:" name="terminal" value={individualFormData.terminal} onChange={handleIndividualChange} className="lg:col-span-1" />
            <FormField label="Boleta:" name="boleta" value={individualFormData.boleta} onChange={handleIndividualChange} className="lg:col-span-1" />
            <div></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-2 items-end">
            <FormField label="Código de facturación:" name="codigoFacturacion" value={individualFormData.codigoFacturacion} onChange={handleIndividualChange} className="lg:col-span-2" />
            <div className="lg:col-span-2"></div>
            <div className="flex justify-start lg:justify-end pt-1">
                <Button type="submit" variant="primary">
                    Consultar
                </Button>
            </div>
          </div>
        </form>
      </Card>

      <Card>
        <form onSubmit={handleMassSubmit} className="space-y-4">
           <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">
            Consulta Masiva
            </h3>
          <FileInputField
            label="Archivo para Consulta Masiva:"
            name="consultaMasivaFile"
            onChange={handleFileChange}
            accept=".xlsx, .csv"
            helpText={fileHelpText}
          />
          <div className="mt-4 flex justify-start">
            <Button type="submit" variant="primary">
              Consulta Masiva
            </Button>
          </div>
        </form>
      </Card>

      {!mostrarResultados ? (
        <div className="mt-6 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md min-h-[200px] flex items-center justify-center text-gray-400 dark:text-gray-500">
          Los resultados de la consulta de boletas aparecerán aquí.
        </div>
      ) : (
        <Card className="mt-6">
          <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">
            Resultados de la búsqueda
          </h3>
          
          {resultados.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No se encontraron boletas que coincidan con los criterios de búsqueda.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tienda</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Hora</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Terminal</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Boleta</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Código Fact.</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Artículos</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estatus</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Cajero</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {resultados.map((boleta) => (
                      <tr key={boleta.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{boleta.tienda}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{boleta.fecha}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{boleta.hora}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{boleta.terminal}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{boleta.boleta}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{boleta.codigoFacturacion}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200 truncate max-w-xs" title={boleta.cliente}>
                          {boleta.cliente}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{boleta.articulos}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{formatearMoneda(boleta.total)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            boleta.estatus === 'Disponible' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : boleta.estatus === 'Facturada'
                                ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {boleta.estatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{boleta.cajero}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Mostrando {resultados.length} boletas
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  );
};
