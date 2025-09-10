/**
 * Módulo de control interno
 * Maneja el seguimiento y actualización de estados de prendas
 */

class Control {
    static currentView = 'list'; // 'list', 'kanban', 'timeline'
    static selectedStatus = 'all';
    static searchQuery = '';
    static sortBy = 'receivedAt';
    static sortOrder = 'desc';

    static async render() {
        const params = Navigation.getPageParams('control');
        
        if (params.clientId) {
            this.selectedClientId = params.clientId;
        }

        return `
            <div class="page-header">
                <h1>⚙️ Control Interno</h1>
                <p>Seguimiento y actualización de estados de prendas</p>
            </div>

            <!-- Barra de herramientas -->
            <div class="control-toolbar card mb-2">
                <div class="toolbar-section">
                    <div class="view-toggles">
                        <button class="btn ${this.currentView === 'list' ? 'btn-primary' : 'btn-secondary'}" 
                                onclick="Control.changeView('list')">
                            📋 Lista
                        </button>
                        <button class="btn ${this.currentView === 'kanban' ? 'btn-primary' : 'btn-secondary'}" 
                                onclick="Control.changeView('kanban')">
                            📊 Kanban
                        </button>
                        <button class="btn ${this.currentView === 'timeline' ? 'btn-primary' : 'btn-secondary'}" 
                                onclick="Control.changeView('timeline')">
                            ⏰ Línea de Tiempo
                        </button>
                    </div>
                </div>
                
                <div class="toolbar-section">
                    <div class="filters">
                        <select id="status-filter" class="form-control" onchange="Control.filterByStatus(this.value)">
                            <option value="all">Todos los estados</option>
                            <option value="recibido">Recibido</option>
                            <option value="en_proceso">En Proceso</option>
                            <option value="listo">Listo</option>
                            <option value="entregado">Entregado</option>
                        </select>
                        
                        <input type="text" 
                               id="control-search" 
                               class="form-control" 
                               placeholder="Buscar por RFID, cliente..."
                               value="${this.searchQuery}"
                               onkeyup="Control.search(this.value)">
                        
                        <button class="btn btn-info" onclick="Control.openBulkActions()">
                            ⚡ Acciones Masivas
                        </button>
                        
                        <button class="btn btn-success" onclick="Control.scanRFID()">
                            🔍 Escanear RFID
                        </button>
                    </div>
                </div>
            </div>

            <!-- Estadísticas rápidas -->
            <div class="control-stats grid grid-4 mb-2">
                ${this.renderQuickStats()}
            </div>

            <!-- Contenido principal -->
            <div id="control-content">
                ${this.renderCurrentView()}
            </div>
        `;
    }

    static renderQuickStats() {
        const garments = this.getFilteredGarments();
        const stats = {
            total: garments.length,
            recibido: garments.filter(g => g.status === 'recibido').length,
            en_proceso: garments.filter(g => g.status === 'en_proceso').length,
            listo: garments.filter(g => g.status === 'listo').length,
            delayed: garments.filter(g => this.isDelayed(g)).length
        };

        return `
            <div class="stat-card">
                <div class="stat-number">${stats.total}</div>
                <div class="stat-label">Total</div>
                <div class="stat-change">Filtradas</div>
            </div>
            <div class="stat-card warning">
                <div class="stat-number">${stats.recibido}</div>
                <div class="stat-label">Recibidas</div>
                <div class="stat-change">Pendientes</div>
            </div>
            <div class="stat-card info">
                <div class="stat-number">${stats.en_proceso}</div>
                <div class="stat-label">En Proceso</div>
                <div class="stat-change">Trabajando</div>
            </div>
            <div class="stat-card success">
                <div class="stat-number">${stats.listo}</div>
                <div class="stat-label">Listas</div>
                <div class="stat-change">Para entrega</div>
            </div>
        `;
    }

    static renderCurrentView() {
        switch (this.currentView) {
            case 'list':
                return this.renderListView();
            case 'kanban':
                return this.renderKanbanView();
            case 'timeline':
                return this.renderTimelineView();
            default:
                return this.renderListView();
        }
    }

    static renderListView() {
        const garments = this.getFilteredGarments();

        if (garments.length === 0) {
            return `
                <div class="card">
                    <div class="empty-state">
                        <div class="empty-icon">📦</div>
                        <h3>No hay prendas</h3>
                        <p>No se encontraron prendas con los filtros aplicados</p>
                        <button class="btn btn-primary" onclick="Control.clearFilters()">
                            Limpiar Filtros
                        </button>
                    </div>
                </div>
            `;
        }

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Lista de Prendas (${garments.length})</h3>
                    <div class="table-actions">
                        <select id="sort-select" class="form-control" onchange="Control.changeSorting()">
                            <option value="receivedAt">Fecha recepción</option>
                            <option value="rfidCode">Código RFID</option>
                            <option value="status">Estado</option>
                            <option value="priority">Prioridad</option>
                        </select>
                        <button class="btn btn-sm btn-secondary" onclick="Control.exportList()">
                            📊 Exportar
                        </button>
                    </div>
                </div>

                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>
                                    <input type="checkbox" id="select-all" onchange="Control.toggleSelectAll()">
                                </th>
                                <th>RFID</th>
                                <th>Cliente</th>
                                <th>Prenda</th>
                                <th>Estado</th>
                                <th>Prioridad</th>
                                <th>Recibida</th>
                                <th>Días</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${garments.map(garment => this.renderGarmentRow(garment)).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    static renderGarmentRow(garment) {
        const client = Storage.getClientById(garment.clientId);
        const daysInSystem = Math.floor((new Date() - new Date(garment.receivedAt)) / (1000 * 60 * 60 * 24));
        const isDelayed = this.isDelayed(garment);

        return `
            <tr class="garment-row ${isDelayed ? 'delayed' : ''}" data-garment-id="${garment.id}">
                <td>
                    <input type="checkbox" class="garment-checkbox" value="${garment.id}">
                </td>
                <td>
                    <div class="rfid-code">
                        <strong>${garment.rfidCode}</strong>
                        ${garment.priority === 'alta' ? '<span class="priority-indicator high">🔥</span>' : ''}
                        ${garment.priority === 'urgente' ? '<span class="priority-indicator urgent">⚡</span>' : ''}
                    </div>
                </td>
                <td>
                    <div class="client-info">
                        <div class="client-name">${client ? client.name : 'Cliente no encontrado'}</div>
                        <div class="client-id">${client ? client.cedula : 'N/A'}</div>
                    </div>
                </td>
                <td>
                    <div class="garment-info">
                        <div class="garment-type">${garment.type} ${garment.color}</div>
                        <div class="garment-details">${garment.size} • ${garment.condition}</div>
                    </div>
                </td>
                <td>
                    <div class="status-cell">
                        <span class="badge badge-${this.getStatusClass(garment.status)}">
                            ${this.getStatusText(garment.status)}
                        </span>
                        ${garment.status === 'en_proceso' ? `
                            <div class="progress-bar mt-1">
                                <div class="progress-fill" style="width: ${this.getProcessProgress(garment)}%;"></div>
                            </div>
                        ` : ''}
                    </div>
                </td>
                <td>
                    <span class="badge badge-${this.getPriorityClass(garment.priority || 'normal')}">
                        ${this.getPriorityText(garment.priority || 'normal')}
                    </span>
                </td>
                <td>
                    <div class="date-info">
                        <div class="date">${this.formatDate(garment.receivedAt)}</div>
                        <div class="time">${this.formatTime(garment.receivedAt)}</div>
                    </div>
                </td>
                <td>
                    <div class="days-info ${isDelayed ? 'delayed' : ''}">
                        ${daysInSystem} día${daysInSystem !== 1 ? 's' : ''}
                        ${isDelayed ? '<span class="delay-warning">⏰</span>' : ''}
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="Control.changeStatus(${garment.id})" title="Cambiar estado">
                            🔄
                        </button>
                        <button class="btn btn-sm btn-info" onclick="Control.viewDetails(${garment.id})" title="Ver detalles">
                            👁️
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="Control.editGarment(${garment.id})" title="Editar">
                            ✏️
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="Control.addNote(${garment.id})" title="Agregar nota">
                            📝
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    static renderKanbanView() {
        const garments = this.getFilteredGarments();
        const statuses = ['recibido', 'en_proceso', 'listo', 'entregado'];

        return `
            <div class="kanban-board">
                ${statuses.map(status => this.renderKanbanColumn(status, garments.filter(g => g.status === status))).join('')}
            </div>
        `;
    }

    static renderKanbanColumn(status, garments) {
        return `
            <div class="kanban-column" data-status="${status}">
                <div class="column-header">
                    <h3 class="column-title">
                        <span class="status-icon">${this.getStatusIcon(status)}</span>
                        ${this.getStatusText(status)}
                        <span class="count">(${garments.length})</span>
                    </h3>
                </div>
                <div class="column-content" ondrop="Control.dropGarment(event)" ondragover="Control.allowDrop(event)">
                    ${garments.map(garment => this.renderKanbanCard(garment)).join('')}
                </div>
            </div>
        `;
    }

    static renderKanbanCard(garment) {
        const client = Storage.getClientById(garment.clientId);
        const daysInSystem = Math.floor((new Date() - new Date(garment.receivedAt)) / (1000 * 60 * 60 * 24));

        return `
            <div class="kanban-card" 
                 draggable="true" 
                 ondragstart="Control.dragStart(event)" 
                 data-garment-id="${garment.id}">
                <div class="card-header">
                    <div class="rfid-code">${garment.rfidCode}</div>
                    <div class="priority ${garment.priority || 'normal'}">${this.getPriorityIcon(garment.priority)}</div>
                </div>
                <div class="card-content">
                    <div class="garment-type">${garment.type} ${garment.color}</div>
                    <div class="client-name">${client ? client.name : 'Cliente no encontrado'}</div>
                    <div class="card-meta">
                        <span class="days">${daysInSystem}d</span>
                        <span class="size">${garment.size}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-xs btn-primary" onclick="Control.viewDetails(${garment.id})">
                        👁️
                    </button>
                    <button class="btn btn-xs btn-secondary" onclick="Control.editGarment(${garment.id})">
                        ✏️
                    </button>
                </div>
            </div>
        `;
    }

    static renderTimelineView() {
        const garments = this.getFilteredGarments();
        const groupedByDate = this.groupGarmentsByDate(garments);

        return `
            <div class="timeline-view">
                ${Object.entries(groupedByDate).map(([date, garments]) => `
                    <div class="timeline-day">
                        <div class="day-header">
                            <h3>${this.formatDateFull(date)}</h3>
                            <span class="day-count">${garments.length} prenda${garments.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div class="day-timeline">
                            ${garments.map(garment => this.renderTimelineItem(garment)).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    static renderTimelineItem(garment) {
        const client = Storage.getClientById(garment.clientId);
        const history = Storage.getHistory().filter(h => h.garmentIds && h.garmentIds.includes(garment.id));

        return `
            <div class="timeline-item">
                <div class="timeline-marker ${garment.status}"></div>
                <div class="timeline-content">
                    <div class="item-header">
                        <span class="rfid">${garment.rfidCode}</span>
                        <span class="time">${this.formatTime(garment.receivedAt)}</span>
                    </div>
                    <div class="item-details">
                        <div class="garment-info">${garment.type} ${garment.color} - ${client ? client.name : 'Cliente no encontrado'}</div>
                        <div class="status-info">
                            Estado: <span class="badge badge-${this.getStatusClass(garment.status)}">${this.getStatusText(garment.status)}</span>
                        </div>
                    </div>
                    ${history.length > 0 ? `
                        <div class="item-history">
                            <details>
                                <summary>Historial (${history.length} entradas)</summary>
                                <ul>
                                    ${history.slice(0, 3).map(h => `
                                        <li>${this.formatDateTime(h.timestamp)} - ${h.details}</li>
                                    `).join('')}
                                </ul>
                            </details>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    // Métodos de interacción
    static init() {
        this.addControlStyles();
        this.setupEventListeners();
    }

    static setupEventListeners() {
        // Búsqueda en tiempo real
        document.addEventListener('input', (e) => {
            if (e.target.id === 'control-search') {
                clearTimeout(this.searchTimeout);
                this.searchTimeout = setTimeout(() => {
                    this.search(e.target.value);
                }, 300);
            }
        });

        // Atajos de teclado
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey) {
                switch (e.key) {
                    case '1':
                        e.preventDefault();
                        this.changeView('list');
                        break;
                    case '2':
                        e.preventDefault();
                        this.changeView('kanban');
                        break;
                    case '3':
                        e.preventDefault();
                        this.changeView('timeline');
                        break;
                }
            }
        });
    }

    static changeView(view) {
        this.currentView = view;
        this.refreshContent();
    }

    static filterByStatus(status) {
        this.selectedStatus = status;
        this.refreshContent();
    }

    static search(query) {
        this.searchQuery = query;
        this.refreshContent();
    }

    static changeSorting() {
        const select = document.getElementById('sort-select');
        this.sortBy = select.value;
        this.refreshContent();
    }

    static clearFilters() {
        this.selectedStatus = 'all';
        this.searchQuery = '';
        document.getElementById('status-filter').value = 'all';
        document.getElementById('control-search').value = '';
        this.refreshContent();
    }

    static toggleSelectAll() {
        const selectAll = document.getElementById('select-all');
        const checkboxes = document.querySelectorAll('.garment-checkbox');
        checkboxes.forEach(cb => cb.checked = selectAll.checked);
    }

    static getSelectedGarments() {
        const checkboxes = document.querySelectorAll('.garment-checkbox:checked');
        return Array.from(checkboxes).map(cb => parseInt(cb.value));
    }

    static scanRFID() {
        const rfidCode = prompt('Escanear código RFID:');
        if (!rfidCode) return;

        const garment = Storage.getGarmentByRfid(rfidCode.trim().toUpperCase());
        if (garment) {
            this.viewDetails(garment.id);
        } else {
            app.showErrorMessage(`No se encontró prenda con código RFID: ${rfidCode}`);
        }
    }

    static changeStatus(garmentId) {
        const garment = Storage.getGarmentById(garmentId);
        if (!garment) return;

        const statusOptions = [
            { value: 'recibido', label: 'Recibido', icon: '📥' },
            { value: 'en_proceso', label: 'En Proceso', icon: '⚙️' },
            { value: 'listo', label: 'Listo', icon: '✅' },
            { value: 'entregado', label: 'Entregado', icon: '📤' }
        ];

        const content = `
            <div class="status-change-modal">
                <div class="current-status">
                    <h4>Estado Actual:</h4>
                    <span class="badge badge-${this.getStatusClass(garment.status)}">
                        ${this.getStatusText(garment.status)}
                    </span>
                </div>
                
                <div class="new-status">
                    <h4>Cambiar a:</h4>
                    <div class="status-options">
                        ${statusOptions.map(option => `
                            <label class="status-option ${option.value === garment.status ? 'disabled' : ''}">
                                <input type="radio" 
                                       name="new-status" 
                                       value="${option.value}" 
                                       ${option.value === garment.status ? 'disabled' : ''}>
                                <span class="option-content">
                                    <span class="option-icon">${option.icon}</span>
                                    <span class="option-label">${option.label}</span>
                                </span>
                            </label>
                        `).join('')}
                    </div>
                </div>

                <div class="status-notes">
                    <label class="form-label">Notas del cambio de estado:</label>
                    <textarea id="status-notes" class="form-control" rows="3" 
                              placeholder="Observaciones, comentarios, etc."></textarea>
                </div>
            </div>
        `;

        const modal = app.showModal(`Cambiar Estado - ${garment.rfidCode}`, content);
        const modalFooter = modal.querySelector('.modal-footer');
        modalFooter.innerHTML = `
            <button class="btn btn-secondary" onclick="app.closeModal('dynamic-modal')">Cancelar</button>
            <button class="btn btn-primary" onclick="Control.confirmStatusChange(${garmentId})">Confirmar Cambio</button>
        `;
    }

    static confirmStatusChange(garmentId) {
        const selectedStatus = document.querySelector('input[name="new-status"]:checked');
        const notes = document.getElementById('status-notes').value;

        if (!selectedStatus) {
            app.showErrorMessage('Seleccione un nuevo estado');
            return;
        }

        const garment = Storage.getGarmentById(garmentId);
        const oldStatus = garment.status;
        const newStatus = selectedStatus.value;

        // Actualizar estado de la prenda
        const updateData = { 
            status: newStatus,
            lastUpdated: new Date().toISOString()
        };

        // Agregar timestamp específico según el estado
        if (newStatus === 'en_proceso' && oldStatus === 'recibido') {
            updateData.processedAt = new Date().toISOString();
        } else if (newStatus === 'listo' && oldStatus === 'en_proceso') {
            updateData.readyAt = new Date().toISOString();
        } else if (newStatus === 'entregado') {
            updateData.deliveredAt = new Date().toISOString();
        }

        Storage.updateGarment(garmentId, updateData);

        // Registrar en historial
        Storage.addHistoryEntry({
            clientId: garment.clientId,
            garmentIds: [garmentId],
            action: 'proceso',
            operator: app.currentUser?.username || 'sistema',
            details: `Estado cambiado de ${this.getStatusText(oldStatus)} a ${this.getStatusText(newStatus)}${notes ? ` - ${notes}` : ''}`
        });

        app.closeModal('dynamic-modal');
        app.showSuccessMessage(`Estado actualizado: ${garment.rfidCode} → ${this.getStatusText(newStatus)}`);
        this.refreshContent();
    }

    static viewDetails(garmentId) {
        const garment = Storage.getGarmentById(garmentId);
        if (!garment) return;

        const client = Storage.getClientById(garment.clientId);
        const history = Storage.getHistory().filter(h => 
            h.garmentIds && h.garmentIds.includes(garmentId)
        );

        const content = `
            <div class="garment-details">
                <div class="detail-header">
                    <h3>${garment.rfidCode}</h3>
                    <span class="badge badge-${this.getStatusClass(garment.status)}">
                        ${this.getStatusText(garment.status)}
                    </span>
                </div>

                <div class="detail-grid">
                    <div class="detail-section">
                        <h4>Información de la Prenda</h4>
                        <div class="detail-list">
                            <div class="detail-item">
                                <span class="label">Tipo:</span>
                                <span class="value">${garment.type}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Color:</span>
                                <span class="value">${garment.color}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Talla:</span>
                                <span class="value">${garment.size}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Condición:</span>
                                <span class="value">${garment.condition}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Prioridad:</span>
                                <span class="value badge badge-${this.getPriorityClass(garment.priority || 'normal')}">${this.getPriorityText(garment.priority || 'normal')}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4>Cliente</h4>
                        <div class="detail-list">
                            <div class="detail-item">
                                <span class="label">Nombre:</span>
                                <span class="value">${client ? client.name : 'No encontrado'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Cédula:</span>
                                <span class="value">${client ? client.cedula : 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">Teléfono:</span>
                                <span class="value">${client ? client.phone : 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4>Fechas</h4>
                        <div class="detail-list">
                            <div class="detail-item">
                                <span class="label">Recibida:</span>
                                <span class="value">${this.formatDateTime(garment.receivedAt)}</span>
                            </div>
                            ${garment.processedAt ? `
                                <div class="detail-item">
                                    <span class="label">Procesada:</span>
                                    <span class="value">${this.formatDateTime(garment.processedAt)}</span>
                                </div>
                            ` : ''}
                            ${garment.readyAt ? `
                                <div class="detail-item">
                                    <span class="label">Lista:</span>
                                    <span class="value">${this.formatDateTime(garment.readyAt)}</span>
                                </div>
                            ` : ''}
                            ${garment.deliveredAt ? `
                                <div class="detail-item">
                                    <span class="label">Entregada:</span>
                                    <span class="value">${this.formatDateTime(garment.deliveredAt)}</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    ${garment.notes || garment.receptionNotes ? `
                        <div class="detail-section full-width">
                            <h4>Notas</h4>
                            <div class="notes-content">
                                ${garment.receptionNotes ? `<p><strong>Recepción:</strong> ${garment.receptionNotes}</p>` : ''}
                                ${garment.notes ? `<p><strong>Especiales:</strong> ${garment.notes}</p>` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>

                ${history.length > 0 ? `
                    <div class="detail-section full-width">
                        <h4>Historial de Cambios</h4>
                        <div class="history-timeline">
                            ${history.map(entry => `
                                <div class="history-entry">
                                    <div class="entry-time">${this.formatDateTime(entry.timestamp)}</div>
                                    <div class="entry-details">${entry.details}</div>
                                    <div class="entry-operator">por ${entry.operator}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;

        const modal = app.showModal('Detalles de Prenda', content);
        modal.classList.add('wide-modal');
    }

    static editGarment(garmentId) {
        const garment = Storage.getGarmentById(garmentId);
        if (!garment) return;

        const content = `
            <form id="edit-garment-form">
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-group">
                            <label class="form-label">Código RFID</label>
                            <input type="text" class="form-control" value="${garment.rfidCode}" readonly>
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-group">
                            <label class="form-label">Estado</label>
                            <select name="status" class="form-control">
                                <option value="recibido" ${garment.status === 'recibido' ? 'selected' : ''}>Recibido</option>
                                <option value="en_proceso" ${garment.status === 'en_proceso' ? 'selected' : ''}>En Proceso</option>
                                <option value="listo" ${garment.status === 'listo' ? 'selected' : ''}>Listo</option>
                                <option value="entregado" ${garment.status === 'entregado' ? 'selected' : ''}>Entregado</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-col">
                        <div class="form-group">
                            <label class="form-label">Tipo</label>
                            <input type="text" name="type" class="form-control" value="${garment.type}">
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-group">
                            <label class="form-label">Color</label>
                            <input type="text" name="color" class="form-control" value="${garment.color}">
                        </div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-col">
                        <div class="form-group">
                            <label class="form-label">Talla</label>
                            <select name="size" class="form-control">
                                <option value="">Sin especificar</option>
                                <option value="XS" ${garment.size === 'XS' ? 'selected' : ''}>XS</option>
                                <option value="S" ${garment.size === 'S' ? 'selected' : ''}>S</option>
                                <option value="M" ${garment.size === 'M' ? 'selected' : ''}>M</option>
                                <option value="L" ${garment.size === 'L' ? 'selected' : ''}>L</option>
                                <option value="XL" ${garment.size === 'XL' ? 'selected' : ''}>XL</option>
                                <option value="XXL" ${garment.size === 'XXL' ? 'selected' : ''}>XXL</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-group">
                            <label class="form-label">Prioridad</label>
                            <select name="priority" class="form-control">
                                <option value="normal" ${(garment.priority || 'normal') === 'normal' ? 'selected' : ''}>Normal</option>
                                <option value="alta" ${garment.priority === 'alta' ? 'selected' : ''}>Alta</option>
                                <option value="urgente" ${garment.priority === 'urgente' ? 'selected' : ''}>Urgente</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Condición</label>
                    <select name="condition" class="form-control">
                        <option value="bueno" ${garment.condition === 'bueno' ? 'selected' : ''}>Bueno</option>
                        <option value="regular" ${garment.condition === 'regular' ? 'selected' : ''}>Regular</option>
                        <option value="delicado" ${garment.condition === 'delicado' ? 'selected' : ''}>Delicado</option>
                        <option value="manchado" ${garment.condition === 'manchado' ? 'selected' : ''}>Manchado</option>
                        <option value="roto" ${garment.condition === 'roto' ? 'selected' : ''}>Roto</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Notas</label>
                    <textarea name="notes" class="form-control" rows="3">${garment.notes || ''}</textarea>
                </div>
            </form>
        `;

        const modal = app.showModal('Editar Prenda', content);
        const modalFooter = modal.querySelector('.modal-footer');
        modalFooter.innerHTML = `
            <button class="btn btn-secondary" onclick="app.closeModal('dynamic-modal')">Cancelar</button>
            <button class="btn btn-primary" onclick="Control.saveGarmentEdit(${garmentId})">Guardar Cambios</button>
        `;
    }

    static saveGarmentEdit(garmentId) {
        const form = document.getElementById('edit-garment-form');
        const formData = new FormData(form);

        const updates = {
            status: formData.get('status'),
            type: formData.get('type'),
            color: formData.get('color'),
            size: formData.get('size'),
            priority: formData.get('priority'),
            condition: formData.get('condition'),
            notes: formData.get('notes')
        };

        const garment = Storage.getGarmentById(garmentId);
        Storage.updateGarment(garmentId, updates);

        // Registrar en historial
        Storage.addHistoryEntry({
            clientId: garment.clientId,
            garmentIds: [garmentId],
            action: 'proceso',
            operator: app.currentUser?.username || 'sistema',
            details: `Prenda editada: ${garment.rfidCode}`
        });

        app.closeModal('dynamic-modal');
        app.showSuccessMessage(`Prenda ${garment.rfidCode} actualizada correctamente`);
        this.refreshContent();
    }

    static addNote(garmentId) {
        const garment = Storage.getGarmentById(garmentId);
        if (!garment) return;

        const content = `
            <div class="add-note-modal">
                <div class="current-notes">
                    <h4>Notas Actuales:</h4>
                    <div class="notes-display">${garment.notes || 'Sin notas'}</div>
                </div>
                
                <div class="new-note">
                    <label class="form-label">Agregar Nueva Nota:</label>
                    <textarea id="new-note" class="form-control" rows="4" 
                              placeholder="Escriba su nota aquí..."></textarea>
                </div>
            </div>
        `;

        const modal = app.showModal(`Agregar Nota - ${garment.rfidCode}`, content);
        const modalFooter = modal.querySelector('.modal-footer');
        modalFooter.innerHTML = `
            <button class="btn btn-secondary" onclick="app.closeModal('dynamic-modal')">Cancelar</button>
            <button class="btn btn-primary" onclick="Control.saveNote(${garmentId})">Agregar Nota</button>
        `;
    }

    static saveNote(garmentId) {
        const newNote = document.getElementById('new-note').value.trim();
        if (!newNote) {
            app.showErrorMessage('Ingrese una nota');
            return;
        }

        const garment = Storage.getGarmentById(garmentId);
        const timestamp = new Date().toLocaleString('es-ES');
        const noteWithTimestamp = `[${timestamp}] ${newNote}`;
        
        const existingNotes = garment.notes || '';
        const updatedNotes = existingNotes ? `${existingNotes}\n\n${noteWithTimestamp}` : noteWithTimestamp;

        Storage.updateGarment(garmentId, { notes: updatedNotes });

        // Registrar en historial
        Storage.addHistoryEntry({
            clientId: garment.clientId,
            garmentIds: [garmentId],
            action: 'proceso',
            operator: app.currentUser?.username || 'sistema',
            details: `Nota agregada: ${newNote}`
        });

        app.closeModal('dynamic-modal');
        app.showSuccessMessage('Nota agregada correctamente');
        this.refreshContent();
    }

    static openBulkActions() {
        const selectedIds = this.getSelectedGarments();
        if (selectedIds.length === 0) {
            app.showWarningMessage('Seleccione al menos una prenda');
            return;
        }

        const content = `
            <div class="bulk-actions-modal">
                <div class="selection-info">
                    <h4>Prendas Seleccionadas: ${selectedIds.length}</h4>
                </div>
                
                <div class="bulk-options">
                    <h4>Acciones Disponibles:</h4>
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-block" onclick="Control.bulkChangeStatus()">
                            🔄 Cambiar Estado
                        </button>
                        <button class="btn btn-warning btn-block" onclick="Control.bulkChangePriority()">
                            ⚡ Cambiar Prioridad
                        </button>
                        <button class="btn btn-info btn-block" onclick="Control.bulkAddNote()">
                            📝 Agregar Nota
                        </button>
                        <button class="btn btn-success btn-block" onclick="Control.bulkExport()">
                            📊 Exportar Selección
                        </button>
                    </div>
                </div>
            </div>
        `;

        app.showModal('Acciones Masivas', content);
    }

    static bulkChangeStatus() {
        const selectedIds = this.getSelectedGarments();
        const content = `
            <div class="bulk-status-change">
                <p>Cambiar estado de ${selectedIds.length} prenda(s) seleccionada(s):</p>
                <div class="status-options">
                    <label><input type="radio" name="bulk-status" value="recibido"> 📥 Recibido</label>
                    <label><input type="radio" name="bulk-status" value="en_proceso"> ⚙️ En Proceso</label>
                    <label><input type="radio" name="bulk-status" value="listo"> ✅ Listo</label>
                    <label><input type="radio" name="bulk-status" value="entregado"> 📤 Entregado</label>
                </div>
                <textarea id="bulk-status-note" class="form-control mt-2" rows="3" 
                          placeholder="Nota del cambio (opcional)"></textarea>
            </div>
        `;

        const modal = app.showModal('Cambio Masivo de Estado', content);
        const modalFooter = modal.querySelector('.modal-footer');
        modalFooter.innerHTML = `
            <button class="btn btn-secondary" onclick="app.closeModal('dynamic-modal')">Cancelar</button>
            <button class="btn btn-primary" onclick="Control.executeBulkStatusChange()">Aplicar Cambios</button>
        `;
    }

    static executeBulkStatusChange() {
        const selectedIds = this.getSelectedGarments();
        const selectedStatus = document.querySelector('input[name="bulk-status"]:checked');
        const note = document.getElementById('bulk-status-note').value;

        if (!selectedStatus) {
            app.showErrorMessage('Seleccione un estado');
            return;
        }

        let updated = 0;
        selectedIds.forEach(id => {
            const garment = Storage.getGarmentById(id);
            if (garment && garment.status !== selectedStatus.value) {
                Storage.updateGarment(id, { 
                    status: selectedStatus.value,
                    lastUpdated: new Date().toISOString()
                });

                // Registrar en historial
                Storage.addHistoryEntry({
                    clientId: garment.clientId,
                    garmentIds: [id],
                    action: 'proceso',
                    operator: app.currentUser?.username || 'sistema',
                    details: `Estado cambiado a ${this.getStatusText(selectedStatus.value)} (masivo)${note ? ` - ${note}` : ''}`
                });

                updated++;
            }
        });

        app.closeModal('dynamic-modal');
        app.showSuccessMessage(`${updated} prenda(s) actualizada(s)`);
        this.refreshContent();
    }

    static exportList() {
        const garments = this.getFilteredGarments();
        const csv = this.generateGarmentsCSV(garments);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `control_prendas_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        app.showSuccessMessage('Lista exportada correctamente');
    }

    static generateGarmentsCSV(garments) {
        const headers = ['RFID', 'Cliente', 'Tipo', 'Color', 'Talla', 'Estado', 'Prioridad', 'Recibida', 'Días en Sistema'];
        
        const rows = garments.map(garment => {
            const client = Storage.getClientById(garment.clientId);
            const daysInSystem = Math.floor((new Date() - new Date(garment.receivedAt)) / (1000 * 60 * 60 * 24));
            
            return [
                garment.rfidCode,
                client ? client.name : 'Cliente no encontrado',
                garment.type,
                garment.color,
                garment.size || 'N/A',
                this.getStatusText(garment.status),
                this.getPriorityText(garment.priority || 'normal'),
                this.formatDate(garment.receivedAt),
                daysInSystem
            ];
        });

        return [headers, ...rows].map(row => 
            row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }

    // Métodos de arrastrar y soltar (Kanban)
    static dragStart(event) {
        event.dataTransfer.setData('text/plain', event.target.getAttribute('data-garment-id'));
    }

    static allowDrop(event) {
        event.preventDefault();
    }

    static dropGarment(event) {
        event.preventDefault();
        const garmentId = parseInt(event.dataTransfer.getData('text/plain'));
        const newStatus = event.currentTarget.closest('.kanban-column').getAttribute('data-status');
        
        const garment = Storage.getGarmentById(garmentId);
        if (garment && garment.status !== newStatus) {
            Storage.updateGarment(garmentId, { status: newStatus });
            
            // Registrar en historial
            Storage.addHistoryEntry({
                clientId: garment.clientId,
                garmentIds: [garmentId],
                action: 'proceso',
                operator: app.currentUser?.username || 'sistema',
                details: `Estado cambiado a ${this.getStatusText(newStatus)} (arrastrar y soltar)`
            });

            app.showSuccessMessage(`${garment.rfidCode} → ${this.getStatusText(newStatus)}`);
            this.refreshContent();
        }
    }

    // Métodos de utilidad
    static getFilteredGarments() {
        let garments = Storage.getGarments();

        // Filtrar por estado
        if (this.selectedStatus !== 'all') {
            garments = garments.filter(g => g.status === this.selectedStatus);
        }

        // Filtrar por cliente específico si está seleccionado
        if (this.selectedClientId) {
            garments = garments.filter(g => g.clientId === this.selectedClientId);
        }

        // Filtrar por búsqueda
        if (this.searchQuery) {
            const query = this.searchQuery.toLowerCase();
            garments = garments.filter(g => {
                const client = Storage.getClientById(g.clientId);
                return g.rfidCode.toLowerCase().includes(query) ||
                       g.type.toLowerCase().includes(query) ||
                       g.color.toLowerCase().includes(query) ||
                       (client && client.name.toLowerCase().includes(query)) ||
                       (client && client.cedula.includes(query));
            });
        }

        // Ordenar
        garments.sort((a, b) => {
            let valueA = a[this.sortBy];
            let valueB = b[this.sortBy];

            if (this.sortBy === 'receivedAt') {
                valueA = new Date(valueA);
                valueB = new Date(valueB);
            }

            if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }

            if (this.sortOrder === 'desc') {
                return valueA > valueB ? -1 : 1;
            } else {
                return valueA > valueB ? 1 : -1;
            }
        });

        return garments;
    }

    static isDelayed(garment) {
        const maxDays = 7; // Configurar según necesidades
        const daysInSystem = (new Date() - new Date(garment.receivedAt)) / (1000 * 60 * 60 * 24);
        return daysInSystem > maxDays && garment.status !== 'entregado';
    }

    static getProcessProgress(garment) {
        const daysInSystem = (new Date() - new Date(garment.receivedAt)) / (1000 * 60 * 60 * 24);
        const expectedDays = 5; // Días esperados de procesamiento
        return Math.min((daysInSystem / expectedDays) * 100, 100);
    }

    static groupGarmentsByDate(garments) {
        const grouped = {};
        garments.forEach(garment => {
            const date = new Date(garment.receivedAt).toDateString();
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(garment);
        });
        return grouped;
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

    static getStatusIcon(status) {
        const icons = {
            'recibido': '📥',
            'en_proceso': '⚙️',
            'listo': '✅',
            'entregado': '📤'
        };
        return icons[status] || '📦';
    }

    static getPriorityClass(priority) {
        const classes = {
            'normal': 'secondary',
            'alta': 'warning',
            'urgente': 'danger'
        };
        return classes[priority] || 'secondary';
    }

    static getPriorityText(priority) {
        const texts = {
            'normal': 'Normal',
            'alta': 'Alta',
            'urgente': 'Urgente'
        };
        return texts[priority] || 'Normal';
    }

    static getPriorityIcon(priority) {
        const icons = {
            'normal': '',
            'alta': '🔥',
            'urgente': '⚡'
        };
        return icons[priority] || '';
    }

    static formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-ES');
    }

    static formatTime(dateString) {
        return new Date(dateString).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }

    static formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('es-ES');
    }

    static formatDateFull(dateString) {
        return new Date(dateString).toLocaleDateString('es-ES', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    }

    static refreshContent() {
        const content = document.getElementById('control-content');
        if (content) {
            content.innerHTML = this.renderCurrentView();
        }

        // Actualizar estadísticas
        const statsContainer = document.querySelector('.control-stats');
        if (statsContainer) {
            statsContainer.innerHTML = this.renderQuickStats();
        }
    }

    static addControlStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .control-toolbar {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                flex-wrap: wrap;
                gap: 20px;
            }

            .toolbar-section {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .view-toggles {
                display: flex;
                gap: 5px;
            }

            .filters {
                display: flex;
                gap: 10px;
                align-items: center;
            }

            .control-stats {
                margin-bottom: 20px;
            }

            .stat-card {
                background: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                transition: transform 0.2s;
            }

            .stat-card:hover {
                transform: translateY(-2px);
            }

            .stat-card.warning { border-left: 4px solid #f39c12; }
            .stat-card.info { border-left: 4px solid #3498db; }
            .stat-card.success { border-left: 4px solid #27ae60; }

            .stat-number {
                font-size: 2.5em;
                font-weight: bold;
                color: #2c3e50;
                margin-bottom: 5px;
            }

            .stat-label {
                font-size: 1.1em;
                color: #7f8c8d;
                margin-bottom: 5px;
            }

            .stat-change {
                font-size: 0.9em;
                color: #95a5a6;
            }

            .garment-row.delayed {
                background-color: #fff5f5;
                border-left: 4px solid #e74c3c;
            }

            .rfid-code {
                font-family: monospace;
                font-weight: bold;
            }

            .priority-indicator {
                margin-left: 5px;
                font-size: 0.8em;
            }

            .client-info .client-name {
                font-weight: 500;
            }

            .client-info .client-id {
                font-size: 0.9em;
                color: #7f8c8d;
            }

            .garment-info .garment-type {
                font-weight: 500;
            }

            .garment-info .garment-details {
                font-size: 0.9em;
                color: #7f8c8d;
            }

            .status-cell .progress-bar {
                width: 100%;
                height: 4px;
                background: #ecf0f1;
                border-radius: 2px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background: #3498db;
                transition: width 0.3s;
            }

            .days-info.delayed {
                color: #e74c3c;
                font-weight: bold;
            }

            .delay-warning {
                margin-left: 5px;
            }

            .action-buttons {
                display: flex;
                gap: 3px;
            }

            .action-buttons .btn {
                padding: 4px 6px;
                font-size: 12px;
            }

            .table-actions {
                display: flex;
                gap: 10px;
                align-items: center;
            }

            /* Kanban Styles */
            .kanban-board {
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 20px;
                min-height: 400px;
            }

            .kanban-column {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 15px;
            }

            .column-header {
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 2px solid #dee2e6;
            }

            .column-title {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 1.1em;
                margin: 0;
            }

            .count {
                background: #6c757d;
                color: white;
                padding: 2px 6px;
                border-radius: 10px;
                font-size: 0.8em;
            }

            .column-content {
                min-height: 300px;
            }

            .kanban-card {
                background: white;
                border-radius: 6px;
                padding: 12px;
                margin-bottom: 10px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                cursor: move;
                transition: all 0.2s;
            }

            .kanban-card:hover {
                box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                transform: translateY(-1px);
            }

            .kanban-card .card-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }

            .kanban-card .rfid-code {
                font-size: 0.9em;
                font-family: monospace;
                font-weight: bold;
                color: #495057;
            }

            .kanban-card .garment-type {
                font-weight: 500;
                color: #212529;
            }

            .kanban-card .client-name {
                font-size: 0.9em;
                color: #6c757d;
                margin: 4px 0;
            }

            .kanban-card .card-meta {
                display: flex;
                justify-content: space-between;
                font-size: 0.8em;
                color: #868e96;
                margin-top: 8px;
            }

            .card-actions {
                display: flex;
                gap: 5px;
                margin-top: 8px;
            }

            .btn-xs {
                padding: 2px 6px;
                font-size: 11px;
            }

            /* Timeline Styles */
            .timeline-view {
                max-width: 800px;
                margin: 0 auto;
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

            .day-count {
                background: #6c757d;
                color: white;
                padding: 4px 12px;
                border-radius: 15px;
                font-size: 0.9em;
            }

            .day-timeline {
                position: relative;
                padding-left: 30px;
            }

            .day-timeline::before {
                content: '';
                position: absolute;
                left: 15px;
                top: 0;
                bottom: 0;
                width: 2px;
                background: #dee2e6;
            }

            .timeline-item {
                display: flex;
                margin-bottom: 20px;
                position: relative;
            }

            .timeline-marker {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                margin-right: 15px;
                margin-top: 5px;
                position: relative;
                z-index: 1;
            }

            .timeline-marker.recibido { background: #6c757d; }
            .timeline-marker.en_proceso { background: #f39c12; }
            .timeline-marker.listo { background: #27ae60; }
            .timeline-marker.entregado { background: #3498db; }

            .timeline-content {
                flex: 1;
                background: white;
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .item-header {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
            }

            .item-header .rfid {
                font-family: monospace;
                font-weight: bold;
            }

            .item-header .time {
                font-size: 0.9em;
                color: #6c757d;
            }

            .item-details {
                margin-bottom: 10px;
            }

            .garment-info {
                margin-bottom: 5px;
            }

            .item-history details {
                margin-top: 10px;
            }

            .item-history summary {
                cursor: pointer;
                font-weight: 500;
                color: #495057;
            }

            .item-history ul {
                margin: 10px 0 0 20px;
                font-size: 0.9em;
                color: #6c757d;
            }

            /* Modal Styles */
            .status-change-modal .current-status {
                margin-bottom: 20px;
                padding: 15px;
                background: #f8f9fa;
                border-radius: 6px;
            }

            .status-options {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                margin: 15px 0;
            }

            .status-option {
                display: flex;
                align-items: center;
                padding: 12px;
                border: 2px solid #dee2e6;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s;
            }

            .status-option:hover {
                border-color: #3498db;
                background: #f8f9fa;
            }

            .status-option.disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .status-option input[type="radio"] {
                margin-right: 10px;
            }

            .option-content {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .garment-details {
                max-width: 100%;
            }

            .detail-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #dee2e6;
            }

            .detail-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin-bottom: 20px;
            }

            .detail-section h4 {
                margin-bottom: 15px;
                color: #495057;
                border-bottom: 1px solid #dee2e6;
                padding-bottom: 8px;
            }

            .detail-section.full-width {
                grid-column: 1 / -1;
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

            .detail-item .label {
                font-weight: 500;
                color: #6c757d;
            }

            .detail-item .value {
                color: #495057;
            }

            .notes-content {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 6px;
                border-left: 4px solid #3498db;
            }

            .history-timeline .history-entry {
                margin-bottom: 15px;
                padding: 12px;
                background: #f8f9fa;
                border-radius: 6px;
                border-left: 4px solid #dee2e6;
            }

            .entry-time {
                font-size: 0.9em;
                color: #6c757d;
                margin-bottom: 5px;
            }

            .entry-details {
                font-weight: 500;
                margin-bottom: 3px;
            }

            .entry-operator {
                font-size: 0.8em;
                color: #868e96;
            }

            .wide-modal .modal-content {
                max-width: 90vw;
                width: 900px;
            }

            .bulk-actions-modal .selection-info {
                margin-bottom: 20px;
                padding: 15px;
                background: #e7f3ff;
                border-radius: 6px;
                text-align: center;
            }

            .bulk-options .action-buttons {
                display: grid;
                grid-template-columns: 1fr;
                gap: 10px;
                margin-top: 15px;
            }

            .bulk-status-change .status-options {
                display: grid;
                grid-template-columns: 1fr;
                gap: 8px;
                margin: 15px 0;
            }

            .bulk-status-change .status-options label {
                display: flex;
                align-items: center;
                padding: 10px;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                cursor: pointer;
            }

            .bulk-status-change .status-options label:hover {
                background: #f8f9fa;
            }

            .bulk-status-change .status-options input {
                margin-right: 10px;
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

            @media (max-width: 768px) {
                .control-toolbar {
                    flex-direction: column;
                    align-items: stretch;
                }

                .toolbar-section {
                    justify-content: center;
                }

                .filters {
                    flex-direction: column;
                    gap: 10px;
                }

                .kanban-board {
                    grid-template-columns: 1fr;
                }

                .detail-grid {
                    grid-template-columns: 1fr;
                }

                .status-options {
                    grid-template-columns: 1fr;
                }

                .action-buttons {
                    flex-wrap: wrap;
                }
            }
        `;
        
        if (!document.querySelector('#control-styles')) {
            style.id = 'control-styles';
            document.head.appendChild(style);
        }
    }
}

// Exponer la clase globalmente
window.Control = Control;