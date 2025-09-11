/**
 * Módulo de Facturación
 * Sistema de precios, facturas y gestión de pagos
 */

class Billing {
    static currentInvoice = null;
    static selectedGarments = [];
    static currentClient = null;

    static async render() {
        return `
            <div class="page-header">
                <h1>💰 Facturación</h1>
                <p>Sistema de precios, facturas y gestión de pagos</p>
            </div>

            <div class="billing-system">
                <!-- Panel de Precios -->
                <div class="card mb-2">
                    <div class="card-header">
                        <h3 class="card-title">💵 Configuración de Precios</h3>
                        <p class="card-subtitle">Precios por tipo de prenda y servicio</p>
                    </div>
                    <div class="pricing-section">
                        ${this.renderPricingTable()}
                    </div>
                </div>

                <!-- Generador de Facturas -->
                <div class="card mb-2">
                    <div class="card-header">
                        <h3 class="card-title">📄 Generar Factura</h3>
                        <p class="card-subtitle">Crear factura para prendas listas para entrega</p>
                    </div>
                    <div class="invoice-generator">
                        <div class="invoice-steps">
                            <div class="step active" id="step-1">
                                <span class="step-number">1</span>
                                <span class="step-title">Seleccionar Cliente</span>
                            </div>
                            <div class="step" id="step-2">
                                <span class="step-number">2</span>
                                <span class="step-title">Seleccionar Prendas</span>
                            </div>
                            <div class="step" id="step-3">
                                <span class="step-number">3</span>
                                <span class="step-title">Revisar Factura</span>
                            </div>
                        </div>
                        
                        <div class="invoice-content" id="invoice-content">
                            ${this.renderClientSelection()}
                        </div>
                    </div>
                </div>

                <!-- Historial de Facturas -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📋 Historial de Facturas</h3>
                        <p class="card-subtitle">Facturas generadas y su estado</p>
                    </div>
                    <div class="invoices-history">
                        ${this.renderInvoicesHistory()}
                    </div>
                </div>
            </div>
        `;
    }

    static renderPricingTable() {
        const pricing = Storage.getPricing();
        const garmentTypes = Object.keys(pricing);

        return `
            <div class="pricing-controls">
                <button class="btn btn-primary" onclick="Billing.editPricing()">
                    ✏️ Editar Precios
                </button>
                <button class="btn btn-secondary" onclick="Billing.resetPricing()">
                    🔄 Restaurar Precios
                </button>
            </div>
            
            <div class="pricing-table">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Tipo de Prenda</th>
                            <th>Servicio Normal</th>
                            <th>Servicio Delicado</th>
                            <th>Servicio Urgente</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${garmentTypes.map(type => `
                            <tr>
                                <td><strong>${type}</strong></td>
                                <td>$${pricing[type].normal.toFixed(2)}</td>
                                <td>$${pricing[type].delicado.toFixed(2)}</td>
                                <td>$${pricing[type].urgente.toFixed(2)}</td>
                                <td>
                                    <button class="btn btn-sm btn-info" onclick="Billing.editGarmentPricing('${type}')">
                                        ✏️
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    static renderClientSelection() {
        const clients = Storage.getClients();
        const currentBranchId = app.getCurrentBranchId();
        const branchClients = currentBranchId ? 
            clients.filter(c => c.branchId === currentBranchId) : clients;

        return `
            <div class="client-selection">
                <div class="search-section">
                    <input type="text" 
                           id="client-search" 
                           class="form-control" 
                           placeholder="Buscar cliente por nombre, cédula o teléfono..."
                           onkeyup="Billing.searchClients(this.value)">
                </div>
                
                <div class="clients-list" id="clients-list">
                    ${this.renderClientsList(branchClients)}
                </div>
            </div>
        `;
    }

    static renderClientsList(clients) {
        if (clients.length === 0) {
            return '<div class="empty-state">No hay clientes registrados</div>';
        }

        return `
            <div class="clients-grid">
                ${clients.map(client => `
                    <div class="client-card" onclick="Billing.selectClient(${client.id})">
                        <div class="client-header">
                            <h4>${client.name}</h4>
                            <span class="client-id">${client.cedula}</span>
                        </div>
                        <div class="client-details">
                            <div class="detail-item">
                                <span class="label">📞 Teléfono:</span>
                                <span class="value">${client.phone}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">📧 Email:</span>
                                <span class="value">${client.email}</span>
                            </div>
                            <div class="detail-item">
                                <span class="label">🏢 Sucursal:</span>
                                <span class="value">${Storage.getBranchById(client.branchId)?.name || 'N/A'}</span>
                            </div>
                        </div>
                        <div class="client-stats">
                            <span class="stat">${client.totalServices || 0} servicios</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    static renderGarmentSelection() {
        if (!this.currentClient) {
            return '<div class="error-state">Seleccione un cliente primero</div>';
        }

        const garments = Storage.getGarmentsByClient(this.currentClient.id)
            .filter(g => g.status === 'listo' && !g.invoiced);

        if (garments.length === 0) {
            return `
                <div class="empty-state">
                    <h4>No hay prendas listas para facturar</h4>
                    <p>Este cliente no tiene prendas en estado "Listo" sin facturar.</p>
                    <button class="btn btn-secondary" onclick="Billing.backToClientSelection()">
                        ← Volver a selección de cliente
                    </button>
                </div>
            `;
        }

        return `
            <div class="garment-selection">
                <div class="selection-header">
                    <h4>Prendas de ${this.currentClient.name}</h4>
                    <div class="selection-actions">
                        <button class="btn btn-primary" onclick="Billing.selectAllGarments()">
                            ✅ Seleccionar Todas
                        </button>
                        <button class="btn btn-secondary" onclick="Billing.clearSelection()">
                            🗑️ Limpiar Selección
                        </button>
                    </div>
                </div>
                
                <div class="garments-list">
                    ${garments.map(garment => `
                        <div class="garment-item ${this.selectedGarments.includes(garment.id) ? 'selected' : ''}" 
                             onclick="Billing.toggleGarment(${garment.id})">
                            <div class="garment-checkbox">
                                <input type="checkbox" 
                                       ${this.selectedGarments.includes(garment.id) ? 'checked' : ''}
                                       onchange="Billing.toggleGarment(${garment.id})">
                            </div>
                            <div class="garment-info">
                                <div class="garment-rfid">${garment.rfidCode}</div>
                                <div class="garment-details">
                                    ${garment.type} ${garment.color} - ${garment.size}
                                </div>
                                <div class="garment-service">
                                    Servicio: ${this.getServiceTypeText(garment.serviceType || 'normal')}
                                </div>
                            </div>
                            <div class="garment-price">
                                $${this.calculateGarmentPrice(garment).toFixed(2)}
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="selection-summary">
                    <div class="summary-item">
                        <span>Prendas seleccionadas:</span>
                        <span class="value">${this.selectedGarments.length}</span>
                    </div>
                    <div class="summary-item">
                        <span>Subtotal:</span>
                        <span class="value">$${this.calculateSubtotal().toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="selection-actions">
                    <button class="btn btn-secondary" onclick="Billing.backToClientSelection()">
                        ← Volver
                    </button>
                    <button class="btn btn-primary" 
                            onclick="Billing.proceedToInvoice()"
                            ${this.selectedGarments.length === 0 ? 'disabled' : ''}>
                        Continuar →
                    </button>
                </div>
            </div>
        `;
    }

    static renderInvoicePreview() {
        if (this.selectedGarments.length === 0) {
            return '<div class="error-state">No hay prendas seleccionadas</div>';
        }

        const subtotal = this.calculateSubtotal();
        const taxRate = Storage.getSettings().taxRate || 0.19;
        const tax = subtotal * taxRate;
        const total = subtotal + tax;
        const selectedGarmentsData = this.selectedGarments.map(id => Storage.getGarmentById(id));

        return `
            <div class="invoice-preview">
                <div class="invoice-header">
                    <h4>📄 Factura de Servicio</h4>
                    <div class="invoice-info">
                        <div class="info-item">
                            <span class="label">Cliente:</span>
                            <span class="value">${this.currentClient.name}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Cédula:</span>
                            <span class="value">${this.currentClient.cedula}</span>
                        </div>
                        <div class="info-item">
                            <span class="label">Fecha:</span>
                            <span class="value">${new Date().toLocaleDateString('es-ES')}</span>
                        </div>
                    </div>
                </div>
                
                <div class="invoice-items">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>RFID</th>
                                <th>Prenda</th>
                                <th>Servicio</th>
                                <th>Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${selectedGarmentsData.map(garment => `
                                <tr>
                                    <td>${garment.rfidCode}</td>
                                    <td>${garment.type} ${garment.color} - ${garment.size}</td>
                                    <td>${this.getServiceTypeText(garment.serviceType || 'normal')}</td>
                                    <td>$${this.calculateGarmentPrice(garment).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                <div class="invoice-totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>IVA (${(taxRate * 100).toFixed(0)}%):</span>
                        <span>$${tax.toFixed(2)}</span>
                    </div>
                    <div class="total-row total">
                        <span>Total:</span>
                        <span>$${total.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="invoice-actions">
                    <button class="btn btn-secondary" onclick="Billing.backToGarmentSelection()">
                        ← Volver
                    </button>
                    <button class="btn btn-success" onclick="Billing.generateInvoice()">
                        💾 Generar Factura
                    </button>
                    <button class="btn btn-info" onclick="Billing.previewInvoice()">
                        👁️ Vista Previa
                    </button>
                </div>
            </div>
        `;
    }

    static renderInvoicesHistory() {
        const invoices = Storage.getInvoices();
        const currentBranchId = app.getCurrentBranchId();
        const branchInvoices = currentBranchId ? 
            invoices.filter(i => i.branchId === currentBranchId) : invoices;

        if (branchInvoices.length === 0) {
            return '<div class="empty-state">No hay facturas generadas</div>';
        }

        return `
            <div class="invoices-table">
                <table class="table">
                    <thead>
                        <tr>
                            <th>N° Factura</th>
                            <th>Cliente</th>
                            <th>Fecha</th>
                            <th>Prendas</th>
                            <th>Total</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${branchInvoices.map(invoice => {
                            const client = Storage.getClientById(invoice.clientId);
                            return `
                                <tr>
                                    <td>#${invoice.id.toString().padStart(6, '0')}</td>
                                    <td>${client ? client.name : 'Cliente no encontrado'}</td>
                                    <td>${new Date(invoice.createdAt).toLocaleDateString('es-ES')}</td>
                                    <td>${invoice.garmentIds.length}</td>
                                    <td>$${invoice.total.toFixed(2)}</td>
                                    <td>
                                        <span class="badge badge-${this.getInvoiceStatusClass(invoice.status)}">
                                            ${this.getInvoiceStatusText(invoice.status)}
                                        </span>
                                    </td>
                                    <td>
                                        <button class="btn btn-sm btn-info" onclick="Billing.viewInvoice(${invoice.id})">
                                            👁️
                                        </button>
                                        <button class="btn btn-sm btn-primary" onclick="Billing.printInvoice(${invoice.id})">
                                            🖨️
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // Métodos de interacción
    static selectClient(clientId) {
        this.currentClient = Storage.getClientById(clientId);
        this.selectedGarments = [];
        this.currentInvoice = null;
        
        this.updateStep(2);
        this.updateInvoiceContent(this.renderGarmentSelection());
        
        app.showSuccessMessage(`Cliente seleccionado: ${this.currentClient.name}`);
    }

    static backToClientSelection() {
        this.currentClient = null;
        this.selectedGarments = [];
        this.currentInvoice = null;
        
        this.updateStep(1);
        this.updateInvoiceContent(this.renderClientSelection());
    }

    static toggleGarment(garmentId) {
        const index = this.selectedGarments.indexOf(garmentId);
        if (index > -1) {
            this.selectedGarments.splice(index, 1);
        } else {
            this.selectedGarments.push(garmentId);
        }
        
        this.updateInvoiceContent(this.renderGarmentSelection());
    }

    static selectAllGarments() {
        const garments = Storage.getGarmentsByClient(this.currentClient.id)
            .filter(g => g.status === 'listo' && !g.invoiced);
        
        this.selectedGarments = garments.map(g => g.id);
        this.updateInvoiceContent(this.renderGarmentSelection());
    }

    static clearSelection() {
        this.selectedGarments = [];
        this.updateInvoiceContent(this.renderGarmentSelection());
    }

    static proceedToInvoice() {
        if (this.selectedGarments.length === 0) {
            app.showErrorMessage('Seleccione al menos una prenda');
            return;
        }
        
        this.updateStep(3);
        this.updateInvoiceContent(this.renderInvoicePreview());
    }

    static backToGarmentSelection() {
        this.updateStep(2);
        this.updateInvoiceContent(this.renderGarmentSelection());
    }

    static generateInvoice() {
        if (this.selectedGarments.length === 0) {
            app.showErrorMessage('No hay prendas seleccionadas');
            return;
        }

        const subtotal = this.calculateSubtotal();
        const taxRate = Storage.getSettings().taxRate || 0.19;
        const tax = subtotal * taxRate;
        const total = subtotal + tax;

        const invoice = {
            clientId: this.currentClient.id,
            branchId: this.currentClient.branchId,
            garmentIds: [...this.selectedGarments],
            subtotal: subtotal,
            tax: tax,
            total: total,
            status: 'pendiente',
            createdBy: app.currentUser?.username || 'sistema'
        };

        // Guardar factura
        const savedInvoice = Storage.addInvoice(invoice);

        // Marcar prendas como facturadas
        this.selectedGarments.forEach(garmentId => {
            Storage.updateGarment(garmentId, { invoiced: true, invoiceId: savedInvoice.id });
        });

        // Registrar en historial
        Storage.addHistoryEntry({
            clientId: this.currentClient.id,
            garmentIds: this.selectedGarments,
            action: 'facturacion',
            operator: app.currentUser?.username || 'sistema',
            details: `Factura #${savedInvoice.id} generada por $${total.toFixed(2)}`
        });

        app.showSuccessMessage(`Factura #${savedInvoice.id} generada correctamente por $${total.toFixed(2)}`);
        
        // Limpiar selección y volver al inicio
        this.currentClient = null;
        this.selectedGarments = [];
        this.currentInvoice = null;
        
        this.updateStep(1);
        this.updateInvoiceContent(this.renderClientSelection());
        
        // Actualizar historial de facturas
        this.refreshInvoicesHistory();
    }

    static viewInvoice(invoiceId) {
        const invoice = Storage.getInvoiceById(invoiceId);
        if (!invoice) {
            app.showErrorMessage('Factura no encontrada');
            return;
        }

        const client = Storage.getClientById(invoice.clientId);
        const garments = invoice.garmentIds.map(id => Storage.getGarmentById(id));

        const content = `
            <div class="invoice-details">
                <div class="invoice-header">
                    <h3>Factura #${invoice.id.toString().padStart(6, '0')}</h3>
                    <span class="badge badge-${this.getInvoiceStatusClass(invoice.status)}">
                        ${this.getInvoiceStatusText(invoice.status)}
                    </span>
                </div>
                
                <div class="invoice-info">
                    <div class="info-section">
                        <h4>Información del Cliente</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label">Nombre:</span>
                                <span class="value">${client ? client.name : 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Cédula:</span>
                                <span class="value">${client ? client.cedula : 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Teléfono:</span>
                                <span class="value">${client ? client.phone : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h4>Detalles de la Factura</h4>
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="label">Fecha:</span>
                                <span class="value">${new Date(invoice.createdAt).toLocaleDateString('es-ES')}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Prendas:</span>
                                <span class="value">${invoice.garmentIds.length}</span>
                            </div>
                            <div class="info-item">
                                <span class="label">Total:</span>
                                <span class="value">$${invoice.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="invoice-items">
                    <h4>Prendas Incluidas</h4>
                    <div class="items-list">
                        ${garments.map(garment => `
                            <div class="item-row">
                                <span class="item-rfid">${garment.rfidCode}</span>
                                <span class="item-details">${garment.type} ${garment.color} - ${garment.size}</span>
                                <span class="item-price">$${this.calculateGarmentPrice(garment).toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="invoice-totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>$${invoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>IVA:</span>
                        <span>$${invoice.tax.toFixed(2)}</span>
                    </div>
                    <div class="total-row total">
                        <span>Total:</span>
                        <span>$${invoice.total.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        `;

        app.showModal(`Factura #${invoice.id}`, content);
    }

    static printInvoice(invoiceId) {
        const invoice = Storage.getInvoiceById(invoiceId);
        if (!invoice) {
            app.showErrorMessage('Factura no encontrada');
            return;
        }

        const client = Storage.getClientById(invoice.clientId);
        const garments = invoice.garmentIds.map(id => Storage.getGarmentById(id));

        // Crear ventana de impresión
        const printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Factura #${invoice.id}</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px; 
                        font-size: 12px;
                        line-height: 1.4;
                    }
                    .invoice-header { 
                        text-align: center; 
                        margin-bottom: 30px;
                        border-bottom: 2px solid #000;
                        padding-bottom: 20px;
                    }
                    .invoice-title { 
                        font-size: 24px; 
                        font-weight: bold; 
                        margin-bottom: 10px;
                    }
                    .invoice-info { 
                        display: flex; 
                        justify-content: space-between; 
                        margin-bottom: 30px;
                    }
                    .client-info, .invoice-details { 
                        width: 45%; 
                    }
                    .info-section h4 { 
                        font-size: 14px; 
                        margin-bottom: 10px; 
                        border-bottom: 1px solid #ccc;
                        padding-bottom: 5px;
                    }
                    .info-item { 
                        margin: 5px 0; 
                        display: flex; 
                        justify-content: space-between;
                    }
                    .items-table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        margin-bottom: 20px;
                    }
                    .items-table th, .items-table td { 
                        border: 1px solid #000; 
                        padding: 8px; 
                        text-align: left;
                    }
                    .items-table th { 
                        background: #f0f0f0; 
                        font-weight: bold;
                    }
                    .totals { 
                        float: right; 
                        width: 300px; 
                        margin-top: 20px;
                    }
                    .total-row { 
                        display: flex; 
                        justify-content: space-between; 
                        margin: 5px 0;
                        padding: 5px 0;
                    }
                    .total-row.total { 
                        border-top: 2px solid #000; 
                        font-weight: bold; 
                        font-size: 14px;
                    }
                    .footer { 
                        margin-top: 50px; 
                        text-align: center; 
                        font-size: 10px; 
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="invoice-header">
                    <div class="invoice-title">LAVANDERÍA RFID</div>
                    <div>FACTURA DE SERVICIO</div>
                    <div>N° ${invoice.id.toString().padStart(6, '0')}</div>
                </div>
                
                <div class="invoice-info">
                    <div class="client-info">
                        <div class="info-section">
                            <h4>Cliente</h4>
                            <div class="info-item">
                                <span>Nombre:</span>
                                <span>${client ? client.name : 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span>Cédula:</span>
                                <span>${client ? client.cedula : 'N/A'}</span>
                            </div>
                            <div class="info-item">
                                <span>Teléfono:</span>
                                <span>${client ? client.phone : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="invoice-details">
                        <div class="info-section">
                            <h4>Factura</h4>
                            <div class="info-item">
                                <span>Fecha:</span>
                                <span>${new Date(invoice.createdAt).toLocaleDateString('es-ES')}</span>
                            </div>
                            <div class="info-item">
                                <span>Estado:</span>
                                <span>${this.getInvoiceStatusText(invoice.status)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <table class="items-table">
                    <thead>
                        <tr>
                            <th>RFID</th>
                            <th>Prenda</th>
                            <th>Servicio</th>
                            <th>Precio</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${garments.map(garment => `
                            <tr>
                                <td>${garment.rfidCode}</td>
                                <td>${garment.type} ${garment.color} - ${garment.size}</td>
                                <td>${this.getServiceTypeText(garment.serviceType || 'normal')}</td>
                                <td>$${this.calculateGarmentPrice(garment).toFixed(2)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
                
                <div class="totals">
                    <div class="total-row">
                        <span>Subtotal:</span>
                        <span>$${invoice.subtotal.toFixed(2)}</span>
                    </div>
                    <div class="total-row">
                        <span>IVA:</span>
                        <span>$${invoice.tax.toFixed(2)}</span>
                    </div>
                    <div class="total-row total">
                        <span>TOTAL:</span>
                        <span>$${invoice.total.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Gracias por su preferencia</p>
                    <p>Impreso el ${new Date().toLocaleString('es-ES')}</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
    }

    // Métodos de cálculo
    static calculateGarmentPrice(garment) {
        const pricing = Storage.getPricing();
        const serviceType = garment.serviceType || 'normal';
        const garmentType = garment.type;
        
        if (pricing[garmentType] && pricing[garmentType][serviceType]) {
            return pricing[garmentType][serviceType];
        }
        
        return 10.00; // Precio por defecto
    }

    static calculateSubtotal() {
        return this.selectedGarments.reduce((total, garmentId) => {
            const garment = Storage.getGarmentById(garmentId);
            return total + this.calculateGarmentPrice(garment);
        }, 0);
    }

    // Métodos de utilidad
    static getServiceTypeText(serviceType) {
        const texts = {
            'normal': 'Normal',
            'delicado': 'Delicado',
            'urgente': 'Urgente'
        };
        return texts[serviceType] || 'Normal';
    }

    static getInvoiceStatusClass(status) {
        const classes = {
            'pendiente': 'warning',
            'pagada': 'success',
            'cancelada': 'danger'
        };
        return classes[status] || 'secondary';
    }

    static getInvoiceStatusText(status) {
        const texts = {
            'pendiente': 'Pendiente',
            'pagada': 'Pagada',
            'cancelada': 'Cancelada'
        };
        return texts[status] || status;
    }

    // Métodos de actualización de UI
    static updateStep(stepNumber) {
        // Remover clase active de todos los pasos
        document.querySelectorAll('.step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Agregar clase active al paso actual
        const currentStep = document.getElementById(`step-${stepNumber}`);
        if (currentStep) {
            currentStep.classList.add('active');
        }
    }

    static updateInvoiceContent(content) {
        const contentContainer = document.getElementById('invoice-content');
        if (contentContainer) {
            contentContainer.innerHTML = content;
        }
    }

    static refreshInvoicesHistory() {
        const historyContainer = document.querySelector('.invoices-history');
        if (historyContainer) {
            historyContainer.innerHTML = this.renderInvoicesHistory();
        }
    }

    // Métodos de búsqueda
    static searchClients(query) {
        const clients = Storage.getClients();
        const currentBranchId = app.getCurrentBranchId();
        let filteredClients = currentBranchId ? 
            clients.filter(c => c.branchId === currentBranchId) : clients;

        if (query.trim()) {
            const lowercaseQuery = query.toLowerCase();
            filteredClients = filteredClients.filter(client => 
                client.name.toLowerCase().includes(lowercaseQuery) ||
                client.cedula.includes(query) ||
                client.phone.includes(query) ||
                client.email.toLowerCase().includes(lowercaseQuery)
            );
        }

        const clientsList = document.getElementById('clients-list');
        if (clientsList) {
            clientsList.innerHTML = this.renderClientsList(filteredClients);
        }
    }

    // Métodos de configuración de precios
    static editPricing() {
        app.showSuccessMessage('Funcionalidad de edición de precios en desarrollo');
    }

    static editGarmentPricing(garmentType) {
        app.showSuccessMessage(`Edición de precios para ${garmentType} en desarrollo`);
    }

    static resetPricing() {
        if (confirm('¿Está seguro que desea restaurar los precios por defecto?')) {
            // Restaurar precios por defecto
            const defaultPricing = {
                'Camisa': { normal: 12.00, delicado: 18.00, urgente: 20.00 },
                'Pantalón': { normal: 18.00, delicado: 25.00, urgente: 30.00 },
                'Buzo': { normal: 15.00, delicado: 22.00, urgente: 25.00 },
                'Chaqueta': { normal: 25.00, delicado: 35.00, urgente: 40.00 },
                'Vestido': { normal: 20.00, delicado: 30.00, urgente: 35.00 },
                'Abrigo': { normal: 30.00, delicado: 45.00, urgente: 50.00 },
                'Falda': { normal: 10.00, delicado: 15.00, urgente: 18.00 },
                'Blusa': { normal: 8.00, delicado: 12.00, urgente: 15.00 }
            };
            
            Storage.updatePricing(defaultPricing);
            app.showSuccessMessage('Precios restaurados correctamente');
            
            // Actualizar tabla de precios
            const pricingSection = document.querySelector('.pricing-section');
            if (pricingSection) {
                pricingSection.innerHTML = this.renderPricingTable();
            }
        }
    }

    // Métodos de inicialización
    static init() {
        this.addBillingStyles();
    }

    static addBillingStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .billing-system {
                max-width: 1200px;
                margin: 0 auto;
            }

            .pricing-controls {
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
                flex-wrap: wrap;
            }

            .pricing-table {
                overflow-x: auto;
            }

            .invoice-generator {
                padding: 20px;
            }

            .invoice-steps {
                display: flex;
                justify-content: center;
                margin-bottom: 30px;
                position: relative;
            }

            .invoice-steps::before {
                content: '';
                position: absolute;
                top: 20px;
                left: 10%;
                right: 10%;
                height: 2px;
                background: #dee2e6;
                z-index: 1;
            }

            .step {
                display: flex;
                flex-direction: column;
                align-items: center;
                position: relative;
                z-index: 2;
                background: white;
                padding: 0 20px;
            }

            .step-number {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: #dee2e6;
                color: #6c757d;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
                margin-bottom: 8px;
                transition: all 0.3s ease;
            }

            .step.active .step-number {
                background: #007bff;
                color: white;
            }

            .step-title {
                font-size: 0.9rem;
                color: #6c757d;
                text-align: center;
            }

            .step.active .step-title {
                color: #007bff;
                font-weight: 500;
            }

            .client-selection {
                max-width: 800px;
                margin: 0 auto;
            }

            .search-section {
                margin-bottom: 20px;
            }

            .clients-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                gap: 15px;
            }

            .client-card {
                background: white;
                border: 2px solid #dee2e6;
                border-radius: 8px;
                padding: 15px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .client-card:hover {
                border-color: #007bff;
                box-shadow: 0 4px 8px rgba(0,123,255,0.1);
            }

            .client-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
            }

            .client-header h4 {
                margin: 0;
                color: #495057;
            }

            .client-id {
                background: #e9ecef;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
                color: #6c757d;
            }

            .client-details {
                margin-bottom: 10px;
            }

            .detail-item {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
                font-size: 0.9rem;
            }

            .detail-item .label {
                color: #6c757d;
            }

            .detail-item .value {
                color: #495057;
                font-weight: 500;
            }

            .client-stats {
                text-align: center;
                padding-top: 10px;
                border-top: 1px solid #dee2e6;
            }

            .stat {
                background: #e7f3ff;
                color: #0066cc;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 0.8rem;
                font-weight: 500;
            }

            .garment-selection {
                max-width: 800px;
                margin: 0 auto;
            }

            .selection-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #dee2e6;
            }

            .selection-actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
            }

            .garments-list {
                margin-bottom: 20px;
            }

            .garment-item {
                display: flex;
                align-items: center;
                padding: 15px;
                border: 2px solid #dee2e6;
                border-radius: 8px;
                margin-bottom: 10px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .garment-item:hover {
                border-color: #007bff;
            }

            .garment-item.selected {
                border-color: #28a745;
                background: #f8fff9;
            }

            .garment-checkbox {
                margin-right: 15px;
            }

            .garment-info {
                flex: 1;
            }

            .garment-rfid {
                font-weight: bold;
                font-family: monospace;
                color: #495057;
                margin-bottom: 5px;
            }

            .garment-details {
                color: #6c757d;
                margin-bottom: 3px;
            }

            .garment-service {
                font-size: 0.9rem;
                color: #6c757d;
            }

            .garment-price {
                font-weight: bold;
                color: #28a745;
                font-size: 1.1rem;
            }

            .selection-summary {
                background: #f8f9fa;
                padding: 15px;
                border-radius: 8px;
                margin-bottom: 20px;
            }

            .summary-item {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
            }

            .summary-item .value {
                font-weight: bold;
                color: #495057;
            }

            .invoice-preview {
                max-width: 800px;
                margin: 0 auto;
            }

            .invoice-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #dee2e6;
            }

            .invoice-info {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 20px;
            }

            .info-item {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
            }

            .info-item .label {
                color: #6c757d;
            }

            .info-item .value {
                color: #495057;
                font-weight: 500;
            }

            .invoice-totals {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }

            .total-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 5px 0;
            }

            .total-row.total {
                border-top: 2px solid #dee2e6;
                font-weight: bold;
                font-size: 1.1rem;
                color: #495057;
            }

            .invoice-actions {
                display: flex;
                gap: 10px;
                justify-content: center;
                flex-wrap: wrap;
            }

            .invoices-table {
                overflow-x: auto;
            }

            .invoice-details {
                padding: 20px;
            }

            .invoice-details .invoice-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #dee2e6;
            }

            .info-section {
                margin-bottom: 20px;
            }

            .info-section h4 {
                margin-bottom: 15px;
                color: #495057;
                border-bottom: 1px solid #dee2e6;
                padding-bottom: 8px;
            }

            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 10px;
            }

            .items-list {
                margin-top: 15px;
            }

            .item-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #f1f3f4;
            }

            .item-row:last-child {
                border-bottom: none;
            }

            .item-rfid {
                font-family: monospace;
                font-weight: bold;
                color: #495057;
            }

            .item-details {
                flex: 1;
                margin: 0 15px;
                color: #6c757d;
            }

            .item-price {
                font-weight: bold;
                color: #28a745;
            }

            .empty-state, .error-state {
                text-align: center;
                padding: 40px 20px;
                color: #6c757d;
            }

            .error-state {
                color: #dc3545;
            }

            @media (max-width: 768px) {
                .invoice-steps {
                    flex-direction: column;
                    gap: 20px;
                }

                .invoice-steps::before {
                    display: none;
                }

                .clients-grid {
                    grid-template-columns: 1fr;
                }

                .selection-header {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 15px;
                }

                .selection-actions, .invoice-actions {
                    justify-content: center;
                }

                .garment-item {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 10px;
                }

                .garment-checkbox {
                    margin-right: 0;
                    text-align: center;
                }

                .invoice-info, .info-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        if (!document.querySelector('#billing-styles')) {
            style.id = 'billing-styles';
            document.head.appendChild(style);
        }
    }
}

// Exponer la clase globalmente
window.Billing = Billing;
