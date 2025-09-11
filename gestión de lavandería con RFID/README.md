# 🧺 Sistema de Gestión de Lavandería con RFID

Sistema empresarial completo desarrollado en HTML5, CSS3 y JavaScript ES6+ para la gestión integral de lavanderías con tecnología RFID. Plataforma web responsive que optimiza los procesos operativos desde la recepción hasta la entrega de prendas.

## 🏢 Características del Sistema

### ✅ Módulos Implementados

- **🔐 Sistema de Autenticación**: Control de acceso con sesiones seguras
- **📊 Dashboard Ejecutivo**: Panel de control con KPIs y métricas en tiempo real
- **👥 Gestión de Clientes**: Base de datos completa con perfiles detallados
- **📥 Recepción RFID**: Proceso guiado de ingreso con simulación de escáner
- **⚙️ Control de Operaciones**: Seguimiento avanzado de estados y flujos
- **📤 Entrega Validada**: Sistema de entrega con verificaciones automáticas
- **📋 Auditoría Completa**: Historial detallado de todas las operaciones
- **📈 Business Intelligence**: Reportes ejecutivos y análisis estadístico
- **📄 Gestión Documental**: Administración de guías y documentos oficiales

### 🎯 Tecnologías Utilizadas

- **HTML5**: Estructura semántica y accesible
- **CSS3**: Diseño moderno y responsivo con Flexbox y Grid
- **JavaScript ES6+**: Programación orientada a objetos sin frameworks
- **localStorage**: Persistencia de datos sin base de datos externa

## 🚀 Instalación y Configuración

### Requisitos del Sistema
- **Navegador Web**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **JavaScript**: Habilitado (requerido para funcionalidad completa)
- **Almacenamiento Local**: 50MB mínimo para datos de operación
- **Resolución**: Mínimo 1024x768 (recomendado 1920x1080)

### Instalación Empresarial

1. **Descarga del Sistema**
   ```bash
   # Clonación del repositorio
   git clone https://github.com/empresa/lavanderia-rfid.git
   
   # O descarga directa del paquete ZIP
   wget https://releases.empresa.com/lavanderia-rfid-v2.1.zip
   ```

2. **Configuración Inicial**
   ```bash
   # Navegar al directorio del proyecto
   cd lavanderia-rfid
   
   # Verificar estructura de archivos
   ls -la
   ```

3. **Despliegue en Servidor Web**
   ```bash
   # Para servidor Apache
   cp -r * /var/www/html/lavanderia/
   
   # Para servidor Nginx
   cp -r * /usr/share/nginx/html/lavanderia/
   ```

4. **Configuración de Acceso**
   - Abrir `index.html` en navegador web
   - Sistema se inicializa automáticamente
   - Datos de ejemplo se cargan en primera ejecución

### Credenciales de Acceso

**Usuario Administrador**:
```
Usuario: admin
Contraseña: admin123
```

**Configuración de Seguridad**:
- Cambiar credenciales en `js/auth.js` para producción
- Implementar autenticación multi-factor según políticas
- Configurar roles de usuario según necesidades operativas

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

## 🖥️ Arquitectura de Pantallas y Modales

### 🔐 Pantalla de Autenticación
**Ubicación**: `index.html` - Pantalla principal de acceso

**Componentes**:
- **Formulario de Login**: Campos de usuario y contraseña con validación
- **Credenciales Demo**: Información de acceso para pruebas
- **Mensajes de Error**: Alertas dinámicas para credenciales incorrectas
- **Animaciones**: Transiciones suaves entre estados de carga

**Funcionalidades**:
- Validación de credenciales en tiempo real
- Sesiones persistentes con renovación automática
- Logout seguro con limpieza completa de datos
- Autocompletado inteligente para usuarios demo

### 📊 Dashboard Ejecutivo
**Ubicación**: `js/dashboard.js` - Panel de control principal

**Componentes**:
- **KPIs en Tiempo Real**: Métricas de rendimiento actualizadas
- **Gráficos de Progreso**: Visualización de estados de prendas
- **Alertas Automáticas**: Notificaciones de prendas demoradas
- **Actividad Reciente**: Timeline de últimas operaciones
- **Acciones Rápidas**: Botones de navegación directa

**Métricas Mostradas**:
- Total de clientes registrados
- Prendas en proceso vs. completadas
- Eficiencia operativa diaria
- Alertas de demoras automáticas

### 👥 Gestión de Clientes
**Ubicación**: `js/clients.js` - Módulo completo de clientes

**Pantallas Principales**:
1. **Lista de Clientes**: Vista tabular con búsqueda y filtros
2. **Perfil de Cliente**: Vista detallada con historial completo
3. **Formulario de Cliente**: Creación y edición de registros

**Modales Implementados**:
- **Modal de Nuevo Cliente**: Formulario completo de registro
- **Modal de Edición**: Modificación de datos existentes
- **Modal de Perfil**: Vista detallada con estadísticas
- **Modal de Historial**: Timeline de servicios del cliente
- **Modal de Exportación**: Configuración de respaldos CSV
- **Modal de Importación**: Carga masiva de datos

**Funcionalidades Avanzadas**:
- Búsqueda inteligente por múltiples campos
- Ordenamiento dinámico por columnas
- Exportación/importación de datos
- Estadísticas individuales por cliente

### 📥 Recepción de Prendas
**Ubicación**: `js/reception.js` - Proceso guiado de recepción

**Flujo de 3 Pasos**:
1. **Selección de Cliente**: Búsqueda y selección del cliente
2. **Registro de Prendas**: Escaneo RFID y detalles de prendas
3. **Confirmación**: Revisión final y generación de guía

**Modales Especializados**:
- **Modal de Detalles de Prenda**: Formulario completo de características
- **Modal de Selección de Cliente**: Búsqueda avanzada de clientes
- **Modal de Confirmación**: Resumen final antes de procesar
- **Modal de Guía Generada**: Visualización del documento creado

**Características del Formulario de Prenda**:
- Tipo de prenda (9 categorías predefinidas)
- Color y talla con validaciones
- Condición inicial (5 estados)
- Notas especiales y observaciones
- Generación automática de códigos RFID únicos

### ⚙️ Control Interno
**Ubicación**: `js/control.js` - Centro de operaciones

**Vistas Disponibles**:
1. **Vista de Lista**: Tabla detallada con filtros avanzados
2. **Vista Kanban**: Organización visual por estados
3. **Vista Timeline**: Línea de tiempo de procesos

**Modales de Gestión**:
- **Modal de Acciones Masivas**: Cambios de estado en lote
- **Modal de Cambio de Estado**: Actualización individual
- **Modal de Filtros Avanzados**: Configuración de búsquedas
- **Modal de Detalles de Prenda**: Información completa
- **Modal de Historial de Estados**: Trazabilidad completa

**Funcionalidades Operativas**:
- Selección múltiple con checkboxes
- Cambios de estado masivos
- Filtros por estado, cliente, fechas
- Alertas automáticas de demoras
- Actualización en tiempo real

### 📤 Entrega de Prendas
**Ubicación**: `js/delivery.js` - Proceso de entrega validado

**Flujo de 4 Pasos**:
1. **Selección de Cliente**: Identificación del cliente
2. **Escaneo de Prendas**: Validación de códigos RFID
3. **Verificación**: Detección de inconsistencias
4. **Confirmación**: Finalización del proceso

**Modales de Validación**:
- **Modal de Inconsistencias**: Alertas de problemas detectados
- **Modal de Confirmación**: Resumen final de entrega
- **Modal de Guía de Entrega**: Documento generado
- **Modal de Escaneo Manual**: Entrada alternativa de códigos

**Sistema de Validaciones**:
- Verificación automática de estados
- Detección de prendas faltantes
- Alertas de inconsistencias
- Generación automática de guías

### 📋 Historial y Auditoría
**Ubicación**: `js/history.js` - Registro completo de operaciones

**Vistas Disponibles**:
- **Timeline Cronológico**: Ordenamiento por fechas
- **Filtros Avanzados**: Por cliente, operación, rango de fechas
- **Exportación de Datos**: Generación de reportes CSV

**Funcionalidades de Auditoría**:
- Registro completo de todas las acciones
- Identificación del operador responsable
- Timestamps precisos de cada operación
- Trazabilidad completa de prendas

### 📈 Reportes Ejecutivos
**Ubicación**: `js/reports.js` - Business Intelligence

**Tipos de Reportes**:
1. **Resumen General**: KPIs y métricas principales
2. **Ranking de Clientes**: Análisis de clientes más activos
3. **Análisis por Prenda**: Estadísticas por tipo de prenda
4. **Proyecciones**: Estimaciones financieras

**Modales de Configuración**:
- **Modal de Período**: Selección de rangos de fechas
- **Modal de Filtros**: Configuración de parámetros
- **Modal de Exportación**: Descarga de reportes
- **Modal de Gráficos**: Visualización interactiva

### 📄 Gestión de Guías
**Ubicación**: `js/guides.js` - Administración documental

**Vistas Disponibles**:
- **Lista de Guías**: Vista tabular con filtros
- **Vista de Tarjetas**: Organización visual
- **Detalles de Guía**: Información completa

**Modales de Gestión**:
- **Modal de Nueva Guía**: Creación manual de documentos
- **Modal de Detalles**: Visualización completa de guías
- **Modal de Impresión**: Simulación de impresión
- **Modal de Filtros**: Configuración de búsquedas

**Tipos de Guías**:
- Guías de Recepción (automáticas y manuales)
- Guías de Entrega (con validaciones)
- Guías Personalizadas (creación manual)

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

## 🏭 Datos y Configuración Empresarial

### 📊 Base de Datos Inicial
- **Clientes de Ejemplo**: 3 perfiles completos con historial
- **Prendas de Prueba**: Múltiples estados para validar flujos
- **Guías Generadas**: Documentos de recepción y entrega
- **Historial Operativo**: Registro completo de actividades

### 🔧 Configuración del Sistema
- **Códigos RFID**: Generación automática de identificadores únicos
- **Estados de Prenda**: 4 estados operativos (Recibido, En Proceso, Listo, Entregado)
- **Tipos de Prenda**: 9 categorías predefinidas
- **Condiciones**: 5 niveles de estado inicial
- **Prioridades**: 3 niveles de urgencia

### 📈 Métricas y KPIs Configurados
- **Eficiencia Operativa**: Tiempo promedio de procesamiento
- **Satisfacción del Cliente**: Tiempo de entrega vs. prometido
- **Productividad**: Prendas procesadas por día
- **Calidad**: Porcentaje de prendas sin problemas

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

## 🚀 Roadmap de Desarrollo

### 🔮 Versión 3.0 - Integración Empresarial
- **Hardware RFID Real**: Integración con lectores físicos industriales
- **Base de Datos Corporativa**: MySQL/PostgreSQL para entornos empresariales
- **API RESTful**: Integración con sistemas ERP y contabilidad
- **Aplicación Móvil**: App nativa para operadores de campo
- **Impresión Industrial**: Integración con impresoras de etiquetas RFID
- **Notificaciones Push**: Sistema de alertas en tiempo real
- **Multi-sucursal**: Gestión centralizada de múltiples ubicaciones
- **Facturación Integrada**: Módulo de cobros y facturación automática

### 📊 Versión 3.5 - Business Intelligence
- **Machine Learning**: Predicción de tiempos de procesamiento
- **Analytics Avanzados**: Dashboards ejecutivos con IA
- **Optimización Automática**: Sugerencias de mejora de procesos
- **Análisis Predictivo**: Detección de tendencias y patrones
- **Reportes Personalizados**: Generador de reportes dinámicos

### 🔒 Versión 4.0 - Seguridad Empresarial
- **Autenticación Multi-factor**: 2FA/SMS/Biometría
- **Gestión de Roles**: Control granular de permisos por usuario
- **Encriptación End-to-End**: Protección de datos sensibles
- **Auditoría Avanzada**: Logs de seguridad y compliance
- **Backup Automático**: Respaldo en la nube con versionado

## 📞 Soporte Técnico y Contacto

### 🆘 Soporte Empresarial
- **Email Corporativo**: soporte@lavanderia-rfid.com
- **Teléfono**: +1 (555) 123-4567
- **Horario**: Lunes a Viernes, 8:00 AM - 6:00 PM EST
- **Portal de Soporte**: https://support.lavanderia-rfid.com

### 📚 Recursos de Documentación
- **Manual de Usuario**: Guía completa de operación
- **API Documentation**: Referencia técnica para desarrolladores
- **Video Tutoriales**: Capacitación paso a paso
- **Base de Conocimiento**: FAQ y soluciones comunes

### 🔧 Soporte Técnico
- **Tickets de Soporte**: Sistema de seguimiento de incidencias
- **Chat en Vivo**: Soporte inmediato para usuarios premium
- **Actualizaciones**: Notificaciones automáticas de nuevas versiones
- **Capacitación**: Sesiones de entrenamiento para equipos

## 📄 Licencia y Términos

**Licencia Empresarial**: Sistema propietario para uso comercial
**Términos de Uso**: Disponibles en el portal de soporte
**Política de Privacidad**: Cumplimiento con GDPR y regulaciones locales
**SLA**: 99.9% de disponibilidad con soporte 24/7 para clientes enterprise

---

## ⚡ Guía de Inicio Rápido

### 🚀 Para Administradores
1. **Descargar** el paquete de instalación
2. **Configurar** credenciales de acceso
3. **Importar** datos iniciales de clientes
4. **Capacitar** al equipo operativo
5. **Iniciar** operaciones con datos de prueba

### 👥 Para Operadores
1. **Acceder** al sistema con credenciales asignadas
2. **Navegar** por el dashboard principal
3. **Procesar** recepción de prendas
4. **Actualizar** estados en control interno
5. **Completar** entregas con validaciones

### 📊 Para Gerentes
1. **Revisar** métricas en tiempo real
2. **Generar** reportes ejecutivos
3. **Analizar** tendencias de productividad
4. **Optimizar** procesos operativos
5. **Tomar** decisiones basadas en datos

---

## 🏆 Características Destacadas

✅ **Sistema Empresarial Completo** - Solución integral para lavanderías
✅ **Tecnología RFID Avanzada** - Trazabilidad completa de prendas  
✅ **Interfaz Intuitiva** - Diseño moderno y fácil de usar
✅ **Escalabilidad** - Adaptable a diferentes tamaños de operación
✅ **Seguridad Robusta** - Protección de datos y auditoría completa
✅ **Soporte Profesional** - Asistencia técnica especializada

---

*Desarrollado por el equipo de ingeniería de Lavandería RFID Solutions - Transformando la industria del lavado con tecnología de vanguardia.*


