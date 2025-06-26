import React, { useState } from 'react';
import { Card } from './Card';


const METODOS_HTTP = [
  { value: 'GET', label: 'GET' },
  { value: 'POST', label: 'POST' },
  { value: 'PUT', label: 'PUT' },
  { value: 'DELETE', label: 'DELETE' },
];

interface Header {
  key: string;
  value: string;
}

export const MonitorDisponibilidadPage: React.FC = () => {
  const [titulo, setTitulo] = useState('');
  const [metodo, setMetodo] = useState('GET');
  const [url, setUrl] = useState('');
  const [headers, setHeaders] = useState<Header[]>([]);
  const [nuevoHeader, setNuevoHeader] = useState<Header>({ key: '', value: '' });

  // --- Tu lógica de funciones permanece intacta ---
  const handleAddHeader = () => { /* ... */ };
  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => { /* ... */ };
  const handleRemoveHeader = (index: number) => { /* ... */ };
  const handleGenerar = (e: React.FormEvent) => { /* ... */ };

  return (
    // CAMBIO RESPONSIVO: Añadimos padding horizontal para que no se pegue a los bordes en móvil
    <div className="flex justify-center items-start min-h-[60vh] p-4">
      <Card className="w-full max-w-4xl mt-8">
        <h2 className="text-lg font-semibold text-primary dark:text-secondary mb-6 text-center">Monitorear URL adicional</h2>
        <form onSubmit={handleGenerar} className="space-y-6">
          <input
            type="text"
            placeholder="Titulo"
            // Los inputs de ancho completo ya son responsivos por defecto
            className="w-full p-3 rounded bg-white dark:bg-gray-700 dark:text-gray-100"
            value={titulo}
            onChange={e => setTitulo(e.target.value)}
          />
          
          {/* Contenedor para URL y Headers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Sección URL */}
            {/* CAMBIO RESPONSIVO: De 'flex' a un layout que se apila en móvil */}
            <div className="flex flex-col sm:flex-row">
              <select
                // CAMBIO RESPONSIVO: Se ajustan los bordes y el ancho para móvil y escritorio
                className="w-full sm:w-auto rounded-md sm:rounded-l-md sm:rounded-r-none p-3 text-white font-bold mb-2 sm:mb-0"
                style={{ backgroundColor: 'var(--color-primary)' }}
                value={metodo}
                onChange={e => setMetodo(e.target.value)}
              >
                {METODOS_HTTP.map(m => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="URL"
                // CAMBIO RESPONSIVO: Se ajustan los bordes para móvil y escritorio
                className="flex-1 rounded-md sm:rounded-r-md sm:rounded-l-none p-3 bg-white dark:bg-gray-700 dark:text-gray-100"
                value={url}
                onChange={e => setUrl(e.target.value)}
              />
            </div>

            {/* Sección Nuevo Header */}
            {/* CAMBIO RESPONSIVO: De 'flex' a un layout que se apila */}
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Header Key"
                // CAMBIO RESPONSIVO: 'flex-1' para que ocupe espacio y bordes redondeados en móvil
                className="p-2 rounded-md sm:rounded-none sm:rounded-l-md bg-white dark:bg-gray-700 dark:text-gray-100 border flex-1"
                value={nuevoHeader.key}
                onChange={e => setNuevoHeader({ ...nuevoHeader, key: e.target.value })}
              />
              <input
                type="text"
                placeholder="Header Value"
                // CAMBIO RESPONSIVO: 'flex-1' y bordes redondeados en móvil
                className="p-2 rounded-md sm:rounded-none bg-white dark:bg-gray-700 dark:text-gray-100 border-t border-b flex-1"
                value={nuevoHeader.value}
                onChange={e => setNuevoHeader({ ...nuevoHeader, value: e.target.value })}
              />
              <button
                type="button"
                // CAMBIO RESPONSIVO: Bordes redondeados en móvil y quitamos margen izquierdo que no aplica en vertical
                className="text-white px-4 py-2 rounded-md sm:rounded-r-md"
                style={{ backgroundColor: 'var(--color-primary)' }}
                onClick={handleAddHeader}
              >
                Nuevo Header
              </button>
            </div>
          </div>

          {/* Lista de Headers añadidos */}
          {headers.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Headers añadidos:</h4>
              <ul className="space-y-4">
                {headers.map((header, idx) => (
                  // CAMBIO RESPONSIVO: Cada header se apila en móvil y se pone en fila en pantallas más grandes
                  <li key={idx} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 p-2 border rounded-md">
                    <input
                      type="text"
                      value={header.key}
                      onChange={e => handleHeaderChange(idx, 'key', e.target.value)}
                      className="p-1 rounded bg-white dark:bg-gray-700 dark:text-gray-100 border w-full sm:w-auto flex-1"
                    />
                    {/* CAMBIO RESPONSIVO: Ocultamos los dos puntos en móvil porque no tiene sentido en una columna */}
                    <span className="mx-1 hidden sm:inline">:</span>
                    <input
                      type="text"
                      value={header.value}
                      onChange={e => handleHeaderChange(idx, 'value', e.target.value)}
                      className="p-1 rounded bg-white dark:bg-gray-700 dark:text-gray-100 border w-full sm:w-auto flex-1"
                    />
                    <button
                      type="button"
                      className="text-red-500 font-bold self-center sm:self-auto" // Para centrar la X en móvil
                      onClick={() => handleRemoveHeader(idx)}
                    >
                      X
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="flex flex-col items-center pt-4">
            <button
              type="submit"
              className="text-white px-8 py-3 rounded"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Generar
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};