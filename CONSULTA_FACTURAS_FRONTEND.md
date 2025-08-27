# Frontend - Sistema de Consulta de Facturas

## Descripción General

El componente `ConsultasFacturasPage.tsx` implementa una interfaz completa para la consulta de facturas que se conecta con el backend Spring Boot. Proporciona un formulario de búsqueda robusto con validaciones y una tabla de resultados interactiva.

## Características Principales

### ✅ Funcionalidades Implementadas

1. **Formulario de Búsqueda Completo**
   - RFC Receptor
   - Nombre del Cliente
   - Apellido Paterno y Materno
   - Razón Social
   - Almacén/Tienda
   - Usuario
   - Serie y Folio
   - UUID
   - Rango de fechas (inicio y fin)
   - Campos adicionales (TE, TR, Fecha Tienda, Código de facturación)
   - Motivo de sustitución

2. **Validaciones del Lado del Cliente**
   - Al menos un campo de búsqueda debe estar lleno
   - Rango de fechas máximo 365 días
   - Fechas válidas (inicio no posterior a fin)
   - Validación en tiempo real

3. **Conexión con Backend**
   - API REST con endpoint `/api/consulta-facturas/buscar`
   - Manejo de errores de conexión
   - Estados de carga (loading)
   - Respuestas estructuradas

4. **Tabla de Resultados**
   - UUID, RFC Emisor/Receptor
   - Serie, Folio, Fecha de emisión
   - Importe formateado en pesos mexicanos
   - Estatus de facturación y SAT con indicadores visuales
   - Tienda y Almacén
   - Botón de cancelación condicional

5. **Indicadores Visuales**
   - Estados de estatus con colores (verde para vigente, rojo para cancelada)
   - Botones de cancelación visibles/ocultos según permisos
   - Mensajes de error claros y visibles
   - Contador de resultados

## Estructura del Componente

### Interfaces TypeScript

```typescript
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
  uuid: string;
  rfcEmisor: string;
  rfcReceptor: string;
  serie: string;
  folio: string;
  fechaEmision: string;
  importe: number;
  estatusFacturacion: string;
  estatusSat: string;
  tienda: string;
  almacen: string;
  usuario: string;
  permiteCancelacion: boolean;
  motivoNoCancelacion?: string;
}
```

### Estados del Componente

```typescript
const [formData, setFormData] = useState<ConsultaFacturasFormData>(initialFormData);
const [resultados, setResultados] = useState<Factura[]>([]);
const [mostrarResultados, setMostrarResultados] = useState(false);
const [cargando, setCargando] = useState(false);
const [error, setError] = useState<string | null>(null);
const [perfilUsuario] = useState<string>('OPERADOR');
```

## Flujo de Funcionamiento

### 1. Inicialización
- El componente se carga con datos iniciales
- Se establece el perfil del usuario (por defecto 'OPERADOR')
- Se configuran las opciones de almacén, tienda y motivo de sustitución

### 2. Entrada del Usuario
- El usuario llena los campos del formulario
- Se aplican validaciones en tiempo real
- Los errores se muestran inmediatamente

### 3. Validación del Formulario
```typescript
const validarFormulario = (): { valido: boolean; mensaje?: string } => {
  // Validar campos obligatorios
  const tieneCampo = 
    formData.rfcReceptor.trim() ||
    formData.nombreCliente.trim() ||
    formData.apellidoPaterno.trim() ||
    formData.razonSocial.trim() ||
    (formData.almacen && formData.almacen !== 'todos') ||
    formData.usuario.trim() ||
    formData.serie.trim() ||
    (formData.fechaInicio && formData.fechaFin);

  if (!tieneCampo) {
    return {
      valido: false,
      mensaje: "Es necesario seleccionar RFC receptor o Nombre y Apellido Paterno o Razón Social o Almacén o Usuario o Serie"
    };
  }

  // Validar rango de fechas
  if (formData.fechaInicio && formData.fechaFin) {
    const fechaInicio = new Date(formData.fechaInicio);
    const fechaFin = new Date(formData.fechaFin);
    const dias = Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24));
    
    if (dias < 0) {
      return {
        valido: false,
        mensaje: "La fecha de inicio no puede ser posterior a la fecha fin"
      };
    }
    
    if (dias > 365) {
      return {
        valido: false,
        mensaje: "El rango máximo permitido es de 365 días. Reintente"
      };
    }
  }

  return { valido: true };
};
```

### 4. Envío al Backend
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Validar formulario
  const validacion = validarFormulario();
  if (!validacion.valido) {
    setError(validacion.mensaje || 'Error de validación');
    return;
  }

  setCargando(true);
  setError(null);

  try {
    // Preparar datos para el backend
    const requestData = {
      ...formData,
      perfilUsuario: perfilUsuario,
      // Convertir fechas de string a formato ISO
      fechaInicio: formData.fechaInicio ? new Date(formData.fechaInicio).toISOString().split('T')[0] : null,
      fechaFin: formData.fechaFin ? new Date(formData.fechaFin).toISOString().split('T')[0] : null,
      fechaTienda: formData.fechaTienda ? new Date(formData.fechaTienda).toISOString().split('T')[0] : null
    };

    // Llamar al backend
    const response = await fetch('http://localhost:8080/api/consulta-facturas/buscar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestData),
    });

    const data: ConsultaFacturaResponse = await response.json();

    if (data.exitoso) {
      setResultados(data.facturas || []);
      setMostrarResultados(true);
      setError(null);
    } else {
      setError(data.mensaje || 'Error en la consulta');
      setResultados([]);
      setMostrarResultados(false);
    }

  } catch (err) {
    console.error('Error al consultar facturas:', err);
    setError('Error de conexión con el servidor');
    setResultados([]);
    setMostrarResultados(false);
  } finally {
    setCargando(false);
  }
};
```

### 5. Visualización de Resultados
- Los resultados se muestran en una tabla responsiva
- Cada factura incluye todos los campos requeridos
- Se muestran indicadores visuales para estatus
- Los botones de cancelación son condicionales según permisos

## Funciones de Utilidad

### Formateo de Moneda
```typescript
const formatearMoneda = (valor: number) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(valor);
};
```

### Formateo de Fechas
```typescript
const formatearFecha = (fecha: string) => {
  try {
    return new Date(fecha).toLocaleDateString('es-MX');
  } catch {
    return fecha;
  }
};
```

## Manejo de Errores

### Tipos de Errores
1. **Errores de Validación**: Campos obligatorios, rango de fechas
2. **Errores de Backend**: Respuestas con `exitoso: false`
3. **Errores de Conexión**: Problemas de red o servidor no disponible

### Visualización de Errores
```typescript
{error && (
  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
    {error}
  </div>
)}
```

## Estilos y Diseño

### Clases CSS Utilizadas
- **Grid responsivo**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Espaciado**: `space-y-6`, `gap-x-6 gap-y-2`
- **Colores de tema**: `text-primary`, `dark:text-secondary`
- **Estados visuales**: `hover:bg-gray-50`, `transition-colors`

### Indicadores de Estatus
```typescript
<span className={`px-2 py-1 rounded-full text-xs ${
  factura.estatusFacturacion === 'Vigente' || 
  factura.estatusFacturacion === 'Activa' || 
  factura.estatusFacturacion === 'Emitida'
    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
}`}>
  {factura.estatusFacturacion}
</span>
```

## Configuración del Backend

### URL del API
```typescript
const response = await fetch('http://localhost:8080/api/consulta-facturas/buscar', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(requestData),
});
```

### Endpoint Requerido
- **URL**: `http://localhost:8080/api/consulta-facturas/buscar`
- **Método**: `POST`
- **Content-Type**: `application/json`
- **CORS**: Habilitado en el backend

## Dependencias Requeridas

### Componentes Utilizados
- `Card`: Contenedor principal con estilos
- `FormField`: Campo de formulario genérico
- `SelectField`: Campo de selección con opciones
- `Button`: Botón con variantes y tamaños

### Constantes Importadas
```typescript
import { ALMACEN_OPTIONS, MOTIVO_SUSTITUCION_OPTIONS, TIENDA_OPTIONS } from '../constants';
```

## Personalización

### Cambiar URL del Backend
```typescript
// Cambiar esta línea en handleSubmit
const response = await fetch('TU_URL_AQUI/api/consulta-facturas/buscar', {
```

### Modificar Validaciones
```typescript
// En validarFormulario, ajustar las reglas según necesidades
if (dias > 365) { // Cambiar 365 por el valor deseado
```

### Agregar Campos Adicionales
1. Agregar el campo a `ConsultaFacturasFormData`
2. Agregar el campo al formulario JSX
3. Incluir en la validación si es necesario
4. Enviar al backend en `requestData`

## Pruebas del Frontend

### Casos de Prueba
1. **Formulario vacío**: Debe mostrar error de campos obligatorios
2. **Rango de fechas inválido**: Debe mostrar error de rango máximo
3. **Fechas invertidas**: Debe mostrar error de fechas inválidas
4. **Búsqueda exitosa**: Debe mostrar tabla de resultados
5. **Error de conexión**: Debe mostrar mensaje de error apropiado

### Verificación Visual
- ✅ Formulario se renderiza correctamente
- ✅ Validaciones funcionan en tiempo real
- ✅ Estados de carga se muestran
- ✅ Errores se muestran claramente
- ✅ Tabla de resultados es responsiva
- ✅ Botones de cancelación son condicionales

## Consideraciones de Rendimiento

### Optimizaciones Implementadas
- Validación en tiempo real sin debounce
- Estados de carga para evitar múltiples envíos
- Limpieza de errores al modificar formulario
- Renderizado condicional de resultados

### Mejoras Futuras
- Implementar debounce en validaciones
- Agregar paginación para grandes volúmenes
- Implementar caché de consultas frecuentes
- Agregar filtros adicionales en la tabla

## Soporte y Mantenimiento

### Debugging
- Revisar consola del navegador para errores JavaScript
- Verificar Network tab para errores de API
- Confirmar que el backend esté ejecutándose
- Verificar configuración de CORS

### Logs Útiles
```typescript
console.log('Buscando Facturas:', formData);
console.error('Error al consultar facturas:', err);
```

### Problemas Comunes
1. **CORS Error**: Verificar configuración del backend
2. **Connection Refused**: Verificar que el backend esté ejecutándose
3. **Validation Errors**: Revisar reglas de validación
4. **Empty Results**: Verificar parámetros de búsqueda

El componente está diseñado para ser robusto, fácil de usar y mantener, siguiendo las mejores prácticas de React y TypeScript.

