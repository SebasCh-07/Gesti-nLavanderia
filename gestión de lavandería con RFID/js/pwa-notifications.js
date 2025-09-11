/**
 * Módulo de Notificaciones Push PWA
 * Maneja notificaciones push simuladas para el sistema
 */

class PWANotifications {
    static isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    static permission = Notification.permission;
    static subscription = null;

    static async init() {
        if (!this.isSupported) {
            console.log('❌ Notificaciones push no soportadas en este navegador');
            return false;
        }

        console.log('🔔 Inicializando notificaciones push PWA...');
        
        // Verificar permisos
        await this.checkPermission();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Simular suscripción a notificaciones
        await this.simulateSubscription();
        
        return true;
    }

    static async checkPermission() {
        if (this.permission === 'default') {
            this.permission = await Notification.requestPermission();
        }
        
        console.log(`🔔 Permisos de notificación: ${this.permission}`);
        return this.permission === 'granted';
    }

    static setupEventListeners() {
        // Escuchar cambios en permisos
        if ('permissions' in navigator) {
            navigator.permissions.query({ name: 'notifications' }).then((result) => {
                result.addEventListener('change', () => {
                    this.permission = result.state;
                    console.log(`🔔 Permisos cambiados a: ${this.permission}`);
                });
            });
        }
    }

    static async simulateSubscription() {
        if (this.permission !== 'granted') {
            console.log('❌ Sin permisos para notificaciones');
            return null;
        }

        try {
            // Simular suscripción (en un caso real, esto se haría con un servidor)
            this.subscription = {
                endpoint: 'https://fcm.googleapis.com/fcm/send/simulated-endpoint',
                keys: {
                    p256dh: 'simulated-p256dh-key',
                    auth: 'simulated-auth-key'
                }
            };

            console.log('✅ Suscripción a notificaciones simulada');
            return this.subscription;
        } catch (error) {
            console.error('❌ Error en suscripción:', error);
            return null;
        }
    }

    static async showNotification(title, options = {}) {
        if (this.permission !== 'granted') {
            console.log('❌ Sin permisos para mostrar notificaciones');
            return false;
        }

        const defaultOptions = {
            body: 'Nueva notificación del sistema de lavandería',
            icon: '/manifest.json',
            badge: '/manifest.json',
            tag: 'lavanderia-notification',
            requireInteraction: true,
            actions: [
                {
                    action: 'view',
                    title: 'Ver',
                    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDJDMTMuMSAyIDE0IDIuOSAxNCA0VjZIMThWNEgxNlYySDEyVjJaIiBmaWxsPSIjNGY0ZjRmIi8+CjxwYXRoIGQ9Ik0xMiA2QzEzLjEgNiAxNCA2LjkgMTQgOFYxMEMxNCAxMS4xIDEzLjEgMTIgMTIgMTJIMTBWMTBIMTJWNkgxMFY2SDEyWiIgZmlsbD0iIzRmNGY0ZiIvPgo8L3N2Zz4='
                },
                {
                    action: 'dismiss',
                    title: 'Descartar',
                    icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE5IDYuNDFMMTcuNTkgNUwxMiAxMC41OUw2LjQxIDVMMTkgNi40MVoiIGZpbGw9IiM0ZjRmNGYiLz4KPC9zdmc+'
                }
            ],
            data: {
                url: '/',
                timestamp: Date.now()
            }
        };

        const notificationOptions = { ...defaultOptions, ...options };

        try {
            const notification = new Notification(title, notificationOptions);
            
            // Configurar eventos de la notificación
            notification.onclick = (event) => {
                event.preventDefault();
                window.focus();
                if (notificationOptions.data?.url) {
                    window.location.href = notificationOptions.data.url;
                }
                notification.close();
            };

            notification.onclose = () => {
                console.log('🔔 Notificación cerrada');
            };

            notification.onerror = (error) => {
                console.error('❌ Error en notificación:', error);
            };

            // Auto-cerrar después de 10 segundos
            setTimeout(() => {
                notification.close();
            }, 10000);

            console.log('✅ Notificación mostrada:', title);
            return notification;
        } catch (error) {
            console.error('❌ Error mostrando notificación:', error);
            return false;
        }
    }

    // Métodos para diferentes tipos de notificaciones
    static async notifyGarmentReady(clientName, garmentCount) {
        return await this.showNotification(
            'Prendas Listas para Recoger',
            {
                body: `${clientName}, sus ${garmentCount} prendas están listas para recoger`,
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiMyN2FlNjAiLz4KPHRleHQgeD0iMzIiIHk9IjQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5SVPC90ZXh0Pgo8L3N2Zz4=',
                tag: 'garment-ready',
                data: { url: '/#delivery' }
            }
        );
    }

    static async notifyPaymentReminder(clientName, amount) {
        return await this.showNotification(
            'Recordatorio de Pago',
            {
                body: `${clientName}, tiene un pago pendiente de $${amount}`,
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiNmMzkxMmMiLz4KPHRleHQgeD0iMzIiIHk9IjQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5SAPC90ZXh0Pgo8L3N2Zz4=',
                tag: 'payment-reminder',
                data: { url: '/#billing' }
            }
        );
    }

    static async notifySystemAlert(message) {
        return await this.showNotification(
            'Alerta del Sistema',
            {
                body: message,
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiNlNzRjM2MiLz4KPHRleHQgeD0iMzIiIHk9IjQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5iAPC90ZXh0Pgo8L3N2Zz4=',
                tag: 'system-alert',
                data: { url: '/#dashboard' }
            }
        );
    }

    static async notifyNewOrder(clientName) {
        return await this.showNotification(
            'Nueva Orden Recibida',
            {
                body: `Nueva orden de ${clientName} recibida`,
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iMTIiIGZpbGw9IiM2NjdlZWEiLz4KPHRleHQgeD0iMzIiIHk9IjQwIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMzIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj7wn5SVPC90ZXh0Pgo8L3N2Zz4=',
                tag: 'new-order',
                data: { url: '/#reception' }
            }
        );
    }

    // Panel de configuración de notificaciones
    static renderNotificationSettings() {
        return `
            <div class="notification-settings">
                <div class="settings-header">
                    <h3>🔔 Configuración de Notificaciones</h3>
                    <p>Gestiona las notificaciones push del sistema</p>
                </div>
                
                <div class="settings-content">
                    <div class="permission-status">
                        <div class="status-item">
                            <span class="status-label">Estado de Permisos:</span>
                            <span class="status-value ${this.permission}">${this.getPermissionText()}</span>
                        </div>
                        ${this.permission !== 'granted' ? `
                            <button class="btn btn-primary" onclick="PWANotifications.requestPermission()">
                                Solicitar Permisos
                            </button>
                        ` : ''}
                    </div>
                    
                    <div class="notification-types">
                        <h4>Tipos de Notificaciones</h4>
                        <div class="type-item">
                            <label class="checkbox-label">
                                <input type="checkbox" checked onchange="PWANotifications.toggleNotificationType('garment-ready', this.checked)">
                                <span class="checkmark"></span>
                                Prendas listas para recoger
                            </label>
                        </div>
                        <div class="type-item">
                            <label class="checkbox-label">
                                <input type="checkbox" checked onchange="PWANotifications.toggleNotificationType('payment-reminder', this.checked)">
                                <span class="checkmark"></span>
                                Recordatorios de pago
                            </label>
                        </div>
                        <div class="type-item">
                            <label class="checkbox-label">
                                <input type="checkbox" checked onchange="PWANotifications.toggleNotificationType('new-order', this.checked)">
                                <span class="checkmark"></span>
                                Nuevas órdenes
                            </label>
                        </div>
                        <div class="type-item">
                            <label class="checkbox-label">
                                <input type="checkbox" onchange="PWANotifications.toggleNotificationType('system-alert', this.checked)">
                                <span class="checkmark"></span>
                                Alertas del sistema
                            </label>
                        </div>
                    </div>
                    
                    <div class="test-notifications">
                        <h4>Probar Notificaciones</h4>
                        <div class="test-buttons">
                            <button class="btn btn-secondary" onclick="PWANotifications.testGarmentReady()">
                                Probar Prendas Listas
                            </button>
                            <button class="btn btn-secondary" onclick="PWANotifications.testPaymentReminder()">
                                Probar Recordatorio
                            </button>
                            <button class="btn btn-secondary" onclick="PWANotifications.testSystemAlert()">
                                Probar Alerta Sistema
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static getPermissionText() {
        const texts = {
            'granted': 'Permitido',
            'denied': 'Denegado',
            'default': 'No solicitado'
        };
        return texts[this.permission] || this.permission;
    }

    static async requestPermission() {
        this.permission = await Notification.requestPermission();
        console.log(`🔔 Permisos actualizados: ${this.permission}`);
        
        if (this.permission === 'granted') {
            await this.simulateSubscription();
            app.showSuccessMessage('Permisos de notificación concedidos');
        } else {
            app.showErrorMessage('Permisos de notificación denegados');
        }
        
        // Actualizar la UI si está visible
        this.refreshSettingsUI();
    }

    static toggleNotificationType(type, enabled) {
        const settings = this.getNotificationSettings();
        settings[type] = enabled;
        localStorage.setItem('pwa_notification_settings', JSON.stringify(settings));
        console.log(`🔔 Notificaciones ${type}: ${enabled ? 'activadas' : 'desactivadas'}`);
    }

    static getNotificationSettings() {
        const defaultSettings = {
            'garment-ready': true,
            'payment-reminder': true,
            'new-order': true,
            'system-alert': false
        };
        
        const stored = localStorage.getItem('pwa_notification_settings');
        return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
    }

    static async testGarmentReady() {
        await this.notifyGarmentReady('Cliente de Prueba', 5);
    }

    static async testPaymentReminder() {
        await this.notifyPaymentReminder('Cliente de Prueba', 25.50);
    }

    static async testSystemAlert() {
        await this.notifySystemAlert('Esta es una alerta de prueba del sistema');
    }

    static refreshSettingsUI() {
        const settingsContainer = document.querySelector('.notification-settings');
        if (settingsContainer) {
            settingsContainer.innerHTML = this.renderNotificationSettings();
        }
    }

    // Método para mostrar notificaciones basadas en eventos del sistema
    static async handleSystemEvent(eventType, data) {
        const settings = this.getNotificationSettings();
        
        if (!settings[eventType]) {
            return; // Tipo de notificación desactivado
        }

        switch (eventType) {
            case 'garment-ready':
                await this.notifyGarmentReady(data.clientName, data.garmentCount);
                break;
            case 'payment-reminder':
                await this.notifyPaymentReminder(data.clientName, data.amount);
                break;
            case 'new-order':
                await this.notifyNewOrder(data.clientName);
                break;
            case 'system-alert':
                await this.notifySystemAlert(data.message);
                break;
        }
    }

    // Simular notificaciones automáticas
    static startAutomaticNotifications() {
        // Simular notificaciones cada 30 segundos para demo
        setInterval(() => {
            if (this.permission === 'granted' && Math.random() > 0.7) {
                const events = [
                    { type: 'garment-ready', data: { clientName: 'María García', garmentCount: 3 } },
                    { type: 'payment-reminder', data: { clientName: 'Juan Pérez', amount: 15.75 } },
                    { type: 'new-order', data: { clientName: 'Ana López' } }
                ];
                
                const randomEvent = events[Math.floor(Math.random() * events.length)];
                this.handleSystemEvent(randomEvent.type, randomEvent.data);
            }
        }, 30000);
    }
}

// Exponer la clase globalmente
window.PWANotifications = PWANotifications;
