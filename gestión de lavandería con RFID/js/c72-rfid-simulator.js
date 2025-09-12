/**
 * Simulador C72 UHF RFID Reader
 * Simulación completa del lector RFID profesional C72
 */

class C72RFIDSimulator {
    static isActive = false;
    static currentRFIDCode = '';
    static scanHistory = [];
    static c72Connected = false;
    static scannedTags = [];

    static async render() {
        return `
            <div class="page-header">
                <h1>🔍 Simulador C72 UHF RFID Reader</h1>
                <p>Simulación del lector RFID profesional C72 para escaneo masivo</p>
            </div>

            <div class="rfid-simulator">
                <!-- Panel C72 RFID Reader -->
                <div class="card mb-3">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <h3 class="card-title">📡 C72 UHF RFID Reader</h3>
                            <div class="device-status">
                                <span class="badge badge-secondary" id="c72-connection-status">
                                    <i class="fas fa-circle"></i> Desconectado
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <!-- Información del Dispositivo -->
                        <div class="device-info-compact mb-3">
                            <small class="text-muted">
                                <strong>C72 UHF RFID</strong> | 
                                <span class="text-info">860-960 MHz</span> | 
                                <span class="text-success">15m alcance</span> | 
                                <span class="text-warning">Multi-tag/s</span>
                            </small>
                        </div>

                        <!-- Controles del C72 -->
                        <div class="row mb-3">
                            <div class="col-md-4">
                                <div class="form-group mb-2">
                                    <label for="batch-size" class="small">Tamaño del Lote</label>
                                    <select id="batch-size" class="form-control form-control-sm">
                                        <option value="10">10 prendas</option>
                                        <option value="15" selected>15 prendas</option>
                                        <option value="20">20 prendas</option>
                                        <option value="25">25 prendas</option>
                                        <option value="30">30 prendas</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group mb-2">
                                    <label for="scan-mode" class="small">Modo</label>
                                    <select id="scan-mode" class="form-control form-control-sm">
                                        <option value="batch" selected>Por Lotes</option>
                                        <option value="single">Individual</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="form-group mb-2">
                                    <label class="small">Estado</label>
                                    <div class="device-status-badge">
                                        <span class="badge badge-secondary" id="c72-status-badge">
                                            <i class="fas fa-circle"></i> Desconectado
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Botones de Control -->
                        <div class="form-actions-compact">
                            <button class="btn btn-success btn-sm" onclick="C72RFIDSimulator.connectC72()">
                                <i class="fas fa-plug"></i> Conectar
                            </button>
                            <button class="btn btn-primary btn-sm" onclick="C72RFIDSimulator.startBatchScan()">
                                <i class="fas fa-play"></i> Escanear Lote
                            </button>
                            <button class="btn btn-info btn-sm" onclick="C72RFIDSimulator.scanSingleTag()">
                                <i class="fas fa-search"></i> Individual
                            </button>
                            <button class="btn btn-warning btn-sm" onclick="C72RFIDSimulator.disconnectC72()">
                                <i class="fas fa-unlink"></i> Desconectar
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="C72RFIDSimulator.clearResults()">
                                <i class="fas fa-trash"></i> Limpiar
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Estado del Escaneo -->
                <div class="card mb-3">
                    <div class="card-header">
                        <h5 class="card-title mb-0">📊 Estado del Escaneo</h5>
                    </div>
                    <div class="card-body py-2">
                        <div id="c72-scan-status"></div>
                        <div id="c72-scan-progress"></div>
                        <div id="c72-scan-complete"></div>
                        <div id="c72-error"></div>
                    </div>
                </div>

                <!-- Tags Detectados -->
                <div class="card mb-3">
                    <div class="card-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <h5 class="card-title mb-0">🏷️ Tags RFID Detectados</h5>
                            <span class="badge badge-primary badge-sm" id="tags-count">0 tags</span>
                        </div>
                    </div>
                    <div class="card-body py-2">
                        <div id="c72-tags-list" class="tags-list-compact">
                            <p class="text-muted text-center small mb-0">No hay tags detectados</p>
                        </div>
                    </div>
                </div>

                <!-- Integración con Sistema -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">🔗 Integración con Sistema</h3>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="selected-client">Cliente</label>
                                    <select id="selected-client" class="form-control">
                                        <option value="">Seleccionar cliente</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-group">
                                    <label for="selected-batch">Lote</label>
                                    <select id="selected-batch" class="form-control">
                                        <option value="">Seleccionar lote</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button class="btn btn-success" onclick="C72RFIDSimulator.createGarmentsFromScan()">
                                <i class="fas fa-plus"></i> Crear Prendas desde Escaneo
                            </button>
                            <button class="btn btn-info" onclick="C72RFIDSimulator.addToBatch()">
                                <i class="fas fa-layer-group"></i> Agregar a Lote
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static init() {
        this.loadClients();
        this.loadBatches();
        console.log('🔍 Simulador C72 RFID inicializado');
    }

    // Conectar/Desconectar C72
    static connectC72() {
        this.c72Connected = true;
        this.showConnectionStatus('Conectado', 'success');
        console.log('🔌 C72 RFID Reader conectado');
    }

    static disconnectC72() {
        this.c72Connected = false;
        this.scannedTags = [];
        this.showConnectionStatus('Desconectado', 'error');
        console.log('🔌 C72 RFID Reader desconectado');
    }

    // Escaneo masivo de lotes
    static async startBatchScan() {
        if (!this.c72Connected) {
            this.showError('Dispositivo no conectado. Conecte el C72 primero.');
            return;
        }

        const batchSize = parseInt(document.getElementById('batch-size').value);
        this.scannedTags = [];
        this.clearTagsList();
        this.showScanningStatus(true, 'Escaneando lote...');

        // Simular lectura de múltiples tags RFID UHF
        for (let i = 1; i <= batchSize; i++) {
            const tag = {
                id: `E20000112213040000000${String(i).padStart(3, '0')}`,
                rssi: Math.floor(Math.random() * 20) + 60,
                timestamp: new Date().toISOString(),
                antenna: Math.floor(Math.random() * 4) + 1,
                frequency: 915.25 + (Math.random() * 0.5)
            };

            this.scannedTags.push(tag);
            this.updateScanProgress(i, batchSize);
            this.updateTagsCount();
            
            // Simular velocidad de lectura real
            await this.delay(100);
        }

        // Mostrar todos los tags detectados al final
        this.showAllDetectedTags();

        this.showScanningStatus(false);
        this.showScanComplete();
        this.updateTagsCount();
    }

    // Escaneo individual
    static async scanSingleTag() {
        if (!this.c72Connected) {
            this.showError('Dispositivo no conectado. Conecte el C72 primero.');
            return;
        }

        this.showScanningStatus(true, 'Escaneando...');
        await this.delay(500);
        
        const tag = {
            id: `E20000112213040000000${Math.floor(Math.random() * 999) + 1}`,
            rssi: Math.floor(Math.random() * 20) + 60,
            timestamp: new Date().toISOString(),
            antenna: 1,
            frequency: 915.25
        };

        this.scannedTags.push(tag);
        this.showScanningStatus(false);
        this.showTagDetected(tag);
        this.updateTagsCount();
    }

    // Mostrar estado de conexión
    static showConnectionStatus(message, type) {
        // Actualizar badge compacto en el header
        const badgeDiv = document.getElementById('c72-status-badge');
        if (badgeDiv) {
            badgeDiv.className = `badge badge-${type === 'success' ? 'success' : 'danger'}`;
            badgeDiv.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'times-circle'}"></i>
                ${message}
            `;
        }

        // Mostrar mensaje en la sección de estado del escaneo
        this.showStatusMessage(message, type);
    }

    // Mostrar mensaje de estado
    static showStatusMessage(message, type) {
        const statusDiv = document.getElementById('c72-scan-status');
        if (statusDiv) {
            statusDiv.innerHTML = `
                <div class="alert alert-${type === 'success' ? 'success' : 'danger'} alert-sm">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'times-circle'}"></i>
                    ${message}
                </div>
            `;
        }
    }

    // Mostrar estado de escaneo
    static showScanningStatus(isScanning, message = 'Escaneando...') {
        const statusDiv = document.getElementById('c72-scan-status');
        if (statusDiv) {
            if (isScanning) {
                statusDiv.innerHTML = `
                    <div class="alert alert-info alert-sm">
                        <i class="fas fa-sync-alt fa-spin"></i>
                        ${message}
                    </div>
                `;
            } else {
                statusDiv.innerHTML = '';
            }
        }
    }

    // Mostrar progreso del escaneo
    static updateScanProgress(current, total) {
        const progressDiv = document.getElementById('c72-scan-progress');
        if (progressDiv) {
            const percentage = Math.round((current / total) * 100);
            progressDiv.innerHTML = `
                <div class="progress-container mb-2">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <small class="text-muted">Progreso del escaneo</small>
                        <small class="text-primary"><strong>${current}/${total} tags</strong></small>
                    </div>
                    <div class="progress">
                        <div class="progress-bar" style="width: ${percentage}%"></div>
                    </div>
                </div>
            `;
        }
    }

    // Limpiar lista de tags
    static clearTagsList() {
        const tagsList = document.getElementById('c72-tags-list');
        if (tagsList) {
            tagsList.innerHTML = '<p class="text-muted text-center small mb-0">Escaneando tags...</p>';
        }
    }

    // Mostrar todos los tags detectados
    static showAllDetectedTags() {
        const tagsList = document.getElementById('c72-tags-list');
        if (tagsList && this.scannedTags.length > 0) {
            tagsList.innerHTML = '';
            
            this.scannedTags.forEach(tag => {
                const tagElement = document.createElement('div');
                tagElement.className = 'tag-item-compact mb-1 p-2 border rounded';
                tagElement.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong class="text-primary small">${tag.id}</strong>
                            <small class="text-muted d-block" style="font-size: 10px;">RSSI: ${tag.rssi}dB | Ant: ${tag.antenna} | ${new Date(tag.timestamp).toLocaleTimeString()}</small>
                        </div>
                        <span class="badge badge-success badge-sm">
                            <i class="fas fa-check"></i>
                        </span>
                    </div>
                `;
                tagsList.appendChild(tagElement);
            });
            
            tagsList.scrollTop = tagsList.scrollHeight;
        }
    }

    // Mostrar tag detectado individual (para escaneo individual)
    static showTagDetected(tag) {
        const tagsList = document.getElementById('c72-tags-list');
        if (tagsList) {
            // Limpiar mensaje inicial solo si es el primer tag
            if (tagsList.querySelector('.text-muted')) {
                tagsList.innerHTML = '';
            }

            const tagElement = document.createElement('div');
            tagElement.className = 'tag-item-compact mb-1 p-2 border rounded';
            tagElement.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong class="text-primary small">${tag.id}</strong>
                        <small class="text-muted d-block" style="font-size: 10px;">RSSI: ${tag.rssi}dB | Ant: ${tag.antenna} | ${new Date(tag.timestamp).toLocaleTimeString()}</small>
                    </div>
                    <span class="badge badge-success badge-sm">
                        <i class="fas fa-check"></i>
                    </span>
                </div>
            `;
            tagsList.appendChild(tagElement);
            tagsList.scrollTop = tagsList.scrollHeight;
        }
    }

    // Mostrar escaneo completado
    static showScanComplete() {
        const completeDiv = document.getElementById('c72-scan-complete');
        if (completeDiv) {
            completeDiv.innerHTML = `
                <div class="alert alert-success alert-sm">
                    <i class="fas fa-check-circle"></i>
                    <strong>Escaneo completado!</strong>
                    Se detectaron ${this.scannedTags.length} tags RFID
                </div>
                <div class="mt-3">
                    <button class="btn btn-primary btn-sm" onclick="C72RFIDSimulator.showCreateBatchForm()">
                        <i class="fas fa-save"></i> Crear Lote con Tags Escaneados
                    </button>
                </div>
            `;
        }
    }

    // Mostrar error
    static showError(message) {
        const errorDiv = document.getElementById('c72-error');
        if (errorDiv) {
            errorDiv.innerHTML = `
                <div class="alert alert-danger alert-sm">
                    <i class="fas fa-exclamation-triangle"></i>
                    ${message}
                </div>
            `;
        }
    }

    // Actualizar contador de tags
    static updateTagsCount() {
        const countElement = document.getElementById('tags-count');
        if (countElement) {
            countElement.textContent = `${this.scannedTags.length} tags`;
        }
    }

    // Mostrar formulario para crear lote
    static showCreateBatchForm() {
        if (this.scannedTags.length === 0) {
            this.showError('No hay tags escaneados para crear un lote.');
            return;
        }

        // Crear modal para el formulario con z-index alto para evitar conflictos
        const modalHtml = `
            <div class="modal fade" id="createBatchModal" tabindex="-1" style="z-index: 9999 !important;">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content" style="z-index: 10000 !important;">
                        <div class="modal-header" style="background: #007bff; color: white;">
                            <h5 class="modal-title">
                                <i class="fas fa-boxes"></i> Crear Lote con Tags Escaneados
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <h6 class="text-primary mb-3">
                                        <i class="fas fa-chart-bar"></i> Información del Escaneo
                                    </h6>
                                    <div class="alert alert-info mb-3">
                                        <div class="mb-2">
                                            <strong>Tags detectados:</strong>
                                            <span class="badge bg-primary ms-2">${this.scannedTags.length}</span>
                                        </div>
                                        <div class="mb-2">
                                            <strong>Primer tag:</strong><br>
                                            <small class="text-muted">${this.scannedTags[0]?.id}</small>
                                        </div>
                                        <div>
                                            <strong>Último tag:</strong><br>
                                            <small class="text-muted">${this.scannedTags[this.scannedTags.length - 1]?.id}</small>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <h6 class="text-primary mb-3">
                                        <i class="fas fa-edit"></i> Datos del Lote
                                    </h6>
                                    <form id="createBatchForm">
                                        <div class="mb-3">
                                            <label class="form-label">Cliente *</label>
                                            <select class="form-select" id="batchClient" required>
                                                <option value="">Seleccionar cliente</option>
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Descripción del lote</label>
                                            <input type="text" class="form-control" id="batchDescription" 
                                                   placeholder="Ej: Lote de camisas de oficina">
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Tipo de servicio</label>
                                            <select class="form-select" id="batchService">
                                                <option value="lavado">Lavado</option>
                                                <option value="lavado_planchado">Lavado + Planchado</option>
                                                <option value="planchado">Solo Planchado</option>
                                                <option value="limpieza_seca">Limpieza en Seco</option>
                                            </select>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">Fecha de entrega</label>
                                            <input type="date" class="form-control" id="batchDeliveryDate" 
                                                   value="${new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}">
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times"></i> Cancelar
                            </button>
                            <button type="button" class="btn btn-success" onclick="C72RFIDSimulator.createBatchFromTags()">
                                <i class="fas fa-save"></i> Crear Lote
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

        // Agregar modal al body
        document.body.insertAdjacentHTML('beforeend', modalHtml);

        // Cargar clientes
        this.loadClientsForBatch();

        // Mostrar modal
        const modal = new bootstrap.Modal(document.getElementById('createBatchModal'));
        modal.show();
    }

    // Cargar clientes para el formulario de lote
    static loadClientsForBatch() {
        const clientSelect = document.getElementById('batchClient');
        if (!clientSelect) return;

        const clients = Storage.getClients();
        clientSelect.innerHTML = '<option value="">Seleccionar cliente</option>';
        
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            clientSelect.appendChild(option);
        });
    }

    // Crear lote con los tags escaneados
    static createBatchFromTags() {
        const clientId = document.getElementById('batchClient').value;
        const description = document.getElementById('batchDescription').value;
        const service = document.getElementById('batchService').value;
        const deliveryDate = document.getElementById('batchDeliveryDate').value;

        if (!clientId) {
            this.showError('Debe seleccionar un cliente.');
            return;
        }

        // Crear prendas desde los tags RFID
        const garments = this.scannedTags.map((tag, index) => ({
            id: Storage.generateId(),
            rfidTag: tag.id,
            type: 'Prenda RFID',
            color: 'No especificado',
            brand: 'No especificado',
            size: 'No especificado',
            status: 'en_proceso',
            clientId: clientId,
            receivedDate: new Date().toISOString(),
            notes: `Prenda escaneada con RFID ${tag.id}`
        }));

        // Crear el lote
        const batch = {
            id: Storage.generateId(),
            number: Storage.generateBatchNumber(),
            clientId: clientId,
            description: description || `Lote RFID con ${this.scannedTags.length} prendas`,
            service: service,
            status: 'en_proceso',
            garmentCount: garments.length,
            garments: garments.map(g => g.id),
            receivedDate: new Date().toISOString(),
            estimatedDeliveryDate: deliveryDate,
            notes: `Lote creado desde escaneo RFID. Tags: ${this.scannedTags.map(t => t.id).join(', ')}`
        };

        // Guardar prendas en el storage
        garments.forEach(garment => {
            Storage.addGarment(garment);
        });

        // Guardar lote en el storage
        Storage.createBatch(batch);

        // Cerrar modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('createBatchModal'));
        if (modal) {
            modal.hide();
        }

        // Mostrar éxito
        this.showSuccess(`¡Lote creado exitosamente!<br>
            <strong>Número de lote:</strong> ${batch.number}<br>
            <strong>Prendas:</strong> ${garments.length}<br>
            <strong>Cliente:</strong> ${Storage.getClients().find(c => c.id === clientId)?.name}`);

        // Limpiar resultados
        setTimeout(() => {
            this.clearResults();
        }, 3000);
    }

    // Limpiar resultados
    static clearResults() {
        this.scannedTags = [];
        const tagsList = document.getElementById('c72-tags-list');
        if (tagsList) {
            tagsList.innerHTML = '<p class="text-muted text-center small mb-0">No hay tags detectados</p>';
        }
        
        const progressDiv = document.getElementById('c72-scan-progress');
        if (progressDiv) progressDiv.innerHTML = '';
        
        const completeDiv = document.getElementById('c72-scan-complete');
        if (completeDiv) completeDiv.innerHTML = '';
        
        const errorDiv = document.getElementById('c72-error');
        if (errorDiv) errorDiv.innerHTML = '';

        this.updateTagsCount();
    }

    // Cargar clientes para integración
    static loadClients() {
        const clientSelect = document.getElementById('selected-client');
        if (!clientSelect) return;

        const clients = Storage.getClients();
        clientSelect.innerHTML = '<option value="">Seleccionar cliente</option>';
        
        clients.forEach(client => {
            const option = document.createElement('option');
            option.value = client.id;
            option.textContent = client.name;
            clientSelect.appendChild(option);
        });
    }

    // Cargar lotes para integración
    static loadBatches() {
        const batchSelect = document.getElementById('selected-batch');
        if (!batchSelect) return;

        const batches = Storage.getBatches();
        batchSelect.innerHTML = '<option value="">Seleccionar lote</option>';
        
        batches.forEach(batch => {
            const option = document.createElement('option');
            option.value = batch.id;
            option.textContent = `${batch.batchNumber} - ${Storage.getClientById(batch.clientId)?.name || 'Cliente'}`;
            batchSelect.appendChild(option);
        });
    }

    // Crear prendas desde el escaneo
    static createGarmentsFromScan() {
        if (this.scannedTags.length === 0) {
            this.showError('No hay tags escaneados para crear prendas');
            return;
        }

        const clientId = document.getElementById('selected-client').value;
        if (!clientId) {
            this.showError('Seleccione un cliente');
            return;
        }

        const client = Storage.getClientById(parseInt(clientId));
        if (!client) {
            this.showError('Cliente no encontrado');
            return;
        }

        // Crear prendas para cada tag escaneado
        let createdCount = 0;
        this.scannedTags.forEach(tag => {
            const garment = {
                id: Storage.getNextGarmentId(),
                rfidCode: tag.id,
                clientId: parseInt(clientId),
                branchId: client.branchId,
                type: 'Prenda',
                color: 'Sin especificar',
                size: 'Sin especificar',
                status: 'recibido',
                receivedAt: new Date().toISOString(),
                processedAt: null,
                deliveredAt: null,
                notes: `Creada desde escaneo C72 - ${new Date().toLocaleString()}`,
                condition: 'bueno',
                timesProcessed: 0,
                serviceType: 'normal',
                priority: 'normal'
            };

            Storage.addGarment(garment);
            createdCount++;
        });

        // Mostrar resultado
        this.showSuccess(`Se crearon ${createdCount} prendas para ${client.name}`);
        
        // Limpiar escaneo
        this.clearResults();
        
        // Actualizar interfaz si estamos en la página de recepción
        if (window.receptionManager) {
            window.receptionManager.loadGarments();
        }
    }

    // Agregar tags a un lote existente
    static addToBatch() {
        if (this.scannedTags.length === 0) {
            this.showError('No hay tags escaneados para agregar al lote');
            return;
        }

        const batchId = document.getElementById('selected-batch').value;
        if (!batchId) {
            this.showError('Seleccione un lote');
            return;
        }

        // Crear prendas y agregar al lote
        this.createGarmentsFromScan();
        
        // Aquí se agregarían al lote específico
        this.showSuccess(`${this.scannedTags.length} prendas agregadas al lote`);
    }

    // Mostrar mensaje de éxito
    static showSuccess(message) {
        const successDiv = document.getElementById('c72-scan-complete');
        if (successDiv) {
            successDiv.innerHTML = `
                <div class="alert alert-success alert-sm">
                    <i class="fas fa-check-circle"></i>
                    ${message}
                </div>
            `;
        }
    }

    // Utilidad para delays
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Exponer globalmente
window.C72RFIDSimulator = C72RFIDSimulator;