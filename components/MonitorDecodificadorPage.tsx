// src/components/MiNuevaPagina1.tsx
import React, { useState } from 'react';
import { Card } from './Card';

// No necesitas props por ahora si es una página simple
export const MonitorDecodificadorPage: React.FC = () => {
  const [modo, setModo] = useState<'encriptado' | 'desencriptado'>('encriptado');
  const [boleta, setBoleta] = useState('');
  const [tienda, setTienda] = useState('');
  const [terminal, setTerminal] = useState('');
  const [fecha, setFecha] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Aquí va la lógica de codificación/decodificación
    alert(`Modo: ${modo}\nBoleta: ${boleta}\nTienda: ${tienda}\nTerminal: ${terminal}\nFecha: ${fecha}`);
  };

  return (
    <div className="flex justify-center items-start min-h-[60vh]">
      <Card className="w-full max-w-5xl mt-8">
        <h2 className="text-lg font-semibold text-primary dark:text-secondary mb-6 text-center">Decodificador de Facturas</h2>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Encriptado */}
            <div>
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  id="encriptado"
                  name="modo"
                  checked={modo === 'encriptado'}
                  onChange={() => setModo('encriptado')}
                  className="mr-2"
                />
                <label htmlFor="encriptado" className="font-medium">Encriptado</label>
              </div>
              <div className="mb-4 flex items-center">
                <label className="w-24 text-right mr-2">Boleta:</label>
                <input
                  type="text"
                  className="rounded-lg p-2 flex-1 border border-gray-400"
                  value={boleta}
                  onChange={e => setBoleta(e.target.value)}
                  disabled={modo !== 'encriptado'}
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="w-24 text-right mr-2">Tienda:</label>
                <input
                  type="text"
                  className="rounded-lg p-2 flex-1 border border-gray-400"
                  value={tienda}
                  onChange={e => setTienda(e.target.value)}
                  disabled={modo !== 'encriptado'}
                />
              </div>
            </div>
            {/* Desencriptado */}
            <div>
              <div className="flex items-center mb-2">
                <input
                  type="radio"
                  id="desencriptado"
                  name="modo"
                  checked={modo === 'desencriptado'}
                  onChange={() => setModo('desencriptado')}
                  className="mr-2"
                />
                <label htmlFor="desencriptado" className="font-medium">Desencriptado</label>
              </div>
              <div className="mb-4 flex items-center">
                <label className="w-24 text-right mr-2">Terminal:</label>
                <input
                  type="text"
                  className="rounded-lg p-2 flex-1 border border-gray-400"
                  value={terminal}
                  onChange={e => setTerminal(e.target.value)}
                  disabled={modo !== 'desencriptado'}
                />
              </div>
              <div className="mb-4 flex items-center">
                <label className="w-24 text-right mr-2">Fecha:</label>
                <input
                  type="text"
                  className="rounded-lg p-2 flex-1 border border-gray-400"
                  value={fecha}
                  onChange={e => setFecha(e.target.value)}
                  disabled={modo !== 'desencriptado'}
                />
              </div>
            </div>
          </div>
          <div className="mt-8 flex justify-start">
            <button
              type="submit"
              className="text-white px-8 py-3 rounded mt-4 font-semibold text-lg"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              Codificar
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};