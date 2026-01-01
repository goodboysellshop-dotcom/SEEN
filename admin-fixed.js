// admin-fixed.js - Рабочая админ-панель
document.addEventListener('DOMContentLoaded', function() {
    console.log('Админ-панель загружается...');
    
    // Инициализация
    initAdminPanel();
    
    function initAdminPanel() {
        try {
            // Загружаем данные
            loadDashboardStats();
            loadSitesList();
            setupCategorySelect();
            
            // Настраиваем обработчики
            setupEventListeners();
            
            // Показываем первую секцию
            showSection('dashboard');
            
            console.log('Админ-панель успешно инициализирована');
            
        } catch (error) {
            console.error('Ошибка инициализации админ-панели:', error);
            showMessage('Ошибка загрузки админ-панели', 'error');
        }
    }
    
    function setupEventListeners() {
        // Навигация
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionId = this.getAttribute('data-section');
                showSection(sectionId);
            });
        });
        
        // Форма добавления сайта
        const addForm = document.getElementById('addSiteForm');
        if (addForm) {
            addForm.addEventListener('submit', function(e) {
                e.preventDefault();
                addNewSite();
            });
        }
        
        // Поиск сайтов
        const searchInput = document.getElementById('searchSitesInput');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                filterSites(this.value);
            });
        }
        
        // Обновление данных
        window.addEventListener('seenDataUpdated', function() {
            loadDashboardStats();
            if (document.getElementById('manage-sites').classList.contains('active')) {
                loadSitesList();
            }
        });
        
        // Кнопки действий
        document.addEventListener('click', function(e) {
            // Редактировать
            if (e.target.closest('.btn-edit')) {
                const siteId = parseInt(e.target.closest('.btn-edit').dataset.id);
                editSite(siteId);
            }
            
            // Удалить
            if (e.target.closest('.btn-delete')) {
                const siteId = parseInt(e.target.closest('.btn-delete').dataset.id);
                deleteSite(siteId);
            }
            
            // Переключить статус
            if (e.target.closest('.btn-toggle')) {
                const siteId = parseInt(e.target.closest('.btn-toggle').dataset.id);
                toggleSiteStatus(siteId);
            }
        });
        
        // Модальные окна
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', function() {
                const modalId = this.closest('.modal').id;
                hideModal(modalId);
            });
        });
        
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    hideModal(this.id);
                }
            });
        });
    }
    
    // Показать секцию
    function showSection(sectionId) {
        // Скрыть все секции
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Убрать активность у всех пунктов меню
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Показать выбранную секцию
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
            
            // Активировать пункт меню
            const targetLink = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
            if (targetLink) {
                targetLink.classList.add('active');
            }
            
            // Загрузить данные для секции
            if (sectionId === 'dashboard') {
                loadDashboardStats();
            } else if (sectionId === 'manage-sites') {
                loadSitesList();
            }
        }
    }
    
    // Загрузить статистику дашборда
    function loadDashboardStats() {
        try {
            const dm = window.dataManager;
            const stats = dm.getStats();
            
            // Обновить основные цифры
            document.querySelectorAll('.stat-value').forEach(el => {
                const statType = el.parentElement.querySelector('.stat-label').textContent;
                if (statType.includes('Всего сайтов')) {
                    el.textContent = stats.totalSites || 0;
                } else if (statType.includes('Добавлено сегодня')) {
                    el.textContent = stats.addedToday || 0;
                } else if (statType.includes('Активных')) {
                    el.textContent = stats.activeSites || 0;
                }
            });
            
            // Обновить категории
            updateCategoryStats(stats.byCategory);
            
            // Обновить график
            updateStatsChart(stats);
            
        } catch (error) {
            console.error('Ошибка загрузки статистики:', error);
        }
    }
    
    function updateCategoryStats(categories) {
        const container = document.getElementById('categoryTags');
        if (!container) return;
        
        if (!categories || Object.keys(categories).length === 0) {
            container.innerHTML = '<p>Нет данных о категориях</p>';
            return;
        }
        
        let html = '';
        Object.entries(categories).forEach(([category, count]) => {
            html += `
                <div class="category-tag">
                    <span>${category}</span>
                    <span class="count">${count}</span>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    function updateStatsChart(stats) {
        const container = document.getElementById('todayStats');
        if (!container) return;
        
        const today = new Date().toLocaleDateString('ru-RU');
        
        container.innerHTML = `
            <div class="stats-chart">
                <div class="chart-row">
                    <span class="chart-label">Всего сайтов:</span>
                    <div class="chart-bar">
                        <div class="chart-fill" style="width: ${Math.min(100, stats.totalSites)}%"></div>
                    </div>
                    <span class="chart-value">${stats.totalSites}</span>
                </div>
                <div class="chart-row">
                    <span class="chart-label">Активных:</span>
                    <div class="chart-bar">
                        <div class="chart-fill" style="width: ${stats.totalSites ? (stats.activeSites / stats.totalSites * 100) : 0}%"></div>
                    </div>
                    <span class="chart-value">${stats.activeSites}</span>
                </div>
                <div class="chart-row">
                    <span class="chart-label">Добавлено сегодня:</span>
                    <div class="chart-bar">
                        <div class="chart-fill" style="width: ${Math.min(100, stats.addedToday * 20)}%"></div>
                    </div>
                    <span class="chart-value">${stats.addedToday}</span>
                </div>
                <div class="chart-date">${today}</div>
            </div>
        `;
    }
    
    // Загрузить список сайтов
    function loadSitesList(filter = '') {
        try {
            const dm = window.dataManager;
            let sites = dm.getSites();
            
            // Применить фильтр
            if (filter) {
                const filterLower = filter.toLowerCase();
                sites = sites.filter(site => 
                    site.title.toLowerCase().includes(filterLower) ||
                    site.url.toLowerCase().includes(filterLower) ||
                    site.description.toLowerCase().includes(filterLower) ||
                    (site.keywords && site.keywords.toLowerCase().includes(filterLower))
                );
            }
            
            displaySites(sites);
            
        } catch (error) {
            console.error('Ошибка загрузки сайтов:', error);
            document.getElementById('sitesListContainer').innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Ошибка загрузки списка сайтов</p>
                </div>
            `;
        }
    }
    
    function filterSites(query) {
        loadSitesList(query);
    }
    
    function displaySites(sites) {
        const container = document.getElementById('sitesListContainer');
        if (!container) return;
        
        if (!sites || sites.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>Сайты не найдены</h3>
                    <p>${document.getElementById('searchSitesInput')?.value ? 'Попробуйте другой запрос' : 'Добавьте первый сайт'}</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        sites.forEach(site => {
            const date = new Date(site.added_date).toLocaleDateString('ru-RU');
            
            html += `
                <div class="site-card">
                    <div class="site-header">
                        <h3 class="site-title">${site.title}</h3>
                        <div class="site-badges">
                            <span class="site-badge ${site.is_active ? 'badge-active' : 'badge-inactive'}">
                                ${site.is_active ? 'Активен' : 'Неактивен'}
                            </span>
                            <span class="site-badge badge-category">
                                ${site.category || 'Другое'}
                            </span>
                        </div>
                    </div>
                    <div class="site-url">
                        <i class="fas fa-link"></i> ${site.url}
                    </div>
                    <p class="site-description">${site.description}</p>
                    <div class="site-footer">
                        <div class="site-meta">
                            <span class="meta-item">
                                <i class="far fa-calendar"></i> ${date}
                            </span>
                            ${site.keywords ? `
                                <span class="meta-item">
                                    <i class="fas fa-tags"></i> ${site.keywords}
                                </span>
                            ` : ''}
                        </div>
                        <div class="site-actions">
                            <button class="action-btn btn-edit" data-id="${site.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn btn-toggle" data-id="${site.id}">
                                <i class="fas fa-power-off"></i>
                            </button>
                            <button class="action-btn btn-delete" data-id="${site.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    // Добавить новый сайт
    function addNewSite() {
        try {
            const title = document.getElementById('siteTitle').value.trim();
            const url = document.getElementById('siteUrl').value.trim();
            const description = document.getElementById('siteDescription').value.trim();
            const keywords = document.getElementById('siteKeywords').value.trim();
            const category = document.getElementById('siteCategory').value;
            
            // Валидация
            if (!title || !url || !description) {
                showMessage('Заполните обязательные поля: название, URL и описание', 'error');
                return;
            }
            
            // Показать загрузку
            const submitBtn = document.querySelector('#addSiteForm button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Добавляем...';
            submitBtn.disabled = true;
            
            // Добавить сайт
            const dm = window.dataManager;
            const newSite = dm.addSite({
                title,
                url,
                description,
                keywords,
                category
            });
            
            // Показать успех
            showMessage(`Сайт "${title}" успешно добавлен!`, 'success');
            
            // Очистить форму
            document.getElementById('addSiteForm').reset();
            
            // Перейти к списку сайтов
            setTimeout(() => {
                showSection('manage-sites');
            }, 1500);
            
        } catch (error) {
            showMessage(`Ошибка: ${error.message}`, 'error');
        } finally {
            // Восстановить кнопку
            const submitBtn = document.querySelector('#addSiteForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
    }
    
    // Редактировать сайт
    function editSite(siteId) {
        try {
            const dm = window.dataManager;
            const site = dm.getSites().find(s => s.id === siteId);
            
            if (!site) {
                showMessage('Сайт не найден', 'error');
                return;
            }
            
            // Заполнить форму редактирования
            document.getElementById('editSiteId').value = site.id;
            document.getElementById('editSiteTitle').value = site.title;
            document.getElementById('editSiteUrl').value = site.url;
            document.getElementById('editSiteDescription').value = site.description;
            document.getElementById('editSiteKeywords').value = site.keywords || '';
            document.getElementById('editSiteCategory').value = site.category || 'Другое';
            document.getElementById('editSiteActive').checked = site.is_active;
            
            // Показать модальное окно
            showModal('editSiteModal');
            
        } catch (error) {
            showMessage(`Ошибка: ${error.message}`, 'error');
        }
    }
    
    // Сохранить редактирование
    window.saveEditedSite = function() {
        try {
            const id = parseInt(document.getElementById('editSiteId').value);
            const title = document.getElementById('editSiteTitle').value.trim();
            const url = document.getElementById('editSiteUrl').value.trim();
            const description = document.getElementById('editSiteDescription').value.trim();
            const keywords = document.getElementById('editSiteKeywords').value.trim();
            const category = document.getElementById('editSiteCategory').value;
            const is_active = document.getElementById('editSiteActive').checked;
            
            if (!title || !url || !description) {
                showMessage('Заполните обязательные поля', 'error');
                return;
            }
            
            const dm = window.dataManager;
            dm.updateSite(id, {
                title,
                url,
                description,
                keywords,
                category,
                is_active
            });
            
            showMessage('Сайт успешно обновлен!', 'success');
            hideModal('editSiteModal');
            loadSitesList();
            
        } catch (error) {
            showMessage(`Ошибка: ${error.message}`, 'error');
        }
    };
    
    // Удалить сайт
    function deleteSite(siteId) {
        if (!confirm('Вы уверены, что хотите удалить этот сайт? Это действие нельзя отменить.')) {
            return;
        }
        
        try {
            const dm = window.dataManager;
            dm.deleteSite(siteId);
            
            showMessage('Сайт успешно удален', 'success');
            loadSitesList();
            
        } catch (error) {
            showMessage(`Ошибка: ${error.message}`, 'error');
        }
    }
    
    // Переключить статус сайта
    function toggleSiteStatus(siteId) {
        try {
            const dm = window.dataManager;
            const site = dm.getSites().find(s => s.id === siteId);
            
            if (site) {
                dm.updateSite(siteId, { is_active: !site.is_active });
                showMessage('Статус сайта изменен', 'success');
                loadSitesList();
            }
        } catch (error) {
            showMessage(`Ошибка: ${error.message}`, 'error');
        }
    }
    
    // Настроить выпадающий список категорий
    function setupCategorySelect() {
        const selects = document.querySelectorAll('select[name="category"]');
        const dm = window.dataManager;
        
        selects.forEach(select => {
            select.innerHTML = '<option value="">Выберите категорию</option>';
            dm.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                select.appendChild(option);
            });
        });
    }
    
    // Показать сообщение
    function showMessage(text, type = 'info') {
        const messageEl = document.getElementById('adminMessage');
        if (!messageEl) return;
        
        messageEl.textContent = text;
        messageEl.className = `message message-${type} show`;
        
        setTimeout(() => {
            messageEl.className = 'message';
        }, 5000);
    }
    
    // Показать/скрыть модальное окно
    function showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('show'), 10);
        }
    }
    
    function hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
    
    // Глобальные функции для кнопок
    window.showSection = showSection;
    window.showModal = showModal;
    window.hideModal = hideModal;
    
    // Добавить стили
    addAdminStyles();
});

function addAdminStyles() {
    const styles = `
        /* Админ-панель */
        .admin-section {
            display: none;
        }
        
        .admin-section.active {
            display: block;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        /* Сообщения */
        .message {
            display: none;
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            animation: slideIn 0.3s ease;
        }
        
        .message.show {
            display: block;
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .message-success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .message-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .message-warning {
            background: #fff3cd;
            color: #856404;
            border: 1px solid #ffeaa7;
        }
        
        /* Карточки сайтов */
        .site-card {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.08);
            border: 1px solid #e0e0e0;
            transition: all 0.3s;
        }
        
        .site-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.12);
        }
        
        .site-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 15px;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .site-title {
            font-size: 1.2rem;
            font-weight: 600;
            color: #1a0dab;
            margin: 0;
            flex: 1;
            min-width: 200px;
        }
        
        .site-badges {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        
        .site-badge {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
        }
        
        .badge-active {
            background: #d4edda;
            color: #155724;
        }
        
        .badge-inactive {
            background: #f8d7da;
            color: #721c24;
        }
        
        .badge-category {
            background: #e8f0fe;
            color: #1a73e8;
        }
        
        .site-url {
            color: #006621;
            font-size: 0.9rem;
            margin-bottom: 15px;
            word-break: break-all;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .site-description {
            color: #545454;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        
        .site-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 15px;
            padding-top: 15px;
            border-top: 1px solid #eee;
        }
        
        .site-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }
        
        .meta-item {
            display: flex;
            align-items: center;
            gap: 5px;
            color: #666;
            font-size: 0.9rem;
        }
        
        .site-actions {
            display: flex;
            gap: 10px;
        }
        
        .action-btn {
            width: 40px;
            height: 40px;
            border-radius: 10px;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s;
            color: white;
            font-size: 1rem;
        }
        
        .btn-edit {
            background: #ffc107;
        }
        
        .btn-edit:hover {
            background: #e0a800;
        }
        
        .btn-toggle {
            background: #6c757d;
        }
        
        .btn-toggle:hover {
            background: #545b62;
        }
        
        .btn-delete {
            background: #dc3545;
        }
        
        .btn-delete:hover {
            background: #c82333;
        }
        
        /* Пустое состояние */
        .empty-state {
            text-align: center;
            padding: 60px 20px;
            color: #666;
        }
        
        .empty-state i {
            font-size: 3rem;
            color: #dadce0;
            margin-bottom: 20px;
        }
        
        .empty-state h3 {
            margin-bottom: 10px;
            color: #333;
        }
        
        /* Ошибка */
        .error-message {
            text-align: center;
            padding: 40px 20px;
            color: #dc3545;
        }
        
        .error-message i {
            font-size: 2rem;
            margin-bottom: 15px;
        }
        
        /* Категории */
        .category-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
        }
        
        .category-tag {
            padding: 8px 16px;
            background: #e8f0fe;
            color: #1a73e8;
            border-radius: 20px;
            font-size: 0.9rem;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .category-tag .count {
            background: #1a73e8;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.8rem;
        }
        
        /* График статистики */
        .stats-chart {
            margin-top: 20px;
        }
        
        .chart-row {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
            gap: 15px;
        }
        
        .chart-label {
            min-width: 150px;
            color: #666;
        }
        
        .chart-bar {
            flex: 1;
            height: 20px;
            background: #f0f0f0;
            border-radius: 10px;
            overflow: hidden;
        }
        
        .chart-fill {
            height: 100%;
            background: linear-gradient(90deg, #4285f4, #34a853);
            border-radius: 10px;
            transition: width 1s ease;
        }
        
        .chart-value {
            min-width: 40px;
            font-weight: 600;
            color: #333;
        }
        
        .chart-date {
            text-align: center;
            color: #999;
            font-size: 0.9rem;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #eee;
        }
        
        /* Формы */
        .site-form {
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.08);
        }
        
        .form-group {
            margin-bottom: 25px;
        }
        
        .form-label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #333;
        }
        
        .form-input,
        .form-textarea,
        .form-select {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #ddd;
            border-radius: 8px;
            font-size: 1rem;
            transition: all 0.3s;
        }
        
        .form-input:focus,
        .form-textarea:focus,
        .form-select:focus {
            outline: none;
            border-color: #4285f4;
            box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.2);
        }
        
        .form-textarea {
            min-height: 120px;
            resize: vertical;
        }
        
        .form-actions {
            display: flex;
            gap: 15px;
            margin-top: 30px;
        }
        
        /* Кнопки */
        .btn {
            padding: 12px 25px;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
        }
        
        .btn-primary {
            background: #4285f4;
            color: white;
        }
        
        .btn-primary:hover {
            background: #3367d6;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(66, 133, 244, 0.3);
        }
        
        .btn-secondary {
            background: #f8f9fa;
            color: #666;
            border: 1px solid #ddd;
        }
        
        .btn-secondary:hover {
            background: #e9ecef;
        }
        
        /* Адаптивность */
        @media (max-width: 768px) {
            .site-header {
                flex-direction: column;
            }
            
            .site-badges {
                justify-content: flex-start;
            }
            
            .site-footer {
                flex-direction: column;
                align-items: stretch;
            }
            
            .site-actions {
                justify-content: center;
            }
            
            .form-actions {
                flex-direction: column;
            }
            
            .btn {
                width: 100%;
                justify-content: center;
            }
            
            .chart-row {
                flex-direction: column;
                align-items: stretch;
                gap: 5px;
            }
            
            .chart-label {
                min-width: auto;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}
