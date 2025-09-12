/**
 * Archivo principal de la aplicación
 * Inicializa el sistema y coordina todos los módulos
 */

class LaundryApp {
    constructor() {
        this.auth = new Auth();
        this.currentUser = null;
        this.currentPage = 'dashboard';
        this.init();
    }

    init() {
        // Inicializar localStorage con datos de ejemplo si no existen
        this.initializeStorage();
        
        // Verificar si hay una sesión activa
        if (this.auth.isAuthenticated()) {
            this.currentUser = this.auth.getCurrentUser();
            this.showMainScreen();
        } else {
            this.showLoginScreen();
        }
        
        // Inicializar eventos de login
        this.initializeLoginEvents();
        
        // Inicializar eventos de logout
        this.initializeLogoutEvents();
        
        // Inicializar menú móvil
        
        // Iniciar monitoreo de sesión
        this.auth.startSessionMonitoring();
        
        // Configurar eventos globales
        this.setupGlobalEvents();
        
        // Inicializar módulos adicionales
        if (typeof Notifications !== 'undefined') {
            Notifications.init();
        }
        
        // Inicializar notificaciones PWA
        if (typeof PWANotifications !== 'undefined') {
            PWANotifications.init().then(() => {
                // Iniciar notificaciones automáticas para demo
                PWANotifications.startAutomaticNotifications();
            });
        }
        
        console.log('📱 Sistema de Lavandería RFID iniciado - SIN LOGIN');
    }

    initializeStorage() {
        console.log('🔧 Inicializando storage...');
        
        // Verificar si ya hay datos existentes
        const hasClients = Storage.getClients().length > 0;
        const hasGarments = Storage.getGarments().length > 0;
        const isInitialized = localStorage.getItem('laundry_initialized');
        
        console.log('🔧 Estado actual:', {
            hasClients,
            hasGarments,
            isInitialized,
            totalClients: Storage.getClients().length,
            totalGarments: Storage.getGarments().length
        });
        
        // Solo inicializar si no hay datos existentes Y no está marcado como inicializado
        if (!isInitialized && !hasClients && !hasGarments) {
            console.log('🗄️ Inicializando datos de ejemplo...');
            Storage.initializeDefaultData();
            localStorage.setItem('laundry_initialized', 'true');
            console.log('🗄️ Datos de ejemplo inicializados');
        } else if (hasClients || hasGarments) {
            // Marcar como inicializado si ya hay datos
            localStorage.setItem('laundry_initialized', 'true');
            console.log('🗄️ Datos existentes detectados, preservando información');
            
            // Verificar y corregir integridad de datos
            this.verifyAndFixDataIntegrity();
        } else {
            console.log('🗄️ Sistema ya inicializado, no se modifican datos');
        }
        
        // Mostrar estado final
        console.log('🔧 Estado final:', {
            totalClients: Storage.getClients().length,
            totalGarments: Storage.getGarments().length
        });
    }

    verifyAndFixDataIntegrity() {
        try {
            const issues = Storage.verifyDataIntegrity();
            if (issues.length > 0) {
                console.warn('⚠️ Problemas de integridad detectados:', issues);
                Storage.fixCounters();
                console.log('✅ Integridad de datos corregida');
            } else {
                console.log('✅ Integridad de datos verificada correctamente');
            }
        } catch (error) {
            console.error('❌ Error verificando integridad:', error);
        }
    }


    showLoginScreen() {
        const loginScreen = document.getElementById('login-screen');
        const mainScreen = document.getElementById('main-screen');
        
        if (loginScreen) loginScreen.style.display = 'flex';
        if (mainScreen) mainScreen.classList.remove('active');
    }

    showMainScreen() {
        console.log('🖥️ Mostrando pantalla principal...');
        
        const loginScreen = document.getElementById('login-screen');
        const mainScreen = document.getElementById('main-screen');
        
        // Ocultar login y mostrar main
        if (loginScreen) loginScreen.style.display = 'none';
        if (mainScreen) {
            mainScreen.classList.add('active');
            console.log('✅ Pantalla principal activada');
        }
        
        // Actualizar información del usuario
        this.updateUserInfo();
        
        // Inicializar selector de sucursal
        this.initializeBranchSelector();
        
        // Cargar dashboard inicial
        setTimeout(() => {
            if (typeof Navigation !== 'undefined' && Navigation.loadPage) {
                Navigation.loadPage('dashboard');
            } else {
                console.warn('⚠️ Navigation no está disponible, cargando dashboard básico...');
                this.loadBasicDashboard();
            }
        }, 50);
    }

    loadBasicDashboard() {
        const pageContent = document.getElementById('page-content');
        if (pageContent) {
            pageContent.innerHTML = `
                <div class="page-header">
                    <h1>📊 Dashboard</h1>
                    <p>Bienvenido al Sistema de Gestión de Lavandería RFID</p>
                </div>
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Sistema Cargado Correctamente</h3>
                    </div>
                    <div style="padding: 20px; text-align: center;">
                        <p>✅ Sistema cargado directamente</p>
                        <p>🔄 Inicializando módulos...</p>
                        <button class="btn btn-primary" onclick="location.reload()">
                            🔄 Recargar Sistema
                        </button>
                    </div>
                </div>
            `;
            
            // Intentar cargar dashboard real después de un momento
            setTimeout(() => {
                if (typeof Navigation !== 'undefined' && Navigation.loadPage) {
                    Navigation.loadPage('dashboard');
                }
            }, 1000);
        }
    }

    setupGlobalEvents() {
        // Manejar teclas de acceso rápido
        document.addEventListener('keydown', (e) => {
            // Ctrl + / para mostrar ayuda rápida
            if (e.ctrlKey && e.key === '/') {
                e.preventDefault();
                this.showQuickHelp();
            }
            
            // Escape para cerrar modales
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Manejar errores globales
        window.addEventListener('error', (e) => {
            console.error('❌ Error en la aplicación:', e.error);
            if (window.app && window.app.showErrorMessage) {
                window.app.showErrorMessage('Ha ocurrido un error inesperado');
            }
        });

        // Guardar datos antes de cerrar la ventana
        window.addEventListener('beforeunload', () => {
            this.saveAppState();
        });
    }

    showQuickHelp() {
        const helpContent = `
        <div class="quick-help">
            <h3>🔄 Atajos de Teclado</h3>
            <ul>
                <li><kbd>Ctrl</kbd> + <kbd>/</kbd> - Mostrar esta ayuda</li>
                <li><kbd>Escape</kbd> - Cerrar modales</li>
                <li><kbd>F5</kbd> - Recargar aplicación</li>
            </ul>
            
            <h3>📋 Navegación Rápida</h3>
            <ul>
                <li>Dashboard - Resumen general del sistema</li>
                <li>Clientes - Gestión de base de datos de clientes</li>
                <li>Recepción - Ingreso de prendas con RFID</li>
                <li>Control - Seguimiento de estados internos</li>
                <li>Entrega - Proceso de entrega con validaciones</li>
                <li>Historial - Consulta de servicios anteriores</li>
                <li>Reportes - Análisis y estadísticas</li>
                <li>Guías - Gestión de documentos</li>
            </ul>
        </div>`;
        
        this.showModal('Ayuda Rápida', helpContent);
    }

    showModal(title, content, onClose = null) {
        // Crear modal dinámicamente
        const modalHtml = `
            <div class="modal active" id="dynamic-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3 class="modal-title">${title}</h3>
                        <button class="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary" onclick="app.closeModal('dynamic-modal')">Cerrar</button>
                    </div>
                </div>
            </div>`;
        
        // Añadir al DOM
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Configurar eventos de cierre
        const modal = document.getElementById('dynamic-modal');
        modal.querySelector('.modal-close').onclick = () => this.closeModal('dynamic-modal');
        modal.onclick = (e) => {
            if (e.target === modal) this.closeModal('dynamic-modal');
        };

        return modal;
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.remove();
        }
    }

    closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }

    showErrorMessage(message) {
        this.showNotification(message, 'error');
    }

    showSuccessMessage(message) {
        this.showNotification(message, 'success');
    }

    showWarningMessage(message) {
        this.showNotification(message, 'warning');
    }

    showNotification(message, type = 'info') {
        // Crear notificación toast
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 18px;">${this.getNotificationIcon(type)}</span>
                <span>${message}</span>
            </div>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 0; margin-left: 10px;">&times;</button>
        `;
        
        // Estilos inline para las notificaciones
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 12px;
            color: white;
            z-index: 10000;
            max-width: 350px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
            display: flex;
            justify-content: space-between;
            align-items: center;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
            font-weight: 500;
        `;

        // Colores según el tipo
        const colors = {
            success: 'linear-gradient(135deg, #48bb78, #38a169)',
            error: 'linear-gradient(135deg, #f56565, #e53e3e)',
            warning: 'linear-gradient(135deg, #ed8936, #dd6b20)',
            info: 'linear-gradient(135deg, #4299e1, #3182ce)'
        };
        notification.style.background = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Auto-remove después de 5 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                notification.style.transform = 'translateX(100%)';
                notification.style.opacity = '0';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    saveAppState() {
        // Guardar estado actual de la aplicación
        const appState = {
            currentUser: this.currentUser,
            currentPage: this.currentPage,
            timestamp: new Date().toISOString()
        };
        localStorage.setItem('app_state', JSON.stringify(appState));
    }


    // Métodos de autenticación
    initializeLogoutEvents() {
        // Usar setTimeout para asegurar que el DOM esté completamente cargado
        setTimeout(() => {
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                // Remover cualquier event listener previo
                logoutBtn.removeEventListener('click', this.handleLogout);
                
                // Agregar el event listener
                this.handleLogout = (e) => {
                    e.preventDefault();
                    console.log('🔘 Botón de logout clickeado');
                    this.logout();
                };
                
                logoutBtn.addEventListener('click', this.handleLogout);
                console.log('✅ Event listener de logout configurado');
            } else {
                console.warn('⚠️ Botón de logout no encontrado, reintentando...');
                // Reintentar después de un tiempo
                setTimeout(() => this.initializeLogoutEvents(), 1000);
            }
        }, 100);
    }

    initializeLoginEvents() {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Autocompletar para demo
        const usernameInput = document.getElementById('username');
        if (usernameInput) {
            usernameInput.addEventListener('focus', () => {
                if (!usernameInput.value) {
                    usernameInput.placeholder = "Ingrese: admin";
                }
            });
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('login-error');
        const loginButton = document.getElementById('login-button');
        const loginText = document.getElementById('login-text');

        // UI de loading mejorada
        loginButton.disabled = true;
        loginButton.classList.add('loading');
        loginText.innerHTML = '<div class="loading-spinner" style="width: 16px; height: 16px; margin-right: 8px;"></div>Iniciando sesión...';
        errorDiv.style.display = 'none';

        try {
            const result = await this.auth.login(username, password);
            
            if (result.success) {
                this.currentUser = result.user;
                this.showSuccessMessage(result.message);
                
                // Animar transición mejorada
                const loginScreen = document.getElementById('login-screen');
                if (loginScreen) {
                    loginScreen.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
                    loginScreen.style.transform = 'translateY(-100%)';
                    loginScreen.style.opacity = '0';
                    setTimeout(() => this.showMainScreen(), 500);
                }
            } else {
                errorDiv.textContent = result.message;
                errorDiv.style.display = 'block';
                errorDiv.classList.add('bounce');
                
                // Shake animation mejorada
                loginButton.style.animation = 'shake 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                setTimeout(() => {
                    loginButton.style.animation = '';
                    errorDiv.classList.remove('bounce');
                }, 600);
            }
        } catch (error) {
            errorDiv.textContent = 'Error de conexión. Intente nuevamente.';
            errorDiv.style.display = 'block';
            errorDiv.classList.add('bounce');
        } finally {
            loginButton.disabled = false;
            loginButton.classList.remove('loading');
            loginText.textContent = 'Iniciar Sesión';
        }
    }

    logout() {
        console.log('🚪 Iniciando logout...');
        
        try {
            this.auth.logout();
            this.currentUser = null;
            console.log('✅ Auth logout completado');
            
            this.showSuccessMessage('Sesión cerrada correctamente');
            console.log('✅ Mensaje mostrado');
            
            this.showLoginScreen();
            console.log('✅ Pantalla de login mostrada');
            
            // Limpiar formulario
            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                loginForm.reset();
                console.log('✅ Formulario limpiado');
            }
        } catch (error) {
            console.error('❌ Error en logout:', error);
            this.showErrorMessage('Error al cerrar sesión');
        }
    }

    updateUserInfo() {
        const userNameEl = document.getElementById('user-name');
        const userRoleEl = document.getElementById('user-role');
        
        if (this.currentUser) {
            if (userNameEl) userNameEl.textContent = this.currentUser.name;
            if (userRoleEl) {
                const roleText = this.getRoleDisplayText(this.currentUser.role);
                const branch = Storage.getBranchById(this.currentUser.branchId);
                const branchText = branch ? ` - ${branch.name}` : '';
                userRoleEl.textContent = `${roleText}${branchText}`;
            }
        }
    }

    getRoleDisplayText(role) {
        const roleTexts = {
            'admin': 'Administrador'
        };
        return roleTexts[role] || role;
    }

    // Métodos para manejo de sucursales
    initializeBranchSelector() {
        const branchSelector = document.getElementById('branch-selector');
        const branchSelect = document.getElementById('current-branch');
        
        if (!this.currentUser) return;
        
        const availableBranches = this.auth.getAvailableBranches();
        
        if (availableBranches.length > 1) {
            // Mostrar selector solo si hay múltiples sucursales disponibles
            branchSelector.style.display = 'block';
            
            // Limpiar opciones existentes
            branchSelect.innerHTML = '<option value="">Seleccionar sucursal...</option>';
            
            // Agregar opciones de sucursales
            availableBranches.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch.id;
                option.textContent = branch.name;
                if (branch.id === this.currentUser.branchId) {
                    option.selected = true;
                }
                branchSelect.appendChild(option);
            });
        } else if (availableBranches.length === 1) {
            // Si solo hay una sucursal, establecerla automáticamente
            this.currentBranchId = availableBranches[0].id;
            branchSelector.style.display = 'none';
        }
    }

    changeBranch(branchId) {
        if (!branchId) return;
        
        // Verificar que el usuario puede acceder a esta sucursal
        if (!this.auth.canAccessBranch(parseInt(branchId))) {
            app.showErrorMessage('No tiene permisos para acceder a esta sucursal');
            return;
        }
        
        this.currentBranchId = parseInt(branchId);
        app.showSuccessMessage(`Sucursal cambiada a: ${Storage.getBranchById(branchId).name}`);
        
        // Recargar la página actual con el nuevo filtro de sucursal
        if (typeof Navigation !== 'undefined' && Navigation.getCurrentPage) {
            Navigation.loadPage(Navigation.getCurrentPage());
        }
    }

    getCurrentBranchId() {
        return this.currentBranchId || (this.currentUser ? this.currentUser.branchId : null);
    }

}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LaundryApp();
    
    // Añadir estilos de animación para notificaciones
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .notification button {
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
            margin-left: 10px;
        }
        .quick-help ul {
            list-style: none;
            padding-left: 0;
        }
        .quick-help li {
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
        }
        .quick-help li:last-child {
            border-bottom: none;
        }
        .quick-help kbd {
            background: #f1f5f9;
            border: 1px solid #cbd5e1;
            border-radius: 4px;
            padding: 2px 6px;
            font-size: 12px;
            font-family: monospace;
        }
    `;
    document.head.appendChild(style);
});

// Exponer la clase globalmente  
window.LaundryApp = LaundryApp;

// Función global de logout como respaldo
window.logout = function() {
    console.log('🔄 Logout global llamado');
    if (window.app) {
        window.app.logout();
    } else {
        console.error('❌ App no está disponible para logout');
        alert('Error: La aplicación no está inicializada correctamente');
    }
};
