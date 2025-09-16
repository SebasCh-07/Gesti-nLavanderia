/**
 * Módulo de Gestión de Lotes
 * Maneja la creación, edición y seguimiento de lotes de prendas
 */

class BatchManager {
    constructor() {
        this.currentBatch = null;
        this.selectedGarments = [];
        this.batchSizes = [10, 15, 20, 25, 30];
    }

    // ===== INICIALIZACIÓN =====

    init() {
        this.setupEventListeners();
        this.loadBatches();
    }

    setupEventListeners() {
        // Event listeners para modales de lotes
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-action="create-batch"]')) {
                this.showCreateBatchModal();
            }
            
            if (e.target.matches('[data-action="edit-batch"]')) {
                const batchId = parseInt(e.target.dataset.batchId);
                this.showEditBatchModal(batchId);
            }
            
            if (e.target.matches('[data-action="delete-batch"]')) {
                const batchId = parseInt(e.target.dataset.batchId);
                this.deleteBatch(batchId);
            }
            
            if (e.target.matches('[data-action="view-batch"]')) {
                const batchId = parseInt(e.target.dataset.batchId);
                this.showBatchDetailsModal(batchId);
            }
            
            if (e.target.matches('[data-action="add-garment-to-batch"]')) {
                const garmentId = parseInt(e.target.dataset.garmentId);
                this.showAddToBatchModal(garmentId);
            }
        });
    }

    // ===== CARGA DE DATOS =====

    loadBatches() {
        const batches = Storage.getBatches();
        this.renderBatchesTable(batches);
        this.updateBatchStats();
    }

    loadFilters() {
        // Cargar filtros para la página de lotes
        this.loadClientFilters();
        this.loadStatusFilters();
    }

    loadClientFilters() {
        const clientSelect = document.getElementById('batch-client-filter');
        if (!clientSelect) return;

        const clients = Storage.getClients();
        clientSelect.innerHTML = '<option value="">Todos los clientes</option>';
        
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            clientSelect.appendChild(option);
        });
    }

    loadStatusFilters() {
        const statusSelect = document.getElementById('batch-status-filter');
        if (!statusSelect) return;

        const statuses = [
            { value: '', text: 'Todos los estados' },
            { value: 'recibido', text: 'Recibido' },
            { value: 'en_proceso', text: 'En Proceso' },
            { value: 'listo', text: 'Listo' },
            { value: 'entregado', text: 'Entregado' }
        ];

        statusSelect.innerHTML = '';
        statuses.forEach(status => {
            const option = document.createElement('option');
            option.value = status.value;
            option.textContent = status.text;
            statusSelect.appendChild(option);
        });
    }

    clearFilters() {
        const clientFilter = document.getElementById('batch-client-filter');
        const statusFilter = document.getElementById('batch-status-filter');
        
        if (clientFilter) clientFilter.value = '';
        if (statusFilter) statusFilter.value = '';
        
        this.loadBatches();
    }

    updateBatchStats() {
        const stats = Storage.getStats();
        
        const totalElement = document.getElementById('total-batches');
        const completedElement = document.getElementById('completed-batches');
        const inProgressElement = document.getElementById('inprogress-batches');
        const emptyElement = document.getElementById('empty-batches');
        
        if (totalElement) totalElement.textContent = stats.totalBatches || 0;
        if (completedElement) completedElement.textContent = stats.completedBatches || 0;
        if (inProgressElement) inProgressElement.textContent = stats.inProgressBatches || 0;
        if (emptyElement) emptyElement.textContent = stats.emptyBatches || 0;
    }

    renderBatchesTable(batches) {
        const tbody = document.getElementById('batches-table-body');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (batches.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center text-muted">
                        No hay lotes registrados
                    </td>
                </tr>
            `;
            return;
        }

        batches.forEach(batch => {
            const client = Storage.getClientById(batch.clientId);
            const progress = Storage.getBatchProgress(batch.id);
            const statusBadge = this.getStatusBadge(batch.status);
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${batch.batchNumber}</td>
                <td>${client ? client.name : 'Cliente no encontrado'}</td>
                <td>${batch.totalGarments} / ${batch.expectedGarments}</td>
                <td>
                    <div class="progress" style="height: 8px;">
                        <div class="progress-bar" role="progressbar" 
                             style="width: ${progress.progress}%" 
                             aria-valuenow="${progress.progress}" 
                             aria-valuemin="0" aria-valuemax="100">
                        </div>
                    </div>
                    <small class="text-muted">${progress.progress}%</small>
                </td>
                <td>${statusBadge}</td>
                <td>${new Date(batch.createdAt).toLocaleDateString('es-ES')}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" 
                                data-action="view-batch" 
                                data-batch-id="${batch.id}"
                                title="Ver detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-outline-warning" 
                                data-action="edit-batch" 
                                data-batch-id="${batch.id}"
                                title="Editar lote">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" 
                                data-action="delete-batch" 
                                data-batch-id="${batch.id}"
                                title="Eliminar lote">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    updateBatchStats() {
        const batches = Storage.getBatches();
        const totalBatches = batches.length;
        const completedBatches = batches.filter(b => b.totalGarments >= b.expectedGarments).length;
        const inProgressBatches = batches.filter(b => b.totalGarments < b.expectedGarments && b.totalGarments > 0).length;
        const emptyBatches = batches.filter(b => b.totalGarments === 0).length;

        // Actualizar estadísticas en el dashboard si existe
        const statsContainer = document.getElementById('batch-stats');
        if (statsContainer) {
            statsContainer.innerHTML = `
                <div class="row">
                    <div class="col-md-3">
                        <div class="stat-card">
                            <h3>${totalBatches}</h3>
                            <p>Total Lotes</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <h3>${completedBatches}</h3>
                            <p>Completados</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <h3>${inProgressBatches}</h3>
                            <p>En Progreso</p>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="stat-card">
                            <h3>${emptyBatches}</h3>
                            <p>Vacios</p>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    // ===== MODALES =====

    showCreateBatchModal() {
        const clients = Storage.getClients();
        
        const modalHTML = `
            <div class="modal fade" id="createBatchModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">📦 Crear Nuevo Lote</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="createBatchForm">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Cliente</label>
                                            <select class="form-select" id="batchClientId" required>
                                                <option value="">Seleccionar cliente...</option>
                                                ${clients.map(client => 
                                                    `<option value="${client.id}">${client.name} (${client.cedula})</option>`
                                                ).join('')}
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Tamaño del Lote</label>
                                            <select class="form-select" id="batchSize" required>
                                                <option value="">Seleccionar tamaño...</option>
                                                ${this.batchSizes.map(size => 
                                                    `<option value="${size}">${size} prendas</option>`
                                                ).join('')}
                                                <option value="custom">Personalizado</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mb-3" id="customSizeContainer" style="display: none;">
                                    <label class="form-label">Cantidad Personalizada</label>
                                    <input type="number" class="form-control" id="customBatchSize" min="1" max="100">
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Nombre del Lote</label>
                                    <input type="text" class="form-control" id="batchName" 
                                           placeholder="Ej: Lote Lavado Normal - Cliente XYZ">
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Descripción</label>
                                    <textarea class="form-control" id="batchDescription" rows="3"
                                              placeholder="Descripción del lote..."></textarea>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Tipo de Servicio</label>
                                            <select class="form-select" id="batchServiceType">
                                                <option value="normal">Normal</option>
                                                <option value="delicado">Delicado</option>
                                                <option value="urgente">Urgente</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Prioridad</label>
                                            <select class="form-select" id="batchPriority">
                                                <option value="normal">Normal</option>
                                                <option value="alta">Alta</option>
                                                <option value="urgente">Urgente</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Notas</label>
                                    <textarea class="form-control" id="batchNotes" rows="2"
                                              placeholder="Notas adicionales..."></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="batchManager.createBatch()">
                                Crear Lote
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modal existente si existe
        const existingModal = document.getElementById('createBatchModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Agregar modal al DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('createBatchModal'));
        modal.show();

        // Event listener para tamaño personalizado
        document.getElementById('batchSize').addEventListener('change', (e) => {
            const customContainer = document.getElementById('customSizeContainer');
            if (e.target.value === 'custom') {
                customContainer.style.display = 'block';
            } else {
                customContainer.style.display = 'none';
            }
        });
    }

    showEditBatchModal(batchId) {
        const batch = Storage.getBatchById(batchId);
        if (!batch) {
            app.showErrorMessage('Lote no encontrado');
            return;
        }

        const client = Storage.getClientById(batch.clientId);
        
        const modalHTML = `
            <div class="modal fade" id="editBatchModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">✏️ Editar Lote: ${batch.batchNumber}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="editBatchForm">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Cliente</label>
                                            <input type="text" class="form-control" value="${client ? client.name : 'Cliente no encontrado'}" readonly>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="mb-3">
                                            <label class="form-label">Tamaño Esperado</label>
                                            <input type="number" class="form-control" id="editBatchSize" 
                                                   value="${batch.expectedGarments}" min="1" max="100">
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Nombre del Lote</label>
                                    <input type="text" class="form-control" id="editBatchName" 
                                           value="${batch.name || ''}">
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Descripción</label>
                                    <textarea class="form-control" id="editBatchDescription" rows="3">${batch.description || ''}</textarea>
                                </div>
                                
                                <div class="row">
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">Estado</label>
                                            <select class="form-select" id="editBatchStatus">
                                                <option value="recibido" ${batch.status === 'recibido' ? 'selected' : ''}>Recibido</option>
                                                <option value="en_proceso" ${batch.status === 'en_proceso' ? 'selected' : ''}>En Proceso</option>
                                                <option value="listo" ${batch.status === 'listo' ? 'selected' : ''}>Listo</option>
                                                <option value="entregado" ${batch.status === 'entregado' ? 'selected' : ''}>Entregado</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">Tipo de Servicio</label>
                                            <select class="form-select" id="editBatchServiceType">
                                                <option value="normal" ${batch.serviceType === 'normal' ? 'selected' : ''}>Normal</option>
                                                <option value="delicado" ${batch.serviceType === 'delicado' ? 'selected' : ''}>Delicado</option>
                                                <option value="urgente" ${batch.serviceType === 'urgente' ? 'selected' : ''}>Urgente</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-4">
                                        <div class="mb-3">
                                            <label class="form-label">Prioridad</label>
                                            <select class="form-select" id="editBatchPriority">
                                                <option value="normal" ${batch.priority === 'normal' ? 'selected' : ''}>Normal</option>
                                                <option value="alta" ${batch.priority === 'alta' ? 'selected' : ''}>Alta</option>
                                                <option value="urgente" ${batch.priority === 'urgente' ? 'selected' : ''}>Urgente</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="mb-3">
                                    <label class="form-label">Notas</label>
                                    <textarea class="form-control" id="editBatchNotes" rows="2">${batch.notes || ''}</textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="batchManager.updateBatch(${batchId})">
                                Actualizar Lote
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modal existente si existe
        const existingModal = document.getElementById('editBatchModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Agregar modal al DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('editBatchModal'));
        modal.show();
    }

    showBatchDetailsModal(batchId) {
        const batch = Storage.getBatchById(batchId);
        if (!batch) {
            app.showErrorMessage('Lote no encontrado');
            return;
        }

        const client = Storage.getClientById(batch.clientId);
        const garments = Storage.getGarments().filter(g => batch.garmentIds.includes(g.id));
        const progress = Storage.getBatchProgress(batch.id);

        const modalHTML = `
            <div class="modal fade" id="batchDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">📦 Detalles del Lote: ${batch.batchNumber}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-8">
                                    <div class="card">
                                        <div class="card-header">
                                            <h6>Información del Lote</h6>
                                        </div>
                                        <div class="card-body">
                                            <div class="row">
                                                <div class="col-md-6">
                                                    <p><strong>Cliente:</strong> ${client ? client.name : 'No encontrado'}</p>
                                                    <p><strong>Nombre:</strong> ${batch.name || 'Sin nombre'}</p>
                                                    <p><strong>Estado:</strong> ${this.getStatusBadge(batch.status)}</p>
                                                </div>
                                                <div class="col-md-6">
                                                    <p><strong>Progreso:</strong> ${batch.totalGarments} / ${batch.expectedGarments} prendas</p>
                                                    <p><strong>Creado:</strong> ${new Date(batch.createdAt).toLocaleString('es-ES')}</p>
                                                </div>
                                            </div>
                                            
                                            <div class="progress mb-3" style="height: 20px;">
                                                <div class="progress-bar" role="progressbar" 
                                                     style="width: ${progress.progress}%" 
                                                     aria-valuenow="${progress.progress}" 
                                                     aria-valuemin="0" aria-valuemax="100">
                                                    ${progress.progress}%
                                                </div>
                                            </div>
                                            
                                            ${batch.description ? `<p><strong>Descripción:</strong> ${batch.description}</p>` : ''}
                                            ${batch.notes ? `<p><strong>Notas:</strong> ${batch.notes}</p>` : ''}
                                        </div>
                                    </div>
                                    
                                    <div class="card mt-3">
                                        <div class="card-header">
                                            <h6>Prendas en el Lote (${garments.length})</h6>
                                        </div>
                                        <div class="card-body">
                                            ${garments.length === 0 ? 
                                                '<p class="text-muted">No hay prendas en este lote</p>' :
                                                `<div class="table-responsive">
                                                    <table class="table table-sm">
                                                        <thead>
                                                            <tr>
                                                                <th>RFID</th>
                                                                <th>Tipo</th>
                                                                <th>Color</th>
                                                                <th>Talla</th>
                                                                <th>Estado</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            ${garments.map(garment => `
                                                                <tr>
                                                                    <td>${garment.rfidCode}</td>
                                                                    <td>${garment.type}</td>
                                                                    <td>${garment.color}</td>
                                                                    <td>${garment.size}</td>
                                                                    <td>${this.getStatusBadge(garment.status)}</td>
                                                                </tr>
                                                            `).join('')}
                                                        </tbody>
                                                    </table>
                                                </div>`
                                            }
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="col-md-4">
                                    <div class="card">
                                        <div class="card-header">
                                            <h6>Acciones</h6>
                                        </div>
                                        <div class="card-body">
                                            <button class="btn btn-primary w-100 mb-2" 
                                                    onclick="batchManager.showAddGarmentsModal(${batchId})">
                                                <i class="fas fa-plus"></i> Agregar Prendas
                                            </button>
                                            
                                            <button class="btn btn-warning w-100 mb-2" 
                                                    onclick="batchManager.showEditBatchModal(${batchId})">
                                                <i class="fas fa-edit"></i> Editar Lote
                                            </button>
                                            
                                            <button class="btn btn-info w-100 mb-2" 
                                                    onclick="batchManager.generateBatchReport(${batchId})">
                                                <i class="fas fa-file-pdf"></i> Generar Reporte
                                            </button>
                                            
                                            <button class="btn btn-success w-100 mb-2" 
                                                    onclick="batchManager.completeBatch(${batchId})"
                                                    ${progress.isComplete ? '' : 'disabled'}>
                                                <i class="fas fa-check"></i> Completar Lote
                                            </button>
                                            
                                            <button class="btn btn-danger w-100" 
                                                    onclick="batchManager.deleteBatch(${batchId})">
                                                <i class="fas fa-trash"></i> Eliminar Lote
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modal existente si existe
        const existingModal = document.getElementById('batchDetailsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Agregar modal al DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('batchDetailsModal'));
        modal.show();
    }

    showAddGarmentsModal(batchId) {
        const batch = Storage.getBatchById(batchId);
        if (!batch) return;

        const availableGarments = Storage.getGarments().filter(g => 
            !g.batchId && g.clientId === batch.clientId && g.status === 'recibido'
        );

        const modalHTML = `
            <div class="modal fade" id="addGarmentsModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">➕ Agregar Prendas al Lote</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <p>Prendas disponibles del cliente para agregar al lote:</p>
                            
                            ${availableGarments.length === 0 ? 
                                '<p class="text-muted">No hay prendas disponibles para agregar a este lote</p>' :
                                `<div class="table-responsive">
                                    <table class="table table-sm">
                                        <thead>
                                            <tr>
                                                <th>Seleccionar</th>
                                                <th>RFID</th>
                                                <th>Tipo</th>
                                                <th>Color</th>
                                                <th>Talla</th>
                                                <th>Precio</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${availableGarments.map(garment => `
                                                <tr>
                                                    <td>
                                                        <input type="checkbox" class="form-check-input garment-checkbox" 
                                                               value="${garment.id}">
                                                    </td>
                                                    <td>${garment.rfidCode}</td>
                                                    <td>${garment.type}</td>
                                                    <td>${garment.color}</td>
                                                    <td>${garment.size}</td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                </div>`
                            }
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" 
                                    onclick="batchManager.addSelectedGarmentsToBatch(${batchId})"
                                    ${availableGarments.length === 0 ? 'disabled' : ''}>
                                Agregar Seleccionadas
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Remover modal existente si existe
        const existingModal = document.getElementById('addGarmentsModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Agregar modal al DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('addGarmentsModal'));
        modal.show();
    }

    // ===== OPERACIONES CRUD =====

    createBatch() {
        const form = document.getElementById('createBatchForm');
        const formData = new FormData(form);
        
        const clientId = document.getElementById('batchClientId').value;
        const batchSize = document.getElementById('batchSize').value;
        const customSize = document.getElementById('customBatchSize').value;
        const name = document.getElementById('batchName').value;
        const description = document.getElementById('batchDescription').value;
        const serviceType = document.getElementById('batchServiceType').value;
        const priority = document.getElementById('batchPriority').value;
        const notes = document.getElementById('batchNotes').value;

        if (!clientId || !batchSize) {
            app.showErrorMessage('Por favor complete todos los campos obligatorios');
            return;
        }

        const expectedGarments = batchSize === 'custom' ? parseInt(customSize) : parseInt(batchSize);
        
        if (expectedGarments < 1) {
            app.showErrorMessage('El tamaño del lote debe ser mayor a 0');
            return;
        }

        const batchData = {
            clientId: parseInt(clientId),
            branchId: app.getCurrentBranchId() || app.auth.getCurrentUser().branchId,
            name: name || `Lote de ${Storage.getClientById(clientId).name}`,
            description: description,
            expectedGarments: expectedGarments,
            serviceType: serviceType,
            priority: priority,
            notes: notes
        };

        const newBatch = Storage.createBatch(batchData);
        
        if (newBatch) {
            app.showSuccessMessage(`Lote ${newBatch.batchNumber} creado exitosamente`);
            this.loadBatches();
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('createBatchModal'));
            modal.hide();
        } else {
            app.showErrorMessage('Error al crear el lote');
        }
    }

    updateBatch(batchId) {
        const form = document.getElementById('editBatchForm');
        
        const expectedGarments = parseInt(document.getElementById('editBatchSize').value);
        const name = document.getElementById('editBatchName').value;
        const description = document.getElementById('editBatchDescription').value;
        const status = document.getElementById('editBatchStatus').value;
        const serviceType = document.getElementById('editBatchServiceType').value;
        const priority = document.getElementById('editBatchPriority').value;
        const notes = document.getElementById('editBatchNotes').value;

        if (expectedGarments < 1) {
            app.showErrorMessage('El tamaño del lote debe ser mayor a 0');
            return;
        }

        const updateData = {
            expectedGarments: expectedGarments,
            name: name,
            description: description,
            status: status,
            serviceType: serviceType,
            priority: priority,
            notes: notes
        };

        const updatedBatch = Storage.updateBatch(batchId, updateData);
        
        if (updatedBatch) {
            app.showSuccessMessage(`Lote ${updatedBatch.batchNumber} actualizado exitosamente`);
            this.loadBatches();
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editBatchModal'));
            modal.hide();
        } else {
            app.showErrorMessage('Error al actualizar el lote');
        }
    }

    deleteBatch(batchId) {
        const batch = Storage.getBatchById(batchId);
        if (!batch) {
            app.showErrorMessage('Lote no encontrado');
            return;
        }

        if (confirm(`¿Está seguro que desea eliminar el lote ${batch.batchNumber}?\n\nEsta acción no se puede deshacer.`)) {
            const success = Storage.deleteBatch(batchId);
            
            if (success) {
                app.showSuccessMessage(`Lote ${batch.batchNumber} eliminado exitosamente`);
                this.loadBatches();
            } else {
                app.showErrorMessage('Error al eliminar el lote');
            }
        }
    }

    addSelectedGarmentsToBatch(batchId) {
        const checkboxes = document.querySelectorAll('.garment-checkbox:checked');
        const garmentIds = Array.from(checkboxes).map(cb => parseInt(cb.value));
        
        if (garmentIds.length === 0) {
            app.showErrorMessage('Por favor seleccione al menos una prenda');
            return;
        }

        let addedCount = 0;
        garmentIds.forEach(garmentId => {
            if (Storage.addGarmentToBatch(batchId, garmentId)) {
                addedCount++;
            }
        });

        if (addedCount > 0) {
            app.showSuccessMessage(`${addedCount} prendas agregadas al lote exitosamente`);
            this.loadBatches();
            
            // Cerrar modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addGarmentsModal'));
            modal.hide();
        } else {
            app.showErrorMessage('Error al agregar las prendas al lote');
        }
    }

    completeBatch(batchId) {
        const batch = Storage.getBatchById(batchId);
        if (!batch) return;

        const updateData = {
            status: 'listo',
            processedAt: new Date().toISOString()
        };

        const updatedBatch = Storage.updateBatch(batchId, updateData);
        
        if (updatedBatch) {
            app.showSuccessMessage(`Lote ${updatedBatch.batchNumber} marcado como completado`);
            // Notificación flotante simulando envío de correo al cliente
            const client = Storage.getClientById(updatedBatch.clientId);
            const clientName = client?.name || 'cliente';
            app.showNotification(`Correo de lote listo enviado a ${clientName}`, 'info');
            this.loadBatches();
        } else {
            app.showErrorMessage('Error al completar el lote');
        }
    }

    // ===== UTILIDADES =====

    getStatusBadge(status) {
        const badges = {
            'recibido': '<span class="badge bg-primary">Recibido</span>',
            'en_proceso': '<span class="badge bg-warning">En Proceso</span>',
            'listo': '<span class="badge bg-success">Listo</span>',
            'entregado': '<span class="badge bg-info">Entregado</span>'
        };
        return badges[status] || '<span class="badge bg-secondary">Desconocido</span>';
    }

    generateBatchReport(batchId) {
        const batch = Storage.getBatchById(batchId);
        if (!batch) return;

        // Implementar generación de reporte
        app.showSuccessMessage('Funcionalidad de reporte en desarrollo');
    }
}

// Exponer la clase globalmente
window.BatchManager = BatchManager;
