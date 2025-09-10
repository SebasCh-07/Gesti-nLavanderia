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
        COUNTERS: 'laundry_counters'
    };

    // Inicializar datos por defecto
    static initializeDefaultData() {
        console.log('🗄️ Inicializando datos por defecto...');
        
        // Clientes de ejemplo
        const clients = [
            {
                id: 1,
                name: 'Javier Rodríguez',
                cedula: '12345678',
                phone: '555-0001',
                email: 'javier@email.com',
                address: 'Av. Principal 123',
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
                createdAt: '2024-02-01T14:30:00Z',
                totalServices: 8,
                rfidTags: ['RFID004', 'RFID005']
            }
        ];

        // Prendas de ejemplo
        const garments = [
            {
                id: 1,
                rfidCode: 'RFID001',
                clientId: 1,
                type: 'Buzo',
                color: 'Azul',
                size: 'M',
                status: 'listo',
                receivedAt: '2024-09-08T08:00:00Z',
                processedAt: '2024-09-09T16:00:00Z',
                deliveredAt: null,
                notes: 'Lavado normal',
                condition: 'bueno',
                timesProcessed: 3
            }
        ];

        // Guías de ejemplo
        const guides = [];

        // Historial de ejemplo
        const history = [];

        // Configuraciones del sistema
        const settings = {
            businessName: 'Lavandería RFID',
            maxDaysInProcess: 7
        };

        // Contadores para IDs
        const counters = {
            clients: 3,
            garments: 2,
            guides: 1,
            history: 1
        };

        // Guardar en localStorage
        this.setData(this.KEYS.CLIENTS, clients);
        this.setData(this.KEYS.GARMENTS, garments);
        this.setData(this.KEYS.GUIDES, guides);
        this.setData(this.KEYS.HISTORY, history);
        this.setData(this.KEYS.SETTINGS, settings);
        this.setData(this.KEYS.COUNTERS, counters);

        console.log('✅ Datos inicializados correctamente');
    }

    // Métodos genéricos de almacenamiento
    static setData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error guardando ${key}:`, error);
            return false;
        }
    }

    static getData(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error(`Error leyendo ${key}:`, error);
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

    // Métodos específicos para prendas
    static getGarments() {
        return this.getData(this.KEYS.GARMENTS, []);
    }

    static setGarments(garments) {
        return this.setData(this.KEYS.GARMENTS, garments);
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
        const garments = this.getGarments();
        const counters = this.getCounters();
        
        garment.id = counters.garments++;
        garment.receivedAt = new Date().toISOString();
        garment.status = garment.status || 'recibido';
        garment.timesProcessed = garment.timesProcessed || 1;
        
        garments.push(garment);
        
        this.setGarments(garments);
        this.setCounters(counters);
        
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
            
            garments.forEach(garment => {
                if (!clients.find(c => c.id === garment.clientId)) {
                    issues.push(`Prenda ${garment.id} referencia cliente inexistente ${garment.clientId}`);
                }
            });
        } catch (error) {
            issues.push(`Error verificando integridad: ${error.message}`);
        }
        
        return issues;
    }
}

// Exponer la clase globalmente
window.Storage = Storage;