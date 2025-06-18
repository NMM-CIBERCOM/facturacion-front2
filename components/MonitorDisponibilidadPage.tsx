import React, { useState } from 'react';

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

  const handleAddHeader = () => {
    if (nuevoHeader.key && nuevoHeader.value) {
      setHeaders([...headers, nuevoHeader]);
      setNuevoHeader({ key: '', value: '' });
    }
  };

  const handleHeaderChange = (index: number, field: 'key' | 'value', value: string) => {
    const nuevosHeaders = [...headers];
    nuevosHeaders[index][field] = value;
    setHeaders(nuevosHeaders);
  };

  const handleRemoveHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleGenerar = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí puedes hacer la lógica para monitorear la URL
    alert(`Monitoreando: ${titulo} - ${metodo} ${url}\nHeaders: ${JSON.stringify(headers)}`);
  };

  return (
    <div className="flex justify-center items-start min-h-[60vh]">
      <form
        onSubmit={handleGenerar}
        className="w-full max-w-4xl dark:bg-gray-800 rounded-2xl p-8 mt-8"
        style={{ backgroundColor: 'var(--color-primary)', border: '4px solid var(--color-primary)' }}
      >
        <h2 className="text-2xl text-white font-semibold text-center mb-6">Monitorear URL adicional</h2>
        <input
          type="text"
          placeholder="Titulo"
          className="w-full mb-4 p-3 rounded bg-white"
          value={titulo}
          onChange={e => setTitulo(e.target.value)}
        />
        <div className="flex mb-4">
          <select
            className="rounded-l p-3 text-white font-bold"
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
            className="flex-1 rounded-r p-3 bg-white"
            value={url}
            onChange={e => setUrl(e.target.value)}
          />
        </div>
        <div className="flex items-center mb-4">
          <input
            type="text"
            placeholder="Header Key"
            className="p-2 rounded-l bg-white border"
            value={nuevoHeader.key}
            onChange={e => setNuevoHeader({ ...nuevoHeader, key: e.target.value })}
          />
          <input
            type="text"
            placeholder="Header Value"
            className="p-2 bg-white border-t border-b"
            value={nuevoHeader.value}
            onChange={e => setNuevoHeader({ ...nuevoHeader, value: e.target.value })}
          />
          <button
            type="button"
            className="text-white px-4 py-2 rounded-r ml-2"
            style={{ backgroundColor: 'var(--color-primary)' }}
            onClick={handleAddHeader}
          >
            Nuevo Header
          </button>
        </div>
        {headers.length > 0 && (
          <div className="mb-4">
            <h4 className="font-semibold mb-2">Headers añadidos:</h4>
            <ul>
              {headers.map((header, idx) => (
                <li key={idx} className="flex items-center mb-1">
                  <input
                    type="text"
                    value={header.key}
                    onChange={e => handleHeaderChange(idx, 'key', e.target.value)}
                    className="p-1 rounded bg-white border mr-2"
                  />
                  <span className="mx-1">:</span>
                  <input
                    type="text"
                    value={header.value}
                    onChange={e => handleHeaderChange(idx, 'value', e.target.value)}
                    className="p-1 rounded bg-white border mr-2"
                  />
                  <button
                    type="button"
                    className="text-red-500 font-bold"
                    onClick={() => handleRemoveHeader(idx)}
                  >
                    X
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-col items-center">
          <button
            type="submit"
            className="text-white px-8 py-3 rounded mt-4"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Generar
          </button>
        </div>
      </form>
    </div>
  );
};