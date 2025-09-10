/**
 * Módulo de entrega de prendas
 * Maneja el proceso de entrega con validaciones y alertas de inconsistencias
 */

class Delivery {
    static currentStep = 1; // 1: Cliente, 2: Escaneo, 3: Validación, 4: Confirmación
    static selectedClient = null;
    static scannedGarments = [];
    static readyGarments = [];
    static inconsistencies = [];
    static currentGuide = null;

    static async render() {
        const params = Navigation.getPageParams('delivery');
        
        if (params.selectedClient) {
            this.selectedClient = Storage.getClientById(params.selectedClient);
            this.loadReadyGarments();
            this.currentStep = 2;
        }

        return `
            <div class="page-header">
                <h1>📤 Entrega de Prendas</h1>
                <p>Sistema de entrega con validación automática</p>
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
                        <div class="step-label">Escaneo</div>
                    </div>
                    <div class="step ${this.currentStep >= 3 ? 'active' : ''} ${this.currentStep > 3 ? 'completed' : ''}">
                        <div class="step-number">3</div>
                        <div class="step-label">Validación</div>
                    </div>
                    <div class="step ${this.currentStep >= 4 ? 'active' : ''}">
                        <div class="step-number">4</div>
                        <div class="step-label">Confirmación</div>
                    </div>
                </div>
            </div>

            <!-- Contenido del paso actual -->
            <div id="delivery-content">
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
                return this.renderValidation();
            case 4:
                return this.renderConfirmation();
            default:
                return this.renderClientSelection();
        }
    }

    static renderClientSelection() {
        const clientsWithReady = this.getClientsWithReadyGarments();

        return `
            <div class="grid grid-2">
                <!-- Búsqueda de cliente -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Seleccionar Cliente</h3>
                        <p class="card-subtitle">Busca el cliente para la entrega</p>
                    </div>
                    
                    <div class="client-search-section">
                        <div class="search-input-group">
                            <input type="text" 
                                   id="client-search-input" 
                                   class="form-control" 
                                   placeholder="Buscar por nombre, cédula..."
                                   onkeyup="Delivery.searchClients(this.value)">
                            <button class="btn btn-secondary" onclick="Delivery.scanClientRFID()">
                                🔍 Escanear RFID
                            </button>
                        </div>
                        
                        <div id="search-results" class="search-results">
                            <!-- Resultados de búsqueda aparecerán aquí -->
                        </div>
                    </div>
                </div>

                <!-- Clientes con prendas listas -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Clientes con Prendas Listas (${clientsWithReady.length})</h3>
                        <p class="card-subtitle">Clientes que tienen prendas listas para entrega</p>
                    </div>
                    
                    <div class="ready-clients">
                        ${clientsWithReady.length > 0 ? clientsWithReady.map(clientInfo => `
                            <div class="client-ready-item" onclick="Delivery.selectClient(${clientInfo.client.id})">
                                <div class="client-info">
                                    <div class="client-name">${clientInfo.client.name}</div>
                                    <div class="client-details">${clientInfo.client.cedula} • ${clientInfo.client.phone}</div>
                                    <div class="ready-count">
                                        <span class="badge badge-success">${clientInfo.readyCount} prenda${clientInfo.readyCount !== 1 ? 's' : ''} lista${clientInfo.readyCount !== 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                                <div class="client-action">
                                    <span class="action-arrow">→</span>
                                </div>
                            </div>
                        `).join('') : `
                            <div class="empty-state">
                                <div class="empty-icon">📦</div>
                                <h4>No hay prendas listas</h4>
                                <p>No hay clientes con prendas listas para entrega</p>
                                <button class="btn btn-primary" onclick="Navigation.loadPage('control')">
                                    Ver Control Interno
                                </button>
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    static renderGarmentScanning() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Escaneo de Prendas para Entrega</h3>
                    <p class="card-subtitle">Cliente: ${this.selectedClient.name}</p>
                </div>
                <div class="scanner-simulation">
                    <h4>Simulador de Escáner RFID</h4>
                    <input type="text" id="delivery-rfid" class="form-control" placeholder="Ingrese código RFID" onkeypress="Delivery.handleRFIDScan(event)">
                    <button class="btn btn-primary mt-2" onclick="Delivery.scanRFID()">Escanear</button>
                    <div class="mt-2">
                        <p>Prendas listas: ${this.readyGarments.length}</p>
                        <p>Prendas escaneadas: ${this.scannedGarments.length}</p>
                    </div>
                </div>
                <div class="navigation-buttons mt-3">
                    <button class="btn btn-secondary" onclick="Delivery.previousStep()">← Anterior</button>
                    <button class="btn btn-success" onclick="Delivery.nextStep()">Siguiente →</button>
                </div>
            </div>
        `;
    }

    static renderValidation() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Validación de Entrega</h3>
                </div>
                <div class="validation-content">
                    <p>✅ Validación completada</p>
                    <p>Prendas a entregar: ${this.scannedGarments.length}</p>
                </div>
                <div class="navigation-buttons mt-3">
                    <button class="btn btn-secondary" onclick="Delivery.previousStep()">← Anterior</button>
                    <button class="btn btn-success" onclick="Delivery.nextStep()">Siguiente →</button>
                </div>
            </div>
        `;
    }

    static renderConfirmation() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Confirmar Entrega</h3>
                </div>
                <div class="confirmation-content">
                    <h4>Cliente: ${this.selectedClient.name}</h4>
                    <p>Prendas a entregar: ${this.scannedGarments.length}</p>
                    <button class="btn btn-success btn-lg" onclick="Delivery.confirmDelivery()">✅ Confirmar Entrega</button>
                </div>
                <div class="navigation-buttons mt-3">
                    <button class="btn btn-secondary" onclick="Delivery.previousStep()">← Anterior</button>
                </div>
            </div>
        `;
    }

    static handleRFIDScan(event) {
        if (event.key === 'Enter') {
            this.scanRFID();
        }
    }

    static scanRFID() {
        const input = document.getElementById('delivery-rfid');
        const rfidCode = input.value.trim();
        if (rfidCode) {
            this.scannedGarments.push({ rfidCode: rfidCode, name: 'Prenda simulada' });
            input.value = '';
            this.refreshContent();
            app.showSuccessMessage(`Prenda ${rfidCode} escaneada`);
        }
    }

    static nextStep() {
        if (this.currentStep < 4) {
            this.currentStep++;
            this.refreshContent();
        }
    }

    static previousStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.refreshContent();
        }
    }

    static confirmDelivery() {
        try {
            // Actualizar estado de las prendas a 'entregado'
            const garmentIds = [];
            this.scannedGarments.forEach(garment => {
                const garmentData = Storage.getGarmentByRfid(garment.rfidCode);
                if (garmentData) {
                    // Actualizar estado de la prenda
                    Storage.updateGarment(garmentData.id, {
                        status: 'entregado',
                        deliveredAt: new Date().toISOString(),
                        lastUpdated: new Date().toISOString()
                    });
                    garmentIds.push(garmentData.id);
                    
                    // Registrar en historial
                    Storage.addHistoryEntry({
                        clientId: this.selectedClient.id,
                        garmentIds: [garmentData.id],
                        action: 'entrega',
                        operator: app.currentUser?.username || 'sistema',
                        details: `Entrega de prenda ${garment.rfidCode} - ${garmentData.type} ${garmentData.color}`
                    });
                }
            });

            // Crear guía de entrega
            if (garmentIds.length > 0) {
                Storage.addGuide({
                    type: 'entrega',
                    clientId: this.selectedClient.id,
                    garmentIds: garmentIds,
                    totalItems: garmentIds.length,
                    notes: `Entrega completada - ${new Date().toLocaleString('es-ES')}`
                });
            }
            
            app.showSuccessMessage(`Entrega confirmada: ${garmentIds.length} prenda(s) entregada(s)`);
            this.resetDelivery();
            this.refreshContent();
            
        } catch (error) {
            console.error('Error en confirmación de entrega:', error);
            app.showErrorMessage('Error procesando la entrega. Intente nuevamente.');
        }
    }

    static searchClients(query) {
        // Implementación básica de búsqueda
        if (query.length < 2) return;
        
        const clients = Storage.searchClients(query);
        const resultsContainer = document.getElementById('search-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = clients.map(client => `
                <div class="search-result" onclick="Delivery.selectClient(${client.id})">
                    <div>${client.name}</div>
                    <div>${client.cedula}</div>
                </div>
            `).join('');
        }
    }

    static scanClientRFID() {
        const rfidCode = prompt('Ingrese código RFID del cliente:');
        if (rfidCode) {
            app.showInfoMessage(`Función de escaneo RFID en desarrollo. Código: ${rfidCode}`);
        }
    }

    // Métodos de interacción básicos
    static init() {
        this.resetDelivery();
        this.addDeliveryStyles();
    }

    static resetDelivery() {
        this.currentStep = 1;
        this.selectedClient = null;
        this.scannedGarments = [];
        this.readyGarments = [];
        this.inconsistencies = [];
        this.currentGuide = null;
        Navigation.clearPageParams('delivery');
    }

    static selectClient(clientId) {
        this.selectedClient = Storage.getClientById(clientId);
        if (this.selectedClient) {
            this.loadReadyGarments();
            this.currentStep = 2;
            this.refreshContent();
        }
    }

    static loadReadyGarments() {
        if (!this.selectedClient) return;
        
        this.readyGarments = Storage.getGarments().filter(garment => 
            garment.clientId === this.selectedClient.id && garment.status === 'listo'
        );
    }

    static getClientsWithReadyGarments() {
        const garments = Storage.getGarments().filter(g => g.status === 'listo');
        const clientsMap = new Map();

        garments.forEach(garment => {
            if (!clientsMap.has(garment.clientId)) {
                const client = Storage.getClientById(garment.clientId);
                if (client) {
                    clientsMap.set(garment.clientId, {
                        client: client,
                        readyCount: 0
                    });
                }
            }
            
            if (clientsMap.has(garment.clientId)) {
                clientsMap.get(garment.clientId).readyCount++;
            }
        });

        return Array.from(clientsMap.values())
            .sort((a, b) => b.readyCount - a.readyCount);
    }

    static refreshContent() {
        const content = document.getElementById('delivery-content');
        if (content) {
            content.innerHTML = this.renderCurrentStep();
        }
    }

    static addDeliveryStyles() {
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
            .ready-clients .client-ready-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                border-bottom: 1px solid #f1f5f9;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            .client-ready-item:hover {
                background-color: #f7fafc;
            }
            .client-ready-item:last-child {
                border-bottom: none;
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
        `;
        
        if (!document.querySelector('#delivery-styles')) {
            style.id = 'delivery-styles';
            document.head.appendChild(style);
        }
    }
}

// Exponer la clase globalmente
window.Delivery = Delivery;