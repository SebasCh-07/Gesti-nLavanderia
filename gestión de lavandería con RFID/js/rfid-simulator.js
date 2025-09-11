/**
 * Módulo de Simulación RFID
 * Panel virtual de lector RFID e impresora de etiquetas
 */

class RFIDSimulator {
    static isActive = false;
    static currentRFIDCode = '';
    static scanHistory = [];
    static printerQueue = [];

    static async render() {
        return `
            <div class="page-header">
                <h1>🔍 Simulador RFID</h1>
                <p>Panel virtual de lector RFID e impresora de etiquetas</p>
            </div>

            <div class="rfid-simulator">
                <!-- Panel de Control RFID -->
                <div class="card mb-2">
                    <div class="card-header">
                        <h3 class="card-title">📡 Lector RFID Virtual</h3>
                        <p class="card-subtitle">Simulación de escaneo de códigos RFID</p>
                    </div>
                    <div class="rfid-controls">
                        <div class="rfid-display">
                            <div class="display-screen" id="rfid-display">
                                <div class="display-text">Listo para escanear...</div>
                                <div class="display-code" id="current-rfid-code"></div>
                            </div>
                        </div>
                        
                        <div class="rfid-buttons">
                            <button class="btn btn-primary btn-lg" onclick="RFIDSimulator.scanRFID()">
                                📡 Escanear RFID
                            </button>
                            <button class="btn btn-secondary" onclick="RFIDSimulator.manualEntry()">
                                ⌨️ Entrada Manual
                            </button>
                            <button class="btn btn-warning" onclick="RFIDSimulator.clearDisplay()">
                                🗑️ Limpiar
                            </button>
                        </div>
                        
                        <div class="rfid-actions">
                            <button class="btn btn-success" onclick="RFIDSimulator.searchGarment()" id="search-btn" disabled>
                                🔍 Buscar Prenda
                            </button>
                            <button class="btn btn-info" onclick="RFIDSimulator.printLabel()" id="print-btn" disabled>
                                🖨️ Imprimir Etiqueta
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Historial de Escaneos -->
                <div class="card mb-2">
                    <div class="card-header">
                        <h3 class="card-title">📋 Historial de Escaneos</h3>
                        <p class="card-subtitle">Últimos códigos RFID escaneados</p>
                    </div>
                    <div class="scan-history" id="scan-history">
                        ${this.renderScanHistory()}
                    </div>
                </div>

                <!-- Impresora Virtual -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">🖨️ Impresora de Etiquetas</h3>
                        <p class="card-subtitle">Cola de impresión y vista previa</p>
                    </div>
                    <div class="printer-section">
                        <div class="printer-queue" id="printer-queue">
                            ${this.renderPrinterQueue()}
                        </div>
                        
                        <div class="printer-actions">
                            <button class="btn btn-success" onclick="RFIDSimulator.printAll()" id="print-all-btn" disabled>
                                🖨️ Imprimir Todo
                            </button>
                            <button class="btn btn-warning" onclick="RFIDSimulator.clearQueue()">
                                🗑️ Limpiar Cola
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static renderScanHistory() {
        if (this.scanHistory.length === 0) {
            return '<div class="empty-state">No hay escaneos recientes</div>';
        }

        return `
            <div class="history-list">
                ${this.scanHistory.slice(0, 10).map(scan => `
                    <div class="history-item">
                        <div class="scan-info">
                            <div class="scan-code">${scan.code}</div>
                            <div class="scan-time">${this.formatTime(scan.timestamp)}</div>
                        </div>
                        <div class="scan-actions">
                            <button class="btn btn-sm btn-secondary" onclick="RFIDSimulator.rescanCode('${scan.code}')">
                                🔄
                            </button>
                            <button class="btn btn-sm btn-info" onclick="RFIDSimulator.addToQueue('${scan.code}')">
                                🖨️
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    static renderPrinterQueue() {
        if (this.printerQueue.length === 0) {
            return '<div class="empty-state">Cola de impresión vacía</div>';
        }

        return `
            <div class="queue-list">
                ${this.printerQueue.map((item, index) => `
                    <div class="queue-item">
                        <div class="queue-info">
                            <div class="queue-code">${item.code}</div>
                            <div class="queue-time">${this.formatTime(item.addedAt)}</div>
                        </div>
                        <div class="queue-actions">
                            <button class="btn btn-sm btn-primary" onclick="RFIDSimulator.printSingle(${index})">
                                🖨️
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="RFIDSimulator.removeFromQueue(${index})">
                                ❌
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Métodos de simulación RFID
    static scanRFID() {
        // Generar código RFID simulado
        const rfidCode = this.generateRFIDCode();
        this.currentRFIDCode = rfidCode;
        
        // Actualizar display
        this.updateDisplay(rfidCode);
        
        // Agregar al historial
        this.addToHistory(rfidCode);
        
        // Habilitar botones
        this.enableButtons();
        
        // Efecto de sonido simulado
        this.playScanSound();
        
        app.showSuccessMessage(`RFID escaneado: ${rfidCode}`);
    }

    static generateRFIDCode() {
        // Generar códigos RFID realistas
        const prefixes = ['RFID', 'TAG', 'LABEL'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const number = String(Math.floor(Math.random() * 999999)).padStart(6, '0');
        return `${prefix}${number}`;
    }

    static updateDisplay(code) {
        const display = document.getElementById('rfid-display');
        const codeDisplay = document.getElementById('current-rfid-code');
        
        if (display && codeDisplay) {
            display.classList.add('scanning');
            codeDisplay.textContent = code;
            
            // Efecto de parpadeo
            setTimeout(() => {
                display.classList.remove('scanning');
            }, 1000);
        }
    }

    static addToHistory(code) {
        const scan = {
            code: code,
            timestamp: new Date().toISOString(),
            found: false
        };
        
        this.scanHistory.unshift(scan);
        
        // Mantener solo los últimos 20 escaneos
        if (this.scanHistory.length > 20) {
            this.scanHistory = this.scanHistory.slice(0, 20);
        }
        
        // Actualizar historial en pantalla
        this.refreshHistory();
    }

    static enableButtons() {
        const searchBtn = document.getElementById('search-btn');
        const printBtn = document.getElementById('print-btn');
        
        if (searchBtn) searchBtn.disabled = false;
        if (printBtn) printBtn.disabled = false;
    }

    static disableButtons() {
        const searchBtn = document.getElementById('search-btn');
        const printBtn = document.getElementById('print-btn');
        
        if (searchBtn) searchBtn.disabled = true;
        if (printBtn) printBtn.disabled = true;
    }

    static manualEntry() {
        const code = prompt('Ingrese el código RFID manualmente:');
        if (code && code.trim()) {
            this.currentRFIDCode = code.trim().toUpperCase();
            this.updateDisplay(this.currentRFIDCode);
            this.addToHistory(this.currentRFIDCode);
            this.enableButtons();
            app.showSuccessMessage(`Código ingresado: ${this.currentRFIDCode}`);
        }
    }

    static clearDisplay() {
        this.currentRFIDCode = '';
        const display = document.getElementById('rfid-display');
        const codeDisplay = document.getElementById('current-rfid-code');
        
        if (display && codeDisplay) {
            codeDisplay.textContent = '';
            display.querySelector('.display-text').textContent = 'Listo para escanear...';
        }
        
        this.disableButtons();
    }

    static searchGarment() {
        if (!this.currentRFIDCode) {
            app.showErrorMessage('No hay código RFID para buscar');
            return;
        }

        const garment = Storage.getGarmentByRfid(this.currentRFIDCode);
        
        if (garment) {
            const client = Storage.getClientById(garment.clientId);
            const branch = Storage.getBranchById(garment.branchId);
            
            const content = `
                <div class="garment-found">
                    <div class="found-header">
                        <h4>✅ Prenda Encontrada</h4>
                        <span class="badge badge-success">${garment.rfidCode}</span>
                    </div>
                    
                    <div class="found-details">
                        <div class="detail-row">
                            <span class="label">Cliente:</span>
                            <span class="value">${client ? client.name : 'No encontrado'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Sucursal:</span>
                            <span class="value">${branch ? branch.name : 'No especificada'}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Tipo:</span>
                            <span class="value">${garment.type} ${garment.color}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Estado:</span>
                            <span class="value badge badge-${this.getStatusClass(garment.status)}">${this.getStatusText(garment.status)}</span>
                        </div>
                        <div class="detail-row">
                            <span class="label">Recibida:</span>
                            <span class="value">${this.formatDateTime(garment.receivedAt)}</span>
                        </div>
                    </div>
                    
                    <div class="found-actions">
                        <button class="btn btn-primary" onclick="RFIDSimulator.viewGarmentDetails(${garment.id})">
                            👁️ Ver Detalles
                        </button>
                        <button class="btn btn-info" onclick="RFIDSimulator.addToQueue('${garment.rfidCode}')">
                            🖨️ Imprimir Etiqueta
                        </button>
                    </div>
                </div>
            `;
            
            app.showModal('Prenda Encontrada', content);
            
            // Marcar como encontrada en el historial
            const scanIndex = this.scanHistory.findIndex(s => s.code === this.currentRFIDCode);
            if (scanIndex !== -1) {
                this.scanHistory[scanIndex].found = true;
                this.refreshHistory();
            }
            
        } else {
            app.showErrorMessage(`No se encontró ninguna prenda con el código RFID: ${this.currentRFIDCode}`);
            
            // Marcar como no encontrada en el historial
            const scanIndex = this.scanHistory.findIndex(s => s.code === this.currentRFIDCode);
            if (scanIndex !== -1) {
                this.scanHistory[scanIndex].found = false;
                this.refreshHistory();
            }
        }
    }

    static viewGarmentDetails(garmentId) {
        app.closeModal('dynamic-modal');
        Navigation.loadPage('control', { garmentId: garmentId });
    }

    // Métodos de impresión
    static printLabel() {
        if (!this.currentRFIDCode) {
            app.showErrorMessage('No hay código RFID para imprimir');
            return;
        }
        
        this.addToQueue(this.currentRFIDCode);
    }

    static addToQueue(code) {
        const existingItem = this.printerQueue.find(item => item.code === code);
        if (existingItem) {
            app.showWarningMessage('Esta etiqueta ya está en la cola de impresión');
            return;
        }
        
        const queueItem = {
            code: code,
            addedAt: new Date().toISOString(),
            status: 'pendiente'
        };
        
        this.printerQueue.push(queueItem);
        this.refreshPrinterQueue();
        this.updatePrintAllButton();
        
        app.showSuccessMessage(`Etiqueta ${code} agregada a la cola de impresión`);
    }

    static removeFromQueue(index) {
        if (index >= 0 && index < this.printerQueue.length) {
            const removed = this.printerQueue.splice(index, 1)[0];
            this.refreshPrinterQueue();
            this.updatePrintAllButton();
            app.showSuccessMessage(`Etiqueta ${removed.code} removida de la cola`);
        }
    }

    static printSingle(index) {
        if (index >= 0 && index < this.printerQueue.length) {
            const item = this.printerQueue[index];
            this.simulatePrint(item.code);
            this.printerQueue.splice(index, 1);
            this.refreshPrinterQueue();
            this.updatePrintAllButton();
        }
    }

    static printAll() {
        if (this.printerQueue.length === 0) {
            app.showWarningMessage('No hay etiquetas en la cola para imprimir');
            return;
        }
        
        const codes = this.printerQueue.map(item => item.code);
        
        // Simular impresión de todas las etiquetas
        codes.forEach((code, index) => {
            setTimeout(() => {
                this.simulatePrint(code);
            }, index * 500); // Espaciar las impresiones
        });
        
        // Limpiar cola después de imprimir
        setTimeout(() => {
            this.printerQueue = [];
            this.refreshPrinterQueue();
            this.updatePrintAllButton();
            app.showSuccessMessage(`${codes.length} etiquetas impresas correctamente`);
        }, codes.length * 500 + 1000);
    }

    static clearQueue() {
        if (this.printerQueue.length === 0) {
            app.showWarningMessage('La cola de impresión ya está vacía');
            return;
        }
        
        if (confirm(`¿Está seguro que desea limpiar la cola de impresión? Se perderán ${this.printerQueue.length} etiqueta(s).`)) {
            this.printerQueue = [];
            this.refreshPrinterQueue();
            this.updatePrintAllButton();
            app.showSuccessMessage('Cola de impresión limpiada');
        }
    }

    static simulatePrint(code) {
        // Simular impresión de etiqueta
        const garment = Storage.getGarmentByRfid(code);
        const client = garment ? Storage.getClientById(garment.clientId) : null;
        const branch = garment ? Storage.getBranchById(garment.branchId) : null;
        
        // Crear ventana de impresión simulada
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Etiqueta RFID - ${code}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px; 
                        font-size: 12px;
                        line-height: 1.4;
                    }
                    .label { 
                        border: 2px solid #000; 
                        padding: 15px; 
                        width: 300px; 
                        margin: 0 auto;
                        text-align: center;
                    }
                    .header { 
                        font-weight: bold; 
                        font-size: 16px; 
                        margin-bottom: 10px;
                        border-bottom: 1px solid #000;
                        padding-bottom: 5px;
                    }
                    .rfid-code { 
                        font-size: 20px; 
                        font-weight: bold; 
                        margin: 10px 0;
                        background: #f0f0f0;
                        padding: 5px;
                    }
                    .info { 
                        margin: 5px 0; 
                        text-align: left;
                    }
                    .barcode {
                        margin: 10px 0;
                        font-family: monospace;
                        font-size: 14px;
                        letter-spacing: 2px;
                    }
                    .footer {
                        margin-top: 10px;
                        font-size: 10px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="label">
                    <div class="header">LAVANDERÍA RFID</div>
                    <div class="rfid-code">${code}</div>
                    <div class="barcode">${this.generateBarcode(code)}</div>
                    ${garment ? `
                        <div class="info"><strong>Cliente:</strong> ${client ? client.name : 'N/A'}</div>
                        <div class="info"><strong>Sucursal:</strong> ${branch ? branch.name : 'N/A'}</div>
                        <div class="info"><strong>Prenda:</strong> ${garment.type} ${garment.color}</div>
                        <div class="info"><strong>Talla:</strong> ${garment.size || 'N/A'}</div>
                        <div class="info"><strong>Estado:</strong> ${this.getStatusText(garment.status)}</div>
                    ` : `
                        <div class="info"><strong>Estado:</strong> Prenda no encontrada</div>
                    `}
                    <div class="footer">
                        Impreso: ${new Date().toLocaleString('es-ES')}
                    </div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        
        // Simular delay de impresión
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }

    static generateBarcode(code) {
        // Generar código de barras simple usando caracteres
        return code.split('').map(char => '█').join('');
    }

    static updatePrintAllButton() {
        const printAllBtn = document.getElementById('print-all-btn');
        if (printAllBtn) {
            printAllBtn.disabled = this.printerQueue.length === 0;
        }
    }

    static refreshHistory() {
        const historyContainer = document.getElementById('scan-history');
        if (historyContainer) {
            historyContainer.innerHTML = this.renderScanHistory();
        }
    }

    static refreshPrinterQueue() {
        const queueContainer = document.getElementById('printer-queue');
        if (queueContainer) {
            queueContainer.innerHTML = this.renderPrinterQueue();
        }
    }

    static rescanCode(code) {
        this.currentRFIDCode = code;
        this.updateDisplay(code);
        this.enableButtons();
        app.showSuccessMessage(`Código restaurado: ${code}`);
    }

    static playScanSound() {
        // Simular sonido de escaneo con vibración si está disponible
        if (navigator.vibrate) {
            navigator.vibrate([100, 50, 100]);
        }
    }

    // Métodos de utilidad
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

    static formatTime(timestamp) {
        return new Date(timestamp).toLocaleString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    }

    static formatDateTime(timestamp) {
        return new Date(timestamp).toLocaleString('es-ES');
    }

    // Métodos de inicialización
    static init() {
        this.addRFIDStyles();
        this.setupKeyboardShortcuts();
    }

    static setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Solo activar si estamos en la página de RFID
            if (Navigation.getCurrentPage() !== 'rfid-simulator') return;
            
            if (e.key === 'Enter' && e.ctrlKey) {
                e.preventDefault();
                this.scanRFID();
            } else if (e.key === 'Escape') {
                this.clearDisplay();
            }
        });
    }

    static addRFIDStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .rfid-simulator {
                max-width: 1200px;
                margin: 0 auto;
            }

            .rfid-controls {
                padding: 20px;
            }

            .rfid-display {
                margin-bottom: 20px;
            }

            .display-screen {
                background: #1a1a1a;
                color: #00ff00;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                font-family: 'Courier New', monospace;
                border: 2px solid #333;
                min-height: 100px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                transition: all 0.3s ease;
            }

            .display-screen.scanning {
                background: #2a2a2a;
                box-shadow: 0 0 20px rgba(0, 255, 0, 0.3);
            }

            .display-text {
                font-size: 14px;
                margin-bottom: 10px;
                opacity: 0.8;
            }

            .display-code {
                font-size: 24px;
                font-weight: bold;
                letter-spacing: 2px;
            }

            .rfid-buttons {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }

            .rfid-actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .scan-history, .printer-queue {
                max-height: 300px;
                overflow-y: auto;
            }

            .history-list, .queue-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .history-item, .queue-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 12px;
                background: #f8f9fa;
                border-radius: 6px;
                border-left: 4px solid #dee2e6;
            }

            .history-item.found {
                border-left-color: #28a745;
            }

            .history-item.not-found {
                border-left-color: #dc3545;
            }

            .scan-info, .queue-info {
                flex: 1;
            }

            .scan-code, .queue-code {
                font-weight: bold;
                font-family: monospace;
                color: #495057;
            }

            .scan-time, .queue-time {
                font-size: 0.8em;
                color: #6c757d;
                margin-top: 2px;
            }

            .scan-actions, .queue-actions {
                display: flex;
                gap: 5px;
            }

            .printer-section {
                padding: 20px;
            }

            .printer-actions {
                margin-top: 15px;
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .garment-found {
                padding: 20px;
            }

            .found-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #dee2e6;
            }

            .found-details {
                margin-bottom: 20px;
            }

            .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                border-bottom: 1px solid #f1f3f4;
            }

            .detail-row:last-child {
                border-bottom: none;
            }

            .detail-row .label {
                font-weight: 500;
                color: #6c757d;
            }

            .detail-row .value {
                color: #495057;
            }

            .found-actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .empty-state {
                text-align: center;
                padding: 40px 20px;
                color: #6c757d;
                font-style: italic;
            }

            @media (max-width: 768px) {
                .rfid-buttons, .rfid-actions, .printer-actions, .found-actions {
                    flex-direction: column;
                }

                .history-item, .queue-item {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 10px;
                }

                .scan-actions, .queue-actions {
                    justify-content: center;
                }

                .display-code {
                    font-size: 18px;
                }
            }
        `;
        
        if (!document.querySelector('#rfid-styles')) {
            style.id = 'rfid-styles';
            document.head.appendChild(style);
        }
    }
}

// Exponer la clase globalmente
window.RFIDSimulator = RFIDSimulator;
