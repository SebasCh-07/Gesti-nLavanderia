/**
 * Módulo de navegación
 * Maneja la navegación entre páginas y carga de contenido dinámico
 */

class Navigation {
    static currentPage = 'dashboard';
    static pages = {
        dashboard: {
            title: 'Dashboard',
            icon: '📊',
            module: 'Dashboard'
        },
        clients: {
            title: 'Clientes',
            icon: '👥',
            module: 'Clients'
        },
        reception: {
            title: 'Recepción',
            icon: '📥',
            module: 'Reception'
        },
        control: {
            title: 'Control Interno',
            icon: '⚙️',
            module: 'Control'
        },
        delivery: {
            title: 'Entrega',
            icon: '📤',
            module: 'Delivery'
        },
        history: {
            title: 'Historial',
            icon: '📋',
            module: 'History'
        },
        reports: {
            title: 'Reportes',
            icon: '📈',
            module: 'Reports'
        },
        guides: {
            title: 'Guías',
            icon: '📄',
            module: 'Guides'
        }
    };

    static init() {
        this.setupMenuEvents();
        this.setupBreadcrumbs();
        console.log('🧭 Sistema de navegación inicializado');
    }

    static setupMenuEvents() {
        // Configurar eventos de click en el menú
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const page = item.getAttribute('data-page');
                if (page) {
                    this.loadPage(page);
                }
            });
        });

        // Configurar navegación con teclado
        document.addEventListener('keydown', (e) => {
            // Alt + número para navegación rápida
            if (e.altKey && e.key >= '1' && e.key <= '8') {
                e.preventDefault();
                const pageKeys = Object.keys(this.pages);
                const pageIndex = parseInt(e.key) - 1;
                if (pageKeys[pageIndex]) {
                    this.loadPage(pageKeys[pageIndex]);
                }
            }
        });
    }

    static setupBreadcrumbs() {
        // Crear contenedor de breadcrumbs si no existe
        const mainContent = document.querySelector('.main-content');
        if (mainContent && !document.querySelector('.breadcrumbs')) {
            const breadcrumbsHtml = `
                <nav class="breadcrumbs fade-in" style="margin-bottom: 20px; padding: 10px 0; border-bottom: 1px solid #e2e8f0;">
                    <div style="display: flex; align-items: center; gap: 8px; font-size: 14px;">
                        <span class="breadcrumb-item" style="display: flex; align-items: center; gap: 5px;">
                            <span style="font-size: 16px;">🏠</span>
                            <a href="#" onclick="Navigation.loadPage('dashboard')" style="color: var(--primary-color); text-decoration: none; font-weight: 500;">Inicio</a>
                        </span>
                        <span class="breadcrumb-separator" style="color: #a0aec0;">/</span>
                        <span class="breadcrumb-current" style="color: var(--muted-text); font-weight: 500;"></span>
                    </div>
                </nav>
            `;
            mainContent.insertAdjacentHTML('afterbegin', breadcrumbsHtml);
        }
    }

    static updateBreadcrumbs(pageName) {
        const currentBreadcrumb = document.querySelector('.breadcrumb-current');
        if (currentBreadcrumb && this.pages[pageName]) {
            const page = this.pages[pageName];
            
            // Animación de transición
            currentBreadcrumb.style.opacity = '0';
            currentBreadcrumb.style.transform = 'translateX(10px)';
            
            setTimeout(() => {
                currentBreadcrumb.innerHTML = `${page.icon} ${page.title}`;
                currentBreadcrumb.style.transition = 'all 0.3s ease';
                currentBreadcrumb.style.opacity = '1';
                currentBreadcrumb.style.transform = 'translateX(0)';
            }, 150);
        }
    }

    static async loadPage(pageName) {
        if (!this.pages[pageName]) {
            console.error(`Página no encontrada: ${pageName}`);
            return;
        }

        try {
            // Mostrar indicador de carga
            this.showLoadingIndicator();

            // Actualizar menú activo
            this.updateActiveMenu(pageName);

            // Actualizar breadcrumbs
            this.updateBreadcrumbs(pageName);

            // Cargar contenido de la página
            await this.renderPage(pageName);

            // Actualizar URL (sin recargar)
            this.updateURL(pageName);

            // Actualizar página actual
            this.currentPage = pageName;
            app.currentPage = pageName;

            // Ocultar indicador de carga
            this.hideLoadingIndicator();

            console.log(`📄 Página cargada: ${pageName}`);

        } catch (error) {
            console.error(`Error cargando página ${pageName}:`, error);
            this.showError(`Error cargando la página ${this.pages[pageName].title}`);
        }
    }

    static updateActiveMenu(pageName) {
        // Remover clase active de todos los items
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });

        // Agregar clase active al item actual
        const activeItem = document.querySelector(`[data-page="${pageName}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }

    static async renderPage(pageName) {
        const pageContent = document.getElementById('page-content');
        if (!pageContent) return;

        const page = this.pages[pageName];
        
        // Añadir clase de transición
        pageContent.classList.add('page-transition');
        
        // Pequeña demora para mostrar la transición
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Verificar si el módulo existe
        if (window[page.module] && typeof window[page.module].render === 'function') {
            // Llamar al método render del módulo
            const content = await window[page.module].render();
            pageContent.innerHTML = content;
            
            // Inicializar eventos de la página si el método existe
            if (typeof window[page.module].init === 'function') {
                window[page.module].init();
            }
        } else {
            // Página no implementada - mostrar placeholder
            pageContent.innerHTML = this.getPlaceholderContent(page);
        }
        
        // Activar transición de entrada
        setTimeout(() => {
            pageContent.classList.remove('page-transition');
            pageContent.classList.add('loaded');
        }, 50);
    }

    static getPlaceholderContent(page) {
        return `
            <div class="page-header">
                <h1>${page.icon} ${page.title}</h1>
                <p>Módulo en desarrollo</p>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">🚧 En Construcción</h3>
                </div>
                <div style="padding: 40px; text-align: center;">
                    <p>Esta funcionalidad estará disponible próximamente.</p>
                    <button class="btn btn-primary" onclick="Navigation.loadPage('dashboard')">
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        `;
    }

    static showLoadingIndicator() {
        const pageContent = document.getElementById('page-content');
        if (pageContent) {
            pageContent.innerHTML = `
                <div class="page-loading">
                    <div class="loading-spinner"></div>
                    <p class="loading-text">Cargando contenido</p>
                </div>
            `;
        }
    }

    static hideLoadingIndicator() {
        // El indicador se oculta automáticamente cuando se carga el nuevo contenido
    }

    static showError(message) {
        const pageContent = document.getElementById('page-content');
        if (pageContent) {
            pageContent.innerHTML = `
                <div class="page-header">
                    <h1>❌ Error</h1>
                    <p>Ha ocurrido un problema</p>
                </div>
                <div class="alert alert-danger">
                    <strong>Error:</strong> ${message}
                </div>
                <div class="card">
                    <div style="padding: 20px; text-align: center;">
                        <button class="btn btn-primary" onclick="Navigation.loadPage('dashboard')">
                            Volver al Dashboard
                        </button>
                        <button class="btn btn-secondary" onclick="location.reload()">
                            Recargar Aplicación
                        </button>
                    </div>
                </div>
            `;
        }
    }

    static updateURL(pageName) {
        // Actualizar URL sin recargar la página
        const newURL = `${window.location.pathname}#${pageName}`;
        window.history.pushState({ page: pageName }, '', newURL);
    }

    static handleBrowserNavigation() {
        // Manejar navegación del navegador (back/forward)
        window.addEventListener('popstate', (e) => {
            const page = e.state?.page || this.getPageFromURL();
            if (page && this.pages[page]) {
                this.loadPage(page);
            }
        });
    }

    static getPageFromURL() {
        const hash = window.location.hash.substring(1);
        return hash || 'dashboard';
    }

    static getCurrentPage() {
        return this.currentPage;
    }

    // Utilidades de navegación
    static goBack() {
        window.history.back();
    }

    static goForward() {
        window.history.forward();
    }

    static refresh() {
        this.loadPage(this.currentPage);
    }


    // Navegación programática
    static navigateTo(page, params = {}) {
        if (this.pages[page]) {
            // Guardar parámetros si es necesario
            if (Object.keys(params).length > 0) {
                sessionStorage.setItem(`nav_params_${page}`, JSON.stringify(params));
            }
            this.loadPage(page);
        }
    }

    static getPageParams(page) {
        const params = sessionStorage.getItem(`nav_params_${page}`);
        return params ? JSON.parse(params) : {};
    }

    static clearPageParams(page) {
        sessionStorage.removeItem(`nav_params_${page}`);
    }

    // Confirmación antes de navegar (para formularios)
    static confirmNavigation(message = '¿Está seguro que desea salir? Los cambios no guardados se perderán.') {
        return confirm(message);
    }

    // Bloquear navegación (para formularios importantes)
    static blockNavigation(block = true) {
        if (block) {
            window.onbeforeunload = () => '¿Está seguro que desea salir?';
        } else {
            window.onbeforeunload = null;
        }
    }

    // Obtener estadísticas de navegación
    static getNavigationStats() {
        const stats = JSON.parse(localStorage.getItem('navigation_stats') || '{}');
        return stats;
    }

    static trackPageVisit(page) {
        const stats = this.getNavigationStats();
        const today = new Date().toDateString();
        
        if (!stats[today]) {
            stats[today] = {};
        }
        
        if (!stats[today][page]) {
            stats[today][page] = 0;
        }
        
        stats[today][page]++;
        localStorage.setItem('navigation_stats', JSON.stringify(stats));
    }

    // Configurar atajos de teclado personalizados
    static setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+1-8 para navegación rápida
            if (e.ctrlKey && e.key >= '1' && e.key <= '8') {
                e.preventDefault();
                const pageKeys = Object.keys(this.pages);
                const pageIndex = parseInt(e.key) - 1;
                if (pageKeys[pageIndex]) {
                    this.loadPage(pageKeys[pageIndex]);
                    // Mostrar notificación de atajo
                    if (window.app) {
                        window.app.showNotification(`Navegando a ${this.pages[pageKeys[pageIndex]].title}`, 'info');
                    }
                }
            }
            
            // Ctrl+R para refresh de página actual
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.refresh();
                if (window.app) {
                    window.app.showNotification('Página actualizada', 'success');
                }
            }
            
            // Ctrl+H para ir al dashboard
            if (e.ctrlKey && e.key === 'h') {
                e.preventDefault();
                this.loadPage('dashboard');
                if (window.app) {
                    window.app.showNotification('Navegando al Dashboard', 'info');
                }
            }
            
            // Escape para cerrar modales
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal.active');
                if (modals.length > 0) {
                    modals.forEach(modal => modal.remove());
                    if (window.app) {
                        window.app.showNotification('Modal cerrado', 'info');
                    }
                }
            }
        });
    }

    // Configurar menú contextual
    static setupContextMenu() {
        document.addEventListener('contextmenu', (e) => {
            // Solo en elementos del menú
            if (e.target.closest('.menu-item')) {
                e.preventDefault();
                this.showContextMenu(e.target.closest('.menu-item'), e.clientX, e.clientY);
            }
        });
    }

    static showContextMenu(menuItem, x, y) {
        const page = menuItem.getAttribute('data-page');
        const contextMenuHtml = `
            <div class="context-menu" style="position: fixed; top: ${y}px; left: ${x}px; z-index: 10000;">
                <ul>
                    <li onclick="Navigation.loadPage('${page}')">Ir a ${this.pages[page].title}</li>
                    <li onclick="Navigation.openInNewTab('${page}')">Abrir en nueva pestaña</li>
                    <li onclick="Navigation.addToFavorites('${page}')">Agregar a favoritos</li>
                </ul>
            </div>
        `;
        
        // Remover menú anterior si existe
        const existingMenu = document.querySelector('.context-menu');
        if (existingMenu) existingMenu.remove();
        
        document.body.insertAdjacentHTML('beforeend', contextMenuHtml);
        
        // Cerrar al hacer click fuera
        setTimeout(() => {
            document.addEventListener('click', function closeContextMenu() {
                const menu = document.querySelector('.context-menu');
                if (menu) menu.remove();
                document.removeEventListener('click', closeContextMenu);
            });
        }, 0);
    }
}

// Inicializar navegación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    Navigation.init();
    Navigation.handleBrowserNavigation();
    Navigation.setupKeyboardShortcuts();
    
    // Cargar página inicial desde URL o dashboard por defecto
    const initialPage = Navigation.getPageFromURL();
    if (Navigation.pages[initialPage]) {
        Navigation.loadPage(initialPage);
    } else {
        Navigation.loadPage('dashboard');
    }
});

// Exponer la clase globalmente
window.Navigation = Navigation;

