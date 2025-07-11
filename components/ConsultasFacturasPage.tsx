import React, { useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { Button } from './Button';
import { ALMACEN_OPTIONS, MOTIVO_SUSTITUCION_OPTIONS, TIENDA_OPTIONS } from '../constants';

interface ConsultaFacturasFormData {
  rfcReceptor: string;
  nombreCliente: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  razonSocial: string;
  almacen: string;
  usuario: string;
  serie: string;
  folio: string;
  uuid: string;
  fechaInicio: string;
  fechaFin: string;
  tienda: string;
  te: string;
  tr: string;
  fechaTienda: string;
  codigoFacturacion: string;
  motivoSustitucion: string;
}

interface Factura {
  id: number;
  uuid: string;
  serie: string;
  folio: string;
  fechaEmision: string;
  rfcReceptor: string;
  nombreReceptor: string;
  total: number;
  estatus: string;
  tienda: string;
  almacen: string;
  usuario: string;
}

const facturasMuestra: Factura[] = [
  {
    id: 1,
    uuid: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
    serie: 'A',
    folio: '1001',
    fechaEmision: '2023-10-15',
    rfcReceptor: 'XAXX010101000',
    nombreReceptor: 'Juan Pérez López',
    total: 1250.50,
    estatus: 'Vigente',
    tienda: 'T001',
    almacen: 'CDMX',
    usuario: 'usuario1'
  },
  {
    id: 2,
    uuid: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    serie: 'A',
    folio: '1002',
    fechaEmision: '2023-10-16',
    rfcReceptor: 'XAXX010101000',
    nombreReceptor: 'Juan Pérez López',
    total: 3450.75,
    estatus: 'Vigente',
    tienda: 'T001',
    almacen: 'CDMX',
    usuario: 'usuario1'
  },
  {
    id: 3,
    uuid: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
    serie: 'B',
    folio: '2001',
    fechaEmision: '2023-10-17',
    rfcReceptor: 'ABCD123456XYZ',
    nombreReceptor: 'María Rodríguez Sánchez',
    total: 5678.90,
    estatus: 'Vigente',
    tienda: 'T002',
    almacen: 'GDL',
    usuario: 'usuario2'
  },
  {
    id: 4,
    uuid: 'd4e5f6a7-b8c9-0123-defg-456789012345',
    serie: 'B',
    folio: '2002',
    fechaEmision: '2023-10-18',
    rfcReceptor: 'ABCD123456XYZ',
    nombreReceptor: 'María Rodríguez Sánchez',
    total: 1234.56,
    estatus: 'Cancelada',
    tienda: 'T002',
    almacen: 'GDL',
    usuario: 'usuario2'
  },
  {
    id: 5,
    uuid: 'e5f6a7b8-c9d0-1234-efgh-567890123456',
    serie: 'C',
    folio: '3001',
    fechaEmision: '2023-10-19',
    rfcReceptor: 'EFGH987654ABC',
    nombreReceptor: 'Empresa Ejemplo SA de CV',
    total: 9876.54,
    estatus: 'Vigente',
    tienda: 'T003',
    almacen: 'MTY',
    usuario: 'usuario3'
  }
];

const initialFormData: ConsultaFacturasFormData = {
  rfcReceptor: '',
  nombreCliente: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  razonSocial: '',
  almacen: ALMACEN_OPTIONS[ALMACEN_OPTIONS.length-1]?.value || '',
  usuario: '',
  serie: '',
  folio: '',
  uuid: '',
  fechaInicio: '',
  fechaFin: '',
  tienda: TIENDA_OPTIONS[0]?.value || '',
  te: '',
  tr: '',
  fechaTienda: '',
  codigoFacturacion: '',
  motivoSustitucion: MOTIVO_SUSTITUCION_OPTIONS[0]?.value || '',
};

export const ConsultasFacturasPage: React.FC = () => {
  const [formData, setFormData] = useState<ConsultaFacturasFormData>(initialFormData);
  const [resultados, setResultados] = useState<Factura[]>([]);
  const [mostrarResultados, setMostrarResultados] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Buscando Facturas:', formData);
    
    // Filtrar facturas según los criterios de búsqueda
    let resultadosFiltrados = [...facturasMuestra];
    
    // Aplicar filtros basados en los campos del formulario que tengan valor
    if (formData.rfcReceptor) {
      resultadosFiltrados = resultadosFiltrados.filter(factura => 
        factura.rfcReceptor.toLowerCase().includes(formData.rfcReceptor.toLowerCase())
      );
    }
    
    if (formData.nombreCliente || formData.apellidoPaterno || formData.apellidoMaterno) {
      const nombreCompleto = `${formData.nombreCliente} ${formData.apellidoPaterno} ${formData.apellidoMaterno}`.trim().toLowerCase();
      if (nombreCompleto) {
        resultadosFiltrados = resultadosFiltrados.filter(factura => 
          factura.nombreReceptor.toLowerCase().includes(nombreCompleto)
        );
      }
    }
    
    if (formData.razonSocial) {
      resultadosFiltrados = resultadosFiltrados.filter(factura => 
        factura.nombreReceptor.toLowerCase().includes(formData.razonSocial.toLowerCase())
      );
    }
    
    if (formData.almacen && formData.almacen !== 'todos') {
      resultadosFiltrados = resultadosFiltrados.filter(factura => 
        factura.almacen === formData.almacen
      );
    }
    
    if (formData.usuario) {
      resultadosFiltrados = resultadosFiltrados.filter(factura => 
        factura.usuario.toLowerCase().includes(formData.usuario.toLowerCase())
      );
    }
    
    if (formData.serie) {
      resultadosFiltrados = resultadosFiltrados.filter(factura => 
        factura.serie.toLowerCase() === formData.serie.toLowerCase()
      );
    }
    
    if (formData.folio) {
      resultadosFiltrados = resultadosFiltrados.filter(factura => 
        factura.folio === formData.folio
      );
    }
    
    if (formData.uuid) {
      resultadosFiltrados = resultadosFiltrados.filter(factura => 
        factura.uuid.toLowerCase().includes(formData.uuid.toLowerCase())
      );
    }
    
    if (formData.fechaInicio && formData.fechaFin) {
      resultadosFiltrados = resultadosFiltrados.filter(factura => 
        factura.fechaEmision >= formData.fechaInicio && factura.fechaEmision <= formData.fechaFin
      );
    } else if (formData.fechaInicio) {
      resultadosFiltrados = resultadosFiltrados.filter(factura => 
        factura.fechaEmision >= formData.fechaInicio
      );
    } else if (formData.fechaFin) {
      resultadosFiltrados = resultadosFiltrados.filter(factura => 
        factura.fechaEmision <= formData.fechaFin
      );
    }
    
    if (formData.tienda && formData.tienda !== 'todas') {
      resultadosFiltrados = resultadosFiltrados.filter(factura => 
        factura.tienda === formData.tienda
      );
    }
    
    // Casos especiales para demostración
    // Si se busca específicamente el RFC XAXX010101000
    if (formData.rfcReceptor === 'XAXX010101000') {
      resultadosFiltrados = facturasMuestra.filter(f => f.rfcReceptor === 'XAXX010101000');
    }
    
    // Si se busca específicamente la serie A
    if (formData.serie === 'A') {
      resultadosFiltrados = facturasMuestra.filter(f => f.serie === 'A');
    }
    
    // Si se busca específicamente la tienda T001
    if (formData.tienda === 'T001') {
      resultadosFiltrados = facturasMuestra.filter(f => f.tienda === 'T001');
    }
    
    setResultados(resultadosFiltrados);
    setMostrarResultados(true);
  };

  const formatearMoneda = (valor: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(valor);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">
          --Ingresa los datos para consulta (por grupo):--
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2">
          <FormField label="RFC Receptor:" name="rfcReceptor" value={formData.rfcReceptor} onChange={handleChange} />
          <FormField label="Nombre del Cliente:" name="nombreCliente" value={formData.nombreCliente} onChange={handleChange} />
          <FormField label="Apellido Paterno:" name="apellidoPaterno" value={formData.apellidoPaterno} onChange={handleChange} />
          <FormField label="Apellido Materno:" name="apellidoMaterno" value={formData.apellidoMaterno} onChange={handleChange} />
          <FormField label="Razón Social:" name="razonSocial" value={formData.razonSocial} onChange={handleChange} />
          <SelectField label="Almacén:" name="almacen" value={formData.almacen} onChange={handleChange} options={ALMACEN_OPTIONS} />
          <FormField label="Usuario:" name="usuario" value={formData.usuario} onChange={handleChange} />
          <FormField label="Serie:" name="serie" value={formData.serie} onChange={handleChange} />
          <FormField label="Folio:" name="folio" value={formData.folio} onChange={handleChange} />
          <FormField label="UUID:" name="uuid" value={formData.uuid} onChange={handleChange} />
          <FormField label="Fecha Inicio:" name="fechaInicio" type="date" value={formData.fechaInicio} onChange={handleChange} />
          <FormField label="Fecha Fin:" name="fechaFin" type="date" value={formData.fechaFin} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-2 mt-4 items-end">
            <SelectField label="Tienda:" name="tienda" value={formData.tienda} onChange={handleChange} options={TIENDA_OPTIONS} className="lg:col-span-1"/>
            <FormField label="TE:" name="te" value={formData.te} onChange={handleChange} className="lg:col-span-1"/>
            <FormField label="TR:" name="tr" value={formData.tr} onChange={handleChange} className="lg:col-span-1"/>
            <FormField label="Fecha:" name="fechaTienda" type="date" value={formData.fechaTienda} onChange={handleChange} className="lg:col-span-1"/>
            <FormField label="Código de facturación:" name="codigoFacturacion" value={formData.codigoFacturacion} onChange={handleChange} className="lg:col-span-1"/>
        </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-2 mt-4">
            <SelectField label="Motivo Sustitución:" name="motivoSustitucion" value={formData.motivoSustitucion} onChange={handleChange} options={MOTIVO_SUSTITUCION_OPTIONS} />
        </div>
        <div className="mt-6 flex justify-start">
          <Button type="submit" variant="primary">
            Buscar
          </Button>
        </div>
      </Card>

      {!mostrarResultados ? (
        <div className="mt-6 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md min-h-[200px] flex items-center justify-center text-gray-400 dark:text-gray-500">
          Los resultados de la búsqueda de facturas aparecerán aquí.
        </div>
      ) : (
        <Card className="mt-6">
          <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">
            Resultados de la búsqueda
          </h3>
          
          {resultados.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No se encontraron facturas que coincidan con los criterios de búsqueda.
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">UUID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Serie</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Folio</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha Emisión</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">RFC Receptor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nombre Receptor</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estatus</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tienda</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Almacén</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {resultados.map((factura) => (
                      <tr key={factura.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200 truncate max-w-xs" title={factura.uuid}>
                          {factura.uuid}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{factura.serie}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{factura.folio}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{factura.fechaEmision}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{factura.rfcReceptor}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200 truncate max-w-xs" title={factura.nombreReceptor}>
                          {factura.nombreReceptor}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{formatearMoneda(factura.total)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            factura.estatus === 'Vigente' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {factura.estatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{factura.tienda}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{factura.almacen}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                Mostrando {resultados.length} facturas
              </div>
            </>
          )}
        </Card>
      )}
    </form>
  );
};
