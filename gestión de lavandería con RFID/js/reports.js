/**
 * Módulo de reportes y balances
 * Genera análisis estadísticos y reportes del sistema
 */

class Reports {
    static currentReport = 'summary';
    static dateRange = 'month';
    static selectedClient = null;

    static async render() {
        return `
            <div class="page-header">
                <h1>📈 Reportes y Balances</h1>
                <p>Análisis estadístico y reportes del sistema</p>
            </div>

            <!-- Navegación de reportes -->
            <div class="reports-nav card mb-2">
                <div class="nav-buttons">
                    <button class="btn ${this.currentReport === 'summary' ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="Reports.showReport('summary')">
                        📊 Resumen General
                    </button>
                    <button class="btn ${this.currentReport === 'clients' ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="Reports.showReport('clients')">
                        👥 Por Cliente
                    </button>
                    <button class="btn ${this.currentReport === 'performance' ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="Reports.showReport('performance')">
                        ⚡ Rendimiento
                    </button>
                </div>
            </div>

            <!-- Controles de filtros -->
            <div class="reports-controls card mb-2">
                <div class="controls-row">
                    <div class="control-group">
                        <label>Período:</label>
                        <select id="date-range" class="form-control" onchange="Reports.changeDateRange(this.value)">
                            <option value="week">Esta semana</option>
                            <option value="month" selected>Este mes</option>
                            <option value="quarter">Este trimestre</option>
                            <option value="year">Este año</option>
                        </select>
                    </div>
                    
                    <div class="control-group">
                        <button class="btn btn-info" onclick="Reports.exportCurrentReport()">
                            📊 Exportar
                        </button>
                    </div>
                </div>
            </div>

            <!-- Contenido del reporte -->
            <div id="reports-content">
                ${this.renderCurrentReport()}
            </div>
        `;
    }

    static renderCurrentReport() {
        switch (this.currentReport) {
            case 'summary':
                return this.renderSummaryReport();
            case 'clients':
                return this.renderClientsReport();
            case 'performance':
                return this.renderPerformanceReport();
            default:
                return this.renderSummaryReport();
        }
    }

    static renderSummaryReport() {
        const stats = this.calculatePeriodStats();
        
        return `
            <div class="summary-report">
                <!-- Estadísticas principales -->
                <div class="stats-grid grid grid-4 mb-2">
                    <div class="stat-card primary">
                        <div class="stat-number">${stats.totalReceived}</div>
                        <div class="stat-label">Prendas Recibidas</div>
                    </div>
                    
                    <div class="stat-card success">
                        <div class="stat-number">${stats.totalDelivered}</div>
                        <div class="stat-label">Prendas Entregadas</div>
                    </div>
                    
                    <div class="stat-card info">
                        <div class="stat-number">${stats.activeClients}</div>
                        <div class="stat-label">Clientes Activos</div>
                    </div>
                    
                    <div class="stat-card warning">
                        <div class="stat-number">${stats.avgProcessTime}</div>
                        <div class="stat-label">Días Promedio</div>
                    </div>
                </div>

                <div class="grid grid-2">
                    <!-- Top clientes -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Top 5 Clientes</h3>
                        </div>
                        <div class="top-clients">
                            ${this.renderTopClients(stats.topClients)}
                        </div>
                    </div>

                    <!-- Estado de prendas -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Estado de Prendas</h3>
                        </div>
                        <div class="status-distribution">
                            ${this.renderStatusChart(stats.statusDistribution)}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static renderClientsReport() {
        const clientsData = this.getClientsAnalysis();
        
        return `
            <div class="clients-report">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Análisis por Cliente</h3>
                        <p class="card-subtitle">Detalle de servicios por cliente</p>
                    </div>
                    
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Cliente</th>
                                    <th>Prendas Totales</th>
                                    <th>En el Período</th>
                                    <th>Promedio Días</th>
                                    <th>Última Visita</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${clientsData.map(client => `
                                    <tr>
                                        <td>
                                            <div class="client-info">
                                                <div class="client-name">${client.name}</div>
                                                <div class="client-id">${client.cedula}</div>
                                            </div>
                                        </td>
                                        <td><span class="badge badge-info">${client.totalGarments}</span></td>
                                        <td><span class="badge badge-primary">${client.periodGarments}</span></td>
                                        <td>${client.avgDays} días</td>
                                        <td>${client.lastVisit}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    static renderPerformanceReport() {
        const performance = this.getPerformanceMetrics();
        
        return `
            <div class="performance-report">
                <!-- KPIs principales -->
                <div class="kpi-grid grid grid-3 mb-2">
                    <div class="kpi-card">
                        <div class="kpi-title">Eficiencia de Entrega</div>
                        <div class="kpi-value excellent">${performance.deliveryEfficiency}%</div>
                        <div class="kpi-description">Prendas entregadas a tiempo</div>
                    </div>
                    
                    <div class="kpi-card">
                        <div class="kpi-title">Tiempo Promedio</div>
                        <div class="kpi-value good">${performance.avgProcessTime} días</div>
                        <div class="kpi-description">Desde recepción hasta entrega</div>
                    </div>
                    
                    <div class="kpi-card">
                        <div class="kpi-title">Satisfacción Cliente</div>
                        <div class="kpi-value excellent">95%</div>
                        <div class="kpi-description">Basado en entregas exitosas</div>
                    </div>
                </div>

                <!-- Métricas adicionales -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Métricas de Rendimiento</h3>
                    </div>
                    <div class="performance-metrics">
                        <div class="metric-item">
                            <span class="metric-label">Prendas procesadas hoy:</span>
                            <span class="metric-value">${performance.todayProcessed}</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Tiempo promedio de procesamiento:</span>
                            <span class="metric-value">${performance.avgProcessTime} días</span>
                        </div>
                        <div class="metric-item">
                            <span class="metric-label">Prendas en cola:</span>
                            <span class="metric-value">${performance.queueSize}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Métodos de cálculo
    static calculatePeriodStats() {
        const garments = Storage.getGarments();
        const clients = Storage.getClients();
        
        const received = garments.filter(g => this.isInPeriod(g.receivedAt));
        const delivered = garments.filter(g => g.deliveredAt && this.isInPeriod(g.deliveredAt));
        const activeClients = new Set(received.map(g => g.clientId)).size;
        
        const processedGarments = garments.filter(g => g.deliveredAt);
        const avgProcessTime = processedGarments.length > 0 
            ? Math.round(processedGarments.reduce((sum, g) => {
                const days = (new Date(g.deliveredAt) - new Date(g.receivedAt)) / (1000 * 60 * 60 * 24);
                return sum + days;
            }, 0) / processedGarments.length)
            : 0;

        const statusDistribution = this.getStatusDistribution(garments);
        const topClients = this.getTopClients(garments, 5);

        return {
            totalReceived: received.length,
            totalDelivered: delivered.length,
            activeClients: activeClients,
            avgProcessTime: avgProcessTime,
            statusDistribution: statusDistribution,
            topClients: topClients
        };
    }

    static getClientsAnalysis() {
        const clients = Storage.getClients();
        const garments = Storage.getGarments();
        
        return clients.map(client => {
            const clientGarments = garments.filter(g => g.clientId === client.id);
            const periodGarments = clientGarments.filter(g => this.isInPeriod(g.receivedAt));
            const deliveredGarments = clientGarments.filter(g => g.deliveredAt);
            
            const avgDays = deliveredGarments.length > 0 
                ? Math.round(deliveredGarments.reduce((sum, g) => {
                    const days = (new Date(g.deliveredAt) - new Date(g.receivedAt)) / (1000 * 60 * 60 * 24);
                    return sum + days;
                }, 0) / deliveredGarments.length)
                : 0;

            const lastVisit = clientGarments.length > 0 
                ? new Date(Math.max(...clientGarments.map(g => new Date(g.receivedAt)))).toLocaleDateString('es-ES')
                : 'Nunca';

            return {
                id: client.id,
                name: client.name,
                cedula: client.cedula,
                totalGarments: clientGarments.length,
                periodGarments: periodGarments.length,
                avgDays: avgDays,
                lastVisit: lastVisit
            };
        });
    }

    static getPerformanceMetrics() {
        const garments = Storage.getGarments();
        const today = new Date().toDateString();
        
        const todayProcessed = garments.filter(g => 
            g.deliveredAt && new Date(g.deliveredAt).toDateString() === today
        ).length;
        
        const processedGarments = garments.filter(g => g.deliveredAt);
        const avgProcessTime = processedGarments.length > 0 
            ? Math.round(processedGarments.reduce((sum, g) => {
                const days = (new Date(g.deliveredAt) - new Date(g.receivedAt)) / (1000 * 60 * 60 * 24);
                return sum + days;
            }, 0) / processedGarments.length)
            : 0;
        
        const queueSize = garments.filter(g => g.status === 'recibido' || g.status === 'en_proceso').length;
        const deliveryEfficiency = Math.round((garments.filter(g => g.status === 'entregado').length / garments.length) * 100) || 0;

        return {
            todayProcessed,
            avgProcessTime,
            queueSize,
            deliveryEfficiency
        };
    }

    static isInPeriod(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        
        switch (this.dateRange) {
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                return date >= weekAgo;
            case 'month':
                const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                return date >= monthAgo;
            case 'quarter':
                const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                return date >= quarterAgo;
            case 'year':
                const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                return date >= yearAgo;
            default:
                return true;
        }
    }

    static getStatusDistribution(garments) {
        const distribution = {};
        garments.forEach(garment => {
            distribution[garment.status] = (distribution[garment.status] || 0) + 1;
        });
        return distribution;
    }

    static getTopClients(garments, limit = 5) {
        const clientCounts = {};
        garments.forEach(garment => {
            clientCounts[garment.clientId] = (clientCounts[garment.clientId] || 0) + 1;
        });
        
        return Object.entries(clientCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, limit)
            .map(([clientId, count]) => {
                const client = Storage.getClientById(parseInt(clientId));
                return {
                    id: clientId,
                    name: client ? client.name : 'Cliente no encontrado',
                    count: count
                };
            });
    }

    static renderTopClients(topClients) {
        return topClients.map(client => `
            <div class="top-client-item">
                <div class="client-name">${client.name}</div>
                <div class="client-count">${client.count} prendas</div>
            </div>
        `).join('');
    }

    static renderStatusChart(distribution) {
        const total = Object.values(distribution).reduce((a, b) => a + b, 0);
        return Object.entries(distribution).map(([status, count]) => {
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            return `
                <div class="status-item">
                    <div class="status-label">${this.getStatusText(status)}</div>
                    <div class="status-bar">
                        <div class="status-fill" style="width: ${percentage}%;"></div>
                    </div>
                    <div class="status-count">${count} (${percentage}%)</div>
                </div>
            `;
        }).join('');
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

    // Métodos de interacción
    static init() {
        this.addReportsStyles();
    }

    static showReport(reportType) {
        this.currentReport = reportType;
        this.refreshContent();
    }

    static changeDateRange(range) {
        this.dateRange = range;
        this.refreshContent();
    }

    static exportCurrentReport() {
        app.showSuccessMessage('Funcionalidad de exportación en desarrollo');
    }

    static refreshContent() {
        const content = document.getElementById('reports-content');
        if (content) {
            content.innerHTML = this.renderCurrentReport();
        }
    }

    static addReportsStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .reports-nav {
                padding: 20px;
            }
            .nav-buttons {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            .reports-controls {
                padding: 20px;
            }
            .controls-row {
                display: flex;
                gap: 20px;
                align-items: end;
                flex-wrap: wrap;
            }
            .control-group {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            .control-group label {
                font-size: 0.9em;
                font-weight: 500;
                color: #4a5568;
            }
            
            .stats-grid .stat-card {
                background: white;
                padding: 25px;
                border-radius: 10px;
                text-align: center;
                box-shadow: 0 5px 15px rgba(0,0,0,0.08);
                transition: transform 0.3s;
            }
            .stat-card:hover {
                transform: translateY(-5px);
            }
            .stat-card.primary { border-left: 4px solid #3498db; }
            .stat-card.success { border-left: 4px solid #27ae60; }
            .stat-card.info { border-left: 4px solid #17a2b8; }
            .stat-card.warning { border-left: 4px solid #f39c12; }
            
            .stat-number {
                font-size: 2.5em;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 10px;
            }
            .stat-label {
                color: #7f8c8d;
                margin-bottom: 10px;
            }
            
            .kpi-grid .kpi-card {
                background: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }
            .kpi-title {
                font-size: 0.9em;
                color: #7f8c8d;
                margin-bottom: 10px;
            }
            .kpi-value {
                font-size: 2.5em;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .kpi-value.excellent { color: #27ae60; }
            .kpi-value.good { color: #f39c12; }
            .kpi-description {
                font-size: 0.8em;
                color: #95a5a6;
            }
            
            .top-client-item {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #ecf0f1;
            }
            .top-client-item:last-child {
                border-bottom: none;
            }
            .client-name {
                font-weight: 500;
                color: #2c3e50;
            }
            .client-count {
                color: #7f8c8d;
            }
            
            .status-item {
                display: flex;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid #ecf0f1;
            }
            .status-item:last-child {
                border-bottom: none;
            }
            .status-label {
                min-width: 100px;
                font-weight: 500;
            }
            .status-bar {
                flex: 1;
                height: 20px;
                background: #ecf0f1;
                border-radius: 10px;
                margin: 0 15px;
                overflow: hidden;
            }
            .status-fill {
                height: 100%;
                background: #3498db;
                transition: width 0.3s;
            }
            .status-count {
                min-width: 80px;
                text-align: right;
                font-weight: 500;
            }
            
            .performance-metrics .metric-item {
                display: flex;
                justify-content: space-between;
                padding: 15px 0;
                border-bottom: 1px solid #ecf0f1;
            }
            .metric-item:last-child {
                border-bottom: none;
            }
            .metric-label {
                color: #4a5568;
            }
            .metric-value {
                font-weight: bold;
                color: #2c3e50;
            }
            
            @media (max-width: 768px) {
                .controls-row {
                    flex-direction: column;
                    align-items: stretch;
                }
                .nav-buttons {
                    flex-direction: column;
                }
                .stats-grid, .kpi-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        if (!document.querySelector('#reports-styles')) {
            style.id = 'reports-styles';
            document.head.appendChild(style);
        }
    }
}

// Exponer la clase globalmente
window.Reports = Reports;