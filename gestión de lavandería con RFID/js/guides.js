/**
 * Módulo de gestión de guías
 * Maneja las guías de recepción y entrega
 */

class Guides {
    static currentFilter = 'all';
    static currentView = 'list';

    static async render() {
        const guides = Storage.getGuides();
        const stats = this.calculateGuidesStats(guides);

        return `
            <div class="page-header">
                <h1>📄 Gestión de Guías</h1>
                <p>Administración de guías de recepción y entrega</p>
            </div>

            <!-- Estadísticas de guías -->
            <div class="grid grid-4 mb-2">
                <div class="stat-card ${this.currentFilter === 'all' ? 'active' : ''}" onclick="Guides.filterGuides('all')">
                    <div class="stat-number">${stats.total}</div>
                    <div class="stat-label">Total de Guías</div>
                    <div class="stat-icon">📄</div>
                </div>
                <div class="stat-card ${this.currentFilter === 'recepcion' ? 'active' : ''}" onclick="Guides.filterGuides('recepcion')">
                    <div class="stat-number">${stats.reception}</div>
                    <div class="stat-label">Recepción</div>
                    <div class="stat-icon">📥</div>
                </div>
                <div class="stat-card ${this.currentFilter === 'entrega' ? 'active' : ''}" onclick="Guides.filterGuides('entrega')">
                    <div class="stat-number">${stats.delivery}</div>
                    <div class="stat-label">Entrega</div>
                    <div class="stat-icon">📤</div>
                </div>
                <div class="stat-card ${this.currentFilter === 'activa' ? 'active' : ''}" onclick="Guides.filterGuides('activa')">
                    <div class="stat-number">${stats.active}</div>
                    <div class="stat-label">Activas</div>
                    <div class="stat-icon">✅</div>
                </div>
            </div>

            <!-- Controles -->
            <div class="card mb-2">
                <div class="guides-controls">
                    <div class="controls-left">
                        <div class="search-group">
                            <input type="text" 
                                   id="guides-search" 
                                   class="form-control" 
                                   placeholder="Buscar por ID, cliente..."
                                   onkeyup="Guides.handleSearch(this.value)">
                        </div>
                        <select id="sort-guides" class="form-control" onchange="Guides.handleSort()">
                            <option value="newest">Más Recientes</option>
                            <option value="oldest">Más Antiguas</option>
                            <option value="client">Por Cliente</option>
                            <option value="items">Por Cantidad</option>
                        </select>
                    </div>
                    <div class="controls-right">
                        <button class="btn btn-info" onclick="Guides.exportGuides()">
                            📊 Exportar
                        </button>
                        <button class="btn btn-success" onclick="Guides.generateCustomGuide()">
                            ➕ Nueva Guía
                        </button>
                    </div>
                </div>
            </div>

            <!-- Lista de guías -->
            <div id="guides-content">
                ${this.renderGuidesList()}
            </div>
        `;
    }

    static renderGuidesList() {
        const guides = this.getFilteredGuides();
        
        if (guides.length === 0) {
            return this.renderEmptyState();
        }

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Guías Encontradas (${guides.length})</h3>
                    <div class="view-toggle">
                        <button class="btn btn-sm ${this.currentView === 'list' ? 'btn-primary' : 'btn-secondary'}" 
                                onclick="Guides.setView('list')">
                            📋 Lista
                        </button>
                        <button class="btn btn-sm ${this.currentView === 'cards' ? 'btn-primary' : 'btn-secondary'}" 
                                onclick="Guides.setView('cards')">
                            ⊞ Tarjetas
                        </button>
                    </div>
                </div>

                <div class="guides-display">
                    ${this.currentView === 'list' ? this.renderGuidesTable(guides) : this.renderGuidesCards(guides)}
                </div>
            </div>
        `;
    }

    static renderGuidesTable(guides) {
        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>ID Guía</th>
                            <th>Tipo</th>
                            <th>Cliente</th>
                            <th>Prendas</th>
                            <th>Fecha</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${guides.map(guide => this.renderGuideRow(guide)).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    static renderGuideRow(guide) {
        const client = Storage.getClientById(guide.clientId);
        const typeIcon = guide.type === 'recepcion' ? '📥' : '📤';
        const statusClass = guide.status === 'activa' ? 'success' : 'info';

        return `
            <tr>
                <td>
                    <div class="guide-id">
                        <strong>${typeIcon} #${guide.id}</strong>
                    </div>
                </td>
                <td>
                    <span class="badge badge-${guide.type === 'recepcion' ? 'primary' : 'warning'}">
                        ${guide.type === 'recepcion' ? 'Recepción' : 'Entrega'}
                    </span>
                </td>
                <td>
                    <div class="client-info">
                        <div class="client-name">${client ? client.name : 'Cliente no encontrado'}</div>
                        <div class="client-phone">${client ? client.phone : 'N/A'}</div>
                    </div>
                </td>
                <td>
                    <span class="items-count">${guide.totalItems} prenda(s)</span>
                </td>
                <td>
                    <div class="date-info">
                        <div class="date">${this.formatDate(guide.generatedAt)}</div>
                        <div class="time">${this.formatTime(guide.generatedAt)}</div>
                    </div>
                </td>
                <td>
                    <span class="badge badge-${statusClass}">
                        ${guide.status === 'activa' ? 'Activa' : 'Completada'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-info" onclick="Guides.viewGuide(${guide.id})" title="Ver detalles">
                            👁️
                        </button>
                        <button class="btn btn-sm btn-primary" onclick="Guides.printGuide(${guide.id})" title="Imprimir">
                            🖨️
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="Guides.duplicateGuide(${guide.id})" title="Duplicar">
                            📋
                        </button>
                        ${guide.status === 'activa' ? 
                            `<button class="btn btn-sm btn-success" onclick="Guides.completeGuide(${guide.id})" title="Marcar completada">
                                ✅
                            </button>` : ''}
                    </div>
                </td>
            </tr>
        `;
    }

    static renderGuidesCards(guides) {
        return `
            <div class="guides-grid">
                ${guides.map(guide => this.renderGuideCard(guide)).join('')}
            </div>
        `;
    }

    static renderGuideCard(guide) {
        const client = Storage.getClientById(guide.clientId);
        const typeIcon = guide.type === 'recepcion' ? '📥' : '📤';
        const typeClass = guide.type === 'recepcion' ? 'reception' : 'delivery';

        return `
            <div class="guide-card ${typeClass}">
                <div class="card-header">
                    <div class="guide-type">
                        <span class="type-icon">${typeIcon}</span>
                        <span class="type-text">${guide.type === 'recepcion' ? 'Recepción' : 'Entrega'}</span>
                    </div>
                    <div class="guide-id">#${guide.id}</div>
                </div>
                
                <div class="card-body">
                    <div class="client-section">
                        <h4>${client ? client.name : 'Cliente no encontrado'}</h4>
                        <p>${client ? client.phone : 'N/A'}</p>
                    </div>
                    
                    <div class="guide-stats">
                        <div class="stat">
                            <span class="stat-value">${guide.totalItems}</span>
                            <span class="stat-label">Prendas</span>
                        </div>
                        <div class="stat">
                            <span class="stat-value">${this.formatDate(guide.generatedAt)}</span>
                            <span class="stat-label">Fecha</span>
                        </div>
                        <div class="stat">
                            <span class="badge badge-${guide.status === 'activa' ? 'success' : 'info'}">
                                ${guide.status === 'activa' ? 'Activa' : 'Completada'}
                            </span>
                        </div>
                    </div>
                    
                    ${guide.notes ? `
                        <div class="guide-notes">
                            <p><strong>Notas:</strong> ${guide.notes}</p>
                        </div>
                    ` : ''}
                </div>
                
                <div class="card-actions">
                    <button class="btn btn-sm btn-info" onclick="Guides.viewGuide(${guide.id})">
                        👁️ Ver
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="Guides.printGuide(${guide.id})">
                        🖨️ Imprimir
                    </button>
                    ${guide.status === 'activa' ? 
                        `<button class="btn btn-sm btn-success" onclick="Guides.completeGuide(${guide.id})">
                            ✅ Completar
                        </button>` : ''}
                </div>
            </div>
        `;
    }

    static renderEmptyState() {
        let message, icon, suggestion;
        
        switch (this.currentFilter) {
            case 'recepcion':
                icon = '📥';
                message = 'No hay guías de recepción';
                suggestion = 'Las guías se generan automáticamente al recibir prendas';
                break;
            case 'entrega':
                icon = '📤';
                message = 'No hay guías de entrega';
                suggestion = 'Las guías se generan automáticamente al entregar prendas';
                break;
            case 'activa':
                icon = '✅';
                message = 'No hay guías activas';
                suggestion = 'Todas las guías han sido completadas';
                break;
            default:
                icon = '📄';
                message = 'No hay guías registradas';
                suggestion = 'Las guías se generan automáticamente con cada operación';
        }

        return `
            <div class="card">
                <div class="empty-state">
                    <div class="empty-icon">${icon}</div>
                    <h3>${message}</h3>
                    <p>${suggestion}</p>
                    <div class="empty-actions">
                        <button class="btn btn-primary" onclick="Navigation.loadPage('reception')">
                            📥 Ir a Recepción
                        </button>
                        <button class="btn btn-secondary" onclick="Guides.filterGuides('all')">
                            📄 Ver Todas
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Métodos de interacción
    static init() {
        this.addGuidesStyles();
    }

    static filterGuides(filter) {
        this.currentFilter = filter;
        this.refreshGuidesList();
    }

    static setView(view) {
        this.currentView = view;
        this.refreshGuidesList();
    }

    static handleSearch(query) {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.searchQuery = query;
            this.refreshGuidesList();
        }, 300);
    }

    static handleSort() {
        this.refreshGuidesList();
    }

    static viewGuide(guideId) {
        const guide = Storage.getGuides().find(g => g.id === guideId);
        if (!guide) {
            app.showErrorMessage('Guía no encontrada');
            return;
        }

        const client = Storage.getClientById(guide.clientId);
        const garments = guide.garmentIds ? guide.garmentIds.map(id => Storage.getGarmentById(id)).filter(g => g) : [];

        const modalContent = `
            <div class="guide-details">
                <div class="guide-header-detail">
                    <div class="guide-info">
                        <h3>${guide.type === 'recepcion' ? '📥' : '📤'} Guía #${guide.id}</h3>
                        <span class="badge badge-${guide.type === 'recepcion' ? 'primary' : 'warning'}">
                            ${guide.type === 'recepcion' ? 'Recepción' : 'Entrega'}
                        </span>
                        <span class="badge badge-${guide.status === 'activa' ? 'success' : 'info'}">
                            ${guide.status === 'activa' ? 'Activa' : 'Completada'}
                        </span>
                    </div>
                </div>

                <div class="guide-sections">
                    <div class="section">
                        <h4>Información del Cliente</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span>Nombre:</span>
                                <span>${client ? client.name : 'Cliente no encontrado'}</span>
                            </div>
                            <div class="detail-item">
                                <span>Teléfono:</span>
                                <span>${client ? client.phone : 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <span>Cédula:</span>
                                <span>${client ? client.cedula : 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="section">
                        <h4>Detalles de la Guía</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <span>Fecha de Generación:</span>
                                <span>${this.formatDateTime(guide.generatedAt)}</span>
                            </div>
                            <div class="detail-item">
                                <span>Total de Prendas:</span>
                                <span>${guide.totalItems}</span>
                            </div>
                            <div class="detail-item">
                                <span>Operador:</span>
                                <span>${app.currentUser?.name || 'Sistema'}</span>
                            </div>
                        </div>
                        ${guide.notes ? `
                            <div class="notes-section">
                                <h5>Notas:</h5>
                                <p>${guide.notes}</p>
                            </div>
                        ` : ''}
                    </div>

                    ${garments.length > 0 ? `
                        <div class="section">
                            <h4>Prendas (${garments.length})</h4>
                            <div class="garments-list-modal">
                                ${garments.map(garment => `
                                    <div class="garment-item-modal">
                                        <div class="garment-code">${garment.rfidCode}</div>
                                        <div class="garment-desc">${garment.type} ${garment.color}</div>
                                        <div class="garment-status">
                                            <span class="badge badge-${Control.getStatusClass(garment.status)}">
                                                ${Control.getStatusText(garment.status)}
                                            </span>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        const modal = app.showModal(`Detalles de Guía #${guide.id}`, modalContent);
        
        const modalFooter = modal.querySelector('.modal-footer');
        modalFooter.innerHTML = `
            <button class="btn btn-secondary" onclick="app.closeModal('dynamic-modal')">Cerrar</button>
            <button class="btn btn-primary" onclick="Guides.printGuide(${guide.id})">🖨️ Imprimir</button>
            ${guide.status === 'activa' ? 
                `<button class="btn btn-success" onclick="Guides.completeGuide(${guide.id}); app.closeModal('dynamic-modal')">
                    ✅ Marcar Completada
                </button>` : ''}
        `;
    }

    static printGuide(guideId) {
        const guide = Storage.getGuides().find(g => g.id === guideId);
        if (!guide) {
            app.showErrorMessage('Guía no encontrada');
            return;
        }

        // Simular impresión
        app.showSuccessMessage(`Guía #${guide.id} enviada a impresión`);
        
        // En una implementación real, aquí se generaría el PDF
        console.log('Printing guide:', {
            id: guide.id,
            type: guide.type,
            client: Storage.getClientById(guide.clientId),
            items: guide.totalItems,
            date: guide.generatedAt
        });
    }

    static duplicateGuide(guideId) {
        const guide = Storage.getGuides().find(g => g.id === guideId);
        if (!guide) {
            app.showErrorMessage('Guía no encontrada');
            return;
        }

        const newGuide = {
            ...guide,
            generatedAt: new Date().toISOString(),
            status: 'activa',
            notes: `Duplicada de guía #${guide.id} - ${guide.notes || ''}`
        };

        const duplicated = Storage.addGuide(newGuide);
        app.showSuccessMessage(`Guía duplicada como #${duplicated.id}`);
        this.refreshGuidesList();
    }

    static completeGuide(guideId) {
        const guides = Storage.getGuides();
        const guideIndex = guides.findIndex(g => g.id === guideId);
        
        if (guideIndex === -1) {
            app.showErrorMessage('Guía no encontrada');
            return;
        }

        guides[guideIndex].status = 'completada';
        guides[guideIndex].completedAt = new Date().toISOString();
        
        Storage.setGuides(guides);
        app.showSuccessMessage(`Guía #${guideId} marcada como completada`);
        this.refreshGuidesList();
    }

    static generateCustomGuide() {
        const modalContent = `
            <form id="custom-guide-form">
                <div class="form-group">
                    <label class="form-label">Tipo de Guía:</label>
                    <select name="type" class="form-control" required>
                        <option value="">Seleccionar tipo...</option>
                        <option value="recepcion">Guía de Recepción</option>
                        <option value="entrega">Guía de Entrega</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Cliente:</label>
                    <select name="clientId" class="form-control" required>
                        <option value="">Seleccionar cliente...</option>
                        ${Storage.getClients().map(client => 
                            `<option value="${client.id}">${client.name} - ${client.cedula}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Número de Prendas:</label>
                    <input type="number" name="totalItems" class="form-control" min="1" required>
                </div>
                
                <div class="form-group">
                    <label class="form-label">Notas:</label>
                    <textarea name="notes" class="form-control" rows="3" 
                              placeholder="Observaciones o instrucciones especiales..."></textarea>
                </div>
            </form>
        `;

        const modal = app.showModal('Nueva Guía Personalizada', modalContent);
        
        const modalFooter = modal.querySelector('.modal-footer');
        modalFooter.innerHTML = `
            <button class="btn btn-secondary" onclick="app.closeModal('dynamic-modal')">Cancelar</button>
            <button class="btn btn-success" onclick="Guides.saveCustomGuide()">✅ Crear Guía</button>
        `;
    }

    static saveCustomGuide() {
        const form = document.getElementById('custom-guide-form');
        const formData = new FormData(form);

        const guideData = {
            type: formData.get('type'),
            clientId: parseInt(formData.get('clientId')),
            totalItems: parseInt(formData.get('totalItems')),
            notes: formData.get('notes') || '',
            garmentIds: [] // Guía personalizada sin prendas específicas
        };

        if (!guideData.type || !guideData.clientId || !guideData.totalItems) {
            app.showErrorMessage('Complete todos los campos obligatorios');
            return;
        }

        const guide = Storage.addGuide(guideData);
        
        // Registrar en historial
        Storage.addHistoryEntry({
            clientId: guideData.clientId,
            action: 'guia',
            operator: app.currentUser?.username || 'sistema',
            details: `Guía personalizada creada #${guide.id} - ${guideData.type}`
        });

        app.closeModal('dynamic-modal');
        app.showSuccessMessage(`Guía #${guide.id} creada correctamente`);
        this.refreshGuidesList();
    }

    static exportGuides() {
        const guides = this.getFilteredGuides();
        
        if (guides.length === 0) {
            app.showWarningMessage('No hay guías para exportar');
            return;
        }

        try {
            const csv = this.generateGuidesCSV(guides);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `guias_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            app.showSuccessMessage(`${guides.length} guía(s) exportadas correctamente`);
        } catch (error) {
            console.error('Error exportando guías:', error);
            app.showErrorMessage('Error al exportar las guías');
        }
    }

    static generateGuidesCSV(guides) {
        const headers = ['ID', 'Tipo', 'Cliente', 'Teléfono', 'Prendas', 'Fecha', 'Estado', 'Notas'];
        
        const rows = guides.map(guide => {
            const client = Storage.getClientById(guide.clientId);
            return [
                guide.id,
                guide.type === 'recepcion' ? 'Recepción' : 'Entrega',
                client ? client.name : 'N/A',
                client ? client.phone : 'N/A',
                guide.totalItems,
                this.formatDateTime(guide.generatedAt),
                guide.status === 'activa' ? 'Activa' : 'Completada',
                guide.notes || ''
            ];
        });
        
        return [headers, ...rows].map(row => 
            row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }

    // Métodos auxiliares
    static getFilteredGuides() {
        let guides = Storage.getGuides();
        
        // Filtrar por tipo/estado
        if (this.currentFilter !== 'all') {
            if (this.currentFilter === 'activa') {
                guides = guides.filter(g => g.status === 'activa');
            } else {
                guides = guides.filter(g => g.type === this.currentFilter);
            }
        }
        
        // Filtrar por búsqueda
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            guides = guides.filter(guide => {
                const client = Storage.getClientById(guide.clientId);
                return guide.id.toString().includes(query) ||
                       (client && client.name.toLowerCase().includes(query)) ||
                       guide.notes?.toLowerCase().includes(query);
            });
        }
        
        // Ordenar
        const sortBy = document.getElementById('sort-guides')?.value || 'newest';
        guides.sort((a, b) => {
            switch (sortBy) {
                case 'oldest':
                    return new Date(a.generatedAt) - new Date(b.generatedAt);
                case 'client':
                    const clientA = Storage.getClientById(a.clientId);
                    const clientB = Storage.getClientById(b.clientId);
                    return (clientA?.name || '').localeCompare(clientB?.name || '');
                case 'items':
                    return b.totalItems - a.totalItems;
                default: // newest
                    return new Date(b.generatedAt) - new Date(a.generatedAt);
            }
        });
        
        return guides;
    }

    static calculateGuidesStats(guides) {
        return {
            total: guides.length,
            reception: guides.filter(g => g.type === 'recepcion').length,
            delivery: guides.filter(g => g.type === 'entrega').length,
            active: guides.filter(g => g.status === 'activa').length
        };
    }

    static refreshGuidesList() {
        const container = document.getElementById('guides-content');
        if (container) {
            container.innerHTML = this.renderGuidesList();
        }
    }

    static formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-ES');
    }

    static formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    static formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('es-ES');
    }

    static addGuidesStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .guides-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                flex-wrap: wrap;
                gap: 20px;
            }
            .controls-left {
                display: flex;
                gap: 15px;
                align-items: center;
                flex: 1;
            }
            .search-group {
                min-width: 300px;
                flex: 1;
            }
            .controls-right {
                display: flex;
                gap: 10px;
            }
            .view-toggle {
                display: flex;
                gap: 5px;
            }
            .guides-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 20px;
                padding: 20px;
            }
            .guide-card {
                background: white;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                border: 1px solid #e2e8f0;
                transition: all 0.3s ease;
            }
            .guide-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 15px rgba(0,0,0,0.15);
            }
            .guide-card.reception {
                border-left: 4px solid #4299e1;
            }
            .guide-card.delivery {
                border-left: 4px solid #ed8936;
            }
            .guide-card .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                background: #f7fafc;
                border-bottom: 1px solid #e2e8f0;
            }
            .guide-type {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .type-icon {
                font-size: 20px;
            }
            .type-text {
                font-weight: 500;
                color: #2d3748;
            }
            .guide-id {
                font-weight: bold;
                color: #667eea;
                font-family: monospace;
            }
            .guide-card .card-body {
                padding: 20px;
            }
            .client-section h4 {
                color: #2d3748;
                margin-bottom: 5px;
            }
            .client-section p {
                color: #718096;
                margin-bottom: 15px;
            }
            .guide-stats {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            .stat {
                text-align: center;
            }
            .stat-value {
                display: block;
                font-weight: bold;
                color: #2d3748;
            }
            .stat-label {
                font-size: 12px;
                color: #718096;
            }
            .guide-notes {
                background: #f7fafc;
                padding: 10px;
                border-radius: 6px;
                border-left: 3px solid #667eea;
                margin-top: 15px;
            }
            .guide-notes p {
                margin: 0;
                font-size: 14px;
                color: #4a5568;
            }
            .card-actions {
                padding: 15px 20px;
                background: #f7fafc;
                border-top: 1px solid #e2e8f0;
                display: flex;
                gap: 8px;
                justify-content: space-between;
            }
            .card-actions .btn {
                flex: 1;
                font-size: 12px;
            }
            .client-info .client-name {
                font-weight: 500;
                color: #2d3748;
            }
            .client-info .client-phone {
                color: #718096;
                font-size: 14px;
            }
            .date-info .date {
                font-weight: 500;
                color: #2d3748;
            }
            .date-info .time {
                color: #718096;
                font-size: 12px;
            }
            .action-buttons {
                display: flex;
                gap: 5px;
            }
            .action-buttons .btn {
                padding: 4px 8px;
                font-size: 12px;
            }
            .guide-details .guide-header-detail {
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #e2e8f0;
            }
            .guide-info {
                display: flex;
                align-items: center;
                gap: 15px;
                flex-wrap: wrap;
            }
            .guide-info h3 {
                margin: 0;
                color: #2d3748;
            }
            .guide-sections .section {
                margin-bottom: 25px;
            }
            .guide-sections h4 {
                color: #2d3748;
                margin-bottom: 15px;
                padding-bottom: 8px;
                border-bottom: 1px solid #e2e8f0;
            }
            .detail-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 15px;
            }
            .detail-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #f1f5f9;
            }
            .detail-item span:first-child {
                font-weight: 500;
                color: #4a5568;
            }
            .detail-item span:last-child {
                color: #2d3748;
            }
            .notes-section {
                background: #f7fafc;
                padding: 15px;
                border-radius: 8px;
                border-left: 4px solid #667eea;
                margin-top: 15px;
            }
            .notes-section h5 {
                margin-bottom: 10px;
                color: #2d3748;
            }
            .garments-list-modal {
                max-height: 300px;
                overflow-y: auto;
            }
            .garment-item-modal {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px;
                border-bottom: 1px solid #f1f5f9;
                background: white;
            }
            .garment-item-modal:hover {
                background-color: #f7fafc;
            }
            .garment-code {
                font-weight: bold;
                color: #667eea;
                font-family: monospace;
            }
            .garment-desc {
                color: #2d3748;
            }
            .empty-state {
                text-align: center;
                padding: 60px 20px;
            }
            .empty-icon {
                font-size: 4rem;
                margin-bottom: 20px;
                opacity: 0.5;
            }
            .empty-actions {
                margin-top: 20px;
            }
            .empty-actions .btn {
                margin: 0 10px;
            }
            @media (max-width: 768px) {
                .guides-controls {
                    flex-direction: column;
                    align-items: stretch;
                }
                .controls-left {
                    flex-direction: column;
                    gap: 10px;
                }
                .search-group {
                    min-width: auto;
                    width: 100%;
                }
                .controls-right {
                    width: 100%;
                    justify-content: stretch;
                }
                .controls-right .btn {
                    flex: 1;
                }
                .guides-grid {
                    grid-template-columns: 1fr;
                    padding: 10px;
                }
                .guide-stats {
                    flex-direction: column;
                    gap: 10px;
                }
                .card-actions {
                    flex-direction: column;
                    gap: 8px;
                }
                .guide-info {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 10px;
                }
                .detail-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        if (!document.querySelector('#guides-styles')) {
            style.id = 'guides-styles';
            document.head.appendChild(style);
        }
    }
}

// Exponer la clase globalmente
window.Guides = Guides;


