// search-core.js - Рабочий поисковый движок
document.addEventListener('DOMContentLoaded', function() {
    console.log('SEEN Search загружается...');
    
    // Проверяем, есть ли хранилище
    if (!window.storage) {
        alert('Ошибка: Хранилище данных не загружено!');
        return;
    }

    // Инициализация
    initialize();
    
    function initialize() {
        try {
            // Получаем элементы DOM
            const elements = getElements();
            
            // Настраиваем начальное состояние
            setupInitialState(elements);
            
            // Настраиваем обработчики событий
            setupEventListeners(elements);
            
            // Показываем начальные данные
            showInitialData(elements);
            
            console.log('SEEN Search успешно инициализирован');
            
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            showError('Не удалось загрузить поисковую систему');
        }
    }
    
    function getElements() {
        return {
            searchForm: document.getElementById('searchForm'),
            searchQuery: document.getElementById('searchQuery'),
            searchButton: document.getElementById('searchButton'),
            clearSearch: document.getElementById('clearSearch'),
            resultsContainer: document.getElementById('results'),
            statsContainer: document.getElementById('stats'),
            siteCountElement: document.getElementById('siteCount'),
            exactMatchCheckbox: document.getElementById('exactMatch'),
            searchTitlesCheckbox: document.getElementById('searchTitles'),
            quickTags: document.getElementById('quickTags'),
            refreshResults: document.getElementById('refreshResults'),
            exportResults: document.getElementById('exportResults'),
            searchTip: document.getElementById('searchTip'),
            resetDataBtn: document.getElementById('resetDataBtn')
        };
    }
    
    function setupInitialState(elements) {
        // Фокус на поле поиска
        if (elements.searchQuery) {
            elements.searchQuery.focus();
        }
        
        // Обновляем счетчик сайтов
        updateSiteCount(elements);
        
        // Настраиваем подсказки
        setupSearchTips(elements);
        
        // Настраиваем быстрые теги
        setupQuickTags(elements);
    }
    
    function setupEventListeners(elements) {
        // Поиск по форме
        if (elements.searchForm) {
            elements.searchForm.addEventListener('submit', function(e) {
                e.preventDefault();
                performSearch(elements);
            });
        }
        
        // Очистка поиска
        if (elements.clearSearch) {
            elements.clearSearch.addEventListener('click', function() {
                elements.searchQuery.value = '';
                elements.searchQuery.focus();
                showInitialData(elements);
            });
        }
        
        // Обновить результаты
        if (elements.refreshResults) {
            elements.refreshResults.addEventListener('click', function() {
                if (elements.searchQuery.value) {
                    performSearch(elements);
                } else {
                    showInitialData(elements);
                }
            });
        }
        
        // Экспорт результатов
        if (elements.exportResults) {
            elements.exportResults.addEventListener('click', exportResults);
        }
        
        // Сброс данных
        if (elements.resetDataBtn) {
            elements.resetDataBtn.addEventListener('click', function() {
                if (confirm('Вы уверены, что хотите сбросить все данные? Все добавленные сайты будут удалены.')) {
                    window.storage.resetData();
                    updateSiteCount(elements);
                    showInitialData(elements);
                    alert('Данные сброшены!');
                }
            });
        }
        
        // Быстрые теги
        if (elements.quickTags) {
            elements.quickTags.addEventListener('click', function(e) {
                if (e.target.classList.contains('tag-btn')) {
                    const query = e.target.getAttribute('data-query');
                    elements.searchQuery.value = query;
                    performSearch(elements);
                }
            });
        }
        
        // Подписываемся на обновления хранилища
        window.storage.subscribe(() => {
            updateSiteCount(elements);
        });
    }
    
    function showInitialData(elements) {
        const stats = window.storage.getStats();
        const sites = window.storage.getAllSites().slice(0, 4);
        
        showWelcomeMessage(elements, stats, sites);
    }
    
    function performSearch(elements) {
        const query = elements.searchQuery.value.trim();
        
        if (!query) {
            showMessage('Введите поисковый запрос', 'error', elements);
            return;
        }
        
        // Показать загрузку
        showLoading(elements, query);
        
        // Имитация задержки для реалистичности
        setTimeout(() => {
            try {
                const results = window.storage.searchSites(query, {
                    exactMatch: elements.exactMatchCheckbox?.checked || false,
                    searchTitles: elements.searchTitlesCheckbox?.checked || false
                });
                
                displayResults(elements, results, query);
                updateStats(elements, results.length, query);
                
            } catch (error) {
                console.error('Ошибка поиска:', error);
                showMessage('Ошибка при выполнении поиска', 'error', elements);
            }
        }, 300);
    }
    
    function displayResults(elements, results, query) {
        const container = elements.resultsContainer;
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!results || results.length === 0) {
            showNoResults(elements, query);
            return;
        }
        
        results.forEach(site => {
            const element = createResultElement(site, query);
            container.appendChild(element);
        });
    }
    
    function createResultElement(site, query) {
        const div = document.createElement('div');
        div.className = 'result-item';
        
        const displayUrl = site.url.replace(/^https?:\/\//, '').replace(/^www\./, '');
        const highlightedTitle = highlightText(site.title, query);
        const highlightedDesc = highlightText(site.description, query);
        
        div.innerHTML = `
            <div class="result-header">
                <a href="${site.url}" class="result-title" target="_blank" rel="noopener noreferrer">
                    ${highlightedTitle}
                </a>
                <span class="result-badge ${site.is_active ? 'active' : 'inactive'}">
                    ${site.category || 'Другое'}
                </span>
            </div>
            <div class="result-url">
                <i class="fas fa-link"></i> ${displayUrl}
            </div>
            <div class="result-description">
                ${highlightedDesc}
            </div>
            <div class="result-footer">
                <span class="result-meta">
                    <i class="far fa-calendar"></i> ${formatDate(site.added_date)}
                </span>
                ${site.keywords ? `
                    <span class="result-meta">
                        <i class="fas fa-tags"></i> ${site.keywords}
                    </span>
                ` : ''}
                <span class="result-meta">
                    <i class="fas fa-external-link-alt"></i>
                    <a href="${site.url}" target="_blank" rel="noopener noreferrer">Перейти на сайт</a>
                </span>
            </div>
        `;
        
        return div;
    }
    
    function showWelcomeMessage(elements, stats, sites) {
        const container = elements.resultsContainer;
        if (!container) return;
        
        let sitesHTML = '';
        if (sites && sites.length > 0) {
            sitesHTML = `
                <div class="popular-sites">
                    <h4>Примеры сайтов в системе:</h4>
                    <div class="popular-grid">
                        ${sites.map(site => `
                            <div class="popular-site">
                                <a href="${site.url}" class="popular-title" target="_blank">
                                    ${site.title}
                                </a>
                                <div class="popular-url">${site.url.replace(/^https?:\/\//, '').replace(/^www\./, '')}</div>
                                <div class="popular-desc">${site.description.substring(0, 100)}...</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-icon">
                    <i class="fas fa-search"></i>
                </div>
                <h3>Добро пожаловать в SEEN Search</h3>
                <p class="welcome-text">В системе ${stats.totalSites} сайтов. Введите запрос для поиска.</p>
                ${sitesHTML}
                <div class="welcome-tips">
                    <h4>Советы по поиску:</h4>
                    <ul>
                        <li>Используйте ключевые слова</li>
                        <li>Попробуйте разные варианты написания</li>
                        <li>Используйте фильтры для точного поиска</li>
                    </ul>
                </div>
            </div>
        `;
        
        if (elements.statsContainer) {
            elements.statsContainer.innerHTML = `
                <div class="stats-content">
                    <p class="stats-main">Готово к поиску</p>
                    <p class="stats-sub">Введите запрос в поле выше</p>
                </div>
            `;
        }
    }
    
    function showNoResults(elements, query) {
        const container = elements.resultsContainer;
        if (!container) return;
        
        container.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">
                    <i class="fas fa-search-minus"></i>
                </div>
                <h3>По запросу "${query}" ничего не найдено</h3>
                <p>Попробуйте:</p>
                <ul class="suggestions-list">
                    <li>Использовать другие ключевые слова</li>
                    <li>Проверить правильность написания</li>
                    <li>Убрать фильтр "Точное соответствие"</li>
                </ul>
            </div>
        `;
    }
    
    function showLoading(elements, query) {
        if (elements.resultsContainer) {
            elements.resultsContainer.innerHTML = `
                <div class="loading">
                    <div class="loading-spinner">
                        <i class="fas fa-spinner fa-spin"></i>
                    </div>
                    <h3>Ищем "${query}"...</h3>
                    <p>Пожалуйста, подождите</p>
                </div>
            `;
        }
        
        if (elements.statsContainer) {
            elements.statsContainer.innerHTML = `
                <div class="stats-content">
                    <p class="stats-main"><i class="fas fa-spinner fa-spin"></i> Выполняется поиск...</p>
                </div>
            `;
        }
        
        // Анимация кнопки поиска
        if (elements.searchButton) {
            const originalHTML = elements.searchButton.innerHTML;
            elements.searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Поиск...';
            elements.searchButton.disabled = true;
            
            setTimeout(() => {
                elements.searchButton.innerHTML = originalHTML;
                elements.searchButton.disabled = false;
            }, 300);
        }
    }
    
    function showMessage(message, type, elements) {
        if (elements.statsContainer) {
            const color = type === 'error' ? '#ea4335' : '#4285f4';
            elements.statsContainer.innerHTML = `
                <div class="stats-content">
                    <p style="color: ${color}">
                        <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
                        ${message}
                    </p>
                </div>
            `;
        }
    }
    
    function showError(message) {
        const container = document.querySelector('.container') || document.body;
        container.innerHTML = `
            <div class="fatal-error">
                <h2><i class="fas fa-exclamation-triangle"></i> Ошибка</h2>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-btn">
                    <i class="fas fa-redo"></i> Перезагрузить страницу
                </button>
            </div>
        `;
    }
    
    function updateSiteCount(elements) {
        try {
            const stats = window.storage.getStats();
            if (elements.siteCountElement) {
                elements.siteCountElement.textContent = stats.totalSites;
            }
        } catch (error) {
            console.error('Ошибка обновления счетчика:', error);
        }
    }
    
    function updateStats(elements, resultCount, query) {
        if (!elements.statsContainer) return;
        
        const time = (Math.random() * 0.2 + 0.1).toFixed(2);
        const stats = window.storage.getStats();
        
        let optionsText = '';
        if (elements.exactMatchCheckbox?.checked) {
            optionsText = ' (точное соответствие)';
        } else if (elements.searchTitlesCheckbox?.checked) {
            optionsText = ' (в заголовках)';
        }
        
        elements.statsContainer.innerHTML = `
            <div class="stats-content">
                <p class="stats-main">
                    Найдено <strong>${resultCount}</strong> результатов по запросу 
                    "<strong>${query}</strong>"${optionsText}
                </p>
                <div class="stats-details">
                    <span><i class="fas fa-clock"></i> ${time} сек.</span>
                    <span><i class="fas fa-database"></i> ${stats.totalSites} сайтов в базе</span>
                </div>
            </div>
        `;
    }
    
    function setupSearchTips(elements) {
        if (!elements.searchTip) return;
        
        const tips = ['google', 'youtube', 'технологии', 'образование', 'новости'];
        let currentTip = 0;
        
        setInterval(() => {
            elements.searchTip.textContent = tips[currentTip];
            currentTip = (currentTip + 1) % tips.length;
        }, 3000);
        
        elements.searchTip.addEventListener('click', function() {
            elements.searchQuery.value = this.textContent;
            performSearch(elements);
        });
    }
    
    function setupQuickTags(elements) {
        if (!elements.quickTags) return;
        
        elements.quickTags.querySelectorAll('.tag-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const query = this.getAttribute('data-query');
                elements.searchQuery.value = query;
                performSearch(elements);
            });
        });
    }
    
    function exportResults() {
        try {
            const sites = window.storage.getAllSites();
            if (sites.length === 0) {
                alert('Нет данных для экспорта');
                return;
            }
            
            // Создаем CSV
            const headers = ['Название', 'URL', 'Описание', 'Категория', 'Ключевые слова'];
            const rows = sites.map(site => [
                `"${site.title.replace(/"/g, '""')}"`,
                site.url,
                `"${site.description.replace(/"/g, '""')}"`,
                site.category,
                `"${site.keywords.replace(/"/g, '""')}"`
            ]);
            
            const csvContent = [headers, ...rows]
                .map(row => row.join(','))
                .join('\n');
            
            // Создаем и скачиваем файл
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `seen-search-data-${new Date().toISOString().slice(0,10)}.csv`;
            link.click();
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Ошибка экспорта:', error);
            alert('Ошибка при экспорте данных');
        }
    }
    
    // Вспомогательные функции
    function highlightText(text, query) {
        if (!text || !query) return text || '';
        
        try {
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escapedQuery})`, 'gi');
            return text.toString().replace(regex, '<mark>$1</mark>');
        } catch (error) {
            return text;
        }
    }
    
    function formatDate(dateString) {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return dateString;
        }
    }
});
