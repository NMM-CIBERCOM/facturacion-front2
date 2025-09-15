import React, { useState } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { Button } from './Button';
import { TIENDA_OPTIONS, TIPO_FACTURA_OPTIONS, ESTATUS_FACTURA_OPTIONS } from '../constants';

// Toast y Modal genéricos
const Toast: React.FC<{ message: string; type?: 'success' | 'error'; onClose: () => void }> = ({ message, type = 'success', onClose }) => (
  <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white transition-all ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
    role="alert">
    <div className="flex items-center space-x-2">
      <span>{message}</span>
      <button onClick={onClose} className="ml-2 text-white hover:text-gray-200 font-bold">×</button>
    </div>
  </div>
);

const Modal: React.FC<{ open: boolean; title: string; children: React.ReactNode; onClose: () => void; onConfirm?: () => void; confirmText?: string; loading?: boolean; }> = ({ open, title, children, onClose, onConfirm, confirmText = 'Confirmar', loading }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 min-w-[320px] max-w-[90vw]">
        <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">{title}</h2>
        <div className="mb-6 text-gray-700 dark:text-gray-200">{children}</div>
        <div className="flex justify-end space-x-3">
          <Button type="button" variant="neutral" onClick={onClose} disabled={loading}>Cancelar</Button>
          {onConfirm && (
            <Button type="button" variant="primary" onClick={onConfirm} disabled={loading}>
              {loading ? 'Procesando...' : confirmText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};


interface FacturaGlobalFormData {
  fecha: string;
  tienda: string;
  tipoFactura: string;
  estatus: string;
}

interface FacturaResult {
  id: number;
  folio: string;
  fecha: string;
  tienda: string;
  subtotal: number;
  iva: number;
  total: number;
  estatus: 'Timbrada' | 'Cancelada' | 'Pendiente';
}

// Datos de ejemplo que se mostrarán en la tabla
const DUMMY_RESULTS: FacturaResult[] = [
  { id: 1, folio: 'FG-00123', fecha: '2025-07-07', tienda: 'Sucursal 1 (S001)', subtotal: 1500.00, iva: 240.00, total: 1740.00, estatus: 'Timbrada' },
  { id: 2, folio: 'FG-00124', fecha: '2025-07-07', tienda: 'Sucursal 1 (S001)', subtotal: 850.50, iva: 136.08, total: 986.58, estatus: 'Timbrada' },
  { id: 3, folio: 'FG-00120', fecha: '2025-07-06', tienda: 'Sucursal 1 (S001)', subtotal: 2100.00, iva: 336.00, total: 2436.00, estatus: 'Cancelada' },
  { id: 4, folio: 'FG-00125', fecha: '2025-07-07', tienda: 'Sucursal 2 (S002)', subtotal: 320.00, iva: 51.20, total: 371.20, estatus: 'Pendiente' },
];

const initialFacturaGlobalFormData: FacturaGlobalFormData = {
  fecha: '2025-07-07',
  tienda: 'T001',      
  tipoFactura: '',     
  estatus: '',         
};


interface SearchResultsTableProps {
  results: FacturaResult[];
}

const SearchResultsTable: React.FC<SearchResultsTableProps & {
  onPdf: (factura: FacturaResult) => void;
  onXml: (factura: FacturaResult) => void;
  onCancelar: (factura: FacturaResult) => void;
}> = ({ results, onPdf, onXml, onCancelar }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Timbrada':
        return 'bg-green-100 text-green-800';
      case 'Cancelada':
        return 'bg-red-100 text-red-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {['Folio', 'Fecha', 'Tienda', 'Subtotal', 'IVA', 'Total', 'Estatus', 'Acciones'].map(header => (
                <th key={header} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
            {results.map((factura) => (
              <tr key={factura.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{factura.folio}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{factura.fecha}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{factura.tienda}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatCurrency(factura.subtotal)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatCurrency(factura.iva)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 dark:text-white">{formatCurrency(factura.total)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                   <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(factura.estatus)}`}>
                      {factura.estatus}
                   </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200" onClick={() => onPdf(factura)}>PDF</button>
                  <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200" onClick={() => onXml(factura)}>XML</button>
                  {factura.estatus === 'Timbrada' && <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200" onClick={() => onCancelar(factura)}>Cancelar</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};


// --- COMPONENTE PRINCIPAL DE LA PÁGINA (ACTUALIZADO) ---

export const FacturacionGlobalPage: React.FC = () => {
  const [formData, setFormData] = useState<FacturaGlobalFormData>(initialFacturaGlobalFormData);
  // Nuevo estado para guardar los resultados de la búsqueda
  const [searchResults, setSearchResults] = useState<FacturaResult[]>([]);
  // Estados para feedback visual y modales
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);
  const [modal, setModal] = useState<{ open: boolean; factura?: FacturaResult; loading?: boolean } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Buscar Factura Global:', formData);
    setSearchResults(DUMMY_RESULTS); 
  };

  const handleExcel = () => {
    console.log('Exportar a Excel:', formData);
    setToast({ message: 'Exportando a Excel (simulado).', type: 'success' });
  };

  // Acciones de la tabla
  const handlePdf = (factura: FacturaResult) => {
    setToast({ message: `Descargando PDF de ${factura.folio} (simulado).`, type: 'success' });
  };
  const handleXml = (factura: FacturaResult) => {
    setToast({ message: `Descargando XML de ${factura.folio} (simulado).`, type: 'success' });
  };
  const handleCancelar = (factura: FacturaResult) => {
    setModal({ open: true, factura });
  };
  const handleConfirmCancelar = async () => {
    if (!modal?.factura) return;
    setModal({ ...modal, loading: true });
    // Simula proceso de cancelación
    setTimeout(() => {
      setSearchResults((prev) => prev.map(f => f.id === modal.factura!.id ? { ...f, estatus: 'Cancelada' } : f));
      setModal(null);
      setToast({ message: `Factura ${modal.factura!.folio} cancelada exitosamente.`, type: 'success' });
    }, 1200);
  };

  return (
    <form onSubmit={handleBuscar} className="space-y-6">
      <Card>
        <h3 className="text-lg font-semibold text-pink-600 mb-4">--Especificar búsqueda--</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 items-end">
          <FormField label="Fecha:" name="fecha" type="date" value={formData.fecha} onChange={handleChange} />
          <SelectField label="Tienda:" name="tienda" value={formData.tienda} onChange={handleChange} options={TIENDA_OPTIONS} />
          <SelectField label="Tipo de Factura:" name="tipoFactura" value={formData.tipoFactura} onChange={handleChange} options={TIPO_FACTURA_OPTIONS} />
          <SelectField label="Estatus:" name="estatus" value={formData.estatus} onChange={handleChange} options={ESTATUS_FACTURA_OPTIONS} />
        </div>
        <div className="mt-6 flex justify-end space-x-3">
            <Button type="submit" variant="primary">
                Buscar
            </Button>
            <Button type="button" onClick={handleExcel} variant="secondary">
                Excel
            </Button>
        </div>
      </Card>

      {/* Renderizado condicional: muestra la tabla si hay resultados, si no, el mensaje */}
      {searchResults.length > 0 ? (
        <SearchResultsTable
          results={searchResults}
          onPdf={handlePdf}
          onXml={handleXml}
          onCancelar={handleCancelar}
        />
      ) : (
        <div className="mt-6 p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-md min-h-[200px] flex items-center justify-center text-gray-400 dark:text-gray-500">
            Los resultados de la búsqueda aparecerán aquí.
        </div>
      )}

      {/* Modal de confirmación de cancelación */}
      <Modal
        open={!!modal?.open}
        title="Confirmar cancelación"
        onClose={() => setModal(null)}
        onConfirm={handleConfirmCancelar}
        confirmText="Cancelar factura"
        loading={modal?.loading}
      >
        {modal?.factura && (
          <>¿Estás seguro que deseas cancelar la factura <b>{modal.factura.folio}</b>? Esta acción no se puede deshacer.</>
        )}
      </Modal>

      {/* Toast de feedback */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </form>
  );
};