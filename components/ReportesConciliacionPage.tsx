import React, { useState } from 'react';
import { Card } from './Card';
import { SelectField } from './SelectField';
import { FormField } from './FormField';
import { Button } from './Button';
import { FileInputField } from './FileInputField';
import { TrashIcon } from './icons';
import { TIPO_DOCUMENTO_CONCILIACION_OPTIONS, dummyConciliacionData } from '../constants';

interface DocumentoConciliacion {
  id: string;
  identificador: string;
  tipo: string;
  nombre: string;
  fechaArchivo: string;
  usuario: string;
  estatus: string;
  fechaCarga: string;
  fechaValidacion: string;
}

interface NewDocumentoFormData {
  tipoDocumento: string;
  fechaDocumento: string;
  archivo: File | null;
}

const initialNewDocumentoFormData: NewDocumentoFormData = {
  tipoDocumento: TIPO_DOCUMENTO_CONCILIACION_OPTIONS[0]?.value || '',
  fechaDocumento: new Date().toISOString().split('T')[0],
  archivo: null,
};

export const ReportesConciliacionPage: React.FC = () => {
  const [newDocumento, setNewDocumento] = useState<NewDocumentoFormData>(initialNewDocumentoFormData);
  const [documentos, setDocumentos] = useState<DocumentoConciliacion[]>(dummyConciliacionData);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewDocumento({ ...newDocumento, [e.target.name]: e.target.value });
  };

  const handleFileChange = (file: File | null) => {
    setNewDocumento({ ...newDocumento, archivo: file });
  };

  const handleCargarDocumento = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocumento.archivo) {
      alert('Por favor, seleccione un archivo.');
      return;
    }
    const nuevoDoc: DocumentoConciliacion = {
        id: `doc${Date.now()}`,
        identificador: `ID-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        tipo: TIPO_DOCUMENTO_CONCILIACION_OPTIONS.find(opt => opt.value === newDocumento.tipoDocumento)?.label || newDocumento.tipoDocumento,
        nombre: newDocumento.archivo.name,
        fechaArchivo: newDocumento.fechaDocumento,
        usuario: 'currentUser', // Placeholder
        estatus: 'Pendiente',
        fechaCarga: new Date().toISOString().split('T')[0],
        fechaValidacion: '',
    };
    setDocumentos([nuevoDoc, ...documentos]);
    setNewDocumento(initialNewDocumentoFormData);
    alert('Documento cargado para conciliación (simulado).');
  };

  const handleDeleteDocumento = (id: string) => {
    setDocumentos(documentos.filter(doc => doc.id !== id));
    alert(`Documento ${id} eliminado (simulado).`);
  };
  
  const fileHelpText="Seleccione el archivo XML, TXT, etc.";

  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Favor de no subir archivos mayores a 9.5 Megas, si su archivo supera esa cantidad favor de dividirlos, recuerde incluir el encabezado en cada uno de los archivos.
      </p>
      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">
          --Cargar nuevo documento--
        </h3>
        <form onSubmit={handleCargarDocumento} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <SelectField label="Tipo de documento:" name="tipoDocumento" value={newDocumento.tipoDocumento} onChange={handleInputChange} options={TIPO_DOCUMENTO_CONCILIACION_OPTIONS} required/>
            <FormField label="Fecha del documento:" name="fechaDocumento" type="date" value={newDocumento.fechaDocumento} onChange={handleInputChange} required/>
            <div></div>
             <FileInputField label="Archivo:" name="archivo" onChange={handleFileChange} accept=".xml,.txt,.csv,.xlsx" helpText={fileHelpText} className="md:col-span-2"/>
            <Button type="submit" variant="primary" className="self-end">
              Cargar archivo
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-primary dark:text-secondary mb-4">
          Documentos Cargados
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Identificador</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Tipo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Nombre</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha Archivo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Usuario</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Estatus</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha Carga</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Fecha Validación</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Eliminar</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {documentos.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{doc.identificador}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{doc.tipo}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200 truncate max-w-xs" title={doc.nombre}>{doc.nombre}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{doc.fechaArchivo}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{doc.usuario}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{doc.estatus}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{doc.fechaCarga}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-200">{doc.fechaValidacion}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <button onClick={() => handleDeleteDocumento(doc.id)} className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-500 p-1" aria-label={`Eliminar documento ${doc.nombre}`}>
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
         {documentos.length === 0 && (
            <p className="text-center py-4 text-gray-500 dark:text-gray-400">No hay documentos cargados.</p>
        )}
      </Card>
    </div>
  );
};
