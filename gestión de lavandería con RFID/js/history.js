/**
 * Módulo de historial de servicios
 * Maneja la consulta y visualización del historial completo
 */

class History {
    static currentFilter = 'all';
    static searchQuery = '';
    static dateRange = 'all';
    static selectedClient = null;

    static async render() {
        const params = Navigation.getPageParams('history');
        
        if (params.clientId) {
            this.selectedClient = Storage.getClientById(params.clientId);
            this.currentFilter = 'client';
        }

        return `
            <div class="page-header">
                <h1>📋 Historial de Servicios</h1>
                <p>Registro completo de operaciones del sistema</p>
            </div>

            <!-- Filtros y controles -->
            <div class="history-controls card mb-2">
                <div class="controls-section">
                    <div class="filter-group">
                        <label>Filtrar por:</label>
                        <select id="history-filter" class="form-control" onchange="History.changeFilter(this.value)">
                            <option value="all">Todas las actividades</option>
                            <option value="recepcion">Recepciones</option>
                            <option value="entrega">Entregas</option>
                            <option value="proceso">Cambios de estado</option>
                            <option value="cliente">Gestión de clientes</option>
                        </select>
                    </div>
                    
                    <div class="filter-group">
                        <label>Período:</label>
                        <select id="date-range" class="form-control" onchange="History.changeDateRange(this.value)">
                            <option value="all">Todo el tiempo</option>
                            <option value="today">Hoy</option>
                            <option value="week">Esta semana</option>
                            <option value="month">Este mes</option>
                            <option value="custom">Personalizado</option>
                        </select>
                    </div>
                    
                    <div class="search-group">
                        <input type="text" 
                               id="history-search" 
                               class="form-control" 
                               placeholder="Buscar en historial..."
                               value="${this.searchQuery}"
                               onkeyup="History.search(this.value)">
                    </div>
                    
                    <div class="action-group">
                        <button class="btn btn-info" onclick="History.exportHistory()">
                            📊 Exportar
                        </button>
                        <button class="btn btn-secondary" onclick="History.clearFilters()">
                            🗑️ Limpiar Filtros
                        </button>
                    </div>
                </div>
            </div>

            <!-- Contenido principal -->
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">
                        ${this.selectedClient ? `Historial de ${this.selectedClient.name}` : 'Historial Completo'}
                    </h3>
                    <p class="card-subtitle">${this.getHistoryCount()} entradas encontradas</p>
                </div>

                <div class="history-content">
                    ${this.renderHistoryList()}
                </div>
            </div>
        `;
    }

    static renderHistoryList() {
        const history = this.getFilteredHistory();
        
        if (history.length === 0) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <h3>No hay historial</h3>
                    <p>No se encontraron registros con los filtros aplicados</p>
                    <button class="btn btn-primary" onclick="History.clearFilters()">
                        Ver Todo el Historial
                    </button>
                </div>
            `;
        }

        return `
            <div class="history-timeline">
                ${this.groupHistoryByDate(history).map(([date, entries]) => `
                    <div class="timeline-day">
                        <div class="day-header">
                            <h4>${this.formatDateHeader(date)}</h4>
                            <span class="day-count">${entries.length} actividades</span>
                        </div>
                        <div class="day-entries">
                            ${entries.map(entry => this.renderHistoryEntry(entry)).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    static renderHistoryEntry(entry) {
        const client = Storage.getClientById(entry.clientId);
        const icon = this.getActionIcon(entry.action);
        const time = new Date(entry.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });

        return `
            <div class="history-entry ${entry.action}">
                <div class="entry-time">${time}</div>
                <div class="entry-icon">${icon}</div>
                <div class="entry-content">
                    <div class="entry-title">${this.getActionTitle(entry.action)}</div>
                    <div class="entry-details">${entry.details}</div>
                    <div class="entry-meta">
                        <span class="client-name">${client ? client.name : 'Cliente no encontrado'}</span>
                        <span class="operator">por ${entry.operator}</span>
                        ${entry.garmentIds && entry.garmentIds.length > 0 ? 
                            `<span class="garment-count">${entry.garmentIds.length} prenda(s)</span>` : ''}
                    </div>
                </div>
                <div class="entry-actions">
                    <button class="btn btn-sm btn-secondary" onclick="History.viewEntryDetails(${entry.id || Date.parse(entry.timestamp)})" title="Ver detalles">
                        👁️
                    </button>
                </div>
            </div>
        `;
    }

    // Métodos de interacción
    static init() {
        this.addHistoryStyles();
    }

    static changeFilter(filter) {
        this.currentFilter = filter;
        this.refreshContent();
    }

    static changeDateRange(range) {
        this.dateRange = range;
        if (range === 'custom') {
            this.showCustomDatePicker();
        } else {
            this.refreshContent();
        }
    }

    static search(query) {
        this.searchQuery = query;
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.refreshContent();
        }, 300);
    }

    static clearFilters() {
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.dateRange = 'all';
        this.selectedClient = null;
        
        document.getElementById('history-filter').value = 'all';
        document.getElementById('date-range').value = 'all';
        document.getElementById('history-search').value = '';
        
        this.refreshContent();
    }

    static getFilteredHistory() {
        let history = Storage.getHistory();
        
        // Filtrar por cliente específico
        if (this.selectedClient) {
            history = history.filter(entry => entry.clientId === this.selectedClient.id);
        }
        
        // Filtrar por tipo de acción
        if (this.currentFilter !== 'all') {
            history = history.filter(entry => entry.action === this.currentFilter);
        }
        
        // Filtrar por búsqueda
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            history = history.filter(entry => 
                entry.details.toLowerCase().includes(query) ||
                entry.operator.toLowerCase().includes(query) ||
                (entry.clientId && Storage.getClientById(entry.clientId)?.name.toLowerCase().includes(query))
            );
        }
        
        // Filtrar por fecha
        history = this.filterByDateRange(history);
        
        // Ordenar por fecha (más reciente primero)
        return history.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    }

    static filterByDateRange(history) {
        if (this.dateRange === 'all') return history;
        
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        return history.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            
            switch (this.dateRange) {
                case 'today':
                    return entryDate >= today;
                case 'week':
                    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
                    return entryDate >= weekAgo;
                case 'month':
                    const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
                    return entryDate >= monthAgo;
                default:
                    return true;
            }
        });
    }

    static groupHistoryByDate(history) {
        const groups = {};
        
        history.forEach(entry => {
            const date = new Date(entry.timestamp).toDateString();
            if (!groups[date]) {
                groups[date] = [];
            }
            groups[date].push(entry);
        });
        
        return Object.entries(groups).sort(([dateA], [dateB]) => 
            new Date(dateB) - new Date(dateA)
        );
    }

    static getHistoryCount() {
        return this.getFilteredHistory().length;
    }

    static getActionIcon(action) {
        const icons = {
            'recepcion': '📥',
            'entrega': '📤',
            'proceso': '⚙️',
            'cliente': '👤',
            'guia': '📄'
        };
        return icons[action] || '📋';
    }

    static getActionTitle(action) {
        const titles = {
            'recepcion': 'Recepción de Prendas',
            'entrega': 'Entrega de Prendas',
            'proceso': 'Cambio de Estado',
            'cliente': 'Gestión de Cliente',
            'guia': 'Generación de Guía'
        };
        return titles[action] || 'Actividad';
    }

    static formatDateHeader(dateString) {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        
        if (date.toDateString() === today.toDateString()) {
            return 'Hoy';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Ayer';
        } else {
            return date.toLocaleDateString('es-ES', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
    }

    static viewEntryDetails(entryId) {
        const history = Storage.getHistory();
        const entry = history.find(e => (e.id || Date.parse(e.timestamp)) === entryId);
        
        if (!entry) return;
        
        const client = Storage.getClientById(entry.clientId);
        const garments = entry.garmentIds ? 
            entry.garmentIds.map(id => Storage.getGarmentById(id)).filter(g => g) : [];
        
        const content = `
            <div class="entry-details">
                <div class="detail-header">
                    <h4>${this.getActionIcon(entry.action)} ${this.getActionTitle(entry.action)}</h4>
                    <span class="detail-time">${new Date(entry.timestamp).toLocaleString('es-ES')}</span>
                </div>
                
                <div class="detail-grid">
                    <div class="detail-section">
                        <h5>Información General</h5>
                        <div class="detail-list">
                            <div class="detail-item">
                                <span>Cliente:</span>
                                <span>${client ? client.name : 'No encontrado'}</span>
                            </div>
                            <div class="detail-item">
                                <span>Usuario:</span>
                                <span>${entry.operator}</span>
                            </div>
                            <div class="detail-item">
                                <span>Fecha:</span>
                                <span>${new Date(entry.timestamp).toLocaleString('es-ES')}</span>
                            </div>
                            <div class="detail-item">
                                <span>Detalles:</span>
                                <span>${entry.details}</span>
                            </div>
                        </div>
                    </div>
                    
                    ${garments.length > 0 ? `
                        <div class="detail-section">
                            <h5>Prendas Involucradas (${garments.length})</h5>
                            <div class="garments-list">
                                ${garments.map(garment => `
                                    <div class="garment-item">
                                        <span class="rfid">${garment.rfidCode}</span>
                                        <span class="type">${garment.type} ${garment.color}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
        
        app.showModal('Detalles de Actividad', content);
    }

    static exportHistory() {
        const history = this.getFilteredHistory();
        const csv = this.generateHistoryCSV(history);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `historial_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        app.showSuccessMessage('Historial exportado correctamente');
    }

    static generateHistoryCSV(history) {
        const headers = ['Fecha', 'Hora', 'Acción', 'Cliente', 'Usuario', 'Detalles', 'Prendas'];
        
        const rows = history.map(entry => {
            const client = Storage.getClientById(entry.clientId);
            const date = new Date(entry.timestamp);
            
            return [
                date.toLocaleDateString('es-ES'),
                date.toLocaleTimeString('es-ES'),
                this.getActionTitle(entry.action),
                client ? client.name : 'No encontrado',
                entry.operator,
                entry.details,
                entry.garmentIds ? entry.garmentIds.length : 0
            ];
        });

        return [headers, ...rows].map(row => 
            row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }

    static refreshContent() {
        const content = document.querySelector('.card .history-content');
        if (content) {
            content.innerHTML = this.renderHistoryList();
        }
        
        // Actualizar contador
        const subtitle = document.querySelector('.card-subtitle');
        if (subtitle) {
            subtitle.textContent = `${this.getHistoryCount()} entradas encontradas`;
        }
    }

    static addHistoryStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .history-controls {
                padding: 20px;
            }
            .controls-section {
                display: flex;
                gap: 20px;
                align-items: end;
                flex-wrap: wrap;
            }
            .filter-group, .search-group, .action-group {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }
            .filter-group label {
                font-size: 0.9em;
                font-weight: 500;
                color: #4a5568;
            }
            .search-group {
                flex: 1;
                min-width: 200px;
            }
            .action-group {
                flex-direction: row;
                gap: 10px;
            }
            
            .history-timeline {
                padding: 20px;
            }
            .timeline-day {
                margin-bottom: 30px;
            }
            .day-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                background: #f8f9fa;
                border-radius: 8px;
                margin-bottom: 15px;
            }
            .day-header h4 {
                margin: 0;
                color: #2d3748;
            }
            .day-count {
                background: #6c757d;
                color: white;
                padding: 4px 12px;
                border-radius: 15px;
                font-size: 0.9em;
            }
            
            .history-entry {
                display: flex;
                align-items: flex-start;
                padding: 15px;
                border-left: 4px solid #dee2e6;
                background: white;
                margin-bottom: 10px;
                border-radius: 0 8px 8px 0;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                transition: all 0.2s;
            }
            .history-entry:hover {
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
            }
            .history-entry.recepcion { border-left-color: #3498db; }
            .history-entry.entrega { border-left-color: #27ae60; }
            .history-entry.proceso { border-left-color: #f39c12; }
            .history-entry.cliente { border-left-color: #9b59b6; }
            
            .entry-time {
                font-size: 0.9em;
                color: #6c757d;
                font-weight: 500;
                min-width: 60px;
                margin-right: 15px;
                margin-top: 2px;
            }
            .entry-icon {
                font-size: 1.5em;
                margin-right: 15px;
                margin-top: 2px;
            }
            .entry-content {
                flex: 1;
            }
            .entry-title {
                font-weight: 500;
                color: #2d3748;
                margin-bottom: 5px;
            }
            .entry-details {
                color: #4a5568;
                margin-bottom: 8px;
                line-height: 1.4;
            }
            .entry-meta {
                font-size: 0.85em;
                color: #718096;
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
            }
            .entry-meta .client-name {
                font-weight: 500;
            }
            .entry-actions {
                margin-left: 15px;
            }
            
            .empty-state {
                text-align: center;
                padding: 60px 20px;
            }
            .empty-icon {
                font-size: 4rem;
                opacity: 0.5;
                margin-bottom: 20px;
            }
            
            .entry-details .detail-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #dee2e6;
            }
            .detail-time {
                font-size: 0.9em;
                color: #6c757d;
            }
            .detail-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            .detail-section h5 {
                margin-bottom: 15px;
                color: #495057;
                border-bottom: 1px solid #dee2e6;
                padding-bottom: 8px;
            }
            .detail-list .detail-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #f1f3f4;
            }
            .detail-item:last-child {
                border-bottom: none;
            }
            .garments-list .garment-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 12px;
                background: #f8f9fa;
                border-radius: 4px;
                margin-bottom: 5px;
            }
            .garment-item .rfid {
                font-family: monospace;
                font-weight: bold;
                color: #495057;
            }
            
            @media (max-width: 768px) {
                .controls-section {
                    flex-direction: column;
                    align-items: stretch;
                }
                .filter-group, .search-group, .action-group {
                    width: 100%;
                }
                .action-group {
                    flex-direction: row;
                    justify-content: center;
                }
                .entry-meta {
                    flex-direction: column;
                    gap: 5px;
                }
                .detail-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        if (!document.querySelector('#history-styles')) {
            style.id = 'history-styles';
            document.head.appendChild(style);
        }
    }
}

// Exponer la clase globalmente
window.History = History;