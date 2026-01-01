// admin-core.js - Рабочая админ-панель
document.addEventListener('DOMContentLoaded', function() {
    console.log('Админ-панель загружается...');
    
    // Проверяем хранилище
    if (!window.storage) {
        alert('Ошибка: Хранилище данных не загружено!');
        return;
    }

    // Инициализация
    initializeAdmin();
    
    function initializeAdmin() {
        try {
            // Настраиваем навигацию
            setupNavigation();
            
            // Настраиваем формы
            setupForms();
            
            // Загружаем данные
            loadDashboard();
            
            // Показываем первую секцию
            showSection('dashboard');
            
            console.log('Админ-панель успешно инициализирована');
            
        } catch (error) {
            console.error('Ошибка инициализации админки:', error);
            showMessage('Ошибка загрузки админ-панели', 'error');
        }
    }
    
    function setupNavigation() {
        // Обработчики для вкладок
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionId = this.getAttribute('data-section');
                showSection(sectionId);
            });
        });
        
        // Кнопка назад к поисковику
        const backBtn = document.querySelector('.header-btn');
        if (backBtn) {
            backBtn.addEventListener('click', function(e) {
                e.preventDefault();
                window.location.href = 'index.html';
            });
        }
    }
    
    function setupForms() {
        // Форма добавления сайта
        const addForm = document.getElementById('addSiteForm');
        if (addForm) {
            addForm.addEventListener('submit', function(e) {
                e.preventDefault();
                addNewSite();
            });
        }
        
        // Поиск по сайтам
        const searchInput = document.getElementById('searchSitesInput');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                filterSites(this.value);
            });
        }
        
        // Заполняем категории в формах
        fillCategorySelects();
    }
    
    function showSection(sectionId) {
        // Скрываем все секции
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Убираем активный класс у всех вкладок
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Показываем выбранную секцию
        const section = document.getElementById(sectionId);
        if (section) {
            section.classList.add('active');
            
            // Активируем вкладку
            const tab = document.querySelector(`.nav-item[data-section="${sectionId}"]`);
            if (tab) {
                tab.classList.add('active');
            }
            
            // Загружаем данные для секции
            if (sectionId === 'dashboard') {
                loadDashboard();
            } else if (sectionId === 'manage-sites') {
                loadSitesList();
            }
        }
    }
    
    function loadDashboard() {
        try {
            const stats = window.storage.getStats();
            
            // Обновляем статистику
            updateStats(stats);
            
            // Обновляем категории
            updateCategories(stats.byCategory);
            
        } catch (error) {
            console.error('Ошибка загрузки дашборда:', error);
        }
    }
    
    function updateStats(stats) {
        // Обновляем цифры в шапке
        const totalSites = document.querySelector('.stat-value');
        if (totalSites) {
            totalSites.textContent = stats.totalSites;
        }
        
        // Обновляем график
        const todayStats = document.getElementById('todayStats');
        if (todayStats) {
            todayStats.innerHTML = `
                <div class="stats-chart">
                    <div class="chart-row">
                        <span class="chart-label">Всего сайтов:</span>
                        <div class="chart-bar">
                            <div class="chart-fill" style="width: ${Math.min(100, stats.totalSites * 5)}%"></div>
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
                </div>
            `;
        }
    }
    
    function updateCategories(categories) {
        const container = document.getElementById('categoryTags');
        if (!container) return;
        
        if (!categories || Object.keys(categories).length === 0) {
            container.innerHTML = '<p>Нет данных о категориях</p>';
            return;
        }
        
        let html = '';
        for (const [category, count] of Object.entries(categories)) {
            html += `
                <div class="category-tag">
                    <span>${category}</span>
                    <span class="count">${count}</span>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }
    
    function fillCategorySelects() {
        const categories = ['Технологии', 'Наука', 'Образование', 'Новости', 'Развлечения', 'Бизнес', 'Здоровье', 'Путешествия', 'Другое'];
        
        // Заполняем все select с категориями
        document.querySelectorAll('select[id$="Category"]').forEach(select => {
            select.innerHTML = '<option value="">Выберите категорию</option>';
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category;
                select.appendChild(option);
            });
        });
    }
    
    function addNewSite() {
        try {
            // Получаем данные из формы
            const title = document.getElementById('siteTitle').value.trim();
            const url = document.getElementById('siteUrl').value.trim();
            const description = document.getElementById('siteDescription').value.trim();
            const keywords = document.getElementById('siteKeywords').value.trim();
            const category = document.getElementById('siteCategory').value || 'Другое';
            
            // Валидация
            if (!title || !url || !description) {
                showMessage('Заполните обязательные поля (название, URL и описание)', 'error');
                return;
            }
            
            // Показываем загрузку
            const submitBtn = document.querySelector('#addSiteForm button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Добавляем...';
            submitBtn.disabled = true;
            
            // Добавляем сайт
            const newSite = window.storage.addSite({
                title,
                url,
                description,
                keywords,
                category
            });
            
            // Успешное сообщение
            showMessage(`Сайт "${title}" успешно добавлен!`, 'success');
            
            // Очищаем форму
            document.getElementById('addSiteForm').reset();
            
            // Переходим к списку сайтов через 1.5 секунды
            setTimeout(() => {
                showSection('manage-sites');
            }, 1500);
            
        } catch (error) {
            showMessage(`Ошибка: ${error.message}`, 'error');
        } finally {
            // Восстанавливаем кнопку
            const submitBtn = document.querySelector('#addSiteForm button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
    }
    
    function loadSitesList(filter = '') {
        try {
            let sites = window.storage.getAllSites();
            
            // Фильтрация
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
            showMessage('Ошибка загрузки списка сайтов', 'error');
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
                <div class="site-card" data-id="${site.id}">
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
                            <button class="action-btn btn-toggle" onclick="toggleSite(${site.id})" title="${site.is_active ? 'Деактивировать' : 'Активировать'}">
                                <i class="fas fa-power-off"></i>
                            </button>
                            <button class="action-btn btn-delete" onclick="deleteSite(${site.id})" title="Удалить">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    // Глобальные функции для кнопок действий
    window.toggleSite = function(id) {
        try {
            const site = window.storage.getSiteById(id);
            if (site) {
                window.storage.updateSite(id, { is_active: !site.is_active });
                loadSitesList();
                showMessage(`Статус сайта изменен`, 'success');
            }
        } catch (error) {
            showMessage(`Ошибка: ${error.message}`, 'error');
        }
    };
    
    window.deleteSite = function(id) {
        if (!confirm('Вы уверены, что хотите удалить этот сайт? Это действие нельзя отменить.')) {
            return;
        }
        
        try {
            window.storage.deleteSite(id);
            loadSitesList();
            loadDashboard(); // Обновляем статистику
            showMessage('Сайт успешно удален', 'success');
        } catch (error) {
            showMessage(`Ошибка: ${error.message}`, 'error');
        }
    };
    
    window.refreshData = function() {
        loadDashboard();
        loadSitesList();
        showMessage('Данные обновлены', 'success');
    };
    
    window.refreshSites = function() {
        loadSitesList();
        showMessage('Список сайтов обновлен', 'success');
    };
    
    window.showSection = showSection;
    
    function showMessage(text, type = 'info') {
        const messageEl = document.getElementById('adminMessage');
        if (!messageEl) return;
        
        messageEl.textContent = text;
        messageEl.className = `message message-${type} show`;
        
        setTimeout(() => {
            messageEl.className = 'message';
        }, 5000);
    }
});
