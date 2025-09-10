/**
 * Módulo de gestión de clientes
 * Maneja lista, búsqueda, creación, edición y perfil de clientes
 */

class Clients {
    static currentClientId = null;
    static currentView = 'list'; // 'list', 'profile', 'edit', 'create'
    static searchQuery = '';
    static sortBy = 'name';
    static sortOrder = 'asc';

    static async render() {
        const params = Navigation.getPageParams('clients');
        
        if (params.selectedClient) {
            this.currentClientId = params.selectedClient;
            this.currentView = 'profile';
        }

        return `
            <div class="page-header">
                <h1>👥 Gestión de Clientes</h1>
                <p>Administra la base de datos de clientes</p>
            </div>

            <!-- Barra de navegación de clientes -->
            <div class="clients-nav card mb-2">
                <div class="nav-buttons">
                    <button class="btn ${this.currentView === 'list' ? 'btn-primary' : 'btn-secondary'}" 
                            onclick="Clients.showView('list')">
                        📋 Lista de Clientes
                    </button>
                    <button class="btn btn-success" onclick="Clients.showView('create')">
                        ➕ Nuevo Cliente
                    </button>
                    <button class="btn btn-info" onclick="Clients.exportClients()">
                        📊 Exportar
                    </button>
                    <button class="btn btn-warning" onclick="Clients.importClients()">
                        📥 Importar
                    </button>
                </div>
            </div>

            <!-- Contenido dinámico -->
            <div id="clients-content">
                ${this.renderCurrentView()}
            </div>
        `;
    }

    static renderCurrentView() {
        switch (this.currentView) {
            case 'list':
                return this.renderClientsList();
            case 'profile':
                return this.renderClientProfile();
            case 'edit':
                return this.renderClientForm(true);
            case 'create':
                return this.renderClientForm(false);
            default:
                return this.renderClientsList();
        }
    }

    static renderClientsList() {
        const clients = this.getFilteredClients();
        const totalClients = Storage.getClients().length;

        return `
            <div class="card">
                <div class="card-header">
                    <div class="clients-header">
                        <div>
                            <h3 class="card-title">Lista de Clientes (${clients.length})</h3>
                            <p class="card-subtitle">Total registrados: ${totalClients}</p>
                        </div>
                        <div class="clients-controls">
                            <!-- Búsqueda -->
                            <div class="search-box">
                                <input type="text" 
                                       id="client-search" 
                                       placeholder="Buscar por nombre, cédula, teléfono..." 
                                       value="${this.searchQuery}"
                                       class="form-control">
                                <button class="btn btn-secondary" onclick="Clients.clearSearch()">
                                    ✖️
                                </button>
                            </div>
                            
                            <!-- Ordenamiento -->
                            <select id="sort-select" class="form-control" onchange="Clients.changeSorting()">
                                <option value="name" ${this.sortBy === 'name' ? 'selected' : ''}>Nombre</option>
                                <option value="cedula" ${this.sortBy === 'cedula' ? 'selected' : ''}>Cédula</option>
                                <option value="totalServices" ${this.sortBy === 'totalServices' ? 'selected' : ''}>Servicios</option>
                                <option value="createdAt" ${this.sortBy === 'createdAt' ? 'selected' : ''}>Fecha registro</option>
                            </select>
                        </div>
                    </div>
                </div>

                ${clients.length === 0 ? this.renderEmptyState() : this.renderClientsTable(clients)}
            </div>
        `;
    }

    static renderClientsTable(clients) {
        return `
            <div class="table-container">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Contacto</th>
                            <th>Servicios</th>
                            <th>Última Actividad</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clients.map(client => this.renderClientRow(client)).join('')}
                    </tbody>
                </table>
            </div>
            
            <!-- Paginación (futuro) -->
            <div class="table-footer">
                <div class="table-info">
                    Mostrando ${clients.length} de ${Storage.getClients().length} clientes
                </div>
            </div>
        `;
    }

    static renderClientRow(client) {
        const lastActivity = this.getClientLastActivity(client.id);
        const clientGarments = Storage.getGarmentsByClient(client.id);
        const activeGarments = clientGarments.filter(g => g.status !== 'entregado').length;
        const totalServices = clientGarments.length; // Calcular servicios totales basado en prendas
        
        return `
            <tr class="client-row" data-client-id="${client.id}">
                <td>
                    <div class="client-info">
                        <div class="client-name">${client.name}</div>
                        <div class="client-details">📋 ${client.cedula}</div>
                    </div>
                </td>
                <td>
                    <div class="contact-info">
                        <div>📞 ${client.phone}</div>
                        <div>📧 ${client.email}</div>
                    </div>
                </td>
                <td>
                    <div class="services-info">
                        <div class="service-count">${totalServices}</div>
                        ${activeGarments > 0 ? `<div class="active-count">${activeGarments} activas</div>` : ''}
                    </div>
                </td>
                <td>
                    <div class="activity-info">
                        ${lastActivity ? this.formatDateTime(lastActivity) : 'Sin actividad'}
                    </div>
                </td>
                <td>
                    <span class="badge ${this.getClientStatusClass(client)}">
                        ${this.getClientStatusText(client)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary" onclick="Clients.viewClient(${client.id})" title="Ver perfil">
                            👁️
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="Clients.editClient(${client.id})" title="Editar">
                            ✏️
                        </button>
                        <button class="btn btn-sm btn-success" onclick="Clients.newService(${client.id})" title="Nuevo servicio">
                            ➕
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="Clients.deleteClient(${client.id})" title="Eliminar">
                            🗑️
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    static renderEmptyState() {
        if (this.searchQuery) {
            return `
                <div class="empty-state">
                    <div class="empty-icon">🔍</div>
                    <h3>No se encontraron resultados</h3>
                    <p>No hay clientes que coincidan con la búsqueda "${this.searchQuery}"</p>
                    <button class="btn btn-secondary" onclick="Clients.clearSearch()">
                        Limpiar búsqueda
                    </button>
                </div>
            `;
        } else {
            return `
                <div class="empty-state">
                    <div class="empty-icon">👥</div>
                    <h3>No hay clientes registrados</h3>
                    <p>Comienza registrando tu primer cliente</p>
                    <button class="btn btn-primary" onclick="Clients.showView('create')">
                        ➕ Registrar Cliente
                    </button>
                </div>
            `;
        }
    }

    static renderClientProfile() {
        const client = Storage.getClientById(this.currentClientId);
        if (!client) {
            return `
                <div class="alert alert-danger">
                    Cliente no encontrado
                </div>
            `;
        }

        const garments = Storage.getGarmentsByClient(client.id);
        const history = this.getClientHistory(client.id);
        const stats = this.getClientStats(client.id);

        return `
            <div class="client-profile">
                <!-- Header del perfil -->
                <div class="card mb-2">
                    <div class="profile-header">
                        <div class="profile-info">
                            <h2>👤 ${client.name}</h2>
                            <p class="text-muted">Cliente desde ${this.formatDate(client.createdAt)}</p>
                            <div class="profile-badges">
                                <span class="badge badge-info">${client.totalServices || 0} servicios</span>
                                <span class="badge ${this.getClientStatusClass(client)}">${this.getClientStatusText(client)}</span>
                            </div>
                        </div>
                        <div class="profile-actions">
                            <button class="btn btn-secondary" onclick="Clients.showView('list')">
                                ← Volver a la lista
                            </button>
                            <button class="btn btn-primary" onclick="Clients.editClient(${client.id})">
                                ✏️ Editar
                            </button>
                            <button class="btn btn-success" onclick="Clients.newService(${client.id})">
                                ➕ Nuevo Servicio
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Información del cliente y estadísticas -->
                <div class="grid grid-2 mb-2">
                    <!-- Datos personales -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Información Personal</h3>
                        </div>
                        <div class="client-details">
                            <div class="detail-item">
                                <span class="detail-label">Cédula:</span>
                                <span class="detail-value">${client.cedula}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Teléfono:</span>
                                <span class="detail-value">${client.phone}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Email:</span>
                                <span class="detail-value">${client.email}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Dirección:</span>
                                <span class="detail-value">${client.address}</span>
                            </div>
                            <div class="detail-item">
                                <span class="detail-label">Etiquetas RFID:</span>
                                <span class="detail-value">
                                    ${client.rfidTags && client.rfidTags.length > 0 
                                        ? client.rfidTags.map(tag => `<span class="badge badge-secondary">${tag}</span>`).join(' ')
                                        : 'Ninguna'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Estadísticas -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Estadísticas de Servicio</h3>
                        </div>
                        <div class="stats-grid">
                            <div class="stat-item">
                                <div class="stat-number">${stats.totalGarments}</div>
                                <div class="stat-label">Prendas Totales</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">${stats.activeGarments}</div>
                                <div class="stat-label">En Proceso</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">${stats.monthlyServices}</div>
                                <div class="stat-label">Este Mes</div>
                            </div>
                            <div class="stat-item">
                                <div class="stat-number">${stats.avgProcessTime}</div>
                                <div class="stat-label">Días Promedio</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Prendas activas y historial -->
                <div class="grid grid-2">
                    <!-- Prendas activas -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Prendas Actuales (${garments.filter(g => g.status !== 'entregado').length})</h3>
                        </div>
                        ${this.renderClientGarments(garments.filter(g => g.status !== 'entregado'))}
                    </div>

                    <!-- Historial reciente -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Historial Reciente</h3>
                        </div>
                        ${this.renderClientHistory(history.slice(0, 10))}
                    </div>
                </div>
            </div>
        `;
    }

    static renderClientGarments(garments) {
        if (garments.length === 0) {
            return `<div class="text-center p-2 text-muted">No hay prendas en proceso</div>`;
        }

        return `
            <div class="garments-list">
                ${garments.map(garment => `
                    <div class="garment-item">
                        <div class="garment-info">
                            <div class="garment-main">
                                <span class="garment-code">${garment.rfidCode}</span>
                                <span class="garment-type">${garment.type} ${garment.color}</span>
                            </div>
                            <div class="garment-meta">
                                <span class="badge badge-${Dashboard.getStatusClass(garment.status)}">
                                    ${Dashboard.getStatusText(garment.status)}
                                </span>
                                <span class="garment-date">${this.formatDate(garment.receivedAt)}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="text-center mt-2">
                <button class="btn btn-sm btn-secondary" onclick="Navigation.navigateTo('control', {clientId: ${this.currentClientId}})">
                    Ver todas en Control
                </button>
            </div>
        `;
    }

    static renderClientHistory(history) {
        if (history.length === 0) {
            return `<div class="text-center p-2 text-muted">No hay historial disponible</div>`;
        }

        return `
            <div class="history-list">
                ${history.map(entry => `
                    <div class="history-item">
                        <div class="history-icon">${Dashboard.getActivityIcon(entry.action)}</div>
                        <div class="history-content">
                            <div class="history-title">${entry.details}</div>
                            <div class="history-time">${this.formatDateTime(entry.timestamp)}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="text-center mt-2">
                <button class="btn btn-sm btn-secondary" onclick="Navigation.navigateTo('history', {clientId: ${this.currentClientId}})">
                    Ver historial completo
                </button>
            </div>
        `;
    }

    static renderClientForm(isEdit = false) {
        const client = isEdit ? Storage.getClientById(this.currentClientId) : null;
        const title = isEdit ? `Editar Cliente: ${client?.name}` : 'Nuevo Cliente';

        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">${title}</h3>
                    <p class="card-subtitle">${isEdit ? 'Modifica los datos del cliente' : 'Registra un nuevo cliente en el sistema'}</p>
                </div>
                
                <form id="client-form" onsubmit="Clients.saveClient(event, ${isEdit})">
                    <div class="form-row">
                        <div class="form-col">
                            <div class="form-group">
                                <label class="form-label">Nombre Completo *</label>
                                <input type="text" 
                                       name="name" 
                                       class="form-control" 
                                       value="${client?.name || ''}" 
                                       required
                                       placeholder="Ej: Juan Pérez">
                            </div>
                        </div>
                        <div class="form-col">
                            <div class="form-group">
                                <label class="form-label">Cédula *</label>
                                <input type="text" 
                                       name="cedula" 
                                       class="form-control" 
                                       value="${client?.cedula || ''}" 
                                       required
                                       placeholder="Ej: 12345678">
                            </div>
                        </div>
                    </div>

                    <div class="form-row">
                        <div class="form-col">
                            <div class="form-group">
                                <label class="form-label">Teléfono</label>
                                <input type="tel" 
                                       name="phone" 
                                       class="form-control" 
                                       value="${client?.phone || ''}" 
                                       placeholder="Ej: 555-0123">
                            </div>
                        </div>
                        <div class="form-col">
                            <div class="form-group">
                                <label class="form-label">Email</label>
                                <input type="email" 
                                       name="email" 
                                       class="form-control" 
                                       value="${client?.email || ''}" 
                                       placeholder="Ej: cliente@email.com">
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Dirección</label>
                        <textarea name="address" 
                                  class="form-control" 
                                  rows="3" 
                                  placeholder="Dirección completa del cliente">${client?.address || ''}</textarea>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Etiquetas RFID Asociadas</label>
                        <input type="text" 
                               name="rfidTags" 
                               class="form-control" 
                               value="${client?.rfidTags?.join(', ') || ''}" 
                               placeholder="Ej: RFID001, RFID002 (separadas por comas)">
                        <small class="text-muted">Códigos RFID de prendas permanentes del cliente</small>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="Clients.cancelForm()">
                            Cancelar
                        </button>
                        <button type="submit" class="btn btn-primary">
                            ${isEdit ? '💾 Guardar Cambios' : '➕ Crear Cliente'}
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    // Métodos de interacción
    static init() {
        this.setupEventListeners();
        this.addClientsStyles();
    }

    static setupEventListeners() {
        // Búsqueda en tiempo real
        document.addEventListener('input', (e) => {
            if (e.target.id === 'client-search') {
                this.searchQuery = e.target.value;
                this.debounceSearch();
            }
        });
    }

    static debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.refreshClientsList();
        }, 300);
    }

    static showView(view, clientId = null) {
        this.currentView = view;
        if (clientId) this.currentClientId = clientId;
        
        const content = document.getElementById('clients-content');
        if (content) {
            content.innerHTML = this.renderCurrentView();
        }
    }

    static viewClient(clientId) {
        this.currentClientId = clientId;
        this.showView('profile');
    }

    static editClient(clientId) {
        this.currentClientId = clientId;
        this.showView('edit');
    }

    static newService(clientId) {
        Navigation.navigateTo('reception', { selectedClient: clientId });
    }

    static async deleteClient(clientId) {
        const client = Storage.getClientById(clientId);
        if (!client) return;

        const activeGarments = Storage.getGarmentsByClient(clientId).filter(g => g.status !== 'entregado');
        
        if (activeGarments.length > 0) {
            app.showErrorMessage(`No se puede eliminar el cliente. Tiene ${activeGarments.length} prenda(s) en proceso.`);
            return;
        }

        const confirmed = confirm(`¿Está seguro que desea eliminar al cliente "${client.name}"?\n\nEsta acción no se puede deshacer.`);
        
        if (confirmed) {
            Storage.deleteClient(clientId);
            
            // Registrar en historial
            Storage.addHistoryEntry({
                clientId: clientId,
                action: 'cliente',
                operator: app.currentUser?.username || 'sistema',
                details: `Cliente "${client.name}" eliminado`
            });

            app.showSuccessMessage(`Cliente "${client.name}" eliminado correctamente`);
            this.refreshClientsList();
        }
    }

    static saveClient(event, isEdit = false) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const clientData = {
            name: formData.get('name').trim(),
            cedula: formData.get('cedula').trim(),
            phone: formData.get('phone').trim(),
            email: formData.get('email').trim(),
            address: formData.get('address').trim(),
            rfidTags: formData.get('rfidTags').split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        // Validaciones
        if (!clientData.name || !clientData.cedula) {
            app.showErrorMessage('Nombre y cédula son campos obligatorios');
            return;
        }

        // Verificar cédula única (excepto en edición del mismo cliente)
        const existingClient = Storage.getClients().find(c => 
            c.cedula === clientData.cedula && (!isEdit || c.id !== this.currentClientId)
        );
        
        if (existingClient) {
            app.showErrorMessage(`Ya existe un cliente con la cédula ${clientData.cedula}`);
            return;
        }

        try {
            let client;
            
            if (isEdit) {
                client = Storage.updateClient(this.currentClientId, clientData);
                app.showSuccessMessage(`Cliente "${client.name}" actualizado correctamente`);
                
                // Registrar en historial
                Storage.addHistoryEntry({
                    clientId: client.id,
                    action: 'cliente',
                    operator: app.currentUser?.username || 'sistema',
                    details: `Datos del cliente actualizados`
                });
                
                this.viewClient(client.id);
            } else {
                client = Storage.addClient(clientData);
                app.showSuccessMessage(`Cliente "${client.name}" registrado correctamente`);
                
                // Registrar en historial
                Storage.addHistoryEntry({
                    clientId: client.id,
                    action: 'cliente',
                    operator: app.currentUser?.username || 'sistema',
                    details: `Nuevo cliente registrado`
                });
                
                this.showView('list');
            }
            
        } catch (error) {
            console.error('Error guardando cliente:', error);
            app.showErrorMessage('Error guardando el cliente. Intente nuevamente.');
        }
    }

    static cancelForm() {
        if (this.currentClientId) {
            this.viewClient(this.currentClientId);
        } else {
            this.showView('list');
        }
    }

    static clearSearch() {
        this.searchQuery = '';
        document.getElementById('client-search').value = '';
        this.refreshClientsList();
    }

    static changeSorting() {
        const select = document.getElementById('sort-select');
        this.sortBy = select.value;
        this.refreshClientsList();
    }

    static refreshClientsList() {
        if (this.currentView === 'list') {
            const content = document.getElementById('clients-content');
            if (content) {
                content.innerHTML = this.renderClientsList();
            }
        }
    }

    static getFilteredClients() {
        let clients = Storage.getClients();
        
        // Aplicar búsqueda
        if (this.searchQuery) {
            clients = Storage.searchClients(this.searchQuery);
        }
        
        // Aplicar ordenamiento
        clients.sort((a, b) => {
            let valueA = a[this.sortBy];
            let valueB = b[this.sortBy];
            
            if (this.sortBy === 'createdAt') {
                valueA = new Date(valueA);
                valueB = new Date(valueB);
            }
            
            if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }
            
            if (this.sortOrder === 'asc') {
                return valueA > valueB ? 1 : -1;
            } else {
                return valueA < valueB ? 1 : -1;
            }
        });
        
        return clients;
    }

    static getClientLastActivity(clientId) {
        const history = Storage.getHistory();
        const clientActivity = history.find(entry => entry.clientId === clientId);
        return clientActivity ? clientActivity.timestamp : null;
    }

    static getClientStatusClass(client) {
        const activeGarments = Storage.getGarmentsByClient(client.id).filter(g => g.status !== 'entregado').length;
        if (activeGarments > 0) return 'badge-warning';
        if (client.totalServices > 0) return 'badge-success';
        return 'badge-secondary';
    }

    static getClientStatusText(client) {
        const activeGarments = Storage.getGarmentsByClient(client.id).filter(g => g.status !== 'entregado').length;
        if (activeGarments > 0) return 'Activo';
        if (client.totalServices > 0) return 'Registrado';
        return 'Nuevo';
    }

    static getClientHistory(clientId) {
        return Storage.getHistory().filter(entry => entry.clientId === clientId);
    }

    static getClientStats(clientId) {
        const garments = Storage.getGarmentsByClient(clientId);
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const monthlyGarments = garments.filter(g => new Date(g.receivedAt) >= thisMonth);
        const deliveredGarments = garments.filter(g => g.status === 'entregado' && g.deliveredAt);
        
        let avgProcessTime = 0;
        if (deliveredGarments.length > 0) {
            const totalDays = deliveredGarments.reduce((sum, garment) => {
                const received = new Date(garment.receivedAt);
                const delivered = new Date(garment.deliveredAt);
                return sum + ((delivered - received) / (1000 * 60 * 60 * 24));
            }, 0);
            avgProcessTime = Math.round(totalDays / deliveredGarments.length);
        }

        return {
            totalGarments: garments.length,
            activeGarments: garments.filter(g => g.status !== 'entregado').length,
            monthlyServices: monthlyGarments.length,
            avgProcessTime: avgProcessTime
        };
    }

    static exportClients() {
        try {
            const clients = Storage.getClients();
            const csv = this.generateCSV(clients);
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `clientes_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
            
            app.showSuccessMessage('Lista de clientes exportada correctamente');
        } catch (error) {
            console.error('Error exportando clientes:', error);
            app.showErrorMessage('Error al exportar la lista de clientes');
        }
    }

    static generateCSV(clients) {
        const headers = ['Nombre', 'Cédula', 'Teléfono', 'Email', 'Dirección', 'Servicios', 'Fecha Registro'];
        const rows = clients.map(client => [
            client.name,
            client.cedula,
            client.phone,
            client.email,
            client.address,
            client.totalServices || 0,
            this.formatDate(client.createdAt)
        ]);
        
        return [headers, ...rows].map(row => 
            row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',')
        ).join('\n');
    }

    static importClients() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        this.processImportedCSV(e.target.result);
                    } catch (error) {
                        console.error('Error importando:', error);
                        app.showErrorMessage('Error procesando el archivo CSV');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    static processImportedCSV(csvText) {
        const lines = csvText.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            app.showErrorMessage('El archivo CSV debe contener al menos una fila de datos');
            return;
        }

        const imported = [];
        const errors = [];

        // Saltar la primera línea (headers)
        for (let i = 1; i < lines.length; i++) {
            try {
                const fields = this.parseCSVLine(lines[i]);
                if (fields.length >= 2 && fields[0] && fields[1]) {
                    const clientData = {
                        name: fields[0],
                        cedula: fields[1],
                        phone: fields[2] || '',
                        email: fields[3] || '',
                        address: fields[4] || ''
                    };
                    
                    // Verificar si ya existe
                    const existing = Storage.getClients().find(c => c.cedula === clientData.cedula);
                    if (!existing) {
                        Storage.addClient(clientData);
                        imported.push(clientData.name);
                    } else {
                        errors.push(`Cliente con cédula ${clientData.cedula} ya existe`);
                    }
                }
            } catch (error) {
                errors.push(`Error en línea ${i + 1}: ${error.message}`);
            }
        }

        if (imported.length > 0) {
            app.showSuccessMessage(`${imported.length} cliente(s) importados correctamente`);
            this.refreshClientsList();
        }

        if (errors.length > 0) {
            app.showWarningMessage(`${errors.length} error(es) durante la importación. Revisar consola para detalles.`);
            console.warn('Errores de importación:', errors);
        }
    }

    static parseCSVLine(line) {
        const fields = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"' && (i === 0 || line[i-1] === ',')) {
                inQuotes = true;
            } else if (char === '"' && inQuotes && (i === line.length - 1 || line[i+1] === ',')) {
                inQuotes = false;
            } else if (char === ',' && !inQuotes) {
                fields.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        fields.push(current.trim());
        
        return fields.map(field => field.replace(/^"|"$/g, '').replace(/""/g, '"'));
    }

    // Utilidades de formato
    static formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('es-ES');
    }

    static formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('es-ES');
    }

    static addClientsStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .clients-nav {
                padding: 20px;
                margin-bottom: 20px;
            }
            .nav-buttons {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }
            .clients-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 20px;
            }
            .clients-controls {
                display: flex;
                gap: 15px;
                align-items: center;
            }
            .search-box {
                display: flex;
                gap: 5px;
                min-width: 300px;
            }
            .search-box input {
                flex: 1;
            }
            .client-row:hover {
                background-color: #f8fafc;
            }
            .client-info .client-name {
                font-weight: 500;
                color: #2d3748;
            }
            .client-info .client-details {
                font-size: 14px;
                color: #718096;
            }
            .contact-info div {
                font-size: 14px;
                color: #4a5568;
                margin: 2px 0;
            }
            .service-count {
                font-size: 16px;
                font-weight: 600;
                color: #2d3748;
                margin-bottom: 2px;
            }
            .active-count {
                font-size: 12px;
                color: #f6ad55;
                font-weight: 500;
            }
            .action-buttons {
                display: flex;
                gap: 5px;
            }
            .action-buttons .btn {
                padding: 6px 8px;
                font-size: 12px;
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
            .profile-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                padding: 30px;
            }
            .profile-badges .badge {
                margin-right: 10px;
            }
            .profile-actions {
                display: flex;
                gap: 10px;
            }
            .client-details .detail-item {
                display: flex;
                justify-content: space-between;
                padding: 12px 0;
                border-bottom: 1px solid #f1f5f9;
            }
            .detail-item:last-child {
                border-bottom: none;
            }
            .detail-label {
                font-weight: 500;
                color: #4a5568;
            }
            .detail-value {
                color: #2d3748;
            }
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                padding: 20px 0;
            }
            .stat-item {
                text-align: center;
            }
            .stat-number {
                font-size: 2rem;
                font-weight: bold;
                color: #667eea;
            }
            .stat-label {
                font-size: 14px;
                color: #718096;
                margin-top: 5px;
            }
            .garments-list .garment-item {
                padding: 12px 0;
                border-bottom: 1px solid #f1f5f9;
            }
            .garment-item:last-child {
                border-bottom: none;
            }
            .garment-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }
            .garment-code {
                font-weight: 500;
                color: #667eea;
                margin-right: 10px;
            }
            .garment-type {
                color: #2d3748;
            }
            .garment-meta {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .garment-date {
                font-size: 12px;
                color: #718096;
            }
            .history-list .history-item {
                display: flex;
                padding: 10px 0;
                border-bottom: 1px solid #f1f5f9;
            }
            .history-item:last-child {
                border-bottom: none;
            }
            .history-icon {
                font-size: 18px;
                margin-right: 12px;
            }
            .history-content {
                flex: 1;
            }
            .history-title {
                font-size: 14px;
                color: #2d3748;
            }
            .history-time {
                font-size: 12px;
                color: #718096;
            }
            .form-actions {
                display: flex;
                gap: 15px;
                justify-content: flex-end;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
            }
            @media (max-width: 768px) {
                .clients-header {
                    flex-direction: column;
                    gap: 15px;
                }
                .clients-controls {
                    width: 100%;
                    flex-direction: column;
                }
                .search-box {
                    min-width: auto;
                    width: 100%;
                }
                .profile-header {
                    flex-direction: column;
                    gap: 20px;
                }
                .profile-actions {
                    width: 100%;
                    justify-content: stretch;
                }
                .profile-actions .btn {
                    flex: 1;
                }
                .stats-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        if (!document.querySelector('#clients-styles')) {
            style.id = 'clients-styles';
            document.head.appendChild(style);
        }
    }
}

// Exponer la clase globalmente
window.Clients = Clients;


