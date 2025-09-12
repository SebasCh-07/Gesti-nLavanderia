/**
 * Sistema de Autenticación Simplificado
 * Maneja login, logout y gestión de sesiones
 */

class Auth {
    constructor() {
        this.currentUser = null;
        this.sessionExpiry = null;
        this.loginAttempts = 0;
        this.maxAttempts = 5;
        this.lockoutTime = 5 * 60 * 1000; // 5 minutos
        
        // Usuarios predefinidos para el prototipo
        this.users = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                name: 'Administrador del Sistema',
                role: 'admin',
                email: 'admin@lavanderia.com',
                branchId: 1,
                permissions: ['all']
            }
        ];
        
        this.initializeAuth();
    }

    initializeAuth() {
        // Verificar si hay una sesión activa
        const savedSession = localStorage.getItem('laundry_session');
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                if (this.isValidSession(session)) {
                    this.currentUser = session.user;
                    this.sessionExpiry = new Date(session.expiry);
                    return true;
                }
            } catch (error) {
                console.error('Error loading session:', error);
            }
        }
        
        // Limpiar sesión inválida
        this.clearSession();
        return false;
    }

    isValidSession(session) {
        if (!session || !session.user || !session.expiry) {
            return false;
        }
        
        const now = new Date();
        const expiry = new Date(session.expiry);
        
        return expiry > now;
    }

    async login(username, password) {
        try {
            // Verificar bloqueo por intentos fallidos
            if (this.isLockedOut()) {
                const remainingTime = this.getRemainingLockoutTime();
                throw new Error(`Cuenta bloqueada. Intente nuevamente en ${Math.ceil(remainingTime / 60000)} minutos.`);
            }

            // Simular demora de red
            await this.simulateNetworkDelay();

            // Buscar usuario
            const user = this.users.find(u => 
                u.username.toLowerCase() === username.toLowerCase() && 
                u.password === password
            );

            if (!user) {
                this.loginAttempts++;
                this.saveLoginAttempts();
                
                const remainingAttempts = this.maxAttempts - this.loginAttempts;
                if (remainingAttempts > 0) {
                    throw new Error(`Credenciales incorrectas. Intentos restantes: ${remainingAttempts}`);
                } else {
                    this.setLockout();
                    throw new Error(`Demasiados intentos fallidos. Cuenta bloqueada por ${this.lockoutTime / 60000} minutos.`);
                }
            }

            // Login exitoso
            this.loginAttempts = 0;
            this.currentUser = { ...user };
            delete this.currentUser.password; // No guardar la contraseña en memoria
            
            // Crear sesión
            this.createSession();
            
            // Limpiar intentos de login
            localStorage.removeItem('login_attempts');
            localStorage.removeItem('lockout_until');
            
            return {
                success: true,
                user: this.currentUser,
                message: `Bienvenido, ${user.name}`
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    createSession() {
        // Sesión válida por 8 horas
        this.sessionExpiry = new Date(Date.now() + 8 * 60 * 60 * 1000);
        
        const session = {
            user: this.currentUser,
            expiry: this.sessionExpiry.toISOString(),
            loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('laundry_session', JSON.stringify(session));
        
        // Agregar al historial
        Storage.addHistoryEntry({
            action: 'login',
            operator: this.currentUser.name,
            details: `Inicio de sesión desde ${this.getDeviceInfo()}`
        });
    }

    logout() {
        if (this.currentUser) {
            // Agregar al historial
            Storage.addHistoryEntry({
                action: 'logout',
                operator: this.currentUser.name,
                details: `Cierre de sesión desde ${this.getDeviceInfo()}`
            });
        }
        
        this.clearSession();
        return true;
    }

    clearSession() {
        this.currentUser = null;
        this.sessionExpiry = null;
        localStorage.removeItem('laundry_session');
    }

    isAuthenticated() {
        return this.currentUser !== null && this.isSessionValid();
    }

    isSessionValid() {
        if (!this.sessionExpiry) return false;
        return new Date() < this.sessionExpiry;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    hasPermission(permission) {
        if (!this.currentUser) return false;
        
        // Admin tiene todos los permisos
        if (this.currentUser.role === 'admin') return true;
        
        // Verificar permisos específicos del usuario
        return this.currentUser.permissions && this.currentUser.permissions.includes(permission);
    }

    hasAnyRole(roles) {
        return this.currentUser && roles.includes(this.currentUser.role);
    }

    canAccessBranch(branchId) {
        if (!this.currentUser) return false;
        
        // Admin puede acceder a todas las sucursales
        if (this.currentUser.role === 'admin') return true;
        
        // Otros roles solo pueden acceder a su sucursal asignada
        return this.currentUser.branchId === branchId;
    }

    getAvailableBranches() {
        if (!this.currentUser) return [];
        
        // Admin puede ver todas las sucursales
        if (this.currentUser.role === 'admin') {
            return Storage.getBranches();
        }
        
        // Otros roles solo ven su sucursal
        const userBranch = Storage.getBranchById(this.currentUser.branchId);
        return userBranch ? [userBranch] : [];
    }

    // Métodos de seguridad
    isLockedOut() {
        const lockoutUntil = localStorage.getItem('lockout_until');
        if (!lockoutUntil) return false;
        
        return new Date() < new Date(lockoutUntil);
    }

    getRemainingLockoutTime() {
        const lockoutUntil = localStorage.getItem('lockout_until');
        if (!lockoutUntil) return 0;
        
        return Math.max(0, new Date(lockoutUntil) - new Date());
    }

    setLockout() {
        const lockoutUntil = new Date(Date.now() + this.lockoutTime);
        localStorage.setItem('lockout_until', lockoutUntil.toISOString());
    }

    saveLoginAttempts() {
        localStorage.setItem('login_attempts', this.loginAttempts.toString());
    }

    // Métodos utilitarios
    async simulateNetworkDelay() {
        const delay = Math.random() * 1000 + 500; // 500-1500ms
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    getDeviceInfo() {
        return `${navigator.platform} - ${navigator.userAgent.split(' ')[0]}`;
    }

    extendSession() {
        if (this.isAuthenticated()) {
            this.sessionExpiry = new Date(Date.now() + 8 * 60 * 60 * 1000);
            this.createSession();
        }
    }

    getSessionInfo() {
        if (!this.isAuthenticated()) return null;
        
        return {
            user: this.currentUser,
            expiry: this.sessionExpiry,
            timeRemaining: this.sessionExpiry - new Date(),
            isExpiringSoon: (this.sessionExpiry - new Date()) < 30 * 60 * 1000 // 30 minutos
        };
    }

    // Método para obtener estadísticas de autenticación
    getAuthStats() {
        return {
            currentUser: this.currentUser?.name || 'No autenticado',
            role: this.currentUser?.role || 'none',
            sessionExpiry: this.sessionExpiry,
            loginAttempts: this.loginAttempts,
            isLockedOut: this.isLockedOut()
        };
    }

    // Método para cambio de contraseña (futuro)
    async changePassword(currentPassword, newPassword) {
        // Implementación futura
        throw new Error('Funcionalidad no implementada en el prototipo');
    }

    // Validación de sesión periódica
    startSessionMonitoring() {
        setInterval(() => {
            if (this.isAuthenticated() && !this.isSessionValid()) {
                this.logout();
                app.showErrorMessage('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
                app.showLoginScreen();
            }
        }, 60000); // Verificar cada minuto
    }
}

// Exponer la clase globalmente
window.Auth = Auth;