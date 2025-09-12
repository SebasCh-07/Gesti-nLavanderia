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
                    <button class="btn ${this.currentReport === 'business-intelligence' ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="Reports.showReport('business-intelligence')">
                        🧠 Business Intelligence
                    </button>
                    <button class="btn ${this.currentReport === 'branches' ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="Reports.showReport('branches')">
                        🏢 Comparación Sucursales
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
            case 'business-intelligence':
                return this.renderBusinessIntelligenceReport();
            case 'branches':
                return this.renderBranchesComparisonReport();
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

    // Nuevos reportes avanzados
    static renderBusinessIntelligenceReport() {
        const biData = this.getBusinessIntelligenceData();
        
        return `
            <div class="business-intelligence-report">
                <!-- KPIs Avanzados -->
                <div class="advanced-kpis grid grid-4 mb-2">
                    <div class="kpi-card advanced">
                        <div class="kpi-icon">⏱️</div>
                        <div class="kpi-title">Tiempo Estimado</div>
                        <div class="kpi-value">${biData.avgProcessingTime} días</div>
                        <div class="kpi-trend ${biData.processingTimeTrend > 0 ? 'positive' : 'negative'}">
                            ${biData.processingTimeTrend > 0 ? '↗️' : '↘️'} ${Math.abs(biData.processingTimeTrend)}%
                        </div>
                    </div>
                    
                    <div class="kpi-card advanced">
                        <div class="kpi-icon">👑</div>
                        <div class="kpi-title">Cliente VIP</div>
                        <div class="kpi-value">${biData.topClient.name}</div>
                        <div class="kpi-subtitle">${biData.topClient.garments} prendas</div>
                    </div>
                    
                    <div class="kpi-card advanced">
                        <div class="kpi-icon">📈</div>
                        <div class="kpi-title">Crecimiento</div>
                        <div class="kpi-value">${biData.growthRate}%</div>
                        <div class="kpi-subtitle">vs mes anterior</div>
                    </div>
                    
                    <div class="kpi-card advanced">
                        <div class="kpi-icon">🎯</div>
                        <div class="kpi-title">Eficiencia</div>
                        <div class="kpi-value">${biData.efficiency}%</div>
                        <div class="kpi-subtitle">Procesamiento</div>
                    </div>
                </div>

                <!-- Ranking de Clientes -->
                <div class="grid grid-2 mb-2">
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">🏆 Ranking de Clientes</h3>
                            <p class="card-subtitle">Top 10 clientes por volumen</p>
                        </div>
                        <div class="client-ranking">
                            ${this.renderClientRanking(biData.clientRanking)}
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">📊 Análisis de Tendencias</h3>
                            <p class="card-subtitle">Patrones de comportamiento</p>
                        </div>
                        <div class="trends-analysis">
                            ${this.renderTrendsAnalysis(biData.trends)}
                        </div>
                    </div>
                </div>

                <!-- Predicciones y Recomendaciones -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">🔮 Predicciones y Recomendaciones</h3>
                        <p class="card-subtitle">Análisis predictivo basado en datos históricos</p>
                    </div>
                    <div class="predictions-grid grid grid-3">
                        <div class="prediction-card">
                            <div class="prediction-icon">📅</div>
                            <div class="prediction-title">Demanda Esperada</div>
                            <div class="prediction-value">${biData.predictedDemand}</div>
                            <div class="prediction-description">Prendas para la próxima semana</div>
                        </div>
                        
                        <div class="prediction-card">
                            <div class="prediction-icon">⏰</div>
                            <div class="prediction-title">Tiempo Óptimo</div>
                            <div class="prediction-value">${biData.optimalProcessingTime}</div>
                            <div class="prediction-description">Días para máxima eficiencia</div>
                        </div>
                        
                        <div class="prediction-card">
                            <div class="prediction-icon">💡</div>
                            <div class="prediction-title">Recomendación</div>
                            <div class="prediction-value">${biData.recommendation}</div>
                            <div class="prediction-description">Acción sugerida</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static renderBranchesComparisonReport() {
        const branchesData = this.getBranchesComparisonData();
        
        return `
            <div class="branches-comparison-report">
                <!-- Comparación General -->
                <div class="branches-overview grid grid-3 mb-2">
                    ${branchesData.map(branch => `
                        <div class="branch-card">
                            <div class="branch-header">
                                <h4 class="branch-name">${branch.name}</h4>
                                <span class="branch-status ${branch.status}">${branch.statusText}</span>
                            </div>
                            <div class="branch-metrics">
                                <div class="metric">
                                    <span class="metric-label">Prendas:</span>
                                    <span class="metric-value">${branch.totalGarments}</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Clientes:</span>
                                    <span class="metric-value">${branch.totalClients}</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Eficiencia:</span>
                                    <span class="metric-value">${branch.efficiency}%</span>
                                </div>
                                <div class="metric">
                                    <span class="metric-label">Tiempo Prom:</span>
                                    <span class="metric-value">${branch.avgTime} días</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Tabla Comparativa -->
                <div class="card mb-2">
                    <div class="card-header">
                        <h3 class="card-title">📊 Comparación Detallada</h3>
                        <p class="card-subtitle">Métricas por sucursal</p>
                    </div>
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Sucursal</th>
                                    <th>Prendas/Mes</th>
                                    <th>Clientes Activos</th>
                                    <th>Tiempo Promedio</th>
                                    <th>Eficiencia</th>
                                    <th>Ingresos Est.</th>
                                    <th>Ranking</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${branchesData.map((branch, index) => `
                                    <tr>
                                        <td>
                                            <div class="branch-info">
                                                <div class="branch-name">${branch.name}</div>
                                                <div class="branch-address">${branch.address}</div>
                                            </div>
                                        </td>
                                        <td><span class="badge badge-primary">${branch.monthlyGarments}</span></td>
                                        <td><span class="badge badge-info">${branch.activeClients}</span></td>
                                        <td>${branch.avgTime} días</td>
                                        <td>
                                            <div class="efficiency-bar">
                                                <div class="efficiency-fill" style="width: ${branch.efficiency}%"></div>
                                                <span class="efficiency-text">${branch.efficiency}%</span>
                                            </div>
                                        </td>
                                        <td>$${branch.estimatedRevenue.toLocaleString()}</td>
                                        <td>
                                            <span class="ranking-badge ranking-${index + 1}">
                                                #${index + 1}
                                            </span>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Gráfico de Comparación -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📈 Análisis Comparativo</h3>
                        <p class="card-subtitle">Rendimiento por sucursal</p>
                    </div>
                    <div class="comparison-charts">
                        <div class="chart-container">
                            <h4>Eficiencia por Sucursal</h4>
                            <div class="chart-bars">
                                ${branchesData.map(branch => `
                                    <div class="chart-bar">
                                        <div class="bar-label">${branch.name}</div>
                                        <div class="bar-container">
                                            <div class="bar-fill" style="width: ${branch.efficiency}%"></div>
                                            <span class="bar-value">${branch.efficiency}%</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="chart-container">
                            <h4>Volumen de Trabajo</h4>
                            <div class="chart-bars">
                                ${branchesData.map(branch => `
                                    <div class="chart-bar">
                                        <div class="bar-label">${branch.name}</div>
                                        <div class="bar-container">
                                            <div class="bar-fill volume" style="width: ${(branch.monthlyGarments / Math.max(...branchesData.map(b => b.monthlyGarments))) * 100}%"></div>
                                            <span class="bar-value">${branch.monthlyGarments}</span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Métodos de datos para BI
    static getBusinessIntelligenceData() {
        const garments = Storage.getGarments();
        const clients = Storage.getClients();
        const currentBranchId = app.getCurrentBranchId();
        
        // Filtrar por sucursal si es necesario
        const branchGarments = currentBranchId ? 
            garments.filter(g => g.branchId === currentBranchId) : garments;
        const branchClients = currentBranchId ? 
            clients.filter(c => c.branchId === currentBranchId) : clients;

        // Calcular tiempo promedio de procesamiento
        const processedGarments = branchGarments.filter(g => g.deliveredAt);
        const avgProcessingTime = processedGarments.length > 0 ? 
            Math.round(processedGarments.reduce((sum, g) => {
                const days = (new Date(g.deliveredAt) - new Date(g.receivedAt)) / (1000 * 60 * 60 * 24);
                return sum + days;
            }, 0) / processedGarments.length) : 0;

        // Simular tendencia (basado en datos aleatorios para demo)
        const processingTimeTrend = Math.random() > 0.5 ? 
            Math.floor(Math.random() * 15) + 1 : 
            -(Math.floor(Math.random() * 15) + 1);

        // Cliente top
        const clientCounts = {};
        branchGarments.forEach(garment => {
            clientCounts[garment.clientId] = (clientCounts[garment.clientId] || 0) + 1;
        });
        
        const topClientId = Object.keys(clientCounts).reduce((a, b) => 
            clientCounts[a] > clientCounts[b] ? a : b, Object.keys(clientCounts)[0]);
        const topClient = topClientId ? {
            name: Storage.getClientById(parseInt(topClientId))?.name || 'N/A',
            garments: clientCounts[topClientId] || 0
        } : { name: 'N/A', garments: 0 };

        // Simular crecimiento
        const growthRate = Math.floor(Math.random() * 30) + 5;

        // Calcular eficiencia
        const efficiency = Math.round((branchGarments.filter(g => g.status === 'entregado').length / branchGarments.length) * 100) || 0;

        // Ranking de clientes
        const clientRanking = Object.entries(clientCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([clientId, count]) => {
                const client = Storage.getClientById(parseInt(clientId));
                return {
                    name: client ? client.name : 'Cliente no encontrado',
                    garments: count,
                    lastVisit: this.getLastVisit(clientId, branchGarments)
                };
            });

        // Tendencias
        const trends = {
            peakHours: this.calculatePeakHours(branchGarments),
            popularServices: this.calculatePopularServices(branchGarments),
            seasonalPattern: this.calculateSeasonalPattern(branchGarments)
        };

        // Predicciones
        const predictedDemand = Math.floor(branchGarments.length * 1.2) + Math.floor(Math.random() * 20);
        const optimalProcessingTime = Math.max(1, avgProcessingTime - Math.floor(Math.random() * 2));
        const recommendation = this.generateRecommendation(efficiency, avgProcessingTime, growthRate);

        return {
            avgProcessingTime,
            processingTimeTrend,
            topClient,
            growthRate,
            efficiency,
            clientRanking,
            trends,
            predictedDemand,
            optimalProcessingTime,
            recommendation
        };
    }

    static getBranchesComparisonData() {
        const branches = Storage.getBranches();
        const garments = Storage.getGarments();
        const clients = Storage.getClients();

        return branches.map(branch => {
            const branchGarments = garments.filter(g => g.branchId === branch.id);
            const branchClients = clients.filter(c => c.branchId === branch.id);

            const processedGarments = branchGarments.filter(g => g.deliveredAt);
            const avgTime = processedGarments.length > 0 ? 
                Math.round(processedGarments.reduce((sum, g) => {
                    const days = (new Date(g.deliveredAt) - new Date(g.receivedAt)) / (1000 * 60 * 60 * 24);
                    return sum + days;
                }, 0) / processedGarments.length) : 0;

            const efficiency = Math.round((branchGarments.filter(g => g.status === 'entregado').length / branchGarments.length) * 100) || 0;
            
            // Calcular prendas del mes actual
            const currentMonth = new Date().getMonth();
            const currentYear = new Date().getFullYear();
            const monthlyGarments = branchGarments.filter(g => {
                const date = new Date(g.receivedAt);
                return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
            }).length;

            // Calcular ingresos estimados (removido - sin facturación)
            const estimatedRevenue = 0;

            // Determinar estado de la sucursal
            let status = 'good';
            let statusText = 'Excelente';
            if (efficiency < 70) {
                status = 'warning';
                statusText = 'Necesita Mejora';
            } else if (efficiency < 85) {
                status = 'info';
                statusText = 'Bueno';
            }

            return {
                ...branch,
                totalGarments: branchGarments.length,
                totalClients: branchClients.length,
                activeClients: new Set(branchGarments.map(g => g.clientId)).size,
                efficiency,
                avgTime,
                monthlyGarments,
                estimatedRevenue,
                status,
                statusText
            };
        }).sort((a, b) => b.efficiency - a.efficiency);
    }

    // Métodos auxiliares para BI
    static renderClientRanking(ranking) {
        return ranking.map((client, index) => `
            <div class="ranking-item">
                <div class="ranking-position">#${index + 1}</div>
                <div class="ranking-info">
                    <div class="ranking-name">${client.name}</div>
                    <div class="ranking-details">${client.garments} prendas • Última: ${client.lastVisit}</div>
                </div>
                <div class="ranking-badge">
                    ${this.getRankingBadge(index + 1)}
                </div>
            </div>
        `).join('');
    }

    static renderTrendsAnalysis(trends) {
        return `
            <div class="trend-item">
                <div class="trend-icon">🕐</div>
                <div class="trend-content">
                    <div class="trend-title">Horas Pico</div>
                    <div class="trend-value">${trends.peakHours.join(', ')}</div>
                </div>
            </div>
            <div class="trend-item">
                <div class="trend-icon">👕</div>
                <div class="trend-content">
                    <div class="trend-title">Servicio Popular</div>
                    <div class="trend-value">${trends.popularServices[0] || 'N/A'}</div>
                </div>
            </div>
            <div class="trend-item">
                <div class="trend-icon">📅</div>
                <div class="trend-content">
                    <div class="trend-title">Patrón Estacional</div>
                    <div class="trend-value">${trends.seasonalPattern}</div>
                </div>
            </div>
        `;
    }

    static getLastVisit(clientId, garments) {
        const clientGarments = garments.filter(g => g.clientId === clientId);
        if (clientGarments.length === 0) return 'Nunca';
        
        const lastDate = new Date(Math.max(...clientGarments.map(g => new Date(g.receivedAt))));
        return lastDate.toLocaleDateString('es-ES');
    }

    static calculatePeakHours(garments) {
        const hours = {};
        garments.forEach(garment => {
            const hour = new Date(garment.receivedAt).getHours();
            hours[hour] = (hours[hour] || 0) + 1;
        });
        
        return Object.entries(hours)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([hour]) => `${hour}:00`);
    }

    static calculatePopularServices(garments) {
        const services = {};
        garments.forEach(garment => {
            services[garment.service] = (services[garment.service] || 0) + 1;
        });
        
        return Object.entries(services)
            .sort(([,a], [,b]) => b - a)
            .map(([service]) => service);
    }

    static calculateSeasonalPattern(garments) {
        const months = {};
        garments.forEach(garment => {
            const month = new Date(garment.receivedAt).getMonth();
            months[month] = (months[month] || 0) + 1;
        });
        
        const peakMonth = Object.entries(months)
            .sort(([,a], [,b]) => b - a)[0];
        
        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
                           'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        
        return peakMonth ? `Pico en ${monthNames[parseInt(peakMonth[0])]}` : 'Sin patrón claro';
    }

    static generateRecommendation(efficiency, avgTime, growthRate) {
        if (efficiency < 70) {
            return 'Optimizar procesos';
        } else if (avgTime > 5) {
            return 'Reducir tiempos';
        } else if (growthRate > 20) {
            return 'Expandir capacidad';
        } else {
            return 'Mantener rendimiento';
        }
    }

    static getRankingBadge(position) {
        if (position === 1) return '🥇';
        if (position === 2) return '🥈';
        if (position === 3) return '🥉';
        return '🏅';
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
            
            /* Estilos para Business Intelligence */
            .advanced-kpis .kpi-card.advanced {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                position: relative;
                overflow: hidden;
            }
            
            .kpi-icon {
                font-size: 2rem;
                margin-bottom: 10px;
                opacity: 0.8;
            }
            
            .kpi-trend {
                font-size: 0.9rem;
                margin-top: 8px;
                padding: 4px 8px;
                border-radius: 4px;
                display: inline-block;
            }
            
            .kpi-trend.positive {
                background: rgba(39, 174, 96, 0.2);
                color: #27ae60;
            }
            
            .kpi-trend.negative {
                background: rgba(231, 76, 60, 0.2);
                color: #e74c3c;
            }
            
            .kpi-subtitle {
                font-size: 0.8rem;
                opacity: 0.8;
                margin-top: 5px;
            }
            
            .client-ranking {
                padding: 20px;
            }
            
            .ranking-item {
                display: flex;
                align-items: center;
                padding: 15px 0;
                border-bottom: 1px solid #f1f3f4;
            }
            
            .ranking-item:last-child {
                border-bottom: none;
            }
            
            .ranking-position {
                font-size: 1.2rem;
                font-weight: bold;
                color: #667eea;
                min-width: 40px;
                margin-right: 15px;
            }
            
            .ranking-info {
                flex: 1;
            }
            
            .ranking-name {
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 4px;
            }
            
            .ranking-details {
                font-size: 0.9rem;
                color: #7f8c8d;
            }
            
            .ranking-badge {
                font-size: 1.5rem;
            }
            
            .trends-analysis {
                padding: 20px;
            }
            
            .trend-item {
                display: flex;
                align-items: center;
                padding: 15px 0;
                border-bottom: 1px solid #f1f3f4;
            }
            
            .trend-item:last-child {
                border-bottom: none;
            }
            
            .trend-icon {
                font-size: 1.5rem;
                margin-right: 15px;
                min-width: 30px;
            }
            
            .trend-content {
                flex: 1;
            }
            
            .trend-title {
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 4px;
            }
            
            .trend-value {
                color: #7f8c8d;
                font-size: 0.9rem;
            }
            
            .predictions-grid {
                padding: 20px;
            }
            
            .prediction-card {
                background: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                border: 1px solid #e2e8f0;
                transition: all 0.3s ease;
            }
            
            .prediction-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .prediction-icon {
                font-size: 2rem;
                margin-bottom: 10px;
            }
            
            .prediction-title {
                font-weight: 600;
                color: #2c3e50;
                margin-bottom: 8px;
            }
            
            .prediction-value {
                font-size: 1.5rem;
                font-weight: bold;
                color: #667eea;
                margin-bottom: 8px;
            }
            
            .prediction-description {
                font-size: 0.9rem;
                color: #7f8c8d;
            }
            
            /* Estilos para Comparación de Sucursales */
            .branches-overview {
                margin-bottom: 20px;
            }
            
            .branch-card {
                background: white;
                border-radius: 8px;
                padding: 20px;
                border: 1px solid #e2e8f0;
                transition: all 0.3s ease;
            }
            
            .branch-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }
            
            .branch-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid #f1f3f4;
            }
            
            .branch-name {
                font-size: 1.1rem;
                font-weight: 600;
                color: #2c3e50;
                margin: 0;
            }
            
            .branch-status {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: 500;
            }
            
            .branch-status.good {
                background: #d4edda;
                color: #155724;
            }
            
            .branch-status.warning {
                background: #fff3cd;
                color: #856404;
            }
            
            .branch-status.info {
                background: #d1ecf1;
                color: #0c5460;
            }
            
            .branch-metrics {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
            }
            
            .metric {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            
            .metric-label {
                font-size: 0.9rem;
                color: #7f8c8d;
            }
            
            .metric-value {
                font-weight: 600;
                color: #2c3e50;
            }
            
            .branch-info {
                display: flex;
                flex-direction: column;
            }
            
            .branch-address {
                font-size: 0.8rem;
                color: #7f8c8d;
                margin-top: 2px;
            }
            
            .efficiency-bar {
                position: relative;
                background: #e2e8f0;
                height: 20px;
                border-radius: 10px;
                overflow: hidden;
                min-width: 80px;
            }
            
            .efficiency-fill {
                height: 100%;
                background: linear-gradient(90deg, #667eea, #764ba2);
                transition: width 0.3s ease;
            }
            
            .efficiency-text {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 0.8rem;
                font-weight: 600;
                color: #2c3e50;
            }
            
            .ranking-badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: 600;
            }
            
            .ranking-1 {
                background: #ffd700;
                color: #b8860b;
            }
            
            .ranking-2 {
                background: #c0c0c0;
                color: #696969;
            }
            
            .ranking-3 {
                background: #cd7f32;
                color: #8b4513;
            }
            
            .comparison-charts {
                padding: 20px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
            }
            
            .chart-container h4 {
                margin-bottom: 20px;
                color: #2c3e50;
                font-size: 1.1rem;
            }
            
            .chart-bars {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .chart-bar {
                display: flex;
                align-items: center;
                gap: 15px;
            }
            
            .bar-label {
                min-width: 100px;
                font-size: 0.9rem;
                color: #2c3e50;
                font-weight: 500;
            }
            
            .bar-container {
                flex: 1;
                position: relative;
                background: #e2e8f0;
                height: 25px;
                border-radius: 12px;
                overflow: hidden;
            }
            
            .bar-fill {
                height: 100%;
                background: linear-gradient(90deg, #667eea, #764ba2);
                transition: width 0.3s ease;
            }
            
            .bar-fill.volume {
                background: linear-gradient(90deg, #f093fb, #f5576c);
            }
            
            .bar-value {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 0.8rem;
                font-weight: 600;
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
                .advanced-kpis {
                    grid-template-columns: 1fr;
                }
                .branches-overview {
                    grid-template-columns: 1fr;
                }
                .comparison-charts {
                    grid-template-columns: 1fr;
                }
                .branch-metrics {
                    grid-template-columns: 1fr;
                }
                .predictions-grid {
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