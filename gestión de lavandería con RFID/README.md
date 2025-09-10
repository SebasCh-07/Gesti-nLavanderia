# 🧺 Sistema de Gestión de Lavandería con RFID

Un prototipo funcional desarrollado en HTML, CSS y JavaScript puro que simula un sistema completo de gestión de lavandería con tecnología RFID.

## 📋 Características Principales

### ✅ Funcionalidades Implementadas

- **🔐 Autenticación**: Login básico con sesiones persistentes
- **📊 Dashboard**: Resumen estadístico con alertas y métricas en tiempo real
- **👥 Gestión de Clientes**: CRUD completo con búsqueda y perfiles detallados
- **📥 Recepción de Prendas**: Simulación de escaneo RFID con generación automática de guías
- **⚙️ Control Interno**: Seguimiento de estados de prendas con actualizaciones masivas
- **📤 Entrega**: Validación automática con alertas de inconsistencias
- **📋 Historial**: Registro completo de todas las operaciones del sistema
- **📈 Reportes**: Análisis estadístico con exportación a CSV
- **📄 Gestión de Guías**: Administración de documentos de recepción y entrega

### 🎯 Tecnologías Utilizadas

- **HTML5**: Estructura semántica y accesible
- **CSS3**: Diseño moderno y responsivo con Flexbox y Grid
- **JavaScript ES6+**: Programación orientada a objetos sin frameworks
- **localStorage**: Persistencia de datos sin base de datos externa

## 🚀 Instalación y Uso

### Requisitos Previos
- Navegador web moderno (Chrome, Firefox, Safari, Edge)
- No requiere servidor web (funciona con archivos locales)

### Pasos de Instalación

1. **Clonar o Descargar**
   ```bash
   # Si tienes git instalado
   git clone <repositorio>
   
   # O descarga el ZIP y extrae los archivos
   ```

2. **Abrir el Proyecto**
   - Navega hasta la carpeta del proyecto
   - Abre `index.html` en tu navegador
   - ¡Listo! El sistema está funcionando

### Credenciales de Acceso

```
Usuario: admin
Contraseña: admin123
```

## 📁 Estructura del Proyecto

```
gestión-de-lavandería-con-rfid/
├── index.html              # Página principal
├── README.md               # Este archivo
├── css/
│   ├── styles.css          # Estilos principales
│   └── login.css           # Estilos del login
├── js/
│   ├── app.js              # Aplicación principal
│   ├── auth.js             # Autenticación
│   ├── navigation.js       # Navegación entre páginas
│   ├── storage.js          # Gestión de localStorage
│   ├── dashboard.js        # Panel principal
│   ├── clients.js          # Gestión de clientes
│   ├── reception.js        # Recepción de prendas
│   ├── control.js          # Control interno
│   ├── delivery.js         # Entrega de prendas
│   ├── history.js          # Historial de servicios
│   ├── reports.js          # Reportes y estadísticas
│   └── guides.js           # Gestión de guías
├── pages/                  # (Reservado para futuras páginas)
└── assets/                 # (Reservado para imágenes y recursos)
```

## 🔧 Funcionalidades Detalladas

### 🔐 Sistema de Autenticación
- Login con validación de credenciales
- Sesiones persistentes en localStorage
- Renovación automática de sesión
- Logout seguro con limpieza de datos

### 📊 Dashboard Inteligente
- **KPIs en Tiempo Real**: Prendas procesadas, clientes activos, etc.
- **Alertas Automáticas**: Prendas demoradas, problemas de integridad
- **Actividad Reciente**: Últimas operaciones realizadas
- **Acciones Rápidas**: Navegación directa a tareas frecuentes

### 👥 Gestión Avanzada de Clientes
- **CRUD Completo**: Crear, editar, eliminar clientes
- **Búsqueda Inteligente**: Por nombre, cédula, teléfono
- **Perfiles Detallados**: Historial completo de servicios
- **Estadísticas por Cliente**: Tiempo promedio, servicios totales
- **Exportación/Importación**: CSV para respaldos

### 📥 Recepción con RFID Simulado
- **Proceso Guiado**: 3 pasos (Cliente → Prendas → Confirmación)
- **Simulación de Escáner**: Entrada manual de códigos RFID
- **Validaciones**: Códigos únicos, detección de duplicados
- **Generación Automática**: Guías de recepción con timestamp
- **Opciones de Servicio**: Prioridad, tipo de lavado, notas especiales

### ⚙️ Control Interno Avanzado
- **Vista Múltiple**: Lista y tarjetas de prendas
- **Filtros Dinámicos**: Por estado, prioridad, cliente, fechas
- **Actualización Masiva**: Cambios de estado en lote
- **Alertas Inteligentes**: Prendas demoradas automáticamente detectadas
- **Seguimiento Completo**: Historial de cada prenda

### 📤 Entrega con Validaciones
- **Escaneo Inteligente**: Validación automática del estado
- **Alertas de Inconsistencias**: Detección de problemas automática
- **Entrega por Cliente**: Procesamiento masivo por cliente
- **Generación de Guías**: Documentación automática de entregas

### 📋 Historial Completo
- **Timeline Visual**: Ordenamiento cronológico por fechas
- **Filtros Avanzados**: Por cliente, actividad, rango de fechas
- **Trazabilidad Total**: Cada acción registrada con operador
- **Exportación**: Reportes históricos en CSV

### 📈 Reportes Ejecutivos
- **4 Tipos de Reportes**:
  - Resumen General con KPIs
  - Ranking de Clientes
  - Análisis por Tipo de Prenda
  - Proyecciones Financieras (simuladas)
- **Gráficos Visuales**: Barras de progreso y distribuciones
- **Períodos Configurables**: Semana, mes, trimestre, año
- **Exportación**: CSV para análisis externos

### 📄 Gestión de Guías
- **Vista Dual**: Lista y tarjetas
- **Filtros por Tipo**: Recepción, entrega, activas
- **Detalles Completos**: Cliente, prendas, fechas, notas
- **Impresión Simulada**: Generación de documentos
- **Guías Personalizadas**: Creación manual cuando sea necesario

## 🎨 Diseño y Experiencia de Usuario

### 🎯 Principios de Diseño
- **Consistencia Visual**: Colores, tipografías y componentes uniformes
- **Navegación Intuitiva**: Menú lateral con iconos descriptivos
- **Responsive Design**: Adaptable a móviles y tablets
- **Accesibilidad**: Contraste adecuado y navegación por teclado

### 🎨 Paleta de Colores
- **Primario**: #667eea (Azul profesional)
- **Secundario**: #764ba2 (Púrpura elegante)
- **Éxito**: #48bb78 (Verde confirmación)
- **Advertencia**: #ed8936 (Naranja atención)
- **Error**: #f56565 (Rojo alerta)
- **Información**: #4299e1 (Azul información)

### 📱 Características Responsivas
- **Breakpoints**: 768px para móviles
- **Menú Adaptativo**: Colapsa en dispositivos pequeños
- **Tablas Responsivas**: Scroll horizontal en móviles
- **Botones Táctiles**: Tamaño adecuado para dedos

## 🔮 Simulaciones y Datos de Prueba

### 📊 Datos Precargados
- **3 Clientes de ejemplo** con historial completo
- **Prendas en diferentes estados** para probar flujos
- **Guías de ejemplo** de recepción y entrega
- **Historial de actividades** para demostrar trazabilidad

### 🎲 Generadores Automáticos
- **Códigos RFID**: Generación automática de códigos únicos
- **Datos de Prueba**: Lotes de prendas para testing
- **Timestamps**: Fechas y horas realistas
- **Estadísticas**: Cálculos automáticos de métricas

## 🔧 Configuración y Personalización

### ⚙️ Configuraciones Disponibles
```javascript
// En js/storage.js - método initializeDefaultData()
const settings = {
    businessName: 'Lavandería RFID',        // Nombre del negocio
    businessAddress: 'Calle Principal 123', // Dirección
    businessPhone: '555-0000',              // Teléfono
    businessEmail: 'info@launderiarf.com',  // Email
    currency: 'USD',                        // Moneda
    timezone: 'America/Mexico_City',        // Zona horaria
    maxDaysInProcess: 7                     // Días máximos en proceso
};
```

### 🎨 Personalización de Estilos
```css
/* En css/styles.css - Variables principales */
:root {
    --primary-color: #667eea;      /* Color principal */
    --secondary-color: #764ba2;    /* Color secundario */
    --success-color: #48bb78;      /* Color de éxito */
    --warning-color: #ed8936;      /* Color de advertencia */
    --danger-color: #f56565;       /* Color de error */
}
```

## 📈 Métricas y KPIs Implementados

### 📊 Dashboard Principal
- **Clientes Registrados**: Total de clientes en el sistema
- **Prendas en Proceso**: Número de prendas actualmente siendo procesadas
- **Prendas Listas**: Cantidad de prendas listas para entrega
- **Guías Activas**: Guías pendientes de completar

### 📋 Control Interno
- **Eficiencia**: Porcentaje de prendas completadas vs recibidas
- **Tiempo Promedio**: Días promedio de procesamiento
- **Prendas Demoradas**: Alertas automáticas por demoras
- **Productividad**: Prendas procesadas por día

### 💰 Métricas Financieras (Simuladas)
- **Ingresos Estimados**: Basado en precios de mercado
- **Ticket Promedio**: Valor promedio por servicio
- **Proyecciones**: Ingresos mensuales estimados
- **Clientes Activos**: Generadores de ingresos

## 🔄 Flujos de Trabajo Principales

### 1. 📥 Flujo de Recepción
```
Cliente → Selección → Escaneo RFID → Detalles de Prendas → Confirmación → Guía Generada
```

### 2. ⚙️ Flujo de Procesamiento
```
Recibido → En Proceso → Listo → Entregado
```

### 3. 📤 Flujo de Entrega
```
Escaneo → Validación → Confirmación → Guía de Entrega → Actualización de Estado
```

### 4. 📊 Flujo de Reportes
```
Selección de Período → Tipo de Reporte → Visualización → Exportación
```

## 🛠️ Mantenimiento y Soporte

### 🗄️ Gestión de Datos
- **Backup Automático**: El sistema crea respaldos automáticos cada operación
- **Limpieza de Datos**: Herramientas para limpiar registros antiguos
- **Verificación de Integridad**: Detección automática de inconsistencias
- **Exportación Completa**: Backup manual de todos los datos

### 🔧 Depuración
- **Consola del Navegador**: Logs detallados de todas las operaciones
- **Estado del Sistema**: Información técnica en el dashboard
- **Verificación de Errores**: Alertas automáticas de problemas

### 📝 Logs y Auditoría
- **Historial Completo**: Registro de todas las acciones del usuario
- **Timestamps**: Fecha y hora exacta de cada operación
- **Operador**: Identificación del usuario que realizó cada acción
- **Trazabilidad**: Seguimiento completo de cada prenda

## 🚀 Posibles Mejoras Futuras

### 🔮 Funcionalidades Avanzadas
- **Integración con Hardware RFID Real**: Conexión con lectores físicos
- **Base de Datos Backend**: MySQL, PostgreSQL o MongoDB
- **API RESTful**: Para integración con otros sistemas
- **Aplicación Móvil**: App nativa para Android/iOS
- **Impresión Real**: Integración con impresoras de etiquetas
- **Notificaciones Push**: Alertas en tiempo real
- **Multi-sucursal**: Gestión de múltiples ubicaciones
- **Facturación Integrada**: Sistema de cobros automático

### 📊 Analytics Avanzados
- **Machine Learning**: Predicción de tiempos de procesamiento
- **Business Intelligence**: Dashboards ejecutivos avanzados
- **Optimización de Procesos**: Sugerencias automáticas de mejoras
- **Análisis de Patrones**: Detección de tendencias de clientes

### 🔒 Seguridad Empresarial
- **Autenticación Multi-factor**: 2FA/SMS
- **Roles y Permisos**: Control granular de accesos
- **Encriptación**: Datos sensibles protegidos
- **Auditoría Avanzada**: Logs de seguridad detallados

## 📞 Soporte y Contacto

Para consultas, sugerencias o reportes de problemas:

- **Email**: soporte@launderiarf.com
- **Documentación**: Ver archivos de código comentados
- **Issues**: Crear tickets en el sistema de control de versiones

## 📄 Licencia

Este proyecto es un prototipo educativo y de demostración. 

---

## ⚡ Inicio Rápido

1. **Descarga** el proyecto completo
2. **Abre** `index.html` en tu navegador
3. **Inicia sesión** con `admin` / `admin123`
4. **Explora** todas las funcionalidades desde el dashboard
5. **Prueba** el flujo completo: Recepción → Control → Entrega

¡El sistema está listo para usar inmediatamente! 🎉

---

*Desarrollado con ❤️ para demostrar las capacidades de JavaScript puro en aplicaciones empresariales complejas.*


