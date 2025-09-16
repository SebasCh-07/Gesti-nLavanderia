/**
 * Módulo de Notificaciones Simuladas
 * Sistema de notificaciones email/SMS simuladas con logs
 */

class Notifications {
    static notificationTypes = ['email', 'sms', 'push'];
    static templates = {
        'delivery_ready': {
            email: {
                subject: 'Sus prendas están listas para recoger',
                body: 'Estimado/a {client_name}, le informamos que sus prendas están listas para recoger en nuestra sucursal {branch_name}. Puede pasar por ellas en horario de atención.'
            },
            sms: {
                body: 'Hola {client_name}, sus prendas están listas en {branch_name}. Puede recogerlas en horario de atención. Lavandería RFID.'
            }
        },
        'delivery_delayed': {
            email: {
                subject: 'Actualización sobre sus prendas',
                body: 'Estimado/a {client_name}, le informamos que sus prendas están tomando más tiempo del esperado. Nos disculpamos por la demora y trabajaremos para entregarlas pronto.'
            },
            sms: {
                body: 'Hola {client_name}, sus prendas están tomando más tiempo. Nos disculpamos por la demora. Lavandería RFID.'
            }
        },
    };

    static async render() {
        return `
            <div class="page-header">
                <h1>📧 Centro de Notificaciones</h1>
                <p>Sistema de notificaciones simuladas (Email/SMS/Push)</p>
            </div>

            <div class="notifications-center">
                <!-- Configuración de Mensajes Automáticos -->
                <div class="card mb-2">
                    <div class="card-header">
                        <h3 class="card-title">⚙️ Configuración de Mensajes Automáticos</h3>
                        <p class="card-subtitle">Define los mensajes enviados automáticamente</p>
                    </div>
                    <div class="auto-config">
                        ${this.renderAutoConfig()}
                    </div>
                </div>

                <!-- Panel de Envío -->
                <div class="card mb-2">
                    <div class="card-header">
                        <h3 class="card-title">📤 Enviar Notificación</h3>
                        <p class="card-subtitle">Enviar notificaciones a clientes</p>
                    </div>
                    <div class="notification-sender">
                        ${this.renderNotificationForm()}
                    </div>
                </div>

                <!-- Historial de Notificaciones -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">📋 Historial de Notificaciones</h3>
                        <p class="card-subtitle">Registro de todas las notificaciones enviadas</p>
                    </div>
                    <div class="notifications-history">
                        ${this.renderNotificationsHistory()}
                    </div>
                </div>
            </div>
        `;
    }

    // ===== Configuración Automática =====
    static ensureDefaultConfig() {
        const settings = Storage.getSettings() || {};
        if (!settings.notificationsConfig) {
            settings.notificationsConfig = {
                internalNewBatch: {
                    toEmail: 'control@lavanderia.com',
                    subject: 'Nuevo lote registrado: {batch_number}',
                    body: 'Se ha recibido un nuevo lote para proceso. Cliente: {client_name}. Prendas: {garment_count}.'
                },
                clientBatchReady: {
                    subject: 'Su lote {batch_number} está listo',
                    body: 'Hola {client_name}, su lote con {garment_count} prenda(s) está listo para recoger en {branch_name}.'
                }
            };
            Storage.setData(Storage.KEYS.SETTINGS, settings);
        }
    }

    static renderAutoConfig() {
        this.ensureDefaultConfig();
        const cfg = Storage.getSettings().notificationsConfig;
        return `
            <div class="auto-config-grid">
                <div class="card inner mb-2">
                    <div class="card-header">
                        <h3 class="card-title">🏭 Control Interno: Nuevo Lote</h3>
                        <p class="card-subtitle">Se envía a un correo general</p>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">Correo destino (general)</label>
                            <input id="cfg-internal-email" class="form-control" type="email" placeholder="control@empresa.com" value="${cfg.internalNewBatch.toEmail || ''}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Asunto</label>
                            <input id="cfg-internal-subject" class="form-control" type="text" value="${cfg.internalNewBatch.subject || ''}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Mensaje</label>
                            <textarea id="cfg-internal-body" class="form-control" rows="3">${cfg.internalNewBatch.body || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Variables disponibles</label>
                            <div class="variables-help">
                                <span class="variable-tag">{batch_number}</span>
                                <span class="variable-tag">{client_name}</span>
                                <span class="variable-tag">{garment_count}</span>
                                <span class="variable-tag">{branch_name}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card inner mb-2">
                    <div class="card-header">
                        <h3 class="card-title">👤 Cliente: Lote Listo</h3>
                        <p class="card-subtitle">La plataforma detecta automáticamente el cliente</p>
                    </div>
                    <div class="card-body">
                        <div class="form-group">
                            <label class="form-label">Asunto</label>
                            <input id="cfg-client-subject" class="form-control" type="text" value="${cfg.clientBatchReady.subject || ''}">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Mensaje</label>
                            <textarea id="cfg-client-body" class="form-control" rows="3">${cfg.clientBatchReady.body || ''}</textarea>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Variables disponibles</label>
                            <div class="variables-help">
                                <span class="variable-tag">{batch_number}</span>
                                <span class="variable-tag">{client_name}</span>
                                <span class="variable-tag">{garment_count}</span>
                                <span class="variable-tag">{branch_name}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="form-actions" style="text-align:right;">
                <button class="btn btn-primary" onclick="Notifications.saveAutoConfig()">💾 Guardar Configuración</button>
            </div>
        `;
    }

    static saveAutoConfig() {
        const settings = Storage.getSettings() || {};
        settings.notificationsConfig = settings.notificationsConfig || {};
        settings.notificationsConfig.internalNewBatch = {
            toEmail: document.getElementById('cfg-internal-email')?.value || '',
            subject: document.getElementById('cfg-internal-subject')?.value || '',
            body: document.getElementById('cfg-internal-body')?.value || ''
        };
        settings.notificationsConfig.clientBatchReady = {
            subject: document.getElementById('cfg-client-subject')?.value || '',
            body: document.getElementById('cfg-client-body')?.value || ''
        };
        Storage.setData(Storage.KEYS.SETTINGS, settings);
        app.showSuccessMessage('Configuración de mensajes automáticos guardada');
    }

    static renderNotificationForm() {
        return `
            <div class="notification-form">
                <div class="form-row">
                    <div class="form-col">
                        <div class="form-group">
                            <label class="form-label">Tipo de Notificación</label>
                            <select id="notification-type" class="form-control" onchange="Notifications.updateForm()">
                                <option value="email">📧 Email</option>
                                <option value="sms">📱 SMS</option>
                                <option value="push">🔔 Push Notification</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-col">
                        <div class="form-group">
                            <label class="form-label">Cliente</label>
                            <select id="notification-client" class="form-control">
                                <option value="">Seleccionar cliente...</option>
                                ${this.renderClientOptions()}
                            </select>
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label class="form-label">Asunto (Email)</label>
                    <input type="text" id="notification-subject" class="form-control" placeholder="Asunto del email...">
                </div>

                <div class="form-group">
                    <label class="form-label">Mensaje</label>
                    <textarea id="notification-message" class="form-control" rows="4" 
                              placeholder="Escriba su mensaje aquí..."></textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Variables disponibles</label>
                    <div class="variables-help">
                        <span class="variable-tag">{client_name}</span>
                        <span class="variable-tag">{client_phone}</span>
                        <span class="variable-tag">{branch_name}</span>
                        <span class="variable-tag">{garment_count}</span>
                    </div>
                </div>

                <div class="form-actions">
                    <button class="btn btn-primary" onclick="Notifications.sendNotification()">
                        📤 Enviar Notificación
                    </button>
                    <button class="btn btn-secondary" onclick="Notifications.clearForm()">
                        🗑️ Limpiar
                    </button>
                    <button class="btn btn-info" onclick="Notifications.previewNotification()">
                        👁️ Vista Previa
                    </button>
                </div>
            </div>
        `;
    }

    static renderClientOptions() {
        const clients = Storage.getClients();
        const currentBranchId = app.getCurrentBranchId();
        const branchClients = currentBranchId ? 
            clients.filter(c => c.branchId === currentBranchId) : clients;

        return branchClients.map(client => `
            <option value="${client.id}">${client.name} - ${client.phone}</option>
        `).join('');
    }

    static renderTemplates() {
        return `
            <div class="templates-grid">
                <div class="template-card" onclick="Notifications.useTemplate('delivery_ready')">
                    <div class="template-icon">📦</div>
                    <div class="template-title">Prendas Listas</div>
                    <div class="template-description">Notificar que las prendas están listas para recoger</div>
                    <div class="template-types">
                        <span class="type-badge email">📧</span>
                        <span class="type-badge sms">📱</span>
                    </div>
                </div>

                <div class="template-card" onclick="Notifications.useTemplate('delivery_delayed')">
                    <div class="template-icon">⏰</div>
                    <div class="template-title">Prendas Demoradas</div>
                    <div class="template-description">Notificar demora en el procesamiento</div>
                    <div class="template-types">
                        <span class="type-badge email">📧</span>
                        <span class="type-badge sms">📱</span>
                    </div>
                </div>


                <div class="template-card" onclick="Notifications.sendBulkNotification()">
                    <div class="template-icon">📢</div>
                    <div class="template-title">Notificación Masiva</div>
                    <div class="template-description">Enviar a múltiples clientes</div>
                    <div class="template-types">
                        <span class="type-badge email">📧</span>
                        <span class="type-badge sms">📱</span>
                    </div>
                </div>
            </div>
        `;
    }

    static renderNotificationsHistory() {
        const notifications = Storage.getNotifications();
        const currentBranchId = app.getCurrentBranchId();
        const branchNotifications = currentBranchId ? 
            notifications.filter(n => n.branchId === currentBranchId) : notifications;

        if (branchNotifications.length === 0) {
            return '<div class="empty-state">No hay notificaciones enviadas</div>';
        }

        return `
            <div class="notifications-list">
                ${branchNotifications.slice(0, 20).map(notification => {
                    const client = Storage.getClientById(notification.clientId);
                    return `
                        <div class="notification-item ${notification.status}">
                            <div class="notification-icon">
                                ${this.getNotificationIcon(notification.type)}
                            </div>
                            <div class="notification-content">
                                <div class="notification-header">
                                    <div class="notification-title">${notification.subject || 'Sin asunto'}</div>
                                    <div class="notification-meta">
                                        <span class="notification-type">${this.getNotificationTypeText(notification.type)}</span>
                                        <span class="notification-time">${this.formatDateTime(notification.createdAt)}</span>
                                    </div>
                                </div>
                                <div class="notification-body">
                                    ${notification.message}
                                </div>
                                <div class="notification-details">
                                    <span class="notification-client">Para: ${client ? client.name : 'Cliente no encontrado'}</span>
                                    <span class="notification-status badge badge-${this.getStatusClass(notification.status)}">
                                        ${this.getStatusText(notification.status)}
                                    </span>
                                </div>
                            </div>
                            <div class="notification-actions">
                                <button class="btn btn-sm btn-info" onclick="Notifications.viewNotification(${notification.id})">
                                    👁️
                                </button>
                                <button class="btn btn-sm btn-secondary" onclick="Notifications.resendNotification(${notification.id})">
                                    🔄
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    // Métodos de interacción
    static updateForm() {
        const type = document.getElementById('notification-type').value;
        const subjectField = document.getElementById('notification-subject');
        
        if (type === 'email') {
            subjectField.style.display = 'block';
            subjectField.previousElementSibling.style.display = 'block';
        } else {
            subjectField.style.display = 'none';
            subjectField.previousElementSibling.style.display = 'none';
        }
    }

    static useTemplate(templateKey) {
        const template = this.templates[templateKey];
        if (!template) return;

        const typeSelect = document.getElementById('notification-type');
        const subjectField = document.getElementById('notification-subject');
        const messageField = document.getElementById('notification-message');

        // Configurar para email por defecto
        typeSelect.value = 'email';
        this.updateForm();

        if (template.email) {
            subjectField.value = template.email.subject;
            messageField.value = template.email.body;
        } else if (template.sms) {
            typeSelect.value = 'sms';
            this.updateForm();
            messageField.value = template.sms.body;
        }

        app.showSuccessMessage(`Plantilla "${templateKey}" cargada`);
    }

    static sendNotification() {
        const type = document.getElementById('notification-type').value;
        const clientId = document.getElementById('notification-client').value;
        const subject = document.getElementById('notification-subject').value;
        const message = document.getElementById('notification-message').value;

        if (!clientId) {
            app.showErrorMessage('Seleccione un cliente');
            return;
        }

        if (!message.trim()) {
            app.showErrorMessage('Escriba un mensaje');
            return;
        }

        if (type === 'email' && !subject.trim()) {
            app.showErrorMessage('Escriba un asunto para el email');
            return;
        }

        const client = Storage.getClientById(parseInt(clientId));
        if (!client) {
            app.showErrorMessage('Cliente no encontrado');
            return;
        }

        // Procesar variables en el mensaje
        const processedMessage = this.processVariables(message, client);
        const processedSubject = subject ? this.processVariables(subject, client) : '';

        // Simular envío de notificación
        this.simulateNotificationSending(type, client, processedSubject, processedMessage);
    }

    static processVariables(text, client) {
        const branch = Storage.getBranchById(client.branchId);
        const clientGarments = Storage.getGarmentsByClient(client.id);
        const readyGarments = clientGarments.filter(g => g.status === 'listo');
        // Sistema de facturación removido - no hay facturas pendientes

        return text
            .replace(/{client_name}/g, client.name)
            .replace(/{client_phone}/g, client.phone)
            .replace(/{branch_name}/g, branch ? branch.name : 'Sucursal')
            .replace(/{garment_count}/g, readyGarments.length.toString())
    }

    static simulateNotificationSending(type, client, subject, message) {
        // Mostrar modal de simulación
        const content = `
            <div class="notification-simulation">
                <div class="simulation-header">
                    <h4>📤 Enviando ${this.getNotificationTypeText(type)}</h4>
                </div>
                
                <div class="simulation-details">
                    <div class="detail-item">
                        <span class="label">Para:</span>
                        <span class="value">${client.name} (${client.phone})</span>
                    </div>
                    <div class="detail-item">
                        <span class="label">Tipo:</span>
                        <span class="value">${this.getNotificationTypeText(type)}</span>
                    </div>
                    ${subject ? `
                        <div class="detail-item">
                            <span class="label">Asunto:</span>
                            <span class="value">${subject}</span>
                        </div>
                    ` : ''}
                    <div class="detail-item">
                        <span class="label">Mensaje:</span>
                        <span class="value">${message}</span>
                    </div>
                </div>
                
                <div class="simulation-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" id="progress-fill"></div>
                    </div>
                    <div class="progress-text" id="progress-text">Preparando envío...</div>
                </div>
            </div>
        `;

        const modal = app.showModal('Enviando Notificación', content);
        
        // Simular progreso de envío
        this.animateProgress(() => {
            // Guardar notificación
            const notification = {
                type: type,
                clientId: client.id,
                branchId: client.branchId,
                subject: subject,
                message: message,
                status: 'enviada',
                sentBy: app.currentUser?.username || 'sistema'
            };

            Storage.addNotification(notification);

            // Cerrar modal y mostrar éxito
            app.closeModal('dynamic-modal');
            app.showSuccessMessage(`${this.getNotificationTypeText(type)} enviado correctamente a ${client.name}`);

            // Limpiar formulario
            this.clearForm();

            // Actualizar historial
            this.refreshHistory();
        });
    }

    static animateProgress(callback) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        const steps = [
            { progress: 20, text: 'Conectando con el servidor...' },
            { progress: 40, text: 'Validando datos...' },
            { progress: 60, text: 'Enviando notificación...' },
            { progress: 80, text: 'Confirmando entrega...' },
            { progress: 100, text: '¡Enviado correctamente!' }
        ];

        let currentStep = 0;
        const interval = setInterval(() => {
            if (currentStep < steps.length) {
                const step = steps[currentStep];
                progressFill.style.width = step.progress + '%';
                progressText.textContent = step.text;
                currentStep++;
            } else {
                clearInterval(interval);
                setTimeout(callback, 500);
            }
        }, 800);
    }

    static clearForm() {
        document.getElementById('notification-client').value = '';
        document.getElementById('notification-subject').value = '';
        document.getElementById('notification-message').value = '';
        document.getElementById('notification-type').value = 'email';
        this.updateForm();
    }

    static previewNotification() {
        const type = document.getElementById('notification-type').value;
        const clientId = document.getElementById('notification-client').value;
        const subject = document.getElementById('notification-subject').value;
        const message = document.getElementById('notification-message').value;

        if (!clientId) {
            app.showErrorMessage('Seleccione un cliente para la vista previa');
            return;
        }

        if (!message.trim()) {
            app.showErrorMessage('Escriba un mensaje para la vista previa');
            return;
        }

        const client = Storage.getClientById(parseInt(clientId));
        const processedMessage = this.processVariables(message, client);
        const processedSubject = subject ? this.processVariables(subject, client) : '';

        const content = `
            <div class="notification-preview">
                <div class="preview-header">
                    <h4>👁️ Vista Previa - ${this.getNotificationTypeText(type)}</h4>
                </div>
                
                <div class="preview-content">
                    <div class="preview-recipient">
                        <strong>Para:</strong> ${client.name} (${client.phone})
                    </div>
                    
                    ${processedSubject ? `
                        <div class="preview-subject">
                            <strong>Asunto:</strong> ${processedSubject}
                        </div>
                    ` : ''}
                    
                    <div class="preview-message">
                        <strong>Mensaje:</strong>
                        <div class="message-content">${processedMessage}</div>
                    </div>
                </div>
            </div>
        `;

        app.showModal('Vista Previa', content);
    }

    static sendBulkNotification() {
        const clients = Storage.getClients();
        const currentBranchId = app.getCurrentBranchId();
        const branchClients = currentBranchId ? 
            clients.filter(c => c.branchId === currentBranchId) : clients;

        if (branchClients.length === 0) {
            app.showErrorMessage('No hay clientes para enviar notificación masiva');
            return;
        }

        const content = `
            <div class="bulk-notification">
                <div class="bulk-header">
                    <h4>📢 Notificación Masiva</h4>
                    <p>Se enviará a ${branchClients.length} cliente(s)</p>
                </div>
                
                <div class="bulk-form">
                    <div class="form-group">
                        <label class="form-label">Tipo de Notificación</label>
                        <select id="bulk-type" class="form-control">
                            <option value="email">📧 Email</option>
                            <option value="sms">📱 SMS</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Asunto (Email)</label>
                        <input type="text" id="bulk-subject" class="form-control" placeholder="Asunto del email...">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Mensaje</label>
                        <textarea id="bulk-message" class="form-control" rows="4" 
                                  placeholder="Escriba su mensaje aquí..."></textarea>
                    </div>
                </div>
                
                <div class="bulk-actions">
                    <button class="btn btn-primary" onclick="Notifications.sendBulkNotificationConfirm()">
                        📤 Enviar a Todos
                    </button>
                    <button class="btn btn-secondary" onclick="app.closeModal('dynamic-modal')">
                        Cancelar
                    </button>
                </div>
            </div>
        `;

        app.showModal('Notificación Masiva', content);
    }

    static sendBulkNotificationConfirm() {
        const type = document.getElementById('bulk-type').value;
        const subject = document.getElementById('bulk-subject').value;
        const message = document.getElementById('bulk-message').value;

        if (!message.trim()) {
            app.showErrorMessage('Escriba un mensaje');
            return;
        }

        if (type === 'email' && !subject.trim()) {
            app.showErrorMessage('Escriba un asunto para el email');
            return;
        }

        const clients = Storage.getClients();
        const currentBranchId = app.getCurrentBranchId();
        const branchClients = currentBranchId ? 
            clients.filter(c => c.branchId === currentBranchId) : clients;

        app.closeModal('dynamic-modal');
        app.showSuccessMessage(`Enviando notificación masiva a ${branchClients.length} clientes...`);

        // Simular envío masivo
        let sent = 0;
        branchClients.forEach((client, index) => {
            setTimeout(() => {
                const processedMessage = this.processVariables(message, client);
                const processedSubject = subject ? this.processVariables(subject, client) : '';

                const notification = {
                    type: type,
                    clientId: client.id,
                    branchId: client.branchId,
                    subject: processedSubject,
                    message: processedMessage,
                    status: 'enviada',
                    sentBy: app.currentUser?.username || 'sistema'
                };

                Storage.addNotification(notification);
                sent++;

                if (sent === branchClients.length) {
                    app.showSuccessMessage(`Notificación masiva completada: ${sent} notificaciones enviadas`);
                    this.refreshHistory();
                }
            }, index * 200);
        });
    }

    static viewNotification(notificationId) {
        const notification = Storage.getNotifications().find(n => n.id === notificationId);
        if (!notification) {
            app.showErrorMessage('Notificación no encontrada');
            return;
        }

        const client = Storage.getClientById(notification.clientId);

        const content = `
            <div class="notification-details">
                <div class="notification-header">
                    <h4>${notification.subject || 'Sin asunto'}</h4>
                    <span class="badge badge-${this.getStatusClass(notification.status)}">
                        ${this.getStatusText(notification.status)}
                    </span>
                </div>
                
                <div class="notification-info">
                    <div class="info-item">
                        <span class="label">Tipo:</span>
                        <span class="value">${this.getNotificationTypeText(notification.type)}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Cliente:</span>
                        <span class="value">${client ? client.name : 'Cliente no encontrado'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Teléfono:</span>
                        <span class="value">${client ? client.phone : 'N/A'}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Enviado por:</span>
                        <span class="value">${notification.sentBy}</span>
                    </div>
                    <div class="info-item">
                        <span class="label">Fecha:</span>
                        <span class="value">${this.formatDateTime(notification.createdAt)}</span>
                    </div>
                </div>
                
                <div class="notification-message">
                    <h5>Mensaje:</h5>
                    <div class="message-content">${notification.message}</div>
                </div>
            </div>
        `;

        app.showModal('Detalles de Notificación', content);
    }

    static resendNotification(notificationId) {
        const notification = Storage.getNotifications().find(n => n.id === notificationId);
        if (!notification) {
            app.showErrorMessage('Notificación no encontrada');
            return;
        }

        if (confirm('¿Está seguro que desea reenviar esta notificación?')) {
            const client = Storage.getClientById(notification.clientId);
            this.simulateNotificationSending(
                notification.type, 
                client, 
                notification.subject, 
                notification.message
            );
        }
    }

    static refreshHistory() {
        const historyContainer = document.querySelector('.notifications-history');
        if (historyContainer) {
            historyContainer.innerHTML = this.renderNotificationsHistory();
        }
    }

    // Métodos de utilidad
    static getNotificationIcon(type) {
        const icons = {
            'email': '📧',
            'sms': '📱',
            'push': '🔔'
        };
        return icons[type] || '📧';
    }

    static getNotificationTypeText(type) {
        const texts = {
            'email': 'Email',
            'sms': 'SMS',
            'push': 'Push Notification'
        };
        return texts[type] || type;
    }

    static getStatusClass(status) {
        const classes = {
            'enviada': 'success',
            'pendiente': 'warning',
            'fallida': 'danger'
        };
        return classes[status] || 'secondary';
    }

    static getStatusText(status) {
        const texts = {
            'enviada': 'Enviada',
            'pendiente': 'Pendiente',
            'fallida': 'Fallida'
        };
        return texts[status] || status;
    }

    static formatDateTime(timestamp) {
        return new Date(timestamp).toLocaleString('es-ES');
    }

    // Métodos de inicialización
    static init() {
        this.addNotificationStyles();
        this.ensureDefaultConfig();
    }

    static addNotificationStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .notifications-center {
                max-width: 1200px;
                margin: 0 auto;
            }

            .notification-form {
                padding: 20px;
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 20px;
            }

            .form-col {
                display: flex;
                flex-direction: column;
            }

            .variables-help {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-top: 8px;
            }

            .variable-tag {
                background: #e7f3ff;
                color: #0066cc;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
                font-family: monospace;
                border: 1px solid #b3d9ff;
            }

            .form-actions {
                display: flex;
                gap: 10px;
                flex-wrap: wrap;
                margin-top: 20px;
            }

            .templates-section {
                padding: 20px;
            }

            .templates-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                gap: 20px;
            }

            .template-card {
                background: white;
                border: 2px solid #dee2e6;
                border-radius: 8px;
                padding: 20px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .template-card:hover {
                border-color: #007bff;
                box-shadow: 0 4px 8px rgba(0,123,255,0.1);
                transform: translateY(-2px);
            }

            .template-icon {
                font-size: 2.5rem;
                margin-bottom: 15px;
            }

            .template-title {
                font-weight: bold;
                color: #495057;
                margin-bottom: 10px;
            }

            .template-description {
                color: #6c757d;
                font-size: 0.9rem;
                margin-bottom: 15px;
            }

            .template-types {
                display: flex;
                justify-content: center;
                gap: 8px;
            }

            .type-badge {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
            }

            .type-badge.email {
                background: #e7f3ff;
                color: #0066cc;
            }

            .type-badge.sms {
                background: #e8f5e8;
                color: #28a745;
            }

            .notifications-history {
                padding: 20px;
            }

            .notifications-list {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }

            .notification-item {
                display: flex;
                align-items: flex-start;
                padding: 15px;
                background: white;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                transition: all 0.2s ease;
            }

            .notification-item:hover {
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .notification-icon {
                font-size: 1.5rem;
                margin-right: 15px;
                margin-top: 5px;
            }

            .notification-content {
                flex: 1;
            }

            .notification-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 8px;
            }

            .notification-title {
                font-weight: bold;
                color: #495057;
                margin-right: 15px;
            }

            .notification-meta {
                display: flex;
                flex-direction: column;
                align-items: flex-end;
                gap: 4px;
            }

            .notification-type {
                background: #e9ecef;
                color: #6c757d;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
            }

            .notification-time {
                font-size: 0.8rem;
                color: #6c757d;
            }

            .notification-body {
                color: #6c757d;
                margin-bottom: 10px;
                line-height: 1.4;
            }

            .notification-details {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .notification-client {
                font-size: 0.9rem;
                color: #495057;
            }

            .notification-actions {
                display: flex;
                gap: 5px;
                margin-left: 15px;
            }

            .notification-simulation {
                padding: 20px;
            }

            .simulation-header {
                text-align: center;
                margin-bottom: 20px;
            }

            .simulation-details {
                margin-bottom: 20px;
            }

            .detail-item {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 8px 0;
                border-bottom: 1px solid #f1f3f4;
            }

            .detail-item:last-child {
                border-bottom: none;
            }

            .detail-item .label {
                color: #6c757d;
                font-weight: 500;
            }

            .detail-item .value {
                color: #495057;
                text-align: right;
                max-width: 60%;
                word-wrap: break-word;
            }

            .simulation-progress {
                margin-top: 20px;
            }

            .progress-bar {
                width: 100%;
                height: 8px;
                background: #e9ecef;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 10px;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #007bff, #0056b3);
                width: 0%;
                transition: width 0.3s ease;
            }

            .progress-text {
                text-align: center;
                color: #6c757d;
                font-size: 0.9rem;
            }

            .notification-preview {
                padding: 20px;
            }

            .preview-header {
                text-align: center;
                margin-bottom: 20px;
            }

            .preview-content {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #007bff;
            }

            .preview-recipient,
            .preview-subject,
            .preview-message {
                margin-bottom: 15px;
            }

            .preview-message:last-child {
                margin-bottom: 0;
            }

            .message-content {
                background: white;
                padding: 15px;
                border-radius: 6px;
                margin-top: 8px;
                border: 1px solid #dee2e6;
                white-space: pre-wrap;
            }

            .bulk-notification {
                padding: 20px;
            }

            .bulk-header {
                text-align: center;
                margin-bottom: 20px;
            }

            .bulk-form {
                margin-bottom: 20px;
            }

            .bulk-actions {
                display: flex;
                gap: 10px;
                justify-content: center;
            }

            .notification-details {
                padding: 20px;
            }

            .notification-details .notification-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                padding-bottom: 15px;
                border-bottom: 2px solid #dee2e6;
            }

            .notification-info {
                margin-bottom: 20px;
            }

            .notification-info .info-item {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 8px 0;
                border-bottom: 1px solid #f1f3f4;
            }

            .notification-info .info-item:last-child {
                border-bottom: none;
            }

            .notification-info .label {
                color: #6c757d;
                font-weight: 500;
            }

            .notification-info .value {
                color: #495057;
            }

            .notification-message h5 {
                margin-bottom: 10px;
                color: #495057;
            }

            .empty-state {
                text-align: center;
                padding: 40px 20px;
                color: #6c757d;
                font-style: italic;
            }

            @media (max-width: 768px) {
                .form-row {
                    grid-template-columns: 1fr;
                }

                .templates-grid {
                    grid-template-columns: 1fr;
                }

                .notification-item {
                    flex-direction: column;
                    align-items: stretch;
                }

                .notification-actions {
                    margin-left: 0;
                    margin-top: 15px;
                    justify-content: center;
                }

                .notification-header {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 10px;
                }

                .notification-meta {
                    align-items: flex-start;
                }

                .notification-details {
                    flex-direction: column;
                    gap: 10px;
                }

                .form-actions,
                .bulk-actions {
                    flex-direction: column;
                }
            }
        `;
        
        if (!document.querySelector('#notifications-styles')) {
            style.id = 'notifications-styles';
            document.head.appendChild(style);
        }
    }
}

// Exponer la clase globalmente
window.Notifications = Notifications;

