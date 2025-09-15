/**
 * Módulo de recepción de prendas
 * Maneja el ingreso de prendas con códigos RFID simulados
 */

class Reception {
    static currentStep = 1; // 1: Cliente, 2: Prendas, 3: Confirmación
    static selectedClient = null;
    static scannedGarments = [];
    static currentGuide = null;

    static async render() {
        const params = Navigation.getPageParams('reception');
        console.log('Parámetros recibidos en reception:', params);
        
        // Restaurar estado desde sessionStorage si no hay cliente seleccionado
        if (!this.selectedClient) {
            const savedClientId = sessionStorage.getItem('reception_selected_client_id');
            const savedGarments = sessionStorage.getItem('reception_scanned_garments');
            
            if (savedClientId) {
                this.selectedClient = Storage.getClientById(parseInt(savedClientId));
                console.log('Cliente restaurado desde sessionStorage:', this.selectedClient?.name);
            }
            
            if (savedGarments) {
                try {
                    this.scannedGarments = JSON.parse(savedGarments);
                    console.log('Prendas restauradas desde sessionStorage:', this.scannedGarments.length);
                } catch (error) {
                    console.error('Error restaurando prendas:', error);
                    this.scannedGarments = [];
                }
            }
        }
        
        // Establecer cliente si viene como parámetro (solo si no hay cliente ya seleccionado)
        if (params.selectedClient && !this.selectedClient) {
            this.selectedClient = Storage.getClientById(params.selectedClient);
            console.log('Cliente seleccionado desde parámetros:', this.selectedClient?.name, 'ID:', params.selectedClient);
            
            // Guardar en sessionStorage
            sessionStorage.setItem('reception_selected_client_id', this.selectedClient.id.toString());
            
            // Si no hay prendas escaneadas, ir al paso 2
            if (this.scannedGarments.length === 0) {
                this.currentStep = 2;
                console.log('Navegando al paso 2 - Registro de prendas');
            }
        } else if (!params.selectedClient && !this.selectedClient) {
            console.log('No hay parámetros de cliente seleccionado');
        } else {
            console.log('Cliente ya seleccionado:', this.selectedClient?.name);
        }
        
        console.log('Estado final - Cliente:', this.selectedClient?.name, 'Paso:', this.currentStep, 'Prendas:', this.scannedGarments.length);

        // Si viene de nuevo servicio y hay cliente, saltar al paso 2 (escaneo)
        if (this.selectedClient && params.jumpToScan) {
            this.currentStep = 2;
        }

        return `
            <div class="page-header">
                <h1>📥 Recepción de Prendas</h1>
                <p>Registro de prendas con tecnología RFID</p>
            </div>

            <!-- Indicador de pasos -->
            <div class="steps-indicator card mb-2">
                <div class="steps">
                    <div class="step ${this.currentStep >= 1 ? 'active' : ''} ${this.currentStep > 1 ? 'completed' : ''}">
                        <div class="step-number">1</div>
                        <div class="step-label">Cliente</div>
                    </div>
                    <div class="step ${this.currentStep >= 2 ? 'active' : ''} ${this.currentStep > 2 ? 'completed' : ''}">
                        <div class="step-number">2</div>
                        <div class="step-label">Prendas</div>
                    </div>
                    <div class="step ${this.currentStep >= 3 ? 'active' : ''}">
                        <div class="step-number">3</div>
                        <div class="step-label">Confirmación</div>
                    </div>
                </div>
            </div>

            <!-- Contenido del paso actual -->
            <div id="reception-content">
                ${this.renderCurrentStep()}
            </div>
        `;
    }

    static renderCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return this.renderClientSelection();
            case 2:
                return this.renderGarmentScanning();
            case 3:
                return this.renderConfirmation();
            default:
                return this.renderClientSelection();
        }
    }

    static renderClientSelection() {
        const clients = Storage.getClients();
        const recentClients = clients
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        return `
            <div class="grid grid-2">
                <!-- Búsqueda de cliente -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Seleccionar Cliente</h3>
                        <p class="card-subtitle">Busca o selecciona el cliente para la recepción</p>
                    </div>
                    
                    <div class="client-search-section">
                        <div class="search-input-group">
                            <input type="text" 
                                   id="client-search-input" 
                                   class="form-control" 
                                   placeholder="Buscar por nombre, cédula o teléfono..."
                                   onkeyup="Reception.searchClients(this.value)">
                            <button class="btn btn-secondary" onclick="Reception.scanClientRFID()">
                                🔍 Escanear RFID
                            </button>
                        </div>
                        
                        <div id="search-results" class="search-results">
                            <!-- Resultados de búsqueda aparecerán aquí -->
                        </div>
                    </div>
                </div>

                <!-- Clientes recientes y nuevo cliente -->
                <div>
                    <div class="card mb-2">
                        <div class="card-header">
                            <h3 class="card-title">Clientes Recientes</h3>
                            <p class="card-subtitle">Acceso rápido a clientes frecuentes</p>
                        </div>
                        
                        <div class="recent-clients">
                            ${recentClients.length > 0 ? recentClients.map(client => `
                                <div class="client-quick-item" onclick="Reception.selectClient(${client.id})">
                                    <div class="client-info">
                                        <div class="client-name">${client.name}</div>
                                        <div class="client-details">${client.cedula} • ${client.phone}</div>
                                    </div>
                                    <div class="client-services">
                                        <span class="badge badge-info">${client.totalServices || 0} servicios</span>
                                    </div>
                                </div>
                            `).join('') : '<div class="text-center text-muted p-2">No hay clientes recientes</div>'}
                        </div>
                    </div>

                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Nuevo Cliente</h3>
                            <p class="card-subtitle">Registrar cliente por primera vez</p>
                        </div>
                        
                        <div class="text-center p-2">
                            <button class="btn btn-success btn-block" onclick="Reception.createNewClient()">
                                ➕ Registrar Nuevo Cliente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static renderGarmentScanning() {
        // Validar que tenemos un cliente seleccionado
        if (!this.selectedClient) {
            console.error('No hay cliente seleccionado en renderGarmentScanning');
            return this.renderClientSelection();
        }
        
        return `
            <div class="grid grid-2">
                <!-- Panel de escaneo -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Cliente Seleccionado</h3>
                        <div class="selected-client-info">
                            <div class="client-card">
                                <div class="client-details">
                                    <h4>${this.selectedClient.name}</h4>
                                    <p>📋 ${this.selectedClient.cedula}</p>
                                    <p>📞 ${this.selectedClient.phone}</p>
                                    <span class="badge badge-info">${this.selectedClient.totalServices || 0} servicios anteriores</span>
                                </div>
                                <button class="btn btn-sm btn-secondary" onclick="Reception.changeClient()">
                                    Cambiar
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Escáner RFID Integrado -->
                    <div class="scanner-section">
                        <!-- Modo C72 RFID -->
                        <div id="c72-scanner" class="scanner-interface">
                            <h4>📡 C72 UHF RFID Reader</h4>
                            
                            <!-- Estado del C72 -->
                            <div class="c72-status-section">
                                <div class="device-info-compact mb-3">
                                    <small class="text-muted">
                                        <strong>C72 UHF RFID</strong> | 
                                        <span class="text-info">860-960 MHz</span> | 
                                        <span class="text-success">15m alcance</span> | 
                                        <span class="text-warning">Multi-tag/s</span>
                                    </small>
                                </div>
                                
                                <div class="device-status">
                                    <span class="badge badge-secondary" id="c72-connection-status">
                                        <i class="fas fa-circle"></i> Desconectado
                                    </span>
                                </div>
                            </div>

                            <!-- Controles del C72 -->
                            <div class="c72-controls">
                                <div class="row mb-3">
                                    <div class="col-md-6">
                                        <div class="form-group mb-2">
                                            <label class="small">Tamaño del Lote</label>
                                            <div class="batch-size-display">
                                                <span class="badge badge-info" id="auto-batch-size">
                                                    <i class="fas fa-magic"></i> Detección Automática
                                                </span>
                                                <small class="text-muted d-block mt-1">Se detectará automáticamente al escanear</small>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
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
                                    <button class="btn btn-success btn-sm" onclick="Reception.connectC72()">
                                        <i class="fas fa-plug"></i> Conectar
                                    </button>
                                    <button class="btn btn-primary btn-sm" onclick="Reception.startBatchScan()">
                                        <i class="fas fa-play"></i> Escanear Lote
                                    </button>
                                    <button class="btn btn-info btn-sm" onclick="Reception.scanSingleTag()">
                                        <i class="fas fa-search"></i> Individual
                                    </button>
                                    <button class="btn btn-warning btn-sm" onclick="Reception.disconnectC72()">
                                        <i class="fas fa-unlink"></i> Desconectar
                                    </button>
                                </div>
                            </div>

                            <!-- Estado del Escaneo C72 -->
                            <div class="c72-scan-status" id="c72-scan-status-container">
                                <div id="c72-scan-status"></div>
                                <div id="c72-scan-progress"></div>
                                <div id="c72-scan-complete"></div>
                                <div id="c72-error"></div>
                            </div>

                            <!-- Tags Detectados -->
                            <div class="c72-tags-section">
                                <h6>🏷️ Tags Detectados: <span class="badge badge-primary badge-sm" id="tags-count">0 tags</span></h6>
                                <div id="c72-tags-list" class="tags-list-compact">
                                    <p class="text-muted text-center small mb-0">No hay tags detectados</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Lista de prendas escaneadas -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Prendas Escaneadas (${this.scannedGarments.length})</h3>
                        <p class="card-subtitle">Lista actual de prendas para recepción</p>
                    </div>

                    <div class="scanned-garments">
                        ${this.scannedGarments.length === 0 ? this.renderEmptyGarmentsList() : this.renderGarmentsList()}
                    </div>

                    ${this.scannedGarments.length > 0 ? `
                        <div class="garments-actions">
                            <button class="btn btn-danger btn-sm" onclick="Reception.clearAllGarments()">
                                🗑️ Limpiar Todo
                            </button>
                            <button class="btn btn-success" onclick="Reception.nextStep()">
                                ✅ Continuar (${this.scannedGarments.length} prendas)
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>

            <!-- Botones de navegación -->
            <div class="step-navigation">
                <button class="btn btn-secondary" onclick="Reception.previousStep()">
                    ← Volver al Cliente
                </button>
            </div>
        `;
    }

    static renderConfirmation() {
        const totalItems = this.scannedGarments.length;
        const estimatedTime = this.calculateEstimatedTime();
        
        console.log('Renderizando confirmación - Cliente:', this.selectedClient?.name, 'Prendas:', totalItems);
        
        // Validar que tenemos cliente y prendas
        if (!this.selectedClient) {
            console.error('No hay cliente seleccionado para confirmación - Redirigiendo a selección de cliente');
            this.currentStep = 1;
            return this.renderClientSelection();
        }
        
        if (totalItems === 0) {
            console.error('No hay prendas escaneadas para confirmación - Redirigiendo a escaneo de prendas');
            this.currentStep = 2;
            return this.renderGarmentScanning();
        }

        return `
            <div class="confirmation-content">
                <!-- Banner principal -->
                <div class="confirmation-banner">
                    <h2>Confirmar Recepción</h2>
                    <p>Revisa los detalles antes de confirmar</p>
                </div>

                <!-- Contenido en dos columnas -->
                <div class="confirmation-grid">
                    <!-- Información del Cliente -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Información del Cliente</h3>
                        </div>
                        <div class="card-body">
                            <div class="client-details">
                                <div class="detail-item">
                                    <span class="label">Nombre:</span>
                                    <span class="value">${this.selectedClient.name}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="label">Cédula:</span>
                                    <span class="value">${this.selectedClient.cedula}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="label">Teléfono:</span>
                                    <span class="value">${this.selectedClient.phone}</span>
                                </div>
                                <div class="detail-item">
                                    <span class="label">Servicios Anteriores:</span>
                                    <span class="value">${this.selectedClient.totalServices || 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Resumen de Prendas -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="card-title">Resumen de Prendas</h3>
                        </div>
                        <div class="card-body">
                            <div class="garment-summary">
                                <div class="summary-item">
                                    <div class="summary-number">${totalItems}</div>
                                    <div class="summary-label">Total de Prendas</div>
                                </div>
                                <div class="summary-item">
                                    <div class="summary-number">${this.getUniqueTypes().length}</div>
                                    <div class="summary-label">Tipos Diferentes</div>
                                </div>
                                <div class="summary-item">
                                    <div class="summary-number">${estimatedTime}</div>
                                    <div class="summary-label">Días Estimados</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Detalle de prendas -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Detalle de Prendas</h3>
                    </div>
                    
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>CÓDIGO RFID</th>
                                    <th>TIPO</th>
                                    <th>COLOR</th>
                                    <th>TALLA</th>
                                    <th>ESTADO</th>
                                    <th>NOTAS</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.scannedGarments.map(garment => `
                                    <tr>
                                        <td><strong>${garment.rfidCode}</strong></td>
                                        <td>${garment.type}</td>
                                        <td>${garment.color}</td>
                                        <td>${garment.size}</td>
                                        <td><span class="status-badge status-${garment.condition.toLowerCase().replace(' ', '-')}">${garment.condition}</span></td>
                                        <td>${garment.notes || '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Opciones de Servicio -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Opciones de Servicio</h3>
                    </div>
                    
                    <div class="card-body">
                        <div class="service-options-grid">
                            <div class="form-group">
                                <label class="form-label">Tipo de Servicio:</label>
                                <select id="service-type" class="form-control">
                                    <option value="normal" selected>Lavado Normal</option>
                                    <option value="express">Servicio Express (+1 día)</option>
                                    <option value="delicate">Prendas Delicadas (+2 días)</option>
                                    <option value="dry-clean">Lavado en Seco (+3 días)</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Prioridad:</label>
                                <select id="priority" class="form-control">
                                    <option value="normal" selected>Normal</option>
                                    <option value="alta">Alta</option>
                                    <option value="urgente">Urgente</option>
                                </select>
                            </div>

                            <div class="form-group full-width">
                                <label class="form-label">Notas Adicionales:</label>
                                <textarea id="reception-notes" 
                                          class="form-control" 
                                          rows="3" 
                                          placeholder="Instrucciones especiales, observaciones, etc."></textarea>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Acciones finales -->
                <div class="confirmation-actions">
                    <button class="btn btn-secondary btn-lg" onclick="Reception.previousStep()">
                        ← Modificar Prendas
                    </button>
                    <button class="btn btn-success btn-lg" onclick="Reception.confirmReception()" id="confirm-reception-btn">
                        ✅ Confirmar Recepción
                    </button>
                </div>
                
                <!-- Botón de respaldo en caso de que el principal no aparezca -->
                <div class="backup-actions" style="margin-top: 20px; text-align: center;">
                    <button class="btn btn-primary" onclick="Reception.forceConfirmReception()" style="display: none;" id="backup-confirm-btn">
                        🔄 Confirmar Recepción (Respaldo)
                    </button>
                    <button class="btn btn-warning btn-sm" onclick="Reception.forceShowConfirmButton()" style="margin-top: 10px;">
                        🔧 Mostrar Botón de Confirmar
                    </button>
                </div>
            </div>
        `;
    }

    static renderEmptyGarmentsList() {
        return `
            <div class="empty-garments">
                <div class="empty-icon">📦</div>
                <h4>No hay prendas escaneadas</h4>
                <p>Utiliza el escáner RFID o ingresa códigos manualmente</p>
            </div>
        `;
    }

    static renderGarmentsList() {
        return `
            <div class="garments-list">
                ${this.scannedGarments.map((garment, index) => `
                    <div class="garment-item ${garment.isBatchItem ? 'batch-item-pending' : ''}">
                        <div class="garment-main">
                            <div class="garment-rfid">
                                ${garment.rfidCode}
                                ${garment.isBatchItem ? '<span class="batch-badge">📦 Lote</span>' : ''}
                            </div>
                            <div class="garment-details">
                                <span class="garment-type ${garment.type === 'Prenda RFID' ? 'incomplete' : ''}">${garment.type}</span>
                                <span class="garment-color ${garment.color === 'Sin especificar' ? 'incomplete' : ''}">${garment.color}</span>
                                <span class="garment-size">${garment.size}</span>
                            </div>
                            ${garment.isBatchItem ? '<div class="garment-status incomplete">⚠️ Pendiente completar detalles</div>' : ''}
                        </div>
                        <div class="garment-actions">
                            ${garment.isBatchItem ? `
                                <button class="btn btn-sm btn-warning" onclick="Reception.openBatchDetailsModal()" title="Completar detalles">
                                    📝 Completar
                                </button>
                            ` : `
                                <button class="btn btn-sm btn-secondary" onclick="Reception.editGarment(${index})" title="Editar">
                                    ✏️
                                </button>
                            `}
                            <button class="btn btn-sm btn-danger" onclick="Reception.removeGarment(${index})" title="Eliminar">
                                🗑️
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Métodos de interacción
    static init() {
        this.resetReception();
        this.addReceptionStyles();
        this.initializeC72();
    }

    // === MÉTODOS DEL SIMULADOR C72 INTEGRADO ===
    
    // Variables del C72
    static c72Connected = false;
    static scannedTags = [];
    static currentScannerMode = 'manual';

    // Inicializar C72
    static initializeC72() {
        this.c72Connected = false;
        this.scannedTags = [];
        this.currentScannerMode = 'c72';
    }


    // Conectar C72
    static connectC72() {
        this.c72Connected = true;
        this.showC72ConnectionStatus('Conectado', 'success');
        console.log('🔌 C72 RFID Reader conectado');
    }

    // Desconectar C72
    static disconnectC72() {
        this.c72Connected = false;
        this.scannedTags = [];
        this.showC72ConnectionStatus('Desconectado', 'error');
        this.clearC72Results();
        console.log('🔌 C72 RFID Reader desconectado');
    }

    // Mostrar estado de conexión C72
    static showC72ConnectionStatus(message, type) {
        const badge = document.getElementById('c72-connection-status');
        const statusBadge = document.getElementById('c72-status-badge');
        
        if (badge) {
            badge.className = `badge badge-${type === 'success' ? 'success' : 'danger'}`;
            badge.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'times-circle'}"></i> ${message}`;
        }
        
        if (statusBadge) {
            statusBadge.className = `badge badge-${type === 'success' ? 'success' : 'danger'}`;
            statusBadge.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'times-circle'}"></i> ${message}`;
        }
    }

    // Actualizar visualización del tamaño del lote
    static updateBatchSizeDisplay(message, type = 'info') {
        const batchSizeDisplay = document.getElementById('auto-batch-size');
        if (batchSizeDisplay) {
            batchSizeDisplay.className = `badge badge-${type}`;
            batchSizeDisplay.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'clock' : 'magic'}"></i> ${message}`;
        }
    }

    // Escaneo masivo de lotes C72
    static async startBatchScan() {
        if (!this.c72Connected) {
            this.showC72Error('Dispositivo no conectado. Conecte el C72 primero.');
            return;
        }

        this.scannedTags = [];
        this.clearC72TagsList();
        this.showC72ScanningStatus(true, 'Escaneando lote...');
        this.updateBatchSizeDisplay('Escaneando...', 'warning');

        // Simular detección automática continua de tags RFID UHF
        let tagCount = 0;
        let maxScanTime = 10000; // 10 segundos máximo de escaneo
        let scanStartTime = Date.now();
        
        // Simular detección automática con tiempo variable
        while (Date.now() - scanStartTime < maxScanTime) {
            // Simular detección de 1-3 tags por iteración
            const tagsInThisRound = Math.floor(Math.random() * 3) + 1;
            
            for (let i = 0; i < tagsInThisRound; i++) {
                tagCount++;
                const tag = {
                    id: `E20000112213040000000${String(tagCount).padStart(3, '0')}`,
                    rssi: Math.floor(Math.random() * 20) + 60,
                    timestamp: new Date().toISOString(),
                    antenna: Math.floor(Math.random() * 4) + 1,
                    frequency: 915.25 + (Math.random() * 0.5)
                };

                this.scannedTags.push(tag);
                this.updateC72TagsCount();
                this.updateBatchSizeDisplay(`${tagCount} prendas detectadas`, 'info');
                
                // Simular velocidad de lectura real
                await this.delay(200);
            }
            
            // Simular pausa entre rondas de detección
            await this.delay(300);
            
            // Si no se detectan más tags en un tiempo, terminar
            if (Math.random() < 0.3) { // 30% de probabilidad de terminar en cada ronda
                break;
            }
        }

        // Mostrar todos los tags detectados al final
        this.showAllC72DetectedTags();

        this.showC72ScanningStatus(false);
        this.showC72ScanComplete();
        this.updateC72TagsCount();
        this.updateBatchSizeDisplay(`${tagCount} prendas detectadas`, 'success');

        // Automáticamente agregar tags a prendas escaneadas y abrir modal
        this.addBatchToGarmentsAndShowModal();
    }

    // Escaneo individual C72
    static async scanSingleTag() {
        if (!this.c72Connected) {
            this.showC72Error('Dispositivo no conectado. Conecte el C72 primero.');
            return;
        }

        this.showC72ScanningStatus(true, 'Escaneando...');
        await this.delay(500);
        
        const tag = {
            id: `E20000112213040000000${Math.floor(Math.random() * 999) + 1}`,
            rssi: Math.floor(Math.random() * 20) + 60,
            timestamp: new Date().toISOString(),
            antenna: 1,
            frequency: 915.25
        };

        this.scannedTags.push(tag);
        this.showC72ScanningStatus(false);
        this.showC72TagDetected(tag);
        this.updateC72TagsCount();
    }

    // Mostrar estado de escaneo C72
    static showC72ScanningStatus(isScanning, message = 'Escaneando...') {
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

    // Mostrar progreso del escaneo C72
    static updateC72ScanProgress(current, total) {
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

    // Limpiar lista de tags C72
    static clearC72TagsList() {
        const tagsList = document.getElementById('c72-tags-list');
        if (tagsList) {
            tagsList.innerHTML = '<p class="text-muted text-center small mb-0">Escaneando tags...</p>';
        }
    }

    // Mostrar todos los tags detectados C72
    static showAllC72DetectedTags() {
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

    // Mostrar tag detectado individual C72
    static showC72TagDetected(tag) {
        const tagsList = document.getElementById('c72-tags-list');
        if (tagsList) {
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

    // Mostrar escaneo completado C72
    static showC72ScanComplete() {
        const completeDiv = document.getElementById('c72-scan-complete');
        if (completeDiv) {
            completeDiv.innerHTML = `
                <div class="alert alert-success alert-sm">
                    <i class="fas fa-check-circle"></i>
                    <strong>Escaneo completado!</strong>
                    Se detectaron ${this.scannedTags.length} tags RFID
                </div>
                <div class="alert alert-info alert-sm mt-2">
                    <i class="fas fa-info-circle"></i>
                    Los tags se agregarán automáticamente a las prendas escaneadas
                </div>
            `;
        }
    }

    // Mostrar error C72
    static showC72Error(message) {
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

    // Actualizar contador de tags C72
    static updateC72TagsCount() {
        const countElement = document.getElementById('tags-count');
        if (countElement) {
            countElement.textContent = `${this.scannedTags.length} tags`;
        }
    }

    // Limpiar resultados C72
    static clearC72Results() {
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

        this.updateC72TagsCount();
    }

    // Agregar lote a prendas escaneadas y mostrar modal
    static addBatchToGarmentsAndShowModal() {
        if (this.scannedTags.length === 0) {
            this.showC72Error('No hay tags escaneados');
            return;
        }

        // Crear prendas temporales para cada tag escaneado
        let addedCount = 0;
        this.scannedTags.forEach(tag => {
            // Verificar si ya existe
            if (this.scannedGarments.find(g => g.rfidCode === tag.id)) {
                return; // Skip si ya existe
            }

            const garment = {
                rfidCode: tag.id,
                type: 'Prenda RFID', // Temporal, se completará en el modal
                color: 'Sin especificar',
                size: 'Sin especificar',
                condition: 'bueno',
                notes: `Escaneada con C72 - ${new Date().toLocaleString()}`,
                isBatchItem: true // Marcar como item de lote
            };

            this.scannedGarments.push(garment);
            addedCount++;
        });

        // Actualizar la lista de prendas
        this.refreshGarmentsList();
        
        // Mostrar botones de acción
        if (this.scannedGarments.length > 0) {
            this.showActionButtons();
        }

        // Limpiar escaneo C72
        this.clearC72Results();

        // Abrir modal automáticamente para completar detalles del lote
        setTimeout(() => {
            this.openBatchDetailsModal();
        }, 500);
    }

    // Crear prendas desde el escaneo C72 (función original mantenida para compatibilidad)
    static createGarmentsFromC72Scan() {
        if (this.scannedTags.length === 0) {
            this.showC72Error('No hay tags escaneados para crear prendas');
            return;
        }

        if (!this.selectedClient) {
            this.showC72Error('No hay cliente seleccionado');
            return;
        }

        // Crear prendas para cada tag escaneado
        let createdCount = 0;
        this.scannedTags.forEach(tag => {
            // Verificar si ya existe
            if (this.scannedGarments.find(g => g.rfidCode === tag.id)) {
                return; // Skip si ya existe
            }

            const garment = {
                rfidCode: tag.id,
                type: 'Prenda RFID',
                color: 'Sin especificar',
                size: 'Sin especificar',
                condition: 'bueno',
                notes: `Creada desde escaneo C72 - ${new Date().toLocaleString()}`
            };

            this.scannedGarments.push(garment);
            createdCount++;
        });

        // Actualizar la lista de prendas
        this.refreshGarmentsList();
        
        // Mostrar botones de acción si hay prendas
        if (this.scannedGarments.length > 0) {
            this.showActionButtons();
        }

        // Mostrar resultado
        this.showC72Success(`Se agregaron ${createdCount} prendas desde el escaneo C72`);
        
        // Limpiar escaneo C72
        this.clearC72Results();
    }

    // Mostrar mensaje de éxito C72
    static showC72Success(message) {
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

    // Modal para completar detalles del lote completo
    static openBatchDetailsModal() {
        const batchItems = this.scannedGarments.filter(g => g.isBatchItem);
        
        if (batchItems.length === 0) {
            console.log('No hay items de lote para mostrar en el modal');
            return;
        }

        const modalContent = `
            <div class="batch-details-modal">
                <div class="batch-header">
                    <h4>📦 Registro de Lote de Prendas</h4>
                    <p class="text-muted">${batchItems.length} prendas escaneadas con C72 RFID</p>
                </div>
                
                <div class="batch-info-section">
                    <div class="batch-summary-card">
                        <h6>📊 Información del Lote</h6>
                        <div class="batch-stats">
                            <div class="stat-item">
                                <span class="stat-number">${batchItems.length}</span>
                                <span class="stat-label">Prendas</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">${new Date().toLocaleDateString()}</span>
                                <span class="stat-label">Fecha</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">C72</span>
                                <span class="stat-label">Escáner</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="batch-details-form">
                    <h6>📋 Información General del Lote</h6>
                    <form id="batch-details-form">
                        <!-- Información de Recepción -->
                        <div class="form-section">
                            <h6 class="section-title">🚚 Estado de Recepción</h6>
                            <div class="row">
                                
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label">Condición General *</label>
                                        <select id="batch-condition" class="form-control" required>
                                            <option value="">Seleccionar condición...</option>
                                            <option value="excelente">Excelente</option>
                                            <option value="bueno">Bueno</option>
                                            <option value="regular">Regular</option>
                                            <option value="delicado">Delicado</option>
                                            <option value="crítico">Crítico</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Información del Servicio -->
                        <div class="form-section">
                            <h6 class="section-title">🧽 Tipo de Servicio</h6>
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label class="form-label">Servicio Principal *</label>
                                        <select id="batch-service" class="form-control" required>
                                            <option value="">Seleccionar servicio...</option>
                                            <option value="lavado-normal">Lavado Normal</option>
                                            <option value="lavado-delicado">Lavado Delicado</option>
                                            <option value="lavado-seco">Lavado en Seco</option>
                                            <option value="planchado">Solo Planchado</option>
                                            <option value="express">Servicio Express</option>
                                            <option value="urgente">Servicio Urgente</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="form-group">
                                        <label class="form-label">Prioridad *</label>
                                        <select id="batch-priority" class="form-control" required>
                                            <option value="">Seleccionar prioridad...</option>
                                            <option value="baja">Baja</option>
                                            <option value="normal">Normal</option>
                                            <option value="alta">Alta</option>
                                            <option value="urgente">Urgente</option>
                                        </select>
                                    </div>
                                </div>
                                
                            </div>
                        </div>

                        <!-- Información del Cliente/Lote -->
                        <div class="form-section">
                            <h6 class="section-title">👤 Información del Lote</h6>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label">Tipo de Prendas *</label>
                                        <select id="batch-type" class="form-control" required>
                                            <option value="">Seleccionar tipo...</option>
                                            <option value="uniforme-empresarial">Uniforme Empresarial</option>
                                            <option value="uniforme-médico">Uniforme Médico</option>
                                            <option value="uniforme-escolar">Uniforme Escolar</option>
                                            <option value="ropa-hotel">Ropa de Hotel</option>
                                            <option value="ropa-restaurante">Ropa de Restaurante</option>
                                            <option value="ropa-industrial">Ropa Industrial</option>
                                            <option value="ropa-deportiva">Ropa Deportiva</option>
                                            <option value="ropa-mixta">Ropa Mixta</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label">Color Predominante *</label>
                                        <select id="batch-color" class="form-control" required>
                                            <option value="">Seleccionar color...</option>
                                            <option value="blanco">Blanco</option>
                                            <option value="negro">Negro</option>
                                            <option value="azul">Azul</option>
                                            <option value="gris">Gris</option>
                                            <option value="verde">Verde</option>
                                            <option value="rojo">Rojo</option>
                                            <option value="amarillo">Amarillo</option>
                                            <option value="mixto">Mixto</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Tratamientos y parámetros de lavado -->
                        <div class="form-section">
                            <h6 class="section-title">⚠️ Parámetros de Lavado</h6>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label">Tratamiento Especial</label>
                                        <select id="batch-special-treatment" class="form-control">
                                            <option value="">Sin tratamiento especial</option>
                                            <option value="desmanchado">Desmanchado</option>
                                            <option value="desinfección">Desinfección</option>
                                            <option value="blanqueado">Blanqueado</option>
                                            <option value="suavizado">Suavizado</option>
                                            <option value="anti-arrugas">Anti-arrugas</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="form-label">Temperatura de Lavado</label>
                                        <select id="batch-temperature" class="form-control">
                                            <option value="fría">Fría (30°C)</option>
                                            <option value="tibia" selected>Tibia (40°C)</option>
                                            <option value="caliente">Caliente (60°C)</option>
                                            <option value="muy-caliente">Muy Caliente (90°C)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Observaciones -->
                        <div class="form-section">
                            <h6 class="section-title">📝 Observaciones del Lote</h6>
                            <div class="form-group">
                                <label class="form-label">Observaciones de Recepción</label>
                                <textarea id="batch-observations" class="form-control" rows="3" 
                                          placeholder="Describe el estado del lote al llegar, manchas específicas, daños, etc..."></textarea>
                            </div>
                            
                        </div>
                    </form>
                </div>

                <div class="batch-preview">
                    <h6>👀 Vista Previa del Lote</h6>
                    <div class="preview-items">
                        ${batchItems.slice(0, 5).map((garment, index) => `
                            <div class="preview-item">
                                <span class="preview-rfid">${garment.rfidCode}</span>
                                <span class="preview-details" id="preview-${index}">Prenda RFID</span>
                            </div>
                        `).join('')}
                        ${batchItems.length > 5 ? `<div class="preview-more">... y ${batchItems.length - 5} prendas más</div>` : ''}
                    </div>
                </div>
            </div>
        `;

        const modal = app.showModal('Configurar Lote Escaneado', modalContent);
        
        // Agregar botones personalizados para el modal
        const modalFooter = modal.querySelector('.modal-footer');
        modalFooter.innerHTML = `
            <button class="btn btn-secondary" onclick="Reception.cancelBatchDetails()">
                <i class="fas fa-times"></i> Cancelar Lote
            </button>
            <button class="btn btn-success" onclick="Reception.saveBatchDetails()" id="save-batch-btn">
                <i class="fas fa-check"></i> Aplicar a Todo el Lote (${batchItems.length} prendas)
            </button>
        `;

        // Agregar listeners para actualizar vista previa
        this.addBatchFormListeners();
    }

    // Agregar listeners para el formulario del lote
    static addBatchFormListeners() {
        const form = document.getElementById('batch-details-form');
        if (!form) return;

        // Listener para actualizar vista previa en tiempo real
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.updateBatchPreview();
            });
        });
    }

    // Actualizar vista previa del lote
    static updateBatchPreview() {
        const batchType = document.getElementById('batch-type')?.value || '';
        const batchColor = document.getElementById('batch-color')?.value || '';
        const batchService = document.getElementById('batch-service')?.value || '';
        const batchPriority = document.getElementById('batch-priority')?.value || '';
        
        // Obtener el número de prendas del lote automáticamente
        const batchItems = this.scannedGarments.filter(g => g.isBatchItem);
        const batchSize = batchItems.length;

        let previewText = 'Prenda RFID';
        if (batchType && batchColor) {
            previewText = `${batchType} ${batchColor}`;
            if (batchService) {
                previewText += ` - ${batchService}`;
            }
            if (batchPriority && batchPriority !== 'normal') {
                previewText += ` [${batchPriority.toUpperCase()}]`;
            }
            if (batchSize > 0) {
                previewText += ` (${batchSize} prendas)`;
            }
        }

        // Actualizar vista previa
        const previewElements = document.querySelectorAll('.preview-details');
        previewElements.forEach(element => {
            element.textContent = previewText;
        });

        // Actualizar botón de guardar
        const saveBtn = document.getElementById('save-batch-btn');
        if (saveBtn) {
            if (batchType && batchColor) {
                saveBtn.disabled = false;
                saveBtn.className = 'btn btn-success';
            } else {
                saveBtn.disabled = true;
                saveBtn.className = 'btn btn-secondary';
            }
        }
    }

    // Guardar detalles del lote
    static saveBatchDetails() {
        const batchItems = this.scannedGarments.filter(g => g.isBatchItem);
        
        // Obtener datos del formulario
        const batchType = document.getElementById('batch-type')?.value;
        const batchColor = document.getElementById('batch-color')?.value;
        const batchSize = batchItems.length; // Tamaño automático basado en prendas escaneadas
        const batchCondition = document.getElementById('batch-condition')?.value;
        const batchService = document.getElementById('batch-service')?.value;
        const batchPriority = document.getElementById('batch-priority')?.value;
        const batchSpecialTreatment = document.getElementById('batch-special-treatment')?.value || '';
        const batchTemperature = document.getElementById('batch-temperature')?.value || 'tibia';
        const batchObservations = document.getElementById('batch-observations')?.value || '';
        const batchSpecialInstructions = '';

        // Validar campos obligatorios
        if (!batchType || !batchColor || !batchCondition || !batchService || !batchPriority) {
            app.showErrorMessage('Todos los campos marcados con * son obligatorios');
            return;
        }

        // Aplicar detalles del lote a todas las prendas
        batchItems.forEach(garment => {
            garment.type = batchType;
            garment.color = batchColor;
            garment.condition = batchCondition;
            garment.serviceType = batchService;
            garment.priority = batchPriority;
            garment.specialTreatment = batchSpecialTreatment;
            garment.temperature = batchTemperature;
            
            // Combinar notas y observaciones
            const originalNotes = garment.notes || '';
            const newNotes = [
                originalNotes,
                batchObservations ? `Observaciones: ${batchObservations}` : '',
                batchSpecialTreatment ? `Tratamiento: ${batchSpecialTreatment}` : '',
                `Temperatura: ${batchTemperature}`,
                `Lote procesado con C72 RFID - ${new Date().toLocaleString()}`
            ].filter(note => note.trim()).join(' | ');
            
            garment.notes = newNotes;
            garment.isBatchItem = false; // Ya no es item temporal del lote
        });

        // Cerrar modal
        app.closeModal('dynamic-modal');

        // Actualizar interfaz
        this.refreshGarmentsList();
        
        // Mostrar mensaje de éxito
        app.showSuccessMessage(`✅ Lote completado: ${batchItems.length} prendas configuradas como ${batchType} ${batchColor}`);

        // Mostrar botones de acción
        if (this.scannedGarments.length > 0) {
            this.showActionButtons();
        }
    }

    // Cancelar detalles del lote
    static cancelBatchDetails() {
        // Remover items del lote que no están completados
        const batchItems = this.scannedGarments.filter(g => g.isBatchItem);
        const incompleteItems = batchItems.filter(g => !g.type || g.type === 'Prenda RFID' || !g.color || g.color === 'Sin especificar');

        // Remover items incompletos
        incompleteItems.forEach(garment => {
            const index = this.scannedGarments.indexOf(garment);
            if (index > -1) {
                this.scannedGarments.splice(index, 1);
            }
        });

        // Marcar items completados como listos
        const completedItems = batchItems.filter(g => g.type && g.type !== 'Prenda RFID' && g.color && g.color !== 'Sin especificar');
        completedItems.forEach(garment => {
            garment.isBatchItem = false;
        });

        // Cerrar modal
        app.closeModal('dynamic-modal');

        // Actualizar interfaz
        this.refreshGarmentsList();
        
        if (completedItems.length > 0) {
            app.showSuccessMessage(`${completedItems.length} prendas guardadas del lote`);
            this.showActionButtons();
        } else {
            app.showInfoMessage('Lote cancelado');
        }
    }

    // Utilidad para delays
    static delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    static resetReception() {
        this.currentStep = 1;
        this.selectedClient = null;
        this.scannedGarments = [];
        this.currentGuide = null;
        this.hideActionButtons();
        Navigation.clearPageParams('reception');
    }

    static searchClients(query) {
        const resultsContainer = document.getElementById('search-results');
        if (!resultsContainer) return;

        if (query.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }

        const clients = Storage.searchClients(query);
        
        if (clients.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-result no-results">
                    <div class="text-muted">No se encontraron clientes</div>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = clients.map(client => `
            <div class="search-result" onclick="Reception.selectClient(${client.id})">
                <div class="result-info">
                    <div class="result-name">${client.name}</div>
                    <div class="result-details">${client.cedula} • ${client.phone}</div>
                </div>
                <div class="result-services">
                    <span class="badge badge-info">${client.totalServices || 0} servicios</span>
                </div>
            </div>
        `).join('');
    }

    static scanClientRFID() {
        const rfidCode = prompt('Escanear RFID del cliente:\n(Ingrese código RFID)');
        if (!rfidCode) return;

        // Buscar cliente por RFID en sus etiquetas asociadas
        const clients = Storage.getClients();
        const client = clients.find(c => 
            c.rfidTags && c.rfidTags.includes(rfidCode.trim().toUpperCase())
        );

        if (client) {
            this.selectClient(client.id);
            app.showSuccessMessage(`Cliente encontrado: ${client.name}`);
        } else {
            app.showErrorMessage(`No se encontró cliente con RFID: ${rfidCode}`);
        }
    }

    static selectClient(clientId) {
        this.selectedClient = Storage.getClientById(clientId);
        if (this.selectedClient) {
            this.currentStep = 2;
            this.refreshContent();
        }
    }

    static changeClient() {
        this.selectedClient = null;
        this.currentStep = 1;
        this.scannedGarments = [];
        this.hideActionButtons();
        this.refreshContent();
    }

    static createNewClient() {
        Navigation.navigateTo('clients', { returnTo: 'reception' });
    }



    static openGarmentDetailsModal(rfidCode) {
        const modalContent = `
            <form id="garment-details-form">
                <div class="form-group">
                    <label class="form-label">Código RFID:</label>
                    <input type="text" class="form-control" value="${rfidCode}" readonly>
                </div>
                
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-group">
                            <label class="form-label">Tipo de Prenda *</label>
                            <select name="type" class="form-control" required>
                                <option value="">Seleccionar...</option>
                                <option value="Camisa">Camisa</option>
                                <option value="Pantalón">Pantalón</option>
                                <option value="Buzo">Buzo</option>
                                <option value="Vestido">Vestido</option>
                                <option value="Falda">Falda</option>
                                <option value="Chaqueta">Chaqueta</option>
                                <option value="Abrigo">Abrigo</option>
                                <option value="Uniforme">Uniforme</option>
                                <option value="Otro">Otro</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-group">
                            <label class="form-label">Color *</label>
                            <input type="text" name="color" class="form-control" required placeholder="Ej: Azul, Blanco, Negro">
                        </div>
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-col">
                        <div class="form-group">
                            <label class="form-label">Talla</label>
                            <select name="size" class="form-control">
                                <option value="">Sin especificar</option>
                                <option value="XS">XS</option>
                                <option value="S">S</option>
                                <option value="M">M</option>
                                <option value="L">L</option>
                                <option value="XL">XL</option>
                                <option value="XXL">XXL</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-group">
                            <label class="form-label">Condición</label>
                            <select name="condition" class="form-control">
                                <option value="bueno">Bueno</option>
                                <option value="regular">Regular</option>
                                <option value="delicado">Delicado</option>
                                <option value="manchado">Manchado</option>
                                <option value="roto">Roto</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Notas Especiales</label>
                    <textarea name="notes" class="form-control" rows="3" placeholder="Instrucciones especiales, manchas, daños, etc."></textarea>
                </div>
            </form>
        `;

        const modal = app.showModal('Detalles de Prenda', modalContent);
        
        // Agregar botón personalizado para guardar
        const modalFooter = modal.querySelector('.modal-footer');
        modalFooter.innerHTML = `
            <button class="btn btn-secondary" onclick="app.closeModal('dynamic-modal')">Cancelar</button>
            <button class="btn btn-primary" onclick="Reception.saveGarmentDetails('${rfidCode}')">Agregar Prenda</button>
        `;
    }

    static saveGarmentDetails(rfidCode) {
        const form = document.getElementById('garment-details-form');
        const formData = new FormData(form);

        const garment = {
            rfidCode: rfidCode,
            type: formData.get('type'),
            color: formData.get('color'),
            size: formData.get('size') || 'N/A',
            condition: formData.get('condition'),
            notes: formData.get('notes')
        };

        // Validaciones
        if (!garment.type || !garment.color) {
            app.showErrorMessage('Tipo de prenda y color son obligatorios');
            return;
        }

        this.scannedGarments.push(garment);
        app.closeModal('dynamic-modal');
        
        // Limpiar input y enfocar para el siguiente
        const input = document.getElementById('rfid-input');
        if (input) {
            input.value = '';
            input.focus();
        }
        
        this.refreshGarmentsList();
        app.showSuccessMessage(`Prenda ${rfidCode} agregada correctamente`);
        
        // Verificar si debe mostrar los botones de acción
        console.log('Después de agregar prenda - Paso actual:', this.currentStep);
        
        // Mostrar botones de acción directamente si hay prendas
        if (this.scannedGarments.length > 0) {
            this.showActionButtons();
        }
    }



    static generateRFIDCode() {
        const prefix = 'RFID';
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `${prefix}${timestamp}${random}`;
    }

    static editGarment(index) {
        const garment = this.scannedGarments[index];
        if (!garment) return;

        // Similar al modal de detalles pero con datos existentes
        this.openGarmentDetailsModal(garment.rfidCode, garment, index);
    }

    static removeGarment(index) {
        const garment = this.scannedGarments[index];
        if (confirm(`¿Eliminar la prenda ${garment.rfidCode}?`)) {
            this.scannedGarments.splice(index, 1);
            this.refreshGarmentsList();
            app.showSuccessMessage('Prenda eliminada de la lista');
            
            // Ocultar botones de acción si no hay prendas
            if (this.scannedGarments.length === 0) {
                this.hideActionButtons();
            }
        }
    }

    static clearAllGarments() {
        if (confirm('¿Está seguro que desea eliminar todas las prendas escaneadas?')) {
            this.scannedGarments = [];
            this.refreshGarmentsList();
            this.hideActionButtons();
            app.showSuccessMessage('Lista de prendas limpiada');
        }
    }

    static nextStep() {
        if (this.currentStep < 3) {
            console.log('Cambiando de paso', this.currentStep, 'a', this.currentStep + 1);
            this.currentStep++;
            
            // Ocultar botones de acción cuando se va al paso 3
            if (this.currentStep === 3) {
                this.hideActionButtons();
            }
            
            this.refreshContent();
        }
        console.log('Paso actual:', this.currentStep, 'Prendas escaneadas:', this.scannedGarments.length);
    }

    static previousStep() {
        if (this.currentStep > 1) {
            console.log('Retrocediendo de paso', this.currentStep, 'a', this.currentStep - 1);
            this.currentStep--;
            
            // Ocultar botones de acción al regresar
            this.hideActionButtons();
            
            this.refreshContent();
        }
    }

    static async confirmReception() {
        if (this.scannedGarments.length === 0) {
            app.showErrorMessage('No hay prendas para procesar');
            return;
        }

        try {
            // Obtener opciones adicionales
            const serviceType = document.getElementById('service-type')?.value || 'normal';
            const priority = document.getElementById('priority')?.value || 'normal';
            const notes = document.getElementById('reception-notes')?.value || '';

            // Procesar cada prenda
            const garmentIds = [];
            for (const garmentData of this.scannedGarments) {
                const garment = Storage.addGarment({
                    ...garmentData,
                    clientId: this.selectedClient.id,
                    branchId: this.selectedClient.branchId || 1,
                    status: 'recibido',
                    serviceType: serviceType,
                    priority: priority,
                    receptionNotes: notes,
                    receivedAt: new Date().toISOString()
                });
                garmentIds.push(garment.id);
                console.log('✅ Prenda guardada:', garment);
            }
            
            console.log('📊 Total de prendas guardadas:', garmentIds.length);
            console.log('📋 Todas las prendas en el sistema:', Storage.getGarments());

            // Crear lote automáticamente si hay múltiples prendas
            let batch = null;
            if (this.scannedGarments.length > 1) {
                batch = Storage.createBatch({
                    clientId: this.selectedClient.id,
                    branchId: this.selectedClient.branchId || 1,
                    name: `Lote de ${this.selectedClient.name}`,
                    description: `Lote de ${this.scannedGarments.length} prendas - ${serviceType}`,
                    garmentIds: garmentIds,
                    expectedGarments: this.scannedGarments.length,
                    serviceType: serviceType,
                    priority: priority,
                    notes: notes || `Lote creado automáticamente desde recepción`
                });

                // Agregar las prendas al lote
                garmentIds.forEach(garmentId => {
                    Storage.addGarmentToBatch(batch.id, garmentId);
                });

                console.log('✅ Lote creado:', batch);
            }

            // Actualizar contador de servicios del cliente
            const updatedServiceCount = (this.selectedClient.totalServices || 0) + 1;
            Storage.updateClient(this.selectedClient.id, {
                totalServices: updatedServiceCount
            });

            // Registrar en historial
            Storage.addHistoryEntry({
                clientId: this.selectedClient.id,
                action: 'recepcion',
                garmentIds: garmentIds,
                operator: app.currentUser?.username || 'sistema',
                details: `Recepción de ${this.scannedGarments.length} prenda(s)${batch ? ` - Lote #${batch.batchNumber}` : ''}`
            });

            // Mostrar confirmación de éxito
            this.showSuccessConfirmation(batch, garmentIds);

        } catch (error) {
            console.error('Error en confirmación:', error);
            app.showErrorMessage('Error procesando la recepción. Intente nuevamente.');
        }
    }

    static showSuccessConfirmation(batch, garmentIds) {
        const content = `
            <div class="success-confirmation">
                <div class="success-icon">✅</div>
                <h3>¡Recepción Completada!</h3>
                <div class="confirmation-details">
                    <div class="detail-item">
                        <span>Cliente:</span>
                        <span>${this.selectedClient.name}</span>
                    </div>
                    <div class="detail-item">
                        <span>Prendas Recibidas:</span>
                        <span>${this.scannedGarments.length}</span>
                    </div>
                    ${batch ? `
                    <div class="detail-item">
                        <span>Lote Creado:</span>
                        <span>#${batch.batchNumber}</span>
                    </div>
                    <div class="detail-item">
                        <span>Estado del Lote:</span>
                        <span>Recibido</span>
                    </div>
                    ` : ''}
                    <div class="detail-item">
                        <span>Fecha y Hora:</span>
                        <span>${new Date().toLocaleString('es-ES')}</span>
                    </div>
                </div>
                
                <div class="confirmation-actions">
                    ${batch ? `
                    <button class="btn btn-secondary" onclick="Reception.printBatchReport(${batch.id})">
                        🖨️ Imprimir Reporte
                    </button>
                    <button class="btn btn-info" onclick="Navigation.loadPage('control'); app.closeModal('dynamic-modal')">
                        ⚙️ Ver en Control Interno
                    </button>
                    ` : ''}
                    <button class="btn btn-primary" onclick="Reception.newReception()">
                        ➕ Nueva Recepción
                    </button>
                    <button class="btn btn-info" onclick="Navigation.loadPage('dashboard'); app.closeModal('dynamic-modal')">
                        📊 Ir al Dashboard
                    </button>
                </div>
            </div>
        `;

        app.showModal('Recepción Exitosa', content);
    }

    static printBatchReport(batchId) {
        // Simular impresión de reporte del lote
        app.showSuccessMessage('Reporte del lote enviado a impresión');
        app.closeModal('dynamic-modal');
    }

    static newReception() {
        this.resetReception();
        this.refreshContent();
        app.closeModal('dynamic-modal');
    }

    static refreshContent() {
        const content = document.getElementById('reception-content');
        if (content) {
            try {
                // Preservar el cliente seleccionado antes de actualizar
                const currentClient = this.selectedClient;
                console.log('Preservando cliente seleccionado:', currentClient?.name);
                
                content.innerHTML = this.renderCurrentStep();
                console.log('Contenido actualizado. Paso:', this.currentStep);
                
                // Restaurar el cliente seleccionado si se perdió
                if (!this.selectedClient && currentClient) {
                    console.log('Restaurando cliente seleccionado');
                    this.selectedClient = currentClient;
                }
                
                // Verificar que el botón de confirmar esté presente en el paso 3
                if (this.currentStep === 3) {
                    setTimeout(() => {
                        this.checkConfirmButton();
                    }, 100);
                    // Verificación adicional después de más tiempo
                    setTimeout(() => {
                        this.checkConfirmButton();
                    }, 500);
                }
                
                // Log para depuración
                console.log('Contenido actualizado. Paso actual:', this.currentStep);
            } catch (error) {
                console.error('Error al actualizar contenido:', error);
                // Fallback: volver al paso 1
                this.currentStep = 1;
                content.innerHTML = this.renderCurrentStep();
            }
        } else {
            console.error('No se encontró el contenedor de contenido de recepción');
        }
    }
    
    static checkConfirmButton() {
        const confirmBtn = document.getElementById('confirm-reception-btn');
        const backupBtn = document.getElementById('backup-confirm-btn');
        
        console.log('Verificando botones de confirmación...');
        console.log('Botón principal encontrado:', !!confirmBtn);
        console.log('Botón de respaldo encontrado:', !!backupBtn);
        
        if (!confirmBtn && backupBtn) {
            console.log('Botón principal no encontrado, mostrando botón de respaldo');
            backupBtn.style.display = 'inline-block';
        } else if (confirmBtn) {
            console.log('Botón principal encontrado correctamente');
            confirmBtn.style.display = 'inline-block';
            if (backupBtn) backupBtn.style.display = 'none';
        } else {
            console.log('Ningún botón de confirmación encontrado, forzando aparición');
            // Forzar aparición del botón
            this.forceShowConfirmButton();
        }
    }
    
    static forceConfirmReception() {
        console.log('Usando función de respaldo para confirmar recepción');
        this.confirmReception();
    }
    
    static forceShowConfirmButton() {
        console.log('Forzando aparición del botón de confirmar...');
        
        // Crear botón si no existe
        const existingBtn = document.getElementById('confirm-reception-btn');
        if (!existingBtn) {
            const actionsContainer = document.querySelector('.final-actions');
            if (actionsContainer) {
                const newBtn = document.createElement('button');
                newBtn.id = 'confirm-reception-btn';
                newBtn.className = 'btn btn-success btn-lg';
                newBtn.onclick = () => Reception.confirmReception();
                newBtn.innerHTML = '✅ Confirmar Recepción';
                actionsContainer.appendChild(newBtn);
                console.log('Botón de confirmar creado y agregado');
            }
        } else {
            existingBtn.style.display = 'inline-block';
            console.log('Botón de confirmar mostrado');
        }
    }
    
    static checkContinueButton() {
        console.log('checkContinueButton - Paso actual:', this.currentStep, 'Prendas:', this.scannedGarments.length);
        
        // Verificar que los botones de acción estén visibles si hay prendas
        if (this.scannedGarments.length > 0) {
            if (this.currentStep === 2) {
                // Paso 2: Buscar el contenedor normal
                const actionsContainer = document.querySelector('.garments-actions');
                if (actionsContainer) {
                    actionsContainer.style.display = 'flex';
                    const continueBtn = actionsContainer.querySelector('.btn-success');
                    if (continueBtn) {
                        continueBtn.textContent = `✅ Continuar (${this.scannedGarments.length} prendas)`;
                        continueBtn.style.display = 'inline-block';
                        console.log('Botón de continuar actualizado correctamente en paso 2');
                    }
                } else {
                    console.log('Contenedor de acciones no encontrado en paso 2, mostrando botones de acción');
                    this.showActionButtons();
                }
                // Ocultar botones de acción en paso 2
                this.hideActionButtons();
            } else if (this.currentStep === 1 && this.selectedClient) {
                // Paso 1: Mostrar botones de acción
                console.log('Paso 1 con prendas, mostrando botones de acción');
                this.showActionButtons();
            }
        } else {
            // No hay prendas, ocultar botones de acción
            this.hideActionButtons();
        }
    }
    
    static createFloatingContinueButton() {
        // Eliminar botón existente si hay uno
        const existingBtn = document.getElementById('floating-continue-btn');
        if (existingBtn) {
            existingBtn.remove();
        }
        
        // Crear nuevo botón flotante
        const floatingBtn = document.createElement('button');
        floatingBtn.id = 'floating-continue-btn';
        floatingBtn.className = 'btn btn-success btn-lg';
        floatingBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            animation: pulse 2s infinite;
            font-size: 16px;
            padding: 15px 25px;
        `;
        floatingBtn.innerHTML = `✅ Continuar (${this.scannedGarments.length} prendas)`;
        floatingBtn.onclick = () => {
            console.log('Botón flotante presionado - Mostrando acciones');
            // Ocultar el botón flotante inmediatamente
            this.hideFloatingContinueButton();
            
            // Mostrar los botones de acción en la misma pantalla
            this.showActionButtons();
            
            // Mostrar mensaje de confirmación
            const prendaText = this.scannedGarments.length === 1 ? 'prenda' : 'prendas';
            app.showSuccessMessage(`¡Excelente! ${this.scannedGarments.length} ${prendaText} registrada${this.scannedGarments.length > 1 ? 's' : ''}. Selecciona una acción:`);
        };
        
        document.body.appendChild(floatingBtn);
        console.log('Botón flotante creado y mostrado con', this.scannedGarments.length, 'prendas');
    }
    
    static hideFloatingContinueButton() {
        const floatingBtn = document.getElementById('floating-continue-btn');
        if (floatingBtn) {
            floatingBtn.remove();
            console.log('Botón flotante eliminado');
        }
    }

    static showActionButtons() {
        // Eliminar botones de acción existentes si los hay
        this.hideActionButtons();
        
        // Crear contenedor de botones de acción
        const actionContainer = document.createElement('div');
        actionContainer.id = 'floating-action-buttons';
        actionContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            flex-direction: column;
            gap: 10px;
            animation: slideInUp 0.3s ease-out;
        `;
        
        // Botón Limpiar Todo
        const clearBtn = document.createElement('button');
        clearBtn.className = 'btn btn-danger btn-lg';
        clearBtn.style.cssText = `
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-size: 16px;
            padding: 15px 25px;
            min-width: 200px;
        `;
        clearBtn.innerHTML = '🗑️ Limpiar Todo';
        clearBtn.onclick = () => {
            if (confirm('¿Está seguro que desea eliminar todas las prendas escaneadas?')) {
                this.scannedGarments = [];
                this.refreshGarmentsList();
                this.hideActionButtons();
                app.showSuccessMessage('Lista de prendas limpiada');
            }
        };
        
        // Botón Continuar
        const continueBtn = document.createElement('button');
        continueBtn.className = 'btn btn-success btn-lg';
        continueBtn.style.cssText = `
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-size: 16px;
            padding: 15px 25px;
            min-width: 200px;
        `;
        continueBtn.innerHTML = `✅ Continuar (${this.scannedGarments.length} prendas)`;
        continueBtn.onclick = () => {
            console.log('Botón continuar presionado - Navegando directamente a confirmación');
            this.hideActionButtons();
            
            // Navegar directamente a la pantalla de confirmación
            this.goToConfirmation();
        };
        
        // Agregar botones al contenedor
        actionContainer.appendChild(clearBtn);
        actionContainer.appendChild(continueBtn);
        
        // Agregar al DOM
        document.body.appendChild(actionContainer);
        
        console.log('Botones de acción mostrados');
    }

    static hideActionButtons() {
        const actionContainer = document.getElementById('floating-action-buttons');
        if (actionContainer) {
            // Agregar clase de animación de salida
            actionContainer.classList.add('hiding');
            
            // Remover después de la animación
            setTimeout(() => {
                if (actionContainer.parentNode) {
                    actionContainer.remove();
                }
            }, 300);
        }
    }

    static goToConfirmation() {
        console.log('Navegando directamente a confirmación...');
        console.log('Estado antes de confirmación - Cliente:', this.selectedClient?.name, 'Prendas:', this.scannedGarments.length);
        
        // Intentar restaurar cliente desde sessionStorage si no está disponible
        if (!this.selectedClient) {
            const savedClientId = sessionStorage.getItem('reception_selected_client_id');
            if (savedClientId) {
                this.selectedClient = Storage.getClientById(parseInt(savedClientId));
                console.log('Cliente restaurado desde sessionStorage:', this.selectedClient?.name);
            }
        }
        
        // Validar que tenemos los datos necesarios
        if (!this.selectedClient) {
            console.error('No hay cliente seleccionado');
            console.log('Cliente actual:', this.selectedClient);
            app.showErrorMessage('Error: No hay cliente seleccionado');
            return;
        }
        
        if (this.scannedGarments.length === 0) {
            console.error('No hay prendas escaneadas');
            console.log('Prendas actuales:', this.scannedGarments);
            app.showErrorMessage('Error: No hay prendas escaneadas');
            return;
        }
        
        // Guardar estado en sessionStorage para preservarlo
        sessionStorage.setItem('reception_selected_client_id', this.selectedClient.id.toString());
        sessionStorage.setItem('reception_scanned_garments', JSON.stringify(this.scannedGarments));
        
        // Establecer paso 3
        this.currentStep = 3;
        console.log('Paso establecido a 3');
        
        // Usar refreshContent en lugar de Navigation.loadPage para preservar el estado
        console.log('Actualizando contenido sin reiniciar módulo');
        this.refreshContent();
        
        // Mostrar mensaje de éxito
        setTimeout(() => {
            app.showSuccessMessage('Revisa los detalles y confirma la recepción');
        }, 500);
        
        console.log('Navegación a confirmación completada');
    }

    // Método de debug para verificar estado
    static debugState() {
        console.log('=== DEBUG ESTADO RECEPCIÓN ===');
        console.log('Cliente seleccionado:', this.selectedClient);
        console.log('Paso actual:', this.currentStep);
        console.log('Prendas escaneadas:', this.scannedGarments.length);
        console.log('Parámetros de navegación:', Navigation.getPageParams('reception'));
        console.log('SessionStorage cliente:', sessionStorage.getItem('reception_selected_client_id'));
        console.log('SessionStorage prendas:', sessionStorage.getItem('reception_scanned_garments'));
        console.log('================================');
    }

    // Limpiar estado de recepción
    static clearReceptionState() {
        this.selectedClient = null;
        this.scannedGarments = [];
        this.currentStep = 1;
        sessionStorage.removeItem('reception_selected_client_id');
        sessionStorage.removeItem('reception_scanned_garments');
        console.log('Estado de recepción limpiado');
    }

    static refreshGarmentsList() {
        const container = document.querySelector('.scanned-garments');
        if (container) {
            container.innerHTML = this.scannedGarments.length === 0 ? this.renderEmptyGarmentsList() : this.renderGarmentsList();
        }
        
        // Actualizar botones de acción
        const actionsContainer = document.querySelector('.garments-actions');
        if (actionsContainer) {
            if (this.scannedGarments.length > 0) {
                actionsContainer.style.display = 'flex';
                const continueBtn = actionsContainer.querySelector('.btn-success');
                if (continueBtn) {
                    continueBtn.textContent = `✅ Continuar (${this.scannedGarments.length} prendas)`;
                    continueBtn.style.display = 'inline-block';
                }
            } else {
                actionsContainer.style.display = 'none';
            }
        } else {
            // Si no existe el contenedor, solo logear el problema, NO cambiar de paso
            console.log('Contenedor de acciones no encontrado en refreshGarmentsList');
        }
    }

    static calculateEstimatedTime() {
        // Cálculo básico basado en tipo de servicio
        const baseTime = 3; // días base
        const hasDelicate = this.scannedGarments.some(g => g.condition === 'delicado');
        const hasDamaged = this.scannedGarments.some(g => g.condition === 'roto' || g.condition === 'manchado');
        
        let estimatedDays = baseTime;
        if (hasDelicate) estimatedDays += 1;
        if (hasDamaged) estimatedDays += 2;
        
        return estimatedDays;
    }

    static getUniqueTypes() {
        return [...new Set(this.scannedGarments.map(g => g.type))];
    }

    static addReceptionStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .steps-indicator {
                padding: 20px;
                background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
            }
            .steps {
                display: flex;
                justify-content: space-between;
                max-width: 600px;
                margin: 0 auto;
            }
            .step {
                display: flex;
                flex-direction: column;
                align-items: center;
                flex: 1;
                position: relative;
            }
            .step:not(:last-child)::after {
                content: '';
                position: absolute;
                top: 20px;
                right: -50%;
                width: 100%;
                height: 2px;
                background: #e2e8f0;
                z-index: 1;
            }
            .step.completed:not(:last-child)::after {
                background: #48bb78;
            }
            .step-number {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #e2e8f0;
                color: #718096;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-bottom: 8px;
                z-index: 2;
                position: relative;
            }
            .step.active .step-number {
                background: #667eea;
                color: white;
            }
            .step.completed .step-number {
                background: #48bb78;
                color: white;
            }
            .step-label {
                font-size: 14px;
                color: #4a5568;
                font-weight: 500;
            }
            .client-search-section {
                padding: 20px 0;
            }
            .search-input-group {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }
            .search-input-group input {
                flex: 1;
            }
            .search-results {
                max-height: 300px;
                overflow-y: auto;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                background: white;
            }
            .search-result {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid #f1f5f9;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            .search-result:hover {
                background-color: #f7fafc;
            }
            .search-result:last-child {
                border-bottom: none;
            }
            .result-name {
                font-weight: 500;
                color: #2d3748;
            }
            .result-details {
                font-size: 14px;
                color: #718096;
            }
            .recent-clients .client-quick-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid #f1f5f9;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            .client-quick-item:hover {
                background-color: #f7fafc;
            }
            .client-quick-item:last-child {
                border-bottom: none;
            }
            .client-card {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                background: #f7fafc;
                border-radius: 8px;
                margin-bottom: 20px;
            }
            .client-details h4 {
                color: var(--primary-color);
                font-size: 1.2rem;
                font-weight: 600;
                margin: 0 0 8px 0;
            }
            .client-details p {
                color: var(--dark-text);
                font-size: 0.9rem;
                margin: 4px 0;
                font-weight: 500;
            }
            .selected-client-info {
                margin-top: 15px;
            }
            .scanner-section {
                padding: 20px 0;
            }
            .scanner-interface {
                background: #f8fafc;
                border: 2px dashed #cbd5e0;
                border-radius: 12px;
                padding: 30px;
                text-align: center;
            }
            .scanner-status {
                display: flex;
                align-items: center;
                justify-content: center;
                margin-bottom: 25px;
                font-weight: 500;
                color: #2d3748;
            }
            .scanner-light {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #48bb78;
                margin-right: 10px;
                animation: pulse 2s infinite;
            }
            @keyframes pulse {
                0% { opacity: 1; }
                50% { opacity: 0.5; }
                100% { opacity: 1; }
            }
            @keyframes pulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.05); }
                100% { transform: scale(1); }
            }
            .manual-input {
                margin-bottom: 25px;
            }
            .rfid-input-group {
                display: flex;
                gap: 10px;
                margin: 10px 0;
            }
            .rfid-input-group input {
                flex: 1;
                font-family: monospace;
                font-size: 16px;
                text-transform: uppercase;
            }
            .quick-scan-options h5 {
                margin-bottom: 15px;
                color: #4a5568;
            }
            .quick-buttons {
                display: flex;
                gap: 10px;
                justify-content: center;
                flex-wrap: wrap;
            }
            .empty-garments {
                text-align: center;
                padding: 60px 20px;
                color: #718096;
            }
            .empty-icon {
                font-size: 4rem;
                margin-bottom: 20px;
                opacity: 0.5;
            }
            .garments-list .garment-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid #f1f5f9;
                background: white;
            }
            .garment-item:hover {
                background-color: #f7fafc;
            }
            .garment-item:last-child {
                border-bottom: none;
            }
            .garment-main {
                flex: 1;
            }
            .garment-rfid {
                font-weight: bold;
                color: #667eea;
                font-family: monospace;
                margin-bottom: 5px;
            }
            .garment-details span {
                display: inline-block;
                margin-right: 15px;
                font-size: 14px;
                color: #4a5568;
            }
            .garment-actions {
                display: flex;
                gap: 5px;
            }
            .garments-actions {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-top: 1px solid #e2e8f0;
                background: #f7fafc;
            }
            
            /* Estilos para prendas del lote */
            .garment-item.batch-item-pending {
                border-left: 4px solid #f59e0b;
                background: linear-gradient(90deg, #fffbeb 0%, #ffffff 100%);
            }
            
            .batch-badge {
                background: #f59e0b;
                color: white;
                font-size: 10px;
                padding: 2px 6px;
                border-radius: 3px;
                margin-left: 8px;
                font-weight: 500;
            }
            
            .garment-details .incomplete {
                color: #dc2626;
                font-weight: 500;
                background: #fef2f2;
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 12px;
            }
            
            .garment-status.incomplete {
                color: #dc2626;
                font-size: 12px;
                font-weight: 500;
                margin-top: 5px;
                padding: 4px 8px;
                background: #fef2f2;
                border-radius: 4px;
                border: 1px solid #fecaca;
            }
            .step-navigation {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e2e8f0;
            }
            .confirmation-content {
                max-width: 900px;
                margin: 0 auto;
            }
            .reception-summary {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 30px;
                padding: 20px 0;
            }
            .summary-section h4 {
                color: #2d3748;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 2px solid #e2e8f0;
            }
            .summary-details .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #f1f5f9;
            }
            .detail-row:last-child {
                border-bottom: none;
            }
            .summary-stats {
                display: flex;
                gap: 20px;
            }
            .stat-box {
                flex: 1;
                text-align: center;
                padding: 20px;
                background: #f7fafc;
                border-radius: 8px;
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
            .service-options {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
                padding: 20px;
            }
            .final-actions {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 30px;
                background: #f7fafc;
                border-radius: 8px;
                margin-top: 20px;
            }
            .success-confirmation {
                text-align: center;
                padding: 30px;
            }
            .success-icon {
                font-size: 4rem;
                margin-bottom: 20px;
            }
            .confirmation-details {
                background: #f7fafc;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                text-align: left;
            }
            .confirmation-details .detail-item {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #e2e8f0;
            }
            .detail-item:last-child {
                border-bottom: none;
            }
            .confirmation-actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                margin-top: 30px;
                flex-wrap: wrap;
            }
            @media (max-width: 768px) {
                .reception-summary {
                    grid-template-columns: 1fr;
                    gap: 20px;
                }
                .summary-stats {
                    flex-direction: column;
                    gap: 10px;
                }
                .service-options {
                    grid-template-columns: 1fr;
                }
                .final-actions {
                    flex-direction: column;
                    gap: 15px;
                }
                .confirmation-actions {
                    flex-direction: column;
                }
                .confirmation-actions .btn {
                    width: 100%;
                }
                .quick-buttons {
                    flex-direction: column;
                }
            }
            
            /* Animación para botones de acción flotantes */
            @keyframes slideInUp {
                from {
                    transform: translateY(100px);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutDown {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(100px);
                    opacity: 0;
                }
            }
            
            #floating-action-buttons {
                animation: slideInUp 0.3s ease-out;
            }
            
            #floating-action-buttons.hiding {
                animation: slideOutDown 0.3s ease-in;
            }
            
            /* === ESTILOS PARA SIMULADOR C72 INTEGRADO === */
            
            .scanner-tabs {
                display: flex;
                border-bottom: 2px solid #e2e8f0;
                margin-bottom: 20px;
            }
            
            .scanner-tab {
                flex: 1;
                padding: 12px 20px;
                background: #f7fafc;
                border: none;
                border-bottom: 3px solid transparent;
                color: #718096;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .scanner-tab:hover {
                background: #edf2f7;
                color: #4a5568;
            }
            
            .scanner-tab.active {
                background: white;
                color: #667eea;
                border-bottom-color: #667eea;
                font-weight: 600;
            }
            
            .c72-status-section {
                background: #f8fafc;
                border: 2px dashed #cbd5e0;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
            }
            
            .device-info-compact {
                text-align: center;
                padding: 10px;
                background: #edf2f7;
                border-radius: 6px;
                margin-bottom: 15px;
            }
            
            .device-info-compact small {
                font-weight: 500;
            }
            
            .device-status {
                text-align: center;
                margin-bottom: 15px;
            }
            
            .c72-controls {
                background: #f7fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
            }
            
            .form-actions-compact {
                display: flex;
                gap: 8px;
                justify-content: center;
                flex-wrap: wrap;
                margin-top: 15px;
            }
            
            .form-actions-compact .btn {
                font-size: 13px;
                padding: 8px 12px;
                min-width: 100px;
            }
            
            .c72-scan-status {
                background: #f8fafc;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 10px;
                margin-bottom: 15px;
            }
            
            .c72-tags-section {
                background: #f7fafc;
                border: 1px solid #e2e8f0;
                border-radius: 8px;
                padding: 15px;
            }
            
            .c72-tags-section h6 {
                margin-bottom: 15px;
                color: #2d3748;
                font-weight: 600;
            }
            
            .tags-list-compact {
                max-height: 200px;
                overflow-y: auto;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 10px;
            }
            
            .tag-item-compact {
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 4px;
                padding: 8px;
                margin-bottom: 8px;
                transition: all 0.2s;
            }
            
            .tag-item-compact:hover {
                background: #f7fafc;
                border-color: #cbd5e0;
            }
            
            .tag-item-compact:last-child {
                margin-bottom: 0;
            }
            
            .progress-container {
                background: white;
                border-radius: 4px;
                padding: 8px;
            }
            
            .progress {
                height: 8px;
                background: #e2e8f0;
                border-radius: 4px;
                overflow: hidden;
            }
            
            .progress-bar {
                background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
                height: 100%;
                transition: width 0.3s ease;
            }
            
            .alert-sm {
                padding: 8px 12px;
                font-size: 13px;
                border-radius: 4px;
            }
            
            .badge-sm {
                font-size: 11px;
                padding: 4px 8px;
            }
            
            /* Responsive para móviles */
            @media (max-width: 768px) {
                .scanner-tabs {
                    flex-direction: column;
                }
                
                .scanner-tab {
                    border-bottom: 1px solid #e2e8f0;
                    border-right: none;
                }
                
                .scanner-tab.active {
                    border-bottom-color: #e2e8f0;
                    border-left: 3px solid #667eea;
                }
                
                .form-actions-compact {
                    flex-direction: column;
                }
                
                .form-actions-compact .btn {
                    width: 100%;
                }
                
                .c72-controls .row {
                    margin: 0;
                }
                
                .c72-controls .col-md-6 {
                    padding: 0 0 15px 0;
                }
            }
            
            /* === ESTILOS PARA MODAL DE DETALLES DEL LOTE === */
            
            /* Ampliar modal de los lados */
            #dynamic-modal .modal-content {
                width: 92%;
                max-width: 1100px;
            }
            #dynamic-modal .modal-body {
                padding: 24px;
            }
            
            .batch-details-modal {
                max-height: 85vh;
                overflow-y: auto;
                padding-right: 6px;
            }
            
            .batch-header {
                text-align: center;
                margin-bottom: 25px;
                padding-bottom: 15px;
                border-bottom: 2px solid #e2e8f0;
            }
            
            .batch-header h4 {
                color: #2d3748;
                margin-bottom: 8px;
                font-weight: 600;
            }
            
            .batch-info-section {
                margin-bottom: 25px;
            }
            
            .batch-summary-card {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 12px;
                padding: 20px;
                text-align: center;
            }
            
            .batch-summary-card h6 {
                color: white;
                margin-bottom: 15px;
                font-weight: 600;
                font-size: 16px;
            }
            
            .batch-stats {
                display: flex;
                justify-content: space-around;
                gap: 20px;
            }
            
            .batch-stats .stat-item {
                text-align: center;
            }
            
            .batch-stats .stat-number {
                display: block;
                font-size: 24px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .batch-stats .stat-label {
                display: block;
                font-size: 12px;
                opacity: 0.9;
                font-weight: 500;
            }
            
            .batch-details-form {
                background: #f8fafc;
                border-radius: 8px;
                padding: 30px;
                margin-bottom: 25px;
                border: 1px solid #e2e8f0;
            }
            
            .batch-details-form h6 {
                color: #2d3748;
                margin-bottom: 20px;
                font-weight: 600;
                font-size: 16px;
                padding-bottom: 10px;
                border-bottom: 2px solid #e2e8f0;
            }
            
            .batch-details-form .form-group {
                margin-bottom: 18px;
            }
            .batch-details-form .form-section {
                padding-top: 4px;
                margin-bottom: 24px;
            }
            
            .batch-details-form .form-label {
                font-weight: 600;
                color: #4a5568;
                margin-bottom: 8px;
                font-size: 14px;
            }
            
            .batch-details-form .form-control {
                border: 2px solid #e2e8f0;
                border-radius: 6px;
                padding: 10px 12px;
                font-size: 14px;
                transition: all 0.2s;
            }
            
            .batch-details-form .form-control:focus {
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .batch-preview {
                background: #f7fafc;
                border-radius: 8px;
                padding: 20px;
                border: 1px solid #e2e8f0;
            }

            /* === Confirmación: lista de prendas con scroll === */
            .confirmation-content .card .table-container {
                max-height: 380px;
                overflow-y: auto;
                overflow-x: hidden;
            }
            .confirmation-content .card .table {
                width: 100%;
                border-collapse: collapse;
            }
            
            .batch-preview h6 {
                color: #2d3748;
                margin-bottom: 15px;
                font-weight: 600;
                font-size: 16px;
                padding-bottom: 10px;
                border-bottom: 2px solid #e2e8f0;
            }
            
            .preview-items {
                max-height: 200px;
                overflow-y: auto;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 6px;
                padding: 15px;
            }
            
            .preview-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid #f1f5f9;
            }
            
            .preview-item:last-child {
                border-bottom: none;
            }
            
            .preview-rfid {
                font-family: monospace;
                font-weight: bold;
                color: #667eea;
                font-size: 13px;
            }
            
            .preview-details {
                color: #4a5568;
                font-size: 13px;
                font-style: italic;
            }
            
            .preview-more {
                text-align: center;
                color: #718096;
                font-style: italic;
                padding: 10px 0;
                border-top: 1px solid #e2e8f0;
                margin-top: 10px;
            }
            
            /* Responsive para modal */
            @media (max-width: 768px) {
                .batch-stats {
                    flex-direction: column;
                    gap: 15px;
                }
                
                .batch-stats .stat-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 6px;
                }
                
                .batch-stats .stat-number {
                    margin-bottom: 0;
                    font-size: 20px;
                }
                
                .batch-details-form .row .col-md-6,
                .batch-details-form .row .col-md-4 {
                    margin-bottom: 16px;
                }
                
                .preview-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 5px;
                }
            }
        `;
        
        if (!document.querySelector('#reception-styles')) {
            style.id = 'reception-styles';
            document.head.appendChild(style);
        }
    }
}

// Exponer la clase globalmente
window.Reception = Reception;

// Exponer métodos globalmente
window.debugReception = () => Reception.debugState();
window.clearReceptionState = () => Reception.clearReceptionState();

// Función de emergencia para forzar restauración de cliente
window.forceRestoreClient = () => {
    const savedClientId = sessionStorage.getItem('reception_selected_client_id');
    if (savedClientId) {
        Reception.selectedClient = Storage.getClientById(parseInt(savedClientId));
        console.log('Cliente restaurado forzadamente:', Reception.selectedClient?.name);
        Reception.refreshContent();
        return true;
    } else {
        console.log('No hay cliente guardado en sessionStorage');
        return false;
    }
};


