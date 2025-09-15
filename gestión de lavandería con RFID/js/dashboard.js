/**
 * Módulo del Dashboard
 * Muestra resumen de estadísticas, alertas y estado general del sistema
 */

class Dashboard {
    static async render() {
        const stats = Storage.getStats();
        const alerts = this.getAlerts();
        const recentActivity = this.getRecentActivity();
        const quickActions = this.getQuickActions();

        return `
            <div class="dashboard fade-in">
                <div class="page-header slide-in-up">
                    <h1>📊 Dashboard</h1>
                    <p>Resumen del estado del sistema de lavandería</p>
                </div>

            <!-- Alertas importantes -->
            ${alerts.length > 0 ? this.renderAlerts(alerts) : ''}

            <!-- Estadísticas principales -->
            <div class="grid grid-4 mb-3">
                <div class="card text-center scale-in" style="animation-delay: 0.1s;">
                    <h3 class="text-primary pulse">${stats.totalClients}</h3>
                    <p class="text-muted">Clientes Registrados</p>
                    <small class="badge badge-info">👥 Total</small>
                </div>
                <div class="card text-center scale-in" style="animation-delay: 0.2s;">
                    <h3 class="text-warning pulse">${stats.garmentsInProcess}</h3>
                    <p class="text-muted">Prendas en Proceso</p>
                    <small class="badge badge-warning">⚙️ En curso</small>
                </div>
                <div class="card text-center scale-in" style="animation-delay: 0.3s;">
                    <h3 class="text-success pulse">${stats.garmentsReady}</h3>
                    <p class="text-muted">Prendas Listas</p>
                    <small class="badge badge-success">✅ Completadas</small>
                </div>
                <div class="card text-center scale-in" style="animation-delay: 0.5s;">
                    <h3 class="text-secondary pulse">${stats.totalBatches}</h3>
                    <p class="text-muted">Lotes Activos</p>
                    <small class="badge badge-secondary">📦 Total</small>
                </div>
            </div>

            <!-- Contenido principal en dos columnas -->
            <div class="grid grid-2">
                <!-- Panel izquierdo -->
                <div>
                    <!-- Estado de prendas -->
                    <div class="card mb-2">
                        <div class="card-header">
                            <h3 class="card-title">Estado de Prendas</h3>
                            <p class="card-subtitle">Distribución actual del inventario</p>
                        </div>
                        ${this.renderGarmentStatus(stats)}
                    </div>

                    <!-- Actividad reciente -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Actividad Reciente</h3>
                            <p class="card-subtitle">Últimas operaciones realizadas</p>
                        </div>
                        ${this.renderRecentActivity(recentActivity)}
                    </div>
                </div>

                <!-- Panel derecho -->
                <div>
                    <!-- Acciones rápidas -->
                    <div class="card mb-2">
                        <div class="card-header">
                            <h3 class="card-title">Acciones Rápidas</h3>
                            <p class="card-subtitle">Operaciones frecuentes</p>
                        </div>
                        ${this.renderQuickActions()}
                    </div>

                    <!-- Información del sistema -->
                    <div class="card mb-2">
                        <div class="card-header">
                            <h3 class="card-title">Estado del Sistema</h3>
                            <p class="card-subtitle">Información técnica</p>
                        </div>
                        ${this.renderSystemInfo()}
                    </div>

                    <!-- Herramientas de administración -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Herramientas de Administración</h3>
                            <p class="card-subtitle">Gestión de datos del sistema</p>
                        </div>
                        ${this.renderAdminTools()}
                    </div>

                    <!-- Clientes más activos -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Clientes Más Activos</h3>
                            <p class="card-subtitle">Top 5 por servicios</p>
                        </div>
                        ${this.renderTopClients()}
                    </div>
                </div>
            </div>
            </div>
        `;
    }

    static renderAlerts(alerts) {
        return `
            <div class="alerts-container mb-3">
                ${alerts.map(alert => `
                    <div class="alert alert-${alert.type}">
                        <strong>${alert.icon} ${alert.title}:</strong> ${alert.message}
                        ${alert.action ? `<button class="btn btn-sm btn-${alert.type}" onclick="${alert.action.onclick}" style="margin-left: 10px;">${alert.action.text}</button>` : ''}
                    </div>
                `).join('')}
            </div>
        `;
    }

    static renderGarmentStatus(stats) {
        const total = stats.totalGarments;
        
        return `
            <div class="status-bars">
                <div class="status-item">
                    <div class="status-info">
                        <span>Recibidas</span>
                        <span class="badge badge-secondary">${stats.garmentsReceived}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${total > 0 ? (stats.garmentsReceived / total) * 100 : 0}%; background-color: #e2e8f0;"></div>
                    </div>
                </div>
                <div class="status-item">
                    <div class="status-info">
                        <span>En Proceso</span>
                        <span class="badge badge-warning">${stats.garmentsInProcess}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${total > 0 ? (stats.garmentsInProcess / total) * 100 : 0}%; background-color: #ed8936;"></div>
                    </div>
                </div>
                <div class="status-item">
                    <div class="status-info">
                        <span>Listas</span>
                        <span class="badge badge-success">${stats.garmentsReady}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${total > 0 ? (stats.garmentsReady / total) * 100 : 0}%; background-color: #48bb78;"></div>
                    </div>
                </div>
                <div class="status-item">
                    <div class="status-info">
                        <span>Entregadas</span>
                        <span class="badge badge-info">${stats.garmentsDelivered}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${total > 0 ? (stats.garmentsDelivered / total) * 100 : 0}%; background-color: #4299e1;"></div>
                    </div>
                </div>
            </div>
        `;
    }

    static renderRecentActivity(activities) {
        if (activities.length === 0) {
            return `<div class="text-center p-2 text-muted">No hay actividad reciente</div>`;
        }

        return `
            <div class="activity-list">
                ${activities.slice(0, 5).map(activity => `
                    <div class="activity-item">
                        <div class="activity-icon">${activity.icon}</div>
                        <div class="activity-content">
                            <div class="activity-title">${activity.title}</div>
                            <div class="activity-subtitle">${activity.subtitle}</div>
                            <div class="activity-time">${this.formatTimeAgo(activity.timestamp)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="text-center mt-2">
                <button class="btn btn-secondary btn-sm" onclick="Navigation.loadPage('history')">
                    Ver todo el historial
                </button>
            </div>
        `;
    }

    static renderQuickActions() {
        return `
            <div class="quick-actions">
                <button class="btn btn-primary btn-block mb-1" onclick="Navigation.loadPage('reception')">
                    📥 Recibir Prendas
                </button>
                <button class="btn btn-success btn-block mb-1" onclick="Navigation.loadPage('delivery')">
                    📤 Entregar Prendas
                </button>
                <button class="btn btn-info btn-block mb-1" onclick="Navigation.loadPage('clients')">
                    👥 Gestionar Clientes
                </button>
                <button class="btn btn-warning btn-block mb-1" onclick="Dashboard.openScanner()">
                    🔍 Escanear RFID
                </button>
            </div>
        `;
    }

    static renderSystemInfo() {
        const now = new Date();
        const stats = Storage.getStats();
        const authStats = window.app?.auth?.getAuthStats() || { currentUser: 'Sistema', sessionTime: 'Activa' };
        const dataIntegrity = Storage.verifyDataIntegrity();

        return `
            <div class="system-info">
                <div class="info-item">
                    <span class="info-label">Fecha y Hora:</span>
                    <span class="info-value">${this.formatDateTime(now)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Total de Registros:</span>
                    <span class="info-value">${stats.totalClients + stats.totalGarments}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Sesiones Hoy:</span>
                    <span class="info-value">${authStats.todayLogins || 0}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Estado de Datos:</span>
                    <span class="info-value ${dataIntegrity.length === 0 ? 'text-success' : 'text-warning'}">
                        ${dataIntegrity.length === 0 ? '✅ Íntegros' : '⚠️ Revisar'}
                    </span>
                </div>
                <div class="info-item">
                    <span class="info-label">Espacio Usado:</span>
                    <span class="info-value">${this.getStorageUsage()}</span>
                </div>
            </div>
        `;
    }

    static renderAdminTools() {
        return `
            <div class="admin-tools">
                <div class="tool-buttons">
                    <button class="btn btn-info btn-sm" onclick="Dashboard.exportBackup()">
                        💾 Exportar Backup
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="Dashboard.importBackup()">
                        📥 Importar Backup
                    </button>
                    <button class="btn btn-secondary btn-sm" onclick="Dashboard.verifyIntegrity()">
                        🔍 Verificar Integridad
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="Dashboard.clearData()">
                        🗑️ Limpiar Datos
                    </button>
                    <button class="btn btn-info btn-sm" onclick="Dashboard.debugStorage()">
                        🔍 Debug Storage
                    </button>
                </div>
                <div class="tool-info">
                    <small class="text-muted">
                        💡 Los backups incluyen todos los datos del sistema. 
                        La verificación de integridad corrige automáticamente problemas detectados.
                    </small>
                </div>
            </div>
        `;
    }

    static renderTopClients() {
        const clients = Storage.getClients()
            .sort((a, b) => (b.totalServices || 0) - (a.totalServices || 0))
            .slice(0, 5);

        if (clients.length === 0) {
            return `<div class="text-center p-2 text-muted">No hay clientes registrados</div>`;
        }

        return `
            <div class="top-clients">
                ${clients.map((client, index) => `
                    <div class="client-item">
                        <div class="client-rank">#${index + 1}</div>
                        <div class="client-info">
                            <div class="client-name">${client.name}</div>
                            <div class="client-services">${client.totalServices || 0} servicios</div>
                        </div>
                        <div class="client-action">
                            <button class="btn btn-sm btn-secondary" onclick="Dashboard.viewClient(${client.id})">
                                Ver
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    static getAlerts() {
        const alerts = [];
        const garments = Storage.getGarments();
        const settings = Storage.getSettings();
        const maxDaysInProcess = settings.maxDaysInProcess || 7;
        
        // Alertas de prendas demoradas
        const delayedGarments = garments.filter(garment => {
            if (garment.status === 'en_proceso' && garment.receivedAt) {
                const receivedDate = new Date(garment.receivedAt);
                const daysDiff = (new Date() - receivedDate) / (1000 * 60 * 60 * 24);
                return daysDiff > maxDaysInProcess;
            }
            return false;
        });

        if (delayedGarments.length > 0) {
            alerts.push({
                type: 'warning',
                icon: '⏰',
                title: 'Prendas Demoradas',
                message: `${delayedGarments.length} prenda(s) llevan más de ${maxDaysInProcess} días en proceso`,
                action: {
                    text: 'Revisar',
                    onclick: 'Dashboard.showDelayedGarments()'
                }
            });
        }

        // Alertas de integridad de datos
        const dataIssues = Storage.verifyDataIntegrity();
        if (dataIssues.length > 0) {
            alerts.push({
                type: 'danger',
                icon: '⚠️',
                title: 'Problemas de Integridad',
                message: `Se encontraron ${dataIssues.length} problema(s) en los datos`,
                action: {
                    text: 'Detalles',
                    onclick: 'Dashboard.showDataIssues()'
                }
            });
        }

        // Alerta de espacio de almacenamiento
        const storageUsage = this.getStorageUsagePercent();
        if (storageUsage > 80) {
            alerts.push({
                type: 'info',
                icon: '💾',
                title: 'Espacio de Almacenamiento',
                message: `El almacenamiento local está al ${storageUsage}% de capacidad`,
                action: {
                    text: 'Limpiar',
                    onclick: 'Dashboard.cleanupStorage()'
                }
            });
        }

        return alerts;
    }

    static getRecentActivity() {
        const history = Storage.getHistory();
        return history.slice(0, 10).map(entry => ({
            icon: this.getActivityIcon(entry.action),
            title: this.getActivityTitle(entry),
            subtitle: entry.details,
            timestamp: entry.timestamp
        }));
    }

    static getActivityIcon(action) {
        const icons = {
            'recepcion': '📥',
            'entrega': '📤',
            'proceso': '⚙️',
            'cliente': '👤',
            'guia': '📄'
        };
        return icons[action] || '📋';
    }

    static getActivityTitle(entry) {
        const client = Storage.getClientById(entry.clientId);
        const clientName = client ? client.name : 'Cliente no encontrado';
        
        const titles = {
            'recepcion': `Recepción de prendas - ${clientName}`,
            'entrega': `Entrega de prendas - ${clientName}`,
            'proceso': `Actualización de estado - ${clientName}`,
            'cliente': `Gestión de cliente - ${clientName}`,
            'guia': `Generación de guía - ${clientName}`
        };
        
        return titles[entry.action] || `Actividad - ${clientName}`;
    }

    static formatTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Hace un momento';
        if (diffMins < 60) return `Hace ${diffMins} minuto(s)`;
        if (diffHours < 24) return `Hace ${diffHours} hora(s)`;
        if (diffDays < 7) return `Hace ${diffDays} día(s)`;
        return time.toLocaleDateString();
    }

    static getQuickActions() {
        return [
            {
                title: 'Nueva Recepción',
                description: 'Recibir nuevas prendas',
                icon: '📥',
                action: 'openScanner',
                color: '#48bb78'
            },
            {
                title: 'Ver Clientes',
                description: 'Gestionar información de clientes',
                icon: '👥',
                action: 'viewClients', 
                color: '#4299e1'
            },
            {
                title: 'Control Interno',
                description: 'Actualizar estado de prendas',
                icon: '📋',
                action: 'openControl',
                color: '#ed8936'
            },
            {
                title: 'Entrega',
                description: 'Procesar entrega de prendas',
                icon: '📤',
                action: 'openDelivery',
                color: '#9f7aea'
            }
        ];
    }

    static formatDateTime(date) {
        return date.toLocaleString('es-ES', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    static getStorageUsage() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length;
            }
        }
        
        if (total < 1024) return `${total} bytes`;
        if (total < 1024 * 1024) return `${(total / 1024).toFixed(1)} KB`;
        return `${(total / (1024 * 1024)).toFixed(1)} MB`;
    }

    static getStorageUsagePercent() {
        // Estimación básica - localStorage típicamente tiene límite de 5-10MB
        const currentSize = JSON.stringify(localStorage).length;
        const estimatedLimit = 5 * 1024 * 1024; // 5MB
        return Math.round((currentSize / estimatedLimit) * 100);
    }

    // Métodos de interacción
    static openScanner() {
        const rfidCode = prompt('Ingrese el código RFID para buscar:');
        if (rfidCode) {
            const garment = Storage.getGarmentByRfid(rfidCode.trim().toUpperCase());
            if (garment) {
                const client = Storage.getClientById(garment.clientId);
                app.showModal('Prenda Encontrada', `
                    <div class="garment-info">
                        <h4>📷 Código RFID: ${garment.rfidCode}</h4>
                        <p><strong>Cliente:</strong> ${client ? client.name : 'No encontrado'}</p>
                        <p><strong>Tipo:</strong> ${garment.type}</p>
                        <p><strong>Color:</strong> ${garment.color}</p>
                        <p><strong>Estado:</strong> <span class="badge badge-${this.getStatusClass(garment.status)}">${this.getStatusText(garment.status)}</span></p>
                        <p><strong>Recibida:</strong> ${this.formatDateTime(new Date(garment.receivedAt))}</p>
                        ${garment.notes ? `<p><strong>Notas:</strong> ${garment.notes}</p>` : ''}
                    </div>
                    <div class="mt-2">
                        <button class="btn btn-primary" onclick="Navigation.loadPage('control'); app.closeModal('dynamic-modal');">Ver en Control</button>
                    </div>
                `);
            } else {
                app.showErrorMessage(`No se encontró ninguna prenda con el código RFID: ${rfidCode}`);
            }
        }
    }

    static viewClients() {
        Navigation.loadPage('clients');
    }

    static openControl() {
        Navigation.loadPage('control');
    }

    static openDelivery() {
        Navigation.loadPage('delivery');
    }

    static viewClient(clientId) {
        Navigation.navigateTo('clients', { selectedClient: clientId });
    }

    static showDelayedGarments() {
        const garments = Storage.getGarments();
        const settings = Storage.getSettings();
        const maxDays = settings.maxDaysInProcess || 7;
        
        const delayed = garments.filter(garment => {
            if (garment.status === 'en_proceso' && garment.receivedAt) {
                const days = (new Date() - new Date(garment.receivedAt)) / (1000 * 60 * 60 * 24);
                return days > maxDays;
            }
            return false;
        });

        const content = `
            <div class="delayed-garments">
                <p>Prendas que llevan más de ${maxDays} días en proceso:</p>
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>RFID</th>
                                <th>Cliente</th>
                                <th>Tipo</th>
                                <th>Días</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${delayed.map(garment => {
                                const client = Storage.getClientById(garment.clientId);
                                const days = Math.floor((new Date() - new Date(garment.receivedAt)) / (1000 * 60 * 60 * 24));
                                return `
                                    <tr>
                                        <td>${garment.rfidCode}</td>
                                        <td>${client ? client.name : 'N/A'}</td>
                                        <td>${garment.type}</td>
                                        <td class="text-warning">${days} días</td>
                                        <td>
                                            <button class="btn btn-sm btn-primary" onclick="Dashboard.prioritizeGarment(${garment.id})">
                                                Priorizar
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        app.showModal('Prendas Demoradas', content);
    }

    static showDataIssues() {
        const issues = Storage.verifyDataIntegrity();
        const content = `
            <div class="data-issues">
                <p>Problemas detectados en los datos:</p>
                <ul>
                    ${issues.map(issue => `<li class="text-warning">⚠️ ${issue}</li>`).join('')}
                </ul>
                <div class="mt-2">
                    <button class="btn btn-danger" onclick="Dashboard.fixDataIssues()">
                        Intentar Reparar
                    </button>
                </div>
            </div>
        `;
        
        app.showModal('Problemas de Integridad', content);
    }

    static prioritizeGarment(garmentId) {
        const garment = Storage.getGarmentById(garmentId);
        if (garment) {
            Storage.updateGarment(garmentId, { priority: 'alta', prioritizedAt: new Date().toISOString() });
            app.showSuccessMessage(`Prenda ${garment.rfidCode} marcada como prioridad alta`);
            app.closeModal('dynamic-modal');
            this.refresh();
        }
    }

    static fixDataIssues() {
        // Implementar lógica básica de reparación
        app.showWarningMessage('Función de reparación automática en desarrollo');
        app.closeModal('dynamic-modal');
    }

    static cleanupStorage() {
        if (confirm('¿Está seguro que desea limpiar el almacenamiento? Esto eliminará datos antiguos.')) {
            // Limpiar historial antiguo (mantener solo últimos 100 registros)
            const history = Storage.getHistory().slice(0, 100);
            Storage.setData(Storage.KEYS.HISTORY, history);
            
            app.showSuccessMessage('Almacenamiento limpiado correctamente');
            this.refresh();
        }
    }

    static getStatusClass(status) {
        const classes = {
            'recibido': 'secondary',
            'en_proceso': 'warning',
            'listo': 'success',
            'entregado': 'info'
        };
        return classes[status] || 'secondary';
    }

    static getStatusText(status) {
        const texts = {
            'recibido': 'Recibido',
            'en_proceso': 'En Proceso',
            'listo': 'Listo',
            'entregado': 'Entregado'
        };
        return texts[status] || status;
    }

    static refresh() {
        Navigation.loadPage('dashboard');
    }

    static init() {
        // Configurar actualización automática cada 30 segundos
        setInterval(() => {
            if (Navigation.getCurrentPage() === 'dashboard') {
                this.refresh();
            }
        }, 30000);

        // Añadir estilos específicos del dashboard
        this.addDashboardStyles();
        
        // Añadir efectos interactivos
        this.addInteractiveEffects();
        
        // Configurar auto-refresh de estadísticas
        this.setupAutoRefresh();
    }

    static addInteractiveEffects() {
        // Añadir efectos de hover a las tarjetas de estadísticas
        setTimeout(() => {
            const statCards = document.querySelectorAll('.card.text-center');
            statCards.forEach((card, index) => {
                card.addEventListener('mouseenter', () => {
                    card.style.transform = 'translateY(-8px) scale(1.05)';
                    card.style.boxShadow = '0 15px 35px rgba(0,0,0,0.2)';
                });
                
                card.addEventListener('mouseleave', () => {
                    card.style.transform = 'translateY(0) scale(1)';
                    card.style.boxShadow = '0 2px 10px rgba(0,0,0,0.08)';
                });
            });
        }, 100);
    }

    static setupAutoRefresh() {
        // Actualizar estadísticas cada 10 segundos si el dashboard está visible
        setInterval(() => {
            if (Navigation.getCurrentPage() === 'dashboard') {
                const statValues = document.querySelectorAll('.card.text-center h3');
                statValues.forEach(value => {
                    value.style.transition = 'all 0.3s ease';
                    value.style.transform = 'scale(1.1)';
                    setTimeout(() => {
                        value.style.transform = 'scale(1)';
                    }, 150);
                });
            }
        }, 10000);
    }

    static addDashboardStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .status-bars .status-item {
                margin-bottom: 15px;
            }
            .status-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
            }
            .progress-bar {
                height: 8px;
                background-color: #e2e8f0;
                border-radius: 4px;
                overflow: hidden;
            }
            .progress-fill {
                height: 100%;
                transition: width 0.3s ease;
            }
            .activity-list .activity-item {
                display: flex;
                padding: 12px 0;
                border-bottom: 1px solid #e2e8f0;
            }
            .activity-item:last-child {
                border-bottom: none;
            }
            .activity-icon {
                font-size: 24px;
                margin-right: 15px;
            }
            .activity-content {
                flex: 1;
            }
            .activity-title {
                font-weight: 500;
                color: #2d3748;
            }
            .activity-subtitle {
                font-size: 14px;
                color: #718096;
                margin: 2px 0;
            }
            .activity-time {
                font-size: 12px;
                color: #a0aec0;
            }
            .system-info .info-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #f1f5f9;
            }
            .info-item:last-child {
                border-bottom: none;
            }
            .info-label {
                font-weight: 500;
                color: #4a5568;
            }
            .info-value {
                color: #2d3748;
            }
            .top-clients .client-item {
                display: flex;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid #e2e8f0;
            }
            .client-item:last-child {
                border-bottom: none;
            }
            .client-rank {
                font-weight: bold;
                color: #667eea;
                margin-right: 15px;
                width: 30px;
            }
            .client-info {
                flex: 1;
            }
            .client-name {
                font-weight: 500;
                color: #2d3748;
            }
            .client-services {
                font-size: 14px;
                color: #718096;
            }
            .quick-actions .btn-block {
                margin-bottom: 8px;
            }
            .admin-tools {
                padding: 15px;
            }
            .tool-buttons {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 8px;
                margin-bottom: 15px;
            }
            .tool-info {
                padding: 10px;
                background: #f7fafc;
                border-radius: 6px;
                border-left: 4px solid #4299e1;
            }
        `;
        
        if (!document.querySelector('#dashboard-styles')) {
            style.id = 'dashboard-styles';
            document.head.appendChild(style);
        }
    }

    // Métodos de administración
    static exportBackup() {
        try {
            Storage.exportAllData();
            app.showSuccessMessage('Backup exportado correctamente');
        } catch (error) {
            console.error('Error exportando backup:', error);
            app.showErrorMessage('Error exportando backup');
        }
    }

    static importBackup() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        if (Storage.importData(data)) {
                            app.showSuccessMessage('Backup importado correctamente');
                            // Recargar la página para mostrar los nuevos datos
                            setTimeout(() => location.reload(), 1000);
                        } else {
                            app.showErrorMessage('Error importando backup');
                        }
                    } catch (error) {
                        console.error('Error procesando archivo:', error);
                        app.showErrorMessage('Archivo de backup inválido');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    static verifyIntegrity() {
        try {
            const issues = Storage.verifyDataIntegrity();
            if (issues.length > 0) {
                console.warn('Problemas detectados:', issues);
                Storage.fixCounters();
                app.showSuccessMessage(`Integridad verificada. ${issues.length} problema(s) corregido(s)`);
            } else {
                app.showSuccessMessage('Integridad de datos verificada correctamente');
            }
            // Recargar dashboard para mostrar estado actualizado
            Navigation.loadPage('dashboard');
        } catch (error) {
            console.error('Error verificando integridad:', error);
            app.showErrorMessage('Error verificando integridad');
        }
    }

    static debugStorage() {
        Storage.debugStorageState();
        app.showSuccessMessage('Estado del storage mostrado en consola');
    }

    static clearData() {
        if (confirm('⚠️ ADVERTENCIA: Esta acción eliminará TODOS los datos del sistema.\n\n¿Está completamente seguro?')) {
            if (confirm('Esta acción NO se puede deshacer. ¿Continuar?')) {
                if (Storage.clearTestData()) {
                    app.showSuccessMessage('Datos limpiados correctamente');
                    // Recargar la página
                    setTimeout(() => location.reload(), 1000);
                }
            }
        }
    }
}

// Exponer la clase globalmente
window.Dashboard = Dashboard;
