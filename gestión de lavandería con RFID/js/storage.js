/**
 * Módulo de almacenamiento en localStorage
 * Maneja toda la persistencia de datos del sistema
 */

class Storage {
    static KEYS = {
        CLIENTS: 'laundry_clients',
        GARMENTS: 'laundry_garments',
        GUIDES: 'laundry_guides',
        HISTORY: 'laundry_history',
        SETTINGS: 'laundry_settings',
        COUNTERS: 'laundry_counters',
        BRANCHES: 'laundry_branches',
        USERS: 'laundry_users',
        PRICING: 'laundry_pricing',
        INVOICES: 'laundry_invoices',
        NOTIFICATIONS: 'laundry_notifications'
    };

    // Inicializar datos por defecto
    static initializeDefaultData() {
        console.log('🗄️ Inicializando datos por defecto...');
        
        // Sucursales de ejemplo
        const branches = [
            {
                id: 1,
                name: 'Sucursal Centro',
                address: 'Av. Principal 123, Centro',
                phone: '555-0100',
                email: 'centro@lavanderia.com',
                manager: 'Gerente Centro',
                isActive: true,
                createdAt: '2024-01-01T00:00:00Z'
            },
            {
                id: 2,
                name: 'Sucursal Norte',
                address: 'Calle Norte 456, Zona Norte',
                phone: '555-0200',
                email: 'norte@lavanderia.com',
                manager: 'Gerente Norte',
                isActive: true,
                createdAt: '2024-01-01T00:00:00Z'
            },
            {
                id: 3,
                name: 'Sucursal Sur',
                address: 'Av. Sur 789, Zona Sur',
                phone: '555-0300',
                email: 'sur@lavanderia.com',
                manager: 'Gerente Sur',
                isActive: true,
                createdAt: '2024-01-01T00:00:00Z'
            }
        ];

        // Clientes de ejemplo
        const clients = [
            {
                id: 1,
                name: 'Javier Rodríguez',
                cedula: '12345678',
                phone: '555-0001',
                email: 'javier@email.com',
                address: 'Av. Principal 123',
                branchId: 1,
                createdAt: '2024-01-15T10:00:00Z',
                totalServices: 15,
                rfidTags: ['RFID001', 'RFID002', 'RFID003']
            },
            {
                id: 2,
                name: 'María González',
                cedula: '87654321',
                phone: '555-0002',
                email: 'maria@email.com',
                address: 'Calle Segunda 456',
                branchId: 1,
                createdAt: '2024-02-01T14:30:00Z',
                totalServices: 8,
                rfidTags: ['RFID004', 'RFID005']
            },
            {
                id: 3,
                name: 'Carlos López',
                cedula: '11223344',
                phone: '555-0003',
                email: 'carlos@email.com',
                address: 'Calle Norte 789',
                branchId: 2,
                createdAt: '2024-02-15T09:00:00Z',
                totalServices: 12,
                rfidTags: ['RFID006', 'RFID007']
            }
        ];

        // Prendas de ejemplo
        const garments = [
            {
                id: 1,
                rfidCode: 'RFID001',
                clientId: 1,
                branchId: 1,
                type: 'Buzo',
                color: 'Azul',
                size: 'M',
                status: 'listo',
                receivedAt: '2024-09-08T08:00:00Z',
                processedAt: '2024-09-09T16:00:00Z',
                deliveredAt: null,
                notes: 'Lavado normal',
                condition: 'bueno',
                timesProcessed: 3,
                serviceType: 'normal',
                priority: 'normal',
                price: 15.00
            },
            {
                id: 2,
                rfidCode: 'RFID002',
                clientId: 1,
                branchId: 1,
                type: 'Camisa',
                color: 'Blanco',
                size: 'L',
                status: 'recibido',
                receivedAt: new Date().toISOString(),
                processedAt: null,
                deliveredAt: null,
                notes: 'Recién recibida',
                condition: 'bueno',
                timesProcessed: 1,
                serviceType: 'normal',
                priority: 'normal',
                price: 12.00
            },
            {
                id: 3,
                rfidCode: 'RFID003',
                clientId: 2,
                branchId: 1,
                type: 'Pantalón',
                color: 'Negro',
                size: 'M',
                status: 'en_proceso',
                receivedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días atrás
                processedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
                deliveredAt: null,
                notes: 'En proceso de lavado',
                condition: 'regular',
                timesProcessed: 1,
                serviceType: 'normal',
                priority: 'normal',
                price: 18.00
            },
            {
                id: 4,
                rfidCode: 'RFID006',
                clientId: 3,
                branchId: 2,
                type: 'Chaqueta',
                color: 'Gris',
                size: 'L',
                status: 'recibido',
                receivedAt: new Date().toISOString(),
                processedAt: null,
                deliveredAt: null,
                notes: 'Lavado en seco',
                condition: 'bueno',
                timesProcessed: 1,
                serviceType: 'delicado',
                priority: 'normal',
                price: 25.00
            }
        ];

        // Guías de ejemplo
        const guides = [];

        // Historial de ejemplo
        const history = [];

        // Configuraciones del sistema
        const settings = {
            businessName: 'Lavandería RFID',
            maxDaysInProcess: 7,
            taxRate: 0.19, // 19% IVA
            currency: 'COP'
        };

        // Precios por tipo de prenda
        const pricing = {
            'Camisa': { normal: 12.00, delicado: 18.00, urgente: 20.00 },
            'Pantalón': { normal: 18.00, delicado: 25.00, urgente: 30.00 },
            'Buzo': { normal: 15.00, delicado: 22.00, urgente: 25.00 },
            'Chaqueta': { normal: 25.00, delicado: 35.00, urgente: 40.00 },
            'Vestido': { normal: 20.00, delicado: 30.00, urgente: 35.00 },
            'Abrigo': { normal: 30.00, delicado: 45.00, urgente: 50.00 },
            'Falda': { normal: 10.00, delicado: 15.00, urgente: 18.00 },
            'Blusa': { normal: 8.00, delicado: 12.00, urgente: 15.00 }
        };

        // Facturas de ejemplo
        const invoices = [];

        // Notificaciones de ejemplo
        const notifications = [];

        // Contadores para IDs
        const counters = {
            clients: 4,
            garments: 5,
            guides: 1,
            history: 1,
            branches: 4,
            invoices: 1,
            notifications: 1
        };

        // Guardar en localStorage
        this.setData(this.KEYS.BRANCHES, branches);
        this.setData(this.KEYS.CLIENTS, clients);
        this.setData(this.KEYS.GARMENTS, garments);
        this.setData(this.KEYS.GUIDES, guides);
        this.setData(this.KEYS.HISTORY, history);
        this.setData(this.KEYS.SETTINGS, settings);
        this.setData(this.KEYS.PRICING, pricing);
        this.setData(this.KEYS.INVOICES, invoices);
        this.setData(this.KEYS.NOTIFICATIONS, notifications);
        this.setData(this.KEYS.COUNTERS, counters);

        console.log('✅ Datos inicializados correctamente');
    }

    // Métodos genéricos de almacenamiento
    static setData(key, data) {
        try {
            console.log(`💾 Storage.setData() - Guardando ${key}:`, data.length || 'objeto', 'elementos');
            localStorage.setItem(key, JSON.stringify(data));
            console.log(`💾 Storage.setData() - ${key} guardado exitosamente`);
            return true;
        } catch (error) {
            console.error(`❌ Error guardando ${key}:`, error);
            return false;
        }
    }

    static getData(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            const parsed = data ? JSON.parse(data) : defaultValue;
            console.log(`📖 Storage.getData() - Leyendo ${key}:`, parsed.length || 'objeto', 'elementos');
            return parsed;
        } catch (error) {
            console.error(`❌ Error leyendo ${key}:`, error);
            return defaultValue;
        }
    }

    // Métodos específicos para clientes
    static getClients() {
        return this.getData(this.KEYS.CLIENTS, []);
    }

    static setClients(clients) {
        return this.setData(this.KEYS.CLIENTS, clients);
    }

    static getClientById(id) {
        const clients = this.getClients();
        return clients.find(client => client.id === parseInt(id));
    }

    static addClient(client) {
        const clients = this.getClients();
        const counters = this.getCounters();
        
        client.id = counters.clients++;
        client.createdAt = new Date().toISOString();
        client.totalServices = 0;
        client.rfidTags = client.rfidTags || [];
        
        clients.push(client);
        
        this.setClients(clients);
        this.setCounters(counters);
        
        return client;
    }

    static updateClient(id, updates) {
        const clients = this.getClients();
        const index = clients.findIndex(client => client.id === parseInt(id));
        
        if (index !== -1) {
            clients[index] = { ...clients[index], ...updates };
            this.setClients(clients);
            return clients[index];
        }
        return null;
    }

    // Métodos específicos para prendas
    static getGarments() {
        const garments = this.getData(this.KEYS.GARMENTS, []);
        console.log('📦 Storage.getGarments() - Retornando:', garments.length, 'prendas');
        return garments;
    }

    static setGarments(garments) {
        console.log('💾 Storage.setGarments() - Guardando:', garments.length, 'prendas');
        const result = this.setData(this.KEYS.GARMENTS, garments);
        console.log('💾 Storage.setGarments() - Resultado:', result ? 'Éxito' : 'Error');
        return result;
    }

    static getGarmentById(id) {
        const garments = this.getGarments();
        return garments.find(garment => garment.id === parseInt(id));
    }

    static getGarmentByRfid(rfidCode) {
        const garments = this.getGarments();
        return garments.find(garment => garment.rfidCode === rfidCode);
    }

    static getGarmentsByStatus(status) {
        const garments = this.getGarments();
        return garments.filter(garment => garment.status === status);
    }

    static getGarmentsByClient(clientId) {
        const garments = this.getGarments();
        return garments.filter(garment => garment.clientId === parseInt(clientId));
    }

    static addGarment(garment) {
        console.log('➕ Storage.addGarment() - Agregando prenda:', garment);
        
        const garments = this.getGarments();
        const counters = this.getCounters();
        
        console.log('➕ Prendas existentes antes:', garments.length);
        console.log('➕ Contador actual:', counters.garments);
        
        garment.id = counters.garments++;
        garment.receivedAt = new Date().toISOString();
        garment.status = garment.status || 'recibido';
        garment.timesProcessed = garment.timesProcessed || 1;
        
        garments.push(garment);
        
        console.log('➕ Prenda procesada:', garment);
        console.log('➕ Nuevo contador:', counters.garments);
        
        const saveResult = this.setGarments(garments);
        const counterResult = this.setCounters(counters);
        
        console.log('➕ Resultado guardado prendas:', saveResult);
        console.log('➕ Resultado guardado contadores:', counterResult);
        
        return garment;
    }

    static updateGarment(id, updates) {
        const garments = this.getGarments();
        const index = garments.findIndex(garment => garment.id === parseInt(id));
        
        if (index !== -1) {
            garments[index] = { ...garments[index], ...updates };
            this.setGarments(garments);
            return garments[index];
        }
        return null;
    }

    // Métodos para guías
    static getGuides() {
        return this.getData(this.KEYS.GUIDES, []);
    }

    static setGuides(guides) {
        return this.setData(this.KEYS.GUIDES, guides);
    }

    static addGuide(guide) {
        const guides = this.getGuides();
        const counters = this.getCounters();
        
        guide.id = counters.guides++;
        guide.generatedAt = new Date().toISOString();
        guide.status = 'activa';
        
        guides.push(guide);
        
        this.setGuides(guides);
        this.setCounters(counters);
        
        return guide;
    }

    // Métodos para historial
    static getHistory() {
        return this.getData(this.KEYS.HISTORY, []);
    }

    static addHistoryEntry(entry) {
        const history = this.getHistory();
        const counters = this.getCounters();
        
        entry.id = counters.history++;
        entry.timestamp = new Date().toISOString();
        
        history.unshift(entry);
        
        this.setData(this.KEYS.HISTORY, history);
        this.setCounters(counters);
        
        return entry;
    }

    // Métodos para configuraciones
    static getSettings() {
        return this.getData(this.KEYS.SETTINGS, {});
    }

    // Métodos para contadores
    static getCounters() {
        return this.getData(this.KEYS.COUNTERS, {
            clients: 1,
            garments: 1,
            guides: 1,
            history: 1
        });
    }

    static setCounters(counters) {
        return this.setData(this.KEYS.COUNTERS, counters);
    }

    // Métodos de utilidad
    static searchClients(query) {
        const clients = this.getClients();
        const lowercaseQuery = query.toLowerCase();
        
        return clients.filter(client => 
            client.name.toLowerCase().includes(lowercaseQuery) ||
            client.cedula.includes(query) ||
            client.phone.includes(query) ||
            client.email.toLowerCase().includes(lowercaseQuery)
        );
    }

    // Estadísticas
    static getStats() {
        const clients = this.getClients();
        const garments = this.getGarments();
        const guides = this.getGuides();
        
        return {
            totalClients: clients.length,
            totalGarments: garments.length,
            garmentsReceived: garments.filter(g => g.status === 'recibido').length,
            garmentsInProcess: garments.filter(g => g.status === 'en_proceso').length,
            garmentsReady: garments.filter(g => g.status === 'listo').length,
            garmentsDelivered: garments.filter(g => g.status === 'entregado').length,
            activeGuides: guides.filter(g => g.status === 'activa').length,
            completedGuides: guides.filter(g => g.status === 'completada').length
        };
    }

    // Verificar integridad de datos
    static verifyDataIntegrity() {
        const issues = [];
        try {
            const clients = this.getClients();
            const garments = this.getGarments();
            const counters = this.getCounters();
            
            // Verificar referencias de prendas a clientes
            garments.forEach(garment => {
                if (!clients.find(c => c.id === garment.clientId)) {
                    issues.push(`Prenda ${garment.id} referencia cliente inexistente ${garment.clientId}`);
                }
            });
            
            // Verificar que los contadores sean correctos
            const maxClientId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) : 0;
            const maxGarmentId = garments.length > 0 ? Math.max(...garments.map(g => g.id)) : 0;
            
            if (counters.clients <= maxClientId) {
                issues.push(`Contador de clientes (${counters.clients}) debe ser mayor que el ID máximo (${maxClientId})`);
            }
            
            if (counters.garments <= maxGarmentId) {
                issues.push(`Contador de prendas (${counters.garments}) debe ser mayor que el ID máximo (${maxGarmentId})`);
            }
            
        } catch (error) {
            issues.push(`Error verificando integridad: ${error.message}`);
        }
        
        return issues;
    }

    // Corregir contadores si es necesario
    static fixCounters() {
        const clients = this.getClients();
        const garments = this.getGarments();
        const guides = this.getGuides();
        const history = this.getHistory();
        
        const counters = {
            clients: clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1,
            garments: garments.length > 0 ? Math.max(...garments.map(g => g.id)) + 1 : 1,
            guides: guides.length > 0 ? Math.max(...guides.map(g => g.id)) + 1 : 1,
            history: history.length > 0 ? Math.max(...history.map(h => h.id)) + 1 : 1
        };
        
        this.setCounters(counters);
        console.log('🔧 Contadores corregidos:', counters);
        return counters;
    }

    // Método para limpiar datos de prueba (solo para desarrollo)
    static clearTestData() {
        if (confirm('¿Está seguro que desea limpiar todos los datos? Esta acción no se puede deshacer.')) {
            localStorage.removeItem(this.KEYS.CLIENTS);
            localStorage.removeItem(this.KEYS.GARMENTS);
            localStorage.removeItem(this.KEYS.GUIDES);
            localStorage.removeItem(this.KEYS.HISTORY);
            localStorage.removeItem(this.KEYS.COUNTERS);
            localStorage.removeItem('laundry_initialized');
            console.log('🗑️ Datos limpiados');
            return true;
        }
        return false;
    }

    // Método para hacer backup de datos
    static exportAllData() {
        const data = {
            clients: this.getClients(),
            garments: this.getGarments(),
            guides: this.getGuides(),
            history: this.getHistory(),
            settings: this.getSettings(),
            counters: this.getCounters(),
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup_lavanderia_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        
        console.log('💾 Backup exportado');
        return data;
    }

    // Método para importar datos desde backup
    static importData(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;
            
            if (data.clients) this.setClients(data.clients);
            if (data.garments) this.setGarments(data.garments);
            if (data.guides) this.setGuides(data.guides);
            if (data.history) this.setData(this.KEYS.HISTORY, data.history);
            if (data.settings) this.setData(this.KEYS.SETTINGS, data.settings);
            if (data.counters) this.setCounters(data.counters);
            
            console.log('📥 Datos importados correctamente');
            return true;
        } catch (error) {
            console.error('❌ Error importando datos:', error);
            return false;
        }
    }

    // Método para verificar el estado actual del localStorage
    static debugStorageState() {
        console.log('🔍 === ESTADO ACTUAL DEL STORAGE ===');
        console.log('🔑 Claves en localStorage:', Object.keys(localStorage));
        
        Object.keys(this.KEYS).forEach(keyName => {
            const key = this.KEYS[keyName];
            const data = localStorage.getItem(key);
            console.log(`📋 ${keyName} (${key}):`, data ? JSON.parse(data).length : 0, 'elementos');
        });
        
        console.log('🔍 === FIN ESTADO STORAGE ===');
    }

    // Métodos para sucursales
    static getBranches() {
        return this.getData(this.KEYS.BRANCHES, []);
    }

    static getBranchById(id) {
        const branches = this.getBranches();
        return branches.find(branch => branch.id === parseInt(id));
    }

    static addBranch(branch) {
        const branches = this.getBranches();
        const counters = this.getCounters();
        
        branch.id = counters.branches++;
        branch.createdAt = new Date().toISOString();
        branch.isActive = true;
        
        branches.push(branch);
        
        this.setData(this.KEYS.BRANCHES, branches);
        this.setCounters(counters);
        
        return branch;
    }

    // Métodos para precios
    static getPricing() {
        return this.getData(this.KEYS.PRICING, {});
    }

    static updatePricing(pricing) {
        return this.setData(this.KEYS.PRICING, pricing);
    }

    static getPriceForGarment(type, serviceType = 'normal') {
        const pricing = this.getPricing();
        return pricing[type] && pricing[type][serviceType] ? pricing[type][serviceType] : 10.00;
    }

    // Métodos para facturas
    static getInvoices() {
        return this.getData(this.KEYS.INVOICES, []);
    }

    static addInvoice(invoice) {
        const invoices = this.getInvoices();
        const counters = this.getCounters();
        
        invoice.id = counters.invoices++;
        invoice.createdAt = new Date().toISOString();
        invoice.status = 'pendiente';
        
        invoices.push(invoice);
        
        this.setData(this.KEYS.INVOICES, invoices);
        this.setCounters(counters);
        
        return invoice;
    }

    static getInvoiceById(id) {
        const invoices = this.getInvoices();
        return invoices.find(invoice => invoice.id === parseInt(id));
    }

    // Métodos para notificaciones
    static getNotifications() {
        return this.getData(this.KEYS.NOTIFICATIONS, []);
    }

    static addNotification(notification) {
        const notifications = this.getNotifications();
        const counters = this.getCounters();
        
        notification.id = counters.notifications++;
        notification.createdAt = new Date().toISOString();
        notification.status = 'enviada';
        
        notifications.push(notification);
        
        this.setData(this.KEYS.NOTIFICATIONS, notifications);
        this.setCounters(counters);
        
        return notification;
    }

    static getNotificationsByClient(clientId) {
        const notifications = this.getNotifications();
        return notifications.filter(n => n.clientId === clientId);
    }

    // Métodos para filtrado por sucursal
    static getClientsByBranch(branchId) {
        const clients = this.getClients();
        return clients.filter(client => client.branchId === branchId);
    }

    static getGarmentsByBranch(branchId) {
        const garments = this.getGarments();
        return garments.filter(garment => garment.branchId === branchId);
    }

    static getInvoicesByBranch(branchId) {
        const invoices = this.getInvoices();
        return invoices.filter(invoice => invoice.branchId === branchId);
    }
}

// Exponer la clase globalmente
window.Storage = Storage;