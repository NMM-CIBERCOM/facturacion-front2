import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { FormField } from './FormField';
import { SelectField } from './SelectField';
import { CheckboxField } from './CheckboxField';
import { Button } from './Button';
import { RfcAutocomplete } from './RfcAutocomplete';
import { MagnifyingGlassIcon } from './icons/MagnifyingGlassIcon';
import { PencilSquareIcon } from './icons/PencilSquareIcon';
import { TrashIcon } from './icons/TrashIcon';
import { REGIMEN_FISCAL_OPTIONS, USO_CFDI_OPTIONS } from '../constants';
import { clienteCatalogoService, ClienteDatos } from '../services/clienteCatalogoService';
import { codigoPostalService } from '../services/codigoPostalService';

interface ClienteFormData {
  id?: number;
  rfc: string;
  razonSocial: string;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  tipoPersona: 'fisica' | 'moral';
  esExtranjero: boolean;
  esPolitico: boolean;
  codigoPostal: string;
  pais: string;
  estado: string;
  municipio: string;
  colonia: string;
  calle: string;
  numeroExterior: string;
  numeroInterior: string;
  correoElectronico: string;
  telefono?: string;
  regimenFiscal: string;
  usoCfdi: string;
}

const initialFormData: ClienteFormData = {
  rfc: '',
  razonSocial: '',
  nombre: '',
  apellidoPaterno: '',
  apellidoMaterno: '',
  tipoPersona: 'moral',
  esExtranjero: false,
  esPolitico: false,
  codigoPostal: '',
  pais: 'MEX',
  estado: '',
  municipio: '',
  colonia: '',
  calle: '',
  numeroExterior: '',
  numeroInterior: '',
  correoElectronico: '',
  telefono: '',
  regimenFiscal: REGIMEN_FISCAL_OPTIONS[0].value,
  usoCfdi: USO_CFDI_OPTIONS[0].value,
};

export const CatalogosClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<ClienteFormData[]>([]);
  const [formData, setFormData] = useState<ClienteFormData>(initialFormData);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [colonias, setColonias] = useState<string[]>([]);
  const [cargandoCP, setCargandoCP] = useState(false);
  const [filtroBusqueda, setFiltroBusqueda] = useState('');
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async () => {
    try {
      // TODO: Implementar endpoint para obtener todos los clientes
      // Por ahora simulamos datos vacíos
      setClientes([]);
    } catch (error) {
      console.error('Error al cargar clientes:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData(prev => ({ ...prev, [name]: newValue }));

    if (name === 'rfc') {
      detectarTipoPersona(value);
    }
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const detectarTipoPersona = (rfc: string) => {
    const rfcUpper = rfc.toUpperCase().trim();
    if (rfcUpper.length === 12) {
      setFormData(prev => ({ ...prev, tipoPersona: 'moral' }));
    } else if (rfcUpper.length === 13) {
      setFormData(prev => ({ ...prev, tipoPersona: 'fisica' }));
    }
  };

  const handleClienteSelect = (cliente: ClienteDatos) => {
    setFormData(prev => ({
      ...prev,
      rfc: cliente.rfc,
      razonSocial: cliente.razonSocial || prev.razonSocial,
      nombre: cliente.nombre || prev.nombre,
      apellidoPaterno: cliente.paterno || prev.apellidoPaterno,
      apellidoMaterno: cliente.materno || prev.apellidoMaterno,
      correoElectronico: cliente.correoElectronico || prev.correoElectronico,
      pais: cliente.pais || prev.pais,
      regimenFiscal: cliente.regimenFiscal || prev.regimenFiscal,
      usoCfdi: cliente.usoCfdi || prev.usoCfdi,
    }));
  };

  const handleRfcNotFound = () => {
    // Si no se encuentra el RFC, permitir continuar con el alta manual
  };

  const cargarDatosCP = async (cp: string) => {
    if (!cp || cp.length !== 5) {
      setColonias([]);
      setFormData(prev => ({ ...prev, estado: '', municipio: '', colonia: '' }));
      return;
    }

    setCargandoCP(true);
    try {
      const data = await codigoPostalService.obtenerDatosCP(cp);
      if (data) {
        setFormData(prev => ({
          ...prev,
          estado: data.estado || '',
          municipio: data.municipio || '',
          colonia: '',
        }));
        setColonias(data.colonias || []);
      } else {
        setColonias([]);
        setFormData(prev => ({ ...prev, estado: '', municipio: '', colonia: '' }));
      }
    } catch (error) {
      console.error('Error al cargar código postal:', error);
      setColonias([]);
    } finally {
      setCargandoCP(false);
    }
  };

  const handleCodigoPostalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cp = e.target.value.replace(/\D/g, '').slice(0, 5);
    setFormData(prev => ({ ...prev, codigoPostal: cp }));

    if (cp.length === 5) {
      cargarDatosCP(cp);
    } else {
      setColonias([]);
      setFormData(prev => ({ ...prev, estado: '', municipio: '', colonia: '' }));
    }
  };

  const handleAgregar = async () => {
    if (!formData.rfc || !formData.razonSocial || !formData.codigoPostal || !formData.correoElectronico) {
      alert('Por favor complete los campos obligatorios marcados con *');
      return;
    }

    if (modoEdicion && formData.id) {
      // Modificar cliente existente
      setClientes(prev =>
        prev.map(c => (c.id === formData.id ? formData : c))
      );
      setModoEdicion(false);
    } else {
      // Agregar nuevo cliente
      try {
        const nuevoCliente: ClienteFormData = {
          ...formData,
          id: Date.now(), // ID temporal
        };
        setClientes(prev => [...prev, nuevoCliente]);
      } catch (error) {
        console.error('Error al agregar cliente:', error);
        alert('Error al agregar cliente. Por favor intente nuevamente.');
        return;
      }
    }

    setFormData(initialFormData);
    setColonias([]);
  };

  const handleEditar = (cliente: ClienteFormData) => {
    setFormData(cliente);
    setModoEdicion(true);
    if (cliente.codigoPostal) {
      cargarDatosCP(cliente.codigoPostal);
    }
  };

  const handleEliminar = (id: number) => {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
      setClientes(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleBuscar = async () => {
    if (!filtroBusqueda.trim()) {
      alert('Ingrese un RFC o razón social para buscar');
      return;
    }

    setBuscando(true);
    try {
      const rfc = filtroBusqueda.trim().toUpperCase();
      const result = await clienteCatalogoService.buscarClientePorRFC(rfc);
      
      if (result.encontrado && result.cliente) {
        const clienteEncontrado: ClienteFormData = {
          id: Date.now(),
          rfc: result.cliente.rfc,
          razonSocial: result.cliente.razonSocial || '',
          nombre: result.cliente.nombre,
          apellidoPaterno: result.cliente.paterno,
          apellidoMaterno: result.cliente.materno,
          tipoPersona: result.cliente.rfc.length === 12 ? 'moral' : 'fisica',
          esExtranjero: false,
          esPolitico: false,
          codigoPostal: '',
          pais: result.cliente.pais || 'MEX',
          estado: '',
          municipio: '',
          colonia: '',
          calle: '',
          numeroExterior: '',
          numeroInterior: '',
          correoElectronico: result.cliente.correoElectronico || '',
          telefono: '',
          regimenFiscal: result.cliente.regimenFiscal || REGIMEN_FISCAL_OPTIONS[0].value,
          usoCfdi: result.cliente.usoCfdi || USO_CFDI_OPTIONS[0].value,
        };
        setClientes([clienteEncontrado]);
      } else {
        alert('No se encontró ningún cliente con ese RFC');
      }
    } catch (error) {
      console.error('Error al buscar cliente:', error);
      alert('Error al buscar cliente. Por favor intente nuevamente.');
    } finally {
      setBuscando(false);
    }
  };

  const clientesFiltrados = filtroBusqueda
    ? clientes.filter(c =>
        c.rfc.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
        c.razonSocial.toLowerCase().includes(filtroBusqueda.toLowerCase()) ||
        (c.nombre && c.nombre.toLowerCase().includes(filtroBusqueda.toLowerCase()))
      )
    : clientes;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Formulario de Cliente */}
      <Card title="Datos Fiscales">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="md:col-span-2 lg:col-span-3">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              RFC *
            </label>
            <RfcAutocomplete
              value={formData.rfc}
              onChange={(rfc) => {
                setFormData(prev => ({ ...prev, rfc }));
                detectarTipoPersona(rfc);
              }}
              onSelect={handleClienteSelect}
              onNotFound={handleRfcNotFound}
              required
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3 flex flex-wrap gap-4">
            <CheckboxField
              name="esExtranjero"
              label="Extranjero"
              checked={formData.esExtranjero}
              onChange={(e) => handleCheckboxChange('esExtranjero', e.target.checked)}
            />
            <CheckboxField
              name="esPolitico"
              label="P. Político"
              checked={formData.esPolitico}
              onChange={(e) => handleCheckboxChange('esPolitico', e.target.checked)}
            />
          </div>

          {formData.tipoPersona === 'moral' ? (
            <div className="md:col-span-2 lg:col-span-3">
              <FormField
                name="razonSocial"
                label="Razón Social *"
                value={formData.razonSocial}
                onChange={handleChange}
                required
              />
            </div>
          ) : (
            <>
              <FormField
                name="nombre"
                label="Nombre *"
                value={formData.nombre || ''}
                onChange={handleChange}
                required={formData.tipoPersona === 'fisica'}
              />
              <FormField
                name="apellidoPaterno"
                label="Apellido Paterno *"
                value={formData.apellidoPaterno || ''}
                onChange={handleChange}
                required={formData.tipoPersona === 'fisica'}
              />
              <FormField
                name="apellidoMaterno"
                label="Apellido Materno"
                value={formData.apellidoMaterno || ''}
                onChange={handleChange}
              />
            </>
          )}

          <FormField
            name="codigoPostal"
            label="Código Postal *"
            value={formData.codigoPostal}
            onChange={handleCodigoPostalChange}
            required
            maxLength={5}
            disabled={cargandoCP}
          />

          <FormField
            name="pais"
            label="País"
            value={formData.pais}
            onChange={handleChange}
            disabled
          />

          <FormField
            name="estado"
            label="Estado"
            value={formData.estado}
            onChange={handleChange}
            disabled
          />

          <FormField
            name="municipio"
            label="Municipio/Delegación"
            value={formData.municipio}
            onChange={handleChange}
            disabled
          />

          <SelectField
            name="colonia"
            label="Colonia *"
            value={formData.colonia}
            onChange={handleChange}
            options={colonias.map(c => ({ value: c, label: c }))}
            required
            disabled={colonias.length === 0 || cargandoCP}
          />

          <FormField
            name="calle"
            label="Calle *"
            value={formData.calle}
            onChange={handleChange}
            required
          />

          <FormField
            name="numeroExterior"
            label="Número exterior"
            value={formData.numeroExterior}
            onChange={handleChange}
            placeholder="Ej: 123, MZ 5, LT 10"
          />

          <FormField
            name="numeroInterior"
            label="Número interior"
            value={formData.numeroInterior}
            onChange={handleChange}
            placeholder="Ej: EDIF A, DEP 101"
          />

          <div className="md:col-span-2 lg:col-span-3">
            <FormField
              name="correoElectronico"
              label="Correo Electrónico *"
              type="email"
              value={formData.correoElectronico}
              onChange={handleChange}
              required
            />
          </div>

          <SelectField
            name="regimenFiscal"
            label="Régimen Fiscal *"
            value={formData.regimenFiscal}
            onChange={handleChange}
            options={REGIMEN_FISCAL_OPTIONS}
            required
          />

          <SelectField
            name="usoCfdi"
            label="Uso Factura *"
            value={formData.usoCfdi}
            onChange={handleChange}
            options={USO_CFDI_OPTIONS}
            required
          />
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 mt-4">
          Los campos marcados con: * son obligatorios
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-6">
          <Button
            type="button"
            onClick={handleAgregar}
            variant="primary"
            className="w-full sm:w-auto"
          >
            {modoEdicion ? 'Modificar' : 'Agregar'}
          </Button>
          {modoEdicion && (
            <Button
              type="button"
              onClick={() => {
                setFormData(initialFormData);
                setModoEdicion(false);
                setColonias([]);
              }}
              variant="neutral"
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
          )}
        </div>
      </Card>

      {/* Datos de Contacto */}
      <Card title="Datos de Contacto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FormField
            name="nombre"
            label="Nombre"
            value={formData.nombre || ''}
            onChange={handleChange}
          />
          <FormField
            name="apellidoPaterno"
            label="Apellido Paterno"
            value={formData.apellidoPaterno || ''}
            onChange={handleChange}
          />
          <FormField
            name="apellidoMaterno"
            label="Apellido Materno"
            value={formData.apellidoMaterno || ''}
            onChange={handleChange}
          />
          <FormField
            name="telefono"
            label="Teléfono"
            type="tel"
            value={formData.telefono || ''}
            onChange={handleChange}
          />
        </div>
      </Card>

      {/* Búsqueda */}
      <Card title="Buscar Clientes">
        <div className="flex flex-col sm:flex-row gap-2">
          <FormField
            name="filtroBusqueda"
            label="Buscar"
            value={filtroBusqueda}
            onChange={(e) => setFiltroBusqueda(e.target.value)}
            placeholder="Buscar por RFC o razón social..."
            className="flex-1"
          />
          <Button
            type="button"
            onClick={handleBuscar}
            variant="secondary"
            disabled={buscando}
            className="w-full sm:w-auto mt-6 sm:mt-0 flex items-center justify-center gap-2"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
            <span>{buscando ? 'Buscando...' : 'Buscar'}</span>
          </Button>
        </div>
      </Card>

      {/* Tabla de Clientes */}
      {clientesFiltrados.length > 0 && (
        <Card title="Clientes Registrados">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    RFC
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Razón Social / Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Correo
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {clientesFiltrados.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {cliente.rfc}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 dark:text-white">
                      {cliente.tipoPersona === 'moral'
                        ? cliente.razonSocial
                        : `${cliente.nombre || ''} ${cliente.apellidoPaterno || ''} ${cliente.apellidoMaterno || ''}`.trim()}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {cliente.correoElectronico}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditar(cliente)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Editar"
                        >
                          <PencilSquareIcon className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleEliminar(cliente.id!)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Eliminar"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
};

