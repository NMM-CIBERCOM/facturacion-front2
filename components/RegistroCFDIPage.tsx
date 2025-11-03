import React, { useState, useEffect, useContext } from 'react';
import { FaEdit, FaSave, FaEye, FaTimes, FaUpload, FaFilePdf, FaSpinner } from 'react-icons/fa';
import { ThemeContext } from '../App';
import { Card } from './Card';

interface RegimenFiscal {
  clave: string;
  descripcion: string;
}

interface FacturaInfo {
  rfc: string;
  curp?: string;
  nombre: string;
  primerApellido?: string;
  segundoApellido?: string;
  tipoVialidad?: string;
  calle: string;
  numExt: string;
  numInt?: string;
  colonia: string;
  localidad?: string;
  municipio: string;
  entidadFederativa: string;
  entreCalle?: string;
  yCalle?: string;
  cp: string;
  regimenesFiscales: string[]; // Cambiado a string[] para coincidir con el backend
  fechaUltimaActualizacion?: string;
  editing?: boolean;
}

const RegistroCFDIPage: React.FC = () => {
  const { customColors } = useContext(ThemeContext);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [facturasInfo, setFacturasInfo] = useState<FacturaInfo[]>([]);
  const [selectedFactura, setSelectedFactura] = useState<FacturaInfo | null>(null);
  const [todosRegimenesFiscales, setTodosRegimenesFiscales] = useState<RegimenFiscal[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchRegimenesFiscales();
  }, []);

  const fetchRegimenesFiscales = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/regimenes-fiscales');
      if (!response.ok) throw new Error('Error al obtener los regímenes fiscales');
      const data: string[] = await response.json();
      // Convertir strings a objetos RegimenFiscal
      const regimenes = data.map(item => {
        const [clave, descripcion] = item.split(' - ');
        return { clave, descripcion };
      });
      setTodosRegimenesFiscales(regimenes);
    } catch (error) {
      console.error('Error al obtener los regímenes fiscales:', error);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
      setSelectedFileName(files.map(file => file.name).join(', '));
    }
  };


  const toggleEdit = (factura: FacturaInfo) => {
    factura.editing = !factura.editing;
    setFacturasInfo([...facturasInfo]);
  };


  const viewDetails = (factura: FacturaInfo) => {
    setSelectedFactura(factura);
  };

  const closeModal = () => {
    setSelectedFactura(null);
  };

  const processData = async () => {
    if (facturasInfo.length === 0) {
      alert("No hay datos para procesar. Primero carga y extrae los datos de los PDFs.");
      return;
    }

    console.log("Procesando datos en el banco de clientes...");
    
    try {
      const responses = [];
      
      for (const factura of facturasInfo) {
        console.log(`Procesando cliente: ${factura.rfc}`);
        
        const response = await fetch('http://localhost:8081/api/cdp/procesar-factura', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rfc: factura.rfc,
            nombre: factura.nombre,
            primerApellido: factura.primerApellido,
            segundoApellido: factura.segundoApellido,
            curp: factura.curp,
            calle: factura.calle,
            numExt: factura.numExt,
            numInt: factura.numInt,
            colonia: factura.colonia,
            localidad: factura.localidad,
            municipio: factura.municipio,
            entidadFederativa: factura.entidadFederativa,
            entreCalle: factura.entreCalle,
            yCalle: factura.yCalle,
            cp: factura.cp,
            email: 'cliente@ejemplo.com', // Email por defecto, se puede modificar
            regimenesFiscales: factura.regimenesFiscales
          })
        });
        
        if (!response.ok) {
          throw new Error(`Error al procesar cliente ${factura.rfc}: ${response.statusText}`);
        }
        
        const result = await response.json();
        responses.push(result);
        
        console.log(`Cliente ${factura.rfc} procesado:`, result);
      }
      
      console.log('Todos los clientes procesados:', responses);
      
      // Mostrar resumen de resultados
      const exitosos = responses.filter(r => r.exitoso).length;
      const existentes = responses.filter(r => r.clienteExistente).length;
      const nuevos = exitosos - existentes;
      
      alert(`✅ Procesamiento completado!\n\n` +
            `📊 Resumen:\n` +
            `• Total procesados: ${responses.length}\n` +
            `• Clientes nuevos: ${nuevos}\n` +
            `• Clientes existentes actualizados: ${existentes}\n\n` +
            `🎉 Los datos han sido guardados en el banco de clientes.`);
      
    } catch (error) {
      console.error('Error al procesar datos:', error);
      alert(`❌ Error al procesar los datos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const submitFile = async () => {
    if (selectedFiles.length === 0) {
      alert("Por favor, selecciona al menos un archivo.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append("archivos", file);
    });

    try {
      const response = await fetch("http://localhost:8080/api/factura/procesar-pdfs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        // Intentar obtener el mensaje de error del servidor
        let errorMessage = "Error al subir los archivos";
        try {
          const errorData = await response.text();
          if (errorData) {
            errorMessage = errorData;
          }
        } catch (e) {
          // Si no se puede leer el mensaje, usar el mensaje por defecto
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const rawFacturas: FacturaInfo[] = await response.json();

      if (!Array.isArray(rawFacturas)) {
        throw new Error("El servidor no devolvió un formato válido");
      }

      const facturasConEditing = rawFacturas.map(factura => ({
        ...factura,
        editing: false
      }));

      setFacturasInfo(facturasConEditing);
      console.log("Facturas procesadas:", facturasConEditing);

      // Mostrar mensaje de éxito
      if (facturasConEditing.length > 0) {
        alert(`✅ Se procesaron ${facturasConEditing.length} archivo(s) correctamente.`);
      } else {
        alert("⚠️ Se procesaron los archivos pero no se encontraron datos válidos.");
      }

    } catch (error) {
      console.error("Error durante la carga:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido al subir los archivos";
      alert(`❌ Hubo un error al subir los archivos:\n\n${errorMessage}\n\nPor favor, verifica que:\n- Los archivos sean PDFs válidos\n- El backend esté corriendo\n- Los archivos contengan constancias fiscales válidas`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Registro de Constancias CFDI
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Cargue constancias de situación fiscal para extraer los datos automáticamente
          </p>
        </div>

        {/* Upload Section */}
        <Card title="Carga de Archivos PDF" className="mb-8">
          <div className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-gray-400 dark:hover:border-gray-500 transition-colors">
              <FaFilePdf className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <div className="space-y-2">
                <label htmlFor="pdfFile" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-gray-100">
                    Seleccionar archivos PDF
                  </span>
                  <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
                    Arrastra y suelta archivos aquí, o haz clic para seleccionar
                  </span>
                </label>
                <input
                  type="file"
                  id="pdfFile"
                  onChange={onFileChange}
                  className="hidden"
                  multiple
                  accept=".pdf"
                />
              </div>
            </div>

            {selectedFileName && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      Archivos seleccionados:
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                      {selectedFileName}
                    </p>
                  </div>
                  <button
                    onClick={submitFile}
                    disabled={isUploading}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${
                      isUploading
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                    }`}
                    style={{
                      backgroundColor: isUploading ? undefined : customColors.primary,
                    }}
                  >
                    {isUploading ? (
                      <>
                        <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <FaUpload className="-ml-1 mr-2 h-4 w-4" />
                        Extraer Datos
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Results Section */}
        {facturasInfo.length > 0 && (
          <Card title="Datos Extraídos" className="mb-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      RFC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Apellidos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Domicilio
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Regímenes Fiscales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {facturasInfo.map((factura, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {factura.rfc}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {factura.editing ? (
                          <input
                            type="text"
                            value={factura.nombre}
                            onChange={(e) => {
                              factura.nombre = e.target.value;
                              setFacturasInfo([...facturasInfo]);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                          />
                        ) : (
                          factura.nombre
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                        {factura.editing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              placeholder="Primer Apellido"
                              value={factura.primerApellido || ''}
                              onChange={(e) => {
                                factura.primerApellido = e.target.value;
                                setFacturasInfo([...facturasInfo]);
                              }}
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                            <input
                              type="text"
                              placeholder="Segundo Apellido"
                              value={factura.segundoApellido || ''}
                              onChange={(e) => {
                                factura.segundoApellido = e.target.value;
                                setFacturasInfo([...facturasInfo]);
                              }}
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                        ) : (
                          <div>
                            {factura.primerApellido && <div>{factura.primerApellido}</div>}
                            {factura.segundoApellido && <div>{factura.segundoApellido}</div>}
                            {!factura.primerApellido && !factura.segundoApellido && (
                              <span className="text-gray-400 dark:text-gray-500">-</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {factura.editing ? (
                          <div className="space-y-1">
                            <input
                              type="text"
                              placeholder="Calle"
                              value={factura.calle}
                              onChange={(e) => {
                                factura.calle = e.target.value;
                                setFacturasInfo([...facturasInfo]);
                              }}
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                            <div className="flex space-x-1">
                              <input
                                type="text"
                                placeholder="Núm. Ext."
                                value={factura.numExt}
                                onChange={(e) => {
                                  factura.numExt = e.target.value;
                                  setFacturasInfo([...facturasInfo]);
                                }}
                                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              />
                              <input
                                type="text"
                                placeholder="Núm. Int."
                                value={factura.numInt || ''}
                                onChange={(e) => {
                                  factura.numInt = e.target.value;
                                  setFacturasInfo([...facturasInfo]);
                                }}
                                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Colonia"
                              value={factura.colonia}
                              onChange={(e) => {
                                factura.colonia = e.target.value;
                                setFacturasInfo([...facturasInfo]);
                              }}
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                            <div className="flex space-x-1">
                              <input
                                type="text"
                                placeholder="Municipio"
                                value={factura.municipio}
                                onChange={(e) => {
                                  factura.municipio = e.target.value;
                                  setFacturasInfo([...facturasInfo]);
                                }}
                                className="flex-1 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              />
                              <input
                                type="text"
                                placeholder="CP"
                                value={factura.cp}
                                onChange={(e) => {
                                  factura.cp = e.target.value;
                                  setFacturasInfo([...facturasInfo]);
                                }}
                                className="w-20 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                              />
                            </div>
                            <input
                              type="text"
                              placeholder="Entidad Federativa"
                              value={factura.entidadFederativa}
                              onChange={(e) => {
                                factura.entidadFederativa = e.target.value;
                                setFacturasInfo([...facturasInfo]);
                              }}
                              className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            />
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div>{factura.calle} {factura.numExt}{factura.numInt ? ` Int. ${factura.numInt}` : ''}</div>
                            <div>{factura.colonia}</div>
                            <div>{factura.municipio}, {factura.entidadFederativa} {factura.cp}</div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                        {factura.editing ? (
                          <select
                            multiple
                            value={factura.regimenesFiscales}
                            onChange={(e) => {
                              const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                              factura.regimenesFiscales = selectedOptions;
                              setFacturasInfo([...facturasInfo]);
                            }}
                            className="w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                            size={3}
                          >
                            {todosRegimenesFiscales.map((regimen, idx) => (
                              <option key={idx} value={regimen.clave + " - " + regimen.descripcion}>
                                {regimen.clave} - {regimen.descripcion}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div>
                            {factura.regimenesFiscales.length > 0 ? (
                              <div className="space-y-1">
                                {factura.regimenesFiscales.map((regimen, idx) => (
                                  <div key={idx} className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                                    {regimen}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 dark:text-gray-500">-</span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => toggleEdit(factura)}
                            className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded transition-colors ${
                              factura.editing
                                ? 'text-green-600 hover:text-green-500'
                                : 'text-blue-600 hover:text-blue-500'
                            }`}
                          >
                            {factura.editing ? <FaSave className="mr-1" /> : <FaEdit className="mr-1" />}
                            {factura.editing ? 'Guardar' : 'Editar'}
                          </button>
                          <button
                            onClick={() => viewDetails(factura)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-gray-600 hover:text-gray-500"
                          >
                            <FaEye className="mr-1" />
                            Ver
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

        {/* Modal */}
        {selectedFactura && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Detalles de la Constancia
                  </h3>
                  <button
                    onClick={closeModal}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <FaTimes className="h-6 w-6" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">RFC</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedFactura.rfc}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nombre</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedFactura.nombre}</p>
                    </div>
                    {selectedFactura.primerApellido && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Primer Apellido</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedFactura.primerApellido}</p>
                      </div>
                    )}
                    {selectedFactura.segundoApellido && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Segundo Apellido</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedFactura.segundoApellido}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Calle</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedFactura.calle}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número Exterior</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedFactura.numExt}</p>
                    </div>
                    {selectedFactura.numInt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Número Interior</label>
                        <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedFactura.numInt}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Colonia</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedFactura.colonia}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Municipio</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedFactura.municipio}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Entidad Federativa</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedFactura.entidadFederativa}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">CP</label>
                      <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{selectedFactura.cp}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Regímenes Fiscales</label>
                    <div className="mt-1">
                      {selectedFactura.regimenesFiscales.length > 0 ? (
                        <div className="space-y-1">
                          {selectedFactura.regimenesFiscales.map((regimen, idx) => (
                            <div key={idx} className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded">
                              {regimen}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-400">No especificados</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Process Button */}
        {facturasInfo.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={processData}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
              style={{
                backgroundColor: customColors.primary,
                '--tw-ring-color': customColors.primary,
              } as React.CSSProperties}
            >
              Procesar Datos
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistroCFDIPage;