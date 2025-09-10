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
                <nav class="breadcrumbs">
                    <span class="breadcrumb-item">
                        🏠 <a href="#" onclick="Navigation.loadPage('dashboard')">Inicio</a>
                    </span>
                    <span class="breadcrumb-separator">/</span>
                    <span class="breadcrumb-current"></span>
                </nav>
            `;
            mainContent.insertAdjacentHTML('afterbegin', breadcrumbsHtml);
        }
    }

    static updateBreadcrumbs(pageName) {
        const currentBreadcrumb = document.querySelector('.breadcrumb-current');
        if (currentBreadcrumb && this.pages[pageName]) {
            const page = this.pages[pageName];
            currentBreadcrumb.innerHTML = `${page.icon} ${page.title}`;
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
                <div class="loading-container" style="text-align: center; padding: 60px;">
                    <div class="loader"></div>
                    <p style="margin-top: 20px; color: #718096;">Cargando...</p>
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
                }
            }
            
            // Ctrl+R para refresh de página actual
            if (e.ctrlKey && e.key === 'r') {
                e.preventDefault();
                this.refresh();
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

