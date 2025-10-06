import React, { useState, useEffect, useRef } from 'react';
import formatoCorreoService, { FormatoCorreoConfig } from '../services/formatoCorreoService';

interface FormatConfig {
  fontFamily: string;
  fontSize: number;
  isItalic: boolean;
  isUnderlined: boolean;
}

interface ProtectedMessageEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  required?: boolean;
  isProtected?: boolean;
}

export const ProtectedMessageEditor: React.FC<ProtectedMessageEditorProps> = ({
  value,
  onChange,
  placeholder = "Contenido del mensaje que se enviará con las facturas",
  rows = 12,
  className = "",
  required = false,
  isProtected = false
}) => {
  const [protectedContent, setProtectedContent] = useState<string>('');
  const [editableContent, setEditableContent] = useState<string>('');
  const [displayProtectedContent, setDisplayProtectedContent] = useState<string>('');
  const [cleanProtectedContent, setCleanProtectedContent] = useState<string>('');
  const [formatConfig, setFormatConfig] = useState<FormatConfig>({
    fontFamily: 'Arial',
    fontSize: 14,
    isItalic: false,
    isUnderlined: false
  });

  const fontOptions = [
    { value: 'Arial', label: 'Arial' },
    { value: 'Times New Roman', label: 'Times New Roman' },
    { value: 'Calibri', label: 'Calibri' }
  ];

  const fontSizes = [12, 14, 16, 18, 20, 24];
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Cargar configuración de formato al inicializar
  useEffect(() => {
    const cargarConfiguracionFormato = async () => {
      try {
        const response = await formatoCorreoService.obtenerConfiguracionActiva();
        if (response.exitoso && response.configuracion) {
          setFormatConfig({
            fontFamily: response.configuracion.tipoFuente,
            fontSize: response.configuracion.tamanoFuente,
            isItalic: response.configuracion.esCursiva,
            isUnderlined: response.configuracion.esSubrayado
          });
        }
      } catch (error) {
        console.error('Error al cargar configuración de formato:', error);
      }
    };

    cargarConfiguracionFormato();
  }, []);

  // Guardar configuración cuando cambie
  const guardarConfiguracionFormato = async (newConfig: FormatConfig) => {
    try {
      // Crear directamente el objeto con valores seguros a partir del estado de la UI
      const rawSize = Number(newConfig.fontSize);
      const safeFontSize = Number.isFinite(rawSize) && rawSize > 0 ? rawSize : 14;
      if (!Number.isFinite(rawSize) || rawSize <= 0) {
        console.warn('fontSize inválido en UI, usando 14 por defecto:', newConfig.fontSize);
      }
      const formatoConfig: FormatoCorreoConfig = {
        tipoFuente: newConfig.fontFamily || 'Arial',
        tamanoFuente: safeFontSize,
        esCursiva: Boolean(newConfig.isItalic),
        esSubrayado: Boolean(newConfig.isUnderlined),
        colorTexto: '#000000',
        activo: true
      };
      
      // Validar que los datos sean correctos antes de enviar
      if (!formatoConfig.tipoFuente || formatoConfig.tipoFuente.trim() === '') {
        console.error('El tipo de fuente no puede estar vacío');
        return;
      }
      
      console.log('Enviando configuración:', formatoConfig);
      try {
        const resultado = await formatoCorreoService.guardarConfiguracionFormato(formatoConfig);
        
        if (!resultado.exitoso) {
          console.error('Error al guardar configuración:', resultado.mensaje);
        } else {
          console.log('Configuración guardada correctamente');
        }
      } catch (error) {
        console.error('Error al guardar configuración:', error);
      }
    } catch (error) {
      console.error('Error al guardar configuración de formato:', error);
    }
  };

  // Variables dinámicas que deben protegerse
  const protectedVariables = ['{serie}', '{folio}', '{uuid}', '{rfcReceptor}', '{facturaInfo}'];

  // Texto completo que debe protegerse
  const protectedTexts = [
    'Estimado cliente,',
    '',
    'Se ha generado su factura electrónica con los siguientes datos:',
    '',
    'Serie de la factura:',
    'Folio de la factura:',
    'UUID de la factura:',
    'RFC del receptor:'
  ];

  useEffect(() => {
    separateContent();
  }, [value]);

  const isProtectedText = (text: string): boolean => {
    return protectedTexts.some(protectedText => 
      text.toLowerCase().includes(protectedText.toLowerCase())
    );
  };

  const isProtectedVariable = (text: string): boolean => {
    return protectedVariables.some(variable => text.includes(variable));
  };

  const separateContent = () => {
    // Contenido protegido limpio sin etiquetas para el correo final
    const fixedProtectedContent = `Asunto: Factura Electrónica - {facturaInfo}
Estimado cliente,
Se ha generado su factura electrónica con los siguientes datos:
Serie de la factura: {serie}
Folio de la factura: {folio}
UUID de la factura: {uuid}
RFC del receptor: {rfcReceptor}`;

    // Contenido para mostrar en la interfaz con etiquetas
    const displayProtectedContent = `Asunto: Factura Electrónica - {facturaInfo}
Estimado cliente,(Texto protegido)
Se ha generado su factura electrónica con los siguientes datos:(Texto protegido)
Serie de la factura: {serie}(Texto protegido)
Folio de la factura: {folio}(Texto protegido)
UUID de la factura: {uuid}(Texto protegido)
RFC del receptor: {rfcReceptor}(Texto protegido)`;

    setProtectedContent(displayProtectedContent);
    setCleanProtectedContent(fixedProtectedContent);
    
    // Extraer el contenido editable del valor total
    if (value) {
      // Buscar el contenido después del contenido protegido
      const lines = value.split('\n');
      
      // Encontrar dónde termina el contenido protegido (después de "RFC del receptor:")
      let editableStartIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('RFC del receptor:')) {
          // Buscar la primera línea no vacía después de RFC del receptor
          for (let j = i + 1; j < lines.length; j++) {
            if (lines[j].trim() !== '') {
              editableStartIndex = j;
              break;
            }
          }
          break;
        }
      }
      
      if (editableStartIndex > -1) {
        const editableLines = lines.slice(editableStartIndex);
        const editableContent = editableLines.join('\n').trim();
        setEditableContent(editableContent);
      } else {
        // Si no encuentra el patrón, buscar después de una línea vacía
        let foundEmptyLine = false;
        let contentAfterEmpty = [];
        for (let i = 0; i < lines.length; i++) {
          if (foundEmptyLine) {
            contentAfterEmpty.push(lines[i]);
          } else if (lines[i].trim() === '' && i > 6) { // Después de las primeras líneas protegidas
            foundEmptyLine = true;
          }
        }
        if (contentAfterEmpty.length > 0) {
          setEditableContent(contentAfterEmpty.join('\n').trim());
        } else {
          setEditableContent('');
        }
      }
    } else {
      setEditableContent('');
    }
  };

  const handleEditableChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newEditableContent = e.target.value;
    setEditableContent(newEditableContent);
    
    // Combinar contenido protegido limpio con contenido editable
    const fullContent = cleanProtectedContent + '\n\n' + newEditableContent;
    onChange(fullContent);
  };

  const handleFontChange = (fontFamily: string) => {
    const newConfig = { ...formatConfig, fontFamily };
    setFormatConfig(newConfig);
    guardarConfiguracionFormato(newConfig);
  };

  const handleFontSizeChange = (fontSize: number) => {
    const newConfig = { ...formatConfig, fontSize };
    setFormatConfig(newConfig);
    guardarConfiguracionFormato(newConfig);
  };

  // Toolbar de formato
  const handleItalicClick = () => {
    setFormatConfig((prev) => ({ ...prev, isItalic: !prev.isItalic }));
    guardarConfiguracionFormato({ ...formatConfig, isItalic: !formatConfig.isItalic });
  };

  const handleUnderlineClick = () => {
    setFormatConfig((prev) => ({ ...prev, isUnderlined: !prev.isUnderlined }));
    guardarConfiguracionFormato({ ...formatConfig, isUnderlined: !formatConfig.isUnderlined });
  };

  const getTextareaStyle = () => ({
    fontFamily: formatConfig.fontFamily,
    fontSize: `${formatConfig.fontSize}px`,
    fontStyle: formatConfig.isItalic ? 'italic' : 'normal',
    textDecoration: formatConfig.isUnderlined ? 'underline' : 'none',
  });

  const renderProtectedContent = () => {
    if (!protectedContent) {
      return (
        <div className="text-gray-400 dark:text-gray-500 italic">
          No hay contenido protegido
        </div>
      );
    }

    const lines = protectedContent.split('\n');
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      if (trimmedLine === '') {
        return <div key={`empty-${index}`} className="h-4"></div>;
      }

      // Verificar si es una variable
      const isVariable = protectedVariables.some(variable => 
        trimmedLine === variable
      );

      if (isVariable) {
        return (
          <div key={`var-${index}`} className="flex items-center my-1">
            <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded border border-yellow-300 dark:border-yellow-700 font-mono inline-block">
              {trimmedLine}
            </span>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              (Variable dinámica)
            </span>
          </div>
        );
      } else {
        return (
          <div key={`text-${index}`} className="flex items-center my-1">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded border border-blue-300 dark:border-blue-700 inline-block">
              {line}
            </span>
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              (Texto protegido)
            </span>
          </div>
        );
      }
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Contenido protegido */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="text-sm text-blue-600 font-medium mb-2">
          Contenido Protegido (No editable)
        </div>
        <div className="whitespace-pre-wrap text-gray-700 text-sm">
          {renderProtectedContent()}
        </div>
      </div>

      {!isProtected ? (
        /* Área editable con barra de herramientas */
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium mb-2">
            Mensaje Personalizable
          </div>
          
          {/* Barra de herramientas de formato */}
          <div className="flex items-center space-x-2 mb-2">
            <select
              className="border rounded px-2 py-1 text-sm"
              value={formatConfig.fontFamily}
              onChange={e => {
                setFormatConfig({ ...formatConfig, fontFamily: e.target.value });
                guardarConfiguracionFormato({ ...formatConfig, fontFamily: e.target.value });
              }}
            >
              {fontOptions.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            {/* Icono de tamaño de fuente ya existente, solo el select */}
            <select
              className="border rounded px-2 py-1 text-sm"
              value={formatConfig.fontSize}
              onChange={e => {
                const newSize = Number(e.target.value);
                setFormatConfig({ ...formatConfig, fontSize: newSize });
                guardarConfiguracionFormato({ ...formatConfig, fontSize: newSize });
              }}
            >
              {fontSizes.map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <button
              type="button"
              className={`border rounded px-2 py-1 text-sm ${formatConfig.isItalic ? 'font-bold bg-gray-200' : ''}`}
              onClick={handleItalicClick}
              title="Cursiva"
            >
              <span style={{ fontStyle: 'italic' }}>I</span>
            </button>
            <button
              type="button"
              className={`border rounded px-2 py-1 text-sm ${formatConfig.isUnderlined ? 'font-bold bg-gray-200' : ''}`}
              onClick={handleUnderlineClick}
              title="Subrayado"
            >
              <span style={{ textDecoration: 'underline' }}>U</span>
            </button>
          </div>

          <textarea
            ref={textareaRef}
            value={editableContent}
            onChange={handleEditableChange}
            placeholder={placeholder}
            rows={rows}
            required={required}
            className="w-full h-32 p-3 border border-green-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            style={{ 
              backgroundColor: '#f0fdf4',
              ...getTextareaStyle()
            }}
          />
        </div>
      ) : null}
    </div>
  );
};