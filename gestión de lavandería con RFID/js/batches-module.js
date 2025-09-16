/**
 * Módulo de Lotes para el sistema de navegación
 * Proporciona la interfaz entre la navegación y el BatchManager
 */

class Batches {
    static async render() {
        // Retornar contenido HTML embebido para evitar problemas de CORS
        return this.getBatchesPageContent();
    }

    static init() {
        // Inicializar el BatchManager si existe
        if (typeof BatchManager !== 'undefined') {
            window.batchManager = new BatchManager();
            batchManager.init();
            batchManager.loadBatches();
            batchManager.loadFilters();
        } else {
            console.error('BatchManager no está disponible');
        }
    }

    static getBatchesPageContent() {
        return `
            <div class="page-header">
                <h1>📦 Gestión de Lotes</h1>
                <p>Administra lotes de prendas por cliente</p>
            </div>

            <!-- Estadísticas de Lotes -->
            <div class="grid grid-4 mb-3" id="batch-stats-container">
                <div class="card text-center">
                    <h3 class="text-primary" id="total-batches">0</h3>
                    <p class="text-muted">Total Lotes</p>
                    <small class="badge badge-info">📦 Activos</small>
                </div>
                <div class="card text-center">
                    <h3 class="text-success" id="completed-batches">0</h3>
                    <p class="text-muted">Completados</p>
                    <small class="badge badge-success">✅ Listos</small>
                </div>
                <div class="card text-center">
                    <h3 class="text-warning" id="inprogress-batches">0</h3>
                    <p class="text-muted">En Progreso</p>
                    <small class="badge badge-warning">⚙️ Procesando</small>
                </div>
                <div class="card text-center">
                    <h3 class="text-secondary" id="empty-batches">0</h3>
                    <p class="text-muted">Vacíos</p>
                    <small class="badge badge-secondary">📭 Pendientes</small>
                </div>
            </div>

            <!-- Controles de Lotes -->
            <div class="card mb-3">
                <div class="card-header">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5>📦 Lista de Lotes</h5>
                        <button class="btn btn-primary" data-action="create-batch">
                            <i class="fas fa-plus"></i> Nuevo Lote
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <!-- Filtros -->
                    <div class="row mb-3">
                        <div class="col-md-4">
                            <label for="batch-client-filter">Cliente:</label>
                            <select id="batch-client-filter" class="form-control">
                                <option value="">Todos los clientes</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label for="batch-status-filter">Estado:</label>
                            <select id="batch-status-filter" class="form-control">
                                <option value="">Todos los estados</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label>&nbsp;</label>
                            <div>
                                <button class="btn btn-outline-secondary" onclick="batchManager.clearFilters()">
                                    <i class="fas fa-times"></i> Limpiar Filtros
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Tabla de Lotes -->
                    <div class="table-responsive">
                        <table class="table table-hover batches-table">
                            <thead>
                                <tr>
                                    <th>Número de Lote</th>
                                    <th>Cliente</th>
                                    <th>Progreso</th>
                                    <th>% Completado</th>
                                    <th>Estado</th>
                                    <th>Fecha Creación</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="batches-table-body">
                                <!-- Los lotes se cargarán dinámicamente -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Modal para Crear/Editar Lote -->
            <div class="modal fade" id="batchModal" tabindex="-1">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">📦 Nuevo Lote</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <form id="batchForm">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="batch-client">Cliente *</label>
                                            <select id="batch-client" class="form-control" required>
                                                <option value="">Seleccionar cliente</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="batch-name">Nombre del Lote</label>
                                            <input type="text" id="batch-name" class="form-control" placeholder="Ej: Lote de camisas">
                                        </div>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="batch-expected">Prendas Esperadas *</label>
                                            <select id="batch-expected" class="form-control" required>
                                                <option value="">Seleccionar cantidad</option>
                                                <option value="10">10 prendas</option>
                                                <option value="15">15 prendas</option>
                                                <option value="20">20 prendas</option>
                                                <option value="25">25 prendas</option>
                                                <option value="30">30 prendas</option>
                                                <option value="40">40 prendas</option>
                                                <option value="50">50 prendas</option>
                                                <option value="75">75 prendas</option>
                                                <option value="100">100 prendas</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-group mb-3">
                                            <label for="batch-priority">Prioridad</label>
                                            <select id="batch-priority" class="form-control">
                                                <option value="normal">Normal</option>
                                                <option value="alta">Alta</option>
                                                <option value="urgente">Urgente</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group mb-3">
                                    <label for="batch-description">Descripción</label>
                                    <textarea id="batch-description" class="form-control" rows="3" placeholder="Descripción del lote..."></textarea>
                                </div>
                            </form>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-primary" onclick="batchManager.saveBatch()">Guardar Lote</button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Modal para Detalles del Lote -->
            <div class="modal fade" id="batchDetailsModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">📦 Detalles del Lote</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body" id="batch-details-content">
                            <!-- Contenido se carga dinámicamente -->
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    static getFallbackContent() {
        return `
            <div class="page-header">
                <h1>📦 Gestión de Lotes</h1>
                <p>Administra lotes de prendas por cliente</p>
            </div>
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">⚠️ Módulo en Desarrollo</h3>
                </div>
                <div style="padding: 40px; text-align: center;">
                    <p>La funcionalidad de lotes está siendo implementada.</p>
                    <p>Características principales:</p>
                    <ul style="text-align: left; max-width: 400px; margin: 20px auto;">
                        <li>✅ Creación de lotes de 15, 20, 25, 30 prendas</li>
                        <li>✅ Vinculación de lotes con clientes</li>
                        <li>✅ Seguimiento de progreso de lotes</li>
                        <li>✅ Gestión de estados (recibido, en proceso, listo, entregado)</li>
                        <li>✅ Reportes y estadísticas</li>
                    </ul>
                    <button class="btn btn-primary" onclick="Navigation.loadPage('dashboard')">
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        `;
    }

    static async refresh() {
        // Refrescar datos de lotes
        if (window.batchManager) {
            batchManager.loadBatches();
            batchManager.updateBatchStats();
            batchManager.loadFilters();
        }
    }

    static getStats() {
        // Retornar estadísticas de lotes para el dashboard
        const batches = Storage.getBatches();
        const totalBatches = batches.length;
        const completedBatches = batches.filter(b => b.totalGarments >= b.expectedGarments).length;
        const inProgressBatches = batches.filter(b => b.totalGarments < b.expectedGarments && b.totalGarments > 0).length;
        const emptyBatches = batches.filter(b => b.totalGarments === 0).length;

        return {
            total: totalBatches,
            completed: completedBatches,
            inProgress: inProgressBatches,
            empty: emptyBatches,
            completionRate: totalBatches > 0 ? Math.round((completedBatches / totalBatches) * 100) : 0
        };
    }
}

// Exponer la clase globalmente
window.Batches = Batches;
