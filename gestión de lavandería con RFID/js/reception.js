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
        
        if (params.selectedClient) {
            this.selectedClient = Storage.getClientById(params.selectedClient);
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

                    <!-- Escáner RFID simulado -->
                    <div class="scanner-section">
                        <h4>🔍 Escáner RFID</h4>
                        <div class="scanner-interface">
                            <div class="scanner-status">
                                <span class="scanner-light active"></span>
                                <span>PDT Lista para escanear</span>
                            </div>
                            
                            <div class="manual-input">
                                <label>Código RFID Manual:</label>
                                <div class="rfid-input-group">
                                    <input type="text" 
                                           id="rfid-input" 
                                           class="form-control" 
                                           placeholder="RFID001, RFID002..."
                                           onkeypress="Reception.handleRFIDInput(event)">
                                    <button class="btn btn-primary" onclick="Reception.addGarmentManually()">
                                        ➕ Agregar
                                    </button>
                                </div>
                                <small class="text-muted">Simula el escaneo manual de etiquetas RFID</small>
                            </div>

                            <div class="quick-scan-options">
                                <h5>Escaneo Rápido:</h5>
                                <div class="quick-buttons">
                                    <button class="btn btn-sm btn-info" onclick="Reception.simulateBulkScan()">
                                        📦 Lote de 5 prendas
                                    </button>
                                    <button class="btn btn-sm btn-warning" onclick="Reception.generateRFID()">
                                        🎲 Generar RFID
                                    </button>
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
        
        // Validar que tenemos cliente y prendas
        if (!this.selectedClient) {
            console.error('No hay cliente seleccionado para confirmación');
            return this.renderClientSelection();
        }
        
        if (totalItems === 0) {
            console.error('No hay prendas escaneadas para confirmación');
            return this.renderGarmentScanning();
        }

        return `
            <div class="confirmation-content">
                <div class="card mb-2">
                    <div class="card-header">
                        <h3 class="card-title">Confirmar Recepción</h3>
                        <p class="card-subtitle">Revisa los detalles antes de confirmar</p>
                    </div>

                    <!-- Resumen de recepción -->
                    <div class="reception-summary">
                        <div class="summary-section">
                            <h4>📋 Información del Cliente</h4>
                            <div class="summary-details">
                                <div class="detail-row">
                                    <span>Nombre:</span>
                                    <span>${this.selectedClient.name}</span>
                                </div>
                                <div class="detail-row">
                                    <span>Cédula:</span>
                                    <span>${this.selectedClient.cedula}</span>
                                </div>
                                <div class="detail-row">
                                    <span>Teléfono:</span>
                                    <span>${this.selectedClient.phone}</span>
                                </div>
                                <div class="detail-row">
                                    <span>Servicios Anteriores:</span>
                                    <span>${this.selectedClient.totalServices || 0}</span>
                                </div>
                            </div>
                        </div>

                        <div class="summary-section">
                            <h4>👔 Resumen de Prendas</h4>
                            <div class="summary-stats">
                                <div class="stat-box">
                                    <div class="stat-number">${totalItems}</div>
                                    <div class="stat-label">Total de Prendas</div>
                                </div>
                                <div class="stat-box">
                                    <div class="stat-number">${this.getUniqueTypes().length}</div>
                                    <div class="stat-label">Tipos Diferentes</div>
                                </div>
                                <div class="stat-box">
                                    <div class="stat-number">${estimatedTime}</div>
                                    <div class="stat-label">Días Estimados</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Detalle de prendas -->
                <div class="card mb-2">
                    <div class="card-header">
                        <h3 class="card-title">Detalle de Prendas</h3>
                    </div>
                    
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Código RFID</th>
                                    <th>Tipo</th>
                                    <th>Color</th>
                                    <th>Talla</th>
                                    <th>Estado</th>
                                    <th>Notas</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${this.scannedGarments.map(garment => `
                                    <tr>
                                        <td><strong>${garment.rfidCode}</strong></td>
                                        <td>${garment.type}</td>
                                        <td>${garment.color}</td>
                                        <td>${garment.size}</td>
                                        <td><span class="badge badge-info">${garment.condition}</span></td>
                                        <td>${garment.notes || '-'}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>

                <!-- Opciones adicionales -->
                <div class="card mb-2">
                    <div class="card-header">
                        <h3 class="card-title">Opciones de Servicio</h3>
                    </div>
                    
                    <div class="service-options">
                        <div class="form-group">
                            <label class="form-label">Tipo de Servicio:</label>
                            <select id="service-type" class="form-control">
                                <option value="normal">Lavado Normal</option>
                                <option value="express">Servicio Express (+1 día)</option>
                                <option value="delicate">Prendas Delicadas (+2 días)</option>
                                <option value="dry-clean">Lavado en Seco (+3 días)</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label class="form-label">Prioridad:</label>
                            <select id="priority" class="form-control">
                                <option value="normal">Normal</option>
                                <option value="alta">Alta</option>
                                <option value="urgente">Urgente</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Notas Adicionales:</label>
                            <textarea id="reception-notes" 
                                      class="form-control" 
                                      rows="3" 
                                      placeholder="Instrucciones especiales, observaciones, etc."></textarea>
                        </div>
                    </div>
                </div>

                <!-- Acciones finales -->
                <div class="final-actions">
                    <button class="btn btn-secondary" onclick="Reception.previousStep()">
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
                    <div class="garment-item">
                        <div class="garment-main">
                            <div class="garment-rfid">${garment.rfidCode}</div>
                            <div class="garment-details">
                                <span class="garment-type">${garment.type}</span>
                                <span class="garment-color">${garment.color}</span>
                                <span class="garment-size">${garment.size}</span>
                            </div>
                        </div>
                        <div class="garment-actions">
                            <button class="btn btn-sm btn-secondary" onclick="Reception.editGarment(${index})" title="Editar">
                                ✏️
                            </button>
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
    }

    static resetReception() {
        this.currentStep = 1;
        this.selectedClient = null;
        this.scannedGarments = [];
        this.currentGuide = null;
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
        this.refreshContent();
    }

    static createNewClient() {
        Navigation.navigateTo('clients', { returnTo: 'reception' });
    }

    static handleRFIDInput(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.addGarmentManually();
        }
    }

    static addGarmentManually() {
        const input = document.getElementById('rfid-input');
        const rfidCode = input.value.trim().toUpperCase();

        if (!rfidCode) {
            app.showErrorMessage('Ingrese un código RFID válido');
            return;
        }

        // Verificar si ya existe
        if (this.scannedGarments.find(g => g.rfidCode === rfidCode)) {
            app.showWarningMessage(`El código ${rfidCode} ya fue escaneado`);
            input.value = '';
            return;
        }

        // Verificar si ya existe en el sistema
        const existingGarment = Storage.getGarmentByRfid(rfidCode);
        if (existingGarment && existingGarment.status !== 'entregado') {
            app.showErrorMessage(`El código ${rfidCode} ya está en el sistema con estado: ${existingGarment.status}`);
            input.value = '';
            return;
        }

        this.openGarmentDetailsModal(rfidCode);
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
        
        // Verificar si debe mostrar el botón de continuar
        console.log('Después de agregar prenda - Paso actual:', this.currentStep);
        
        // Crear botón flotante inmediatamente si hay prendas
        if (this.scannedGarments.length > 0) {
            this.createFloatingContinueButton();
        }
    }

    static simulateBulkScan() {
        const types = ['Camisa', 'Pantalón', 'Buzo', 'Vestido', 'Chaqueta'];
        const colors = ['Blanco', 'Negro', 'Azul', 'Rojo', 'Verde', 'Gris'];
        const sizes = ['S', 'M', 'L', 'XL'];
        const conditions = ['bueno', 'regular', 'delicado'];

        for (let i = 0; i < 5; i++) {
            const rfidCode = this.generateRFIDCode();
            if (!this.scannedGarments.find(g => g.rfidCode === rfidCode)) {
                this.scannedGarments.push({
                    rfidCode: rfidCode,
                    type: types[Math.floor(Math.random() * types.length)],
                    color: colors[Math.floor(Math.random() * colors.length)],
                    size: sizes[Math.floor(Math.random() * sizes.length)],
                    condition: conditions[Math.floor(Math.random() * conditions.length)],
                    notes: `Prenda escaneada automáticamente - ${new Date().toLocaleTimeString()}`
                });
            }
        }

        this.refreshGarmentsList();
        app.showSuccessMessage('5 prendas simuladas agregadas');
        
        // Crear botón flotante inmediatamente si hay prendas
        if (this.scannedGarments.length > 0) {
            this.createFloatingContinueButton();
        }
    }

    static generateRFID() {
        const rfidCode = this.generateRFIDCode();
        const input = document.getElementById('rfid-input');
        if (input) {
            input.value = rfidCode;
            input.focus();
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
        }
    }

    static clearAllGarments() {
        if (confirm('¿Está seguro que desea eliminar todas las prendas escaneadas?')) {
            this.scannedGarments = [];
            this.refreshGarmentsList();
            app.showSuccessMessage('Lista de prendas limpiada');
        }
    }

    static nextStep() {
        if (this.currentStep < 3) {
            console.log('Cambiando de paso', this.currentStep, 'a', this.currentStep + 1);
            this.currentStep++;
            
            // Ocultar botón flotante cuando se va al paso 3
            if (this.currentStep === 3) {
                this.hideFloatingContinueButton();
            }
            
            this.refreshContent();
        }
        console.log('Paso actual:', this.currentStep, 'Prendas escaneadas:', this.scannedGarments.length);
    }

    static previousStep() {
        if (this.currentStep > 1) {
            console.log('Retrocediendo de paso', this.currentStep, 'a', this.currentStep - 1);
            this.currentStep--;
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
                    status: 'recibido',
                    serviceType: serviceType,
                    priority: priority,
                    receptionNotes: notes
                });
                garmentIds.push(garment.id);
            }

            // Crear guía de recepción
            const guide = Storage.addGuide({
                type: 'recepcion',
                clientId: this.selectedClient.id,
                garmentIds: garmentIds,
                totalItems: this.scannedGarments.length,
                serviceType: serviceType,
                priority: priority,
                notes: notes
            });

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
                details: `Recepción de ${this.scannedGarments.length} prenda(s) - Guía #${guide.id}`
            });

            // Mostrar confirmación de éxito
            this.showSuccessConfirmation(guide);

        } catch (error) {
            console.error('Error en confirmación:', error);
            app.showErrorMessage('Error procesando la recepción. Intente nuevamente.');
        }
    }

    static showSuccessConfirmation(guide) {
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
                    <div class="detail-item">
                        <span>Guía de Recepción:</span>
                        <span>#${guide.id}</span>
                    </div>
                    <div class="detail-item">
                        <span>Fecha y Hora:</span>
                        <span>${new Date().toLocaleString('es-ES')}</span>
                    </div>
                </div>
                
                <div class="confirmation-actions">
                    <button class="btn btn-secondary" onclick="Reception.printGuide(${guide.id})">
                        🖨️ Imprimir Guía
                    </button>
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

    static printGuide(guideId) {
        // Simular impresión de guía
        app.showSuccessMessage('Guía enviada a impresión');
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
        
        // Verificar que el botón esté visible en cualquier paso si hay prendas
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
                    console.log('Contenedor de acciones no encontrado en paso 2, creando botón flotante');
                    this.createFloatingContinueButton();
                }
                // Ocultar botón flotante en paso 2
                this.hideFloatingContinueButton();
            } else if (this.currentStep === 1 && this.selectedClient) {
                // Paso 1: Crear botón flotante
                console.log('Paso 1 con prendas, creando botón flotante');
                this.createFloatingContinueButton();
            }
        } else {
            // No hay prendas, ocultar botón flotante
            this.hideFloatingContinueButton();
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
            console.log('Botón flotante presionado');
            // Ocultar el botón flotante inmediatamente
            this.hideFloatingContinueButton();
            
            // Mostrar mensaje de confirmación exitosa
            const prendaText = this.scannedGarments.length === 1 ? 'prenda' : 'prendas';
            app.showSuccessMessage(`¡Excelente! ${this.scannedGarments.length} ${prendaText} registrada${this.scannedGarments.length > 1 ? 's' : ''}. Continuando a confirmación...`);
            
            // Cambiar al paso 3 (confirmación) después de un breve delay
            setTimeout(() => {
                this.currentStep = 3;
                this.refreshContent();
                
                // Mostrar mensaje adicional en la pantalla de confirmación
                setTimeout(() => {
                    app.showSuccessMessage('Revisa los detalles y confirma la recepción');
                }, 500);
                
                console.log('Pasando a confirmación - Paso actual:', this.currentStep);
            }, 1500);
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
        `;
        
        if (!document.querySelector('#reception-styles')) {
            style.id = 'reception-styles';
            document.head.appendChild(style);
        }
    }
}

// Exponer la clase globalmente
window.Reception = Reception;


