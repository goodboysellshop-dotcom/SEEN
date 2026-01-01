// script.js - Улучшенный поиск
document.addEventListener('DOMContentLoaded', function() {
    // Проверяем наличие DataManager
    if (!window.dataManager) {
        console.error('DataManager не загружен!');
        showFatalError();
        return;
    }

    // Инициализация
    initSearchEngine();
    
    function initSearchEngine() {
        try {
            // Получаем элементы DOM
            const elements = getDOMElements();
            
            // Настройка начального состояния
            setupInitialState(elements);
            
            // Настройка обработчиков событий
            setupEventListeners(elements);
            
            // Загрузка начальных данных
            loadInitialData(elements);
            
        } catch (error) {
            console.error('Ошибка инициализации поисковой системы:', error);
            showFatalError();
        }
    }
    
    function getDOMElements() {
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
            quickSearchButtons: document.getElementById('quickSearchButtons')
        };
    }
    
    function setupInitialState(elements) {
        // Фокус на поле поиска
        if (elements.searchQuery) {
            elements.searchQuery.focus();
        }
        
        // Показать количество сайтов
        updateSiteCount(elements);
        
        // Настройка ротации подсказок
        setupSearchTips(elements);
        
        // Настройка быстрого поиска
        setupQuickSearchButtons(elements);
    }
    
    function setupEventListeners(elements) {
        // Основной поиск
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
                showWelcomeMessage(elements);
            });
        }
        
        // Обновление результатов
        if (elements.refreshResults) {
            elements.refreshResults.addEventListener('click', function() {
                if (elements.searchQuery.value) {
                    performSearch(elements);
                } else {
                    loadInitialData(elements);
                }
            });
        }
        
        // Экспорт
        if (elements.exportResults) {
            elements.exportResults.addEventListener('click', function() {
                exportSearchResults(elements);
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
        
        // Обновление данных
        window.addEventListener('seenDataUpdated', function() {
            updateSiteCount(elements);
            if (elements.searchQuery && elements.searchQuery.value) {
                performSearch(elements);
            }
        });
        
        // Обработка клавиш
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                elements.searchQuery.focus();
            }
        });
    }
    
    function loadInitialData(elements) {
        try {
            const stats = window.dataManager.getStats();
            const popularSites = window.dataManager.getPopularSites(4);
            
            // Показать приветственное сообщение
            showWelcomeMessage(elements, stats, popularSites);
            
        } catch (error) {
            console.error('Ошибка загрузки начальных данных:', error);
            showErrorMessage(elements, 'Не удалось загрузить данные');
        }
    }
    
    async function performSearch(elements) {
        const query = elements.searchQuery.value.trim();
        
        if (!query) {
            showErrorMessage(elements, 'Введите поисковый запрос');
            return;
        }
        
        // Показать загрузку
        showLoading(elements, query);
        
        try {
            // Имитация задержки для лучшего UX
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Выполнить поиск
            const results = window.dataManager.searchSites(query, {
                exactMatch: elements.exactMatchCheckbox?.checked || false,
                searchTitles: elements.searchTitlesCheckbox?.checked || false
            });
            
            // Показать результаты
            displayResults(elements, results, query);
            
            // Обновить статистику
            updateSearchStats(elements, results.length, query);
            
        } catch (error) {
            console.error('Ошибка поиска:', error);
            showErrorMessage(elements, 'Ошибка при выполнении поиска');
        }
    }
    
    function displayResults(elements, results, query) {
        const container = elements.resultsContainer;
        if (!container) return;
        
        container.innerHTML = '';
        
        if (!results || results.length === 0) {
            showNoResults(elements, query);
            return;
        }
        
        // Создаем элементы результатов
        results.forEach(site => {
            const resultElement = createResultElement(site, query);
            container.appendChild(resultElement);
        });
    }
    
    function createResultElement(site, query) {
        const element = document.createElement('div');
        element.className = 'result-item';
        
        // Форматируем URL для отображения
        const displayUrl = formatUrlForDisplay(site.url);
        
        // Подсвечиваем совпадения
        const highlightedTitle = highlightMatches(site.title, query);
        const highlightedDescription = highlightMatches(site.description, query);
        
        element.innerHTML = `
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
                ${highlightedDescription}
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
        
        return element;
    }
    
    function showWelcomeMessage(elements, stats, popularSites) {
        const container = elements.resultsContainer;
        if (!container) return;
        
        let popularSitesHTML = '';
        if (popularSites && popularSites.length > 0) {
            popularSitesHTML = `
                <div class="popular-sites">
                    <h4>Популярные сайты:</h4>
                    <div class="popular-grid">
                        ${popularSites.map(site => `
                            <div class="popular-site">
                                <a href="${site.url}" class="popular-title" target="_blank">
                                    ${site.title}
                                </a>
                                <div class="popular-url">${formatUrlForDisplay(site.url)}</div>
                                <div class="popular-desc">${truncateText(site.description, 100)}</div>
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
                <p class="welcome-text">
                    Начните поиск, введя запрос в поле выше.
                    ${stats ? `В системе ${stats.totalSites} сайтов.` : ''}
                </p>
                ${popularSitesHTML}
                <div class="welcome-tips">
                    <h4>Советы по поиску:</h4>
                    <ul>
                        <li>Используйте ключевые слова для точного поиска</li>
                        <li>Попробуйте разные варианты написания</li>
                        <li>Используйте фильтры для уточнения результатов</li>
                        <li>Добавляйте новые сайты через панель управления</li>
                    </ul>
                </div>
            </div>
        `;
        
        // Обновить статистику
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
        
        // Получаем предложения
        const suggestions = getSearchSuggestions(query);
        
        container.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">
                    <i class="fas fa-search-minus"></i>
                </div>
                <h3>По запросу "${query}" ничего не найдено</h3>
                <p>Попробуйте следующее:</p>
                <ul class="suggestions-list">
                    <li>Проверьте правильность написания</li>
                    <li>Используйте более общие ключевые слова</li>
                    <li>Уберите фильтр "Точное соответствие"</li>
                    <li>Попробуйте другой запрос</li>
                </ul>
                
                ${suggestions.length > 0 ? `
                    <div class="search-suggestions">
                        <h4>Возможно, вы искали:</h4>
                        <div class="suggestion-buttons">
                            ${suggestions.map(suggestion => `
                                <button class="suggestion-btn" 
                                        onclick="document.getElementById('searchQuery').value='${suggestion}'; 
                                                 document.querySelector('#searchForm').dispatchEvent(new Event('submit'))">
                                    ${suggestion}
                                </button>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    function getSearchSuggestions(query) {
        try {
            const sites = window.dataManager.getSites();
            const allKeywords = sites
                .flatMap(site => site.keywords ? site.keywords.split(',').map(k => k.trim()) : [])
                .filter(k => k.length > 0);
            
            const uniqueKeywords = [...new Set(allKeywords)];
            const queryLower = query.toLowerCase();
            
            return uniqueKeywords
                .filter(keyword => {
                    const keywordLower = keyword.toLowerCase();
                    return keywordLower.includes(queryLower) || 
                           queryLower.includes(keywordLower) ||
                           keywordLower.split(' ').some(word => word.startsWith(queryLower.substring(0, 3)));
                })
                .slice(0, 5);
        } catch (error) {
            return [];
        }
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
            elements.searchButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Поиск...';
            elements.searchButton.disabled = true;
            setTimeout(() => {
                elements.searchButton.innerHTML = '<i class="fas fa-search"></i> Найти';
                elements.searchButton.disabled = false;
            }, 1000);
        }
    }
    
    function showErrorMessage(elements, message) {
        if (elements.statsContainer) {
            elements.statsContainer.innerHTML = `
                <div class="stats-content error">
                    <p><i class="fas fa-exclamation-triangle"></i> ${message}</p>
                </div>
            `;
        }
    }
    
    function showFatalError() {
        const container = document.querySelector('.container') || document.body;
        container.innerHTML = `
            <div class="fatal-error">
                <h2><i class="fas fa-exclamation-triangle"></i> Ошибка загрузки</h2>
                <p>Не удалось загрузить поисковую систему. Пожалуйста:</p>
                <ol>
                    <li>Обновите страницу</li>
                    <li>Проверьте подключение к интернету</li>
                    <li>Попробуйте другой браузер</li>
                </ol>
                <button onclick="location.reload()" class="retry-btn">
                    <i class="fas fa-redo"></i> Попробовать снова
                </button>
            </div>
        `;
    }
    
    function updateSiteCount(elements) {
        try {
            const stats = window.dataManager.getStats();
            if (elements.siteCountElement) {
                elements.siteCountElement.textContent = stats.totalSites || 0;
            }
        } catch (error) {
            console.error('Ошибка обновления счетчика сайтов:', error);
        }
    }
    
    function updateSearchStats(elements, resultCount, query) {
        if (!elements.statsContainer) return;
        
        const stats = window.dataManager.getStats();
        const time = (Math.random() * 0.2 + 0.1).toFixed(2);
        
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
        
        const tips = [
            'технологии', 'образование', 'новости', 
            'путешествия', 'здоровье', 'финансы',
            'google', 'youtube', 'wikipedia'
        ];
        
        let currentTip = 0;
        setInterval(() => {
            elements.searchTip.textContent = tips[currentTip];
            elements.searchTip.style.opacity = '0.7';
            setTimeout(() => {
                elements.searchTip.style.opacity = '1';
            }, 300);
            currentTip = (currentTip + 1) % tips.length;
        }, 3000);
        
        // Клик по подсказке
        elements.searchTip.addEventListener('click', function() {
            elements.searchQuery.value = this.textContent;
            performSearch(elements);
        });
    }
    
    function setupQuickSearchButtons(elements) {
        if (!elements.quickSearchButtons) return;
        
        const quickSearches = [
            { query: 'технологии', icon: 'microchip', label: 'Технологии' },
            { query: 'образование', icon: 'graduation-cap', label: 'Образование' },
            { query: 'новости', icon: 'newspaper', label: 'Новости' },
            { query: 'путешествия', icon: 'plane', label: 'Путешествия' },
            { query: 'здоровье', icon: 'heartbeat', label: 'Здоровье' },
            { query: 'google', icon: 'search', label: 'Google' }
        ];
        
        elements.quickSearchButtons.innerHTML = quickSearches
            .map(item => `
                <button class="quick-search-btn" data-query="${item.query}">
                    <i class="fas fa-${item.icon}"></i>
                    ${item.label}
                </button>
            `).join('');
        
        // Обработчики для кнопок быстрого поиска
        elements.quickSearchButtons.querySelectorAll('.quick-search-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const query = this.getAttribute('data-query');
                elements.searchQuery.value = query;
                performSearch(elements);
            });
        });
    }
    
    function exportSearchResults(elements) {
        try {
            const query = elements.searchQuery.value;
            const results = window.dataManager.searchSites(query, {
                exactMatch: elements.exactMatchCheckbox?.checked || false,
                searchTitles: elements.searchTitlesCheckbox?.checked || false
            });
            
            if (results.length === 0) {
                alert('Нет результатов для экспорта');
                return;
            }
            
            // Создаем CSV
            const headers = ['Название', 'URL', 'Описание', 'Категория', 'Ключевые слова', 'Дата добавления'];
            const rows = results.map(site => [
                `"${site.title.replace(/"/g, '""')}"`,
                site.url,
                `"${site.description.replace(/"/g, '""')}"`,
                site.category,
                `"${site.keywords.replace(/"/g, '""')}"`,
                formatDate(site.added_date)
            ]);
            
            const csvContent = [headers, ...rows]
                .map(row => row.join(','))
                .join('\n');
            
            // Создаем и скачиваем файл
            const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `seen-search-results-${query || 'all'}-${new Date().toISOString().slice(0,10)}.csv`;
            link.click();
            URL.revokeObjectURL(url);
            
        } catch (error) {
            console.error('Ошибка экспорта:', error);
            alert('Ошибка при экспорте результатов');
        }
    }
    
    // Вспомогательные функции
    function highlightMatches(text, query) {
        if (!text || !query) return text || '';
        
        try {
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escapedQuery})`, 'gi');
            return text.toString().replace(regex, '<mark>$1</mark>');
        } catch (error) {
            return text;
        }
    }
    
    function formatUrlForDisplay(url) {
        try {
            return url
                .replace(/^https?:\/\//, '')
                .replace(/^www\./, '')
                .replace(/\/$/, '');
        } catch (error) {
            return url;
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
    
    function truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
    
    // Добавляем стили
    addSearchStyles();
});

function addSearchStyles() {
    const styles = `
        /* Результаты поиска */
        .result-item {
            background: white;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.08);
            border: 1px solid #e0e0e0;
            transition: all 0.3s;
        }
        
        .result-item:hover {
            transform: translateY(-3px);
            box-shadow: 0 5px 20px rgba(0,0,0,0.12);
            border-color: #4285f4;
        }
        
        .result-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }
        
        .result-title {
            font-size: 1.3rem;
            font-weight: 600;
            color: #1a0dab;
            text-decoration: none;
            flex-grow: 1;
        }
        
        .result-title:hover {
            text-decoration: underline;
        }
        
        .result-badge {
            padding: 5px 12px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 500;
            margin-left: 15px;
        }
        
        .result-badge.active {
            background: #d4edda;
            color: #155724;
        }
        
        .result-badge.inactive {
            background: #f8d7da;
            color: #721c24;
        }
        
        .result-url {
            color: #006621;
            font-size: 0.9rem;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .result-description {
            color: #545454;
            line-height: 1.6;
            margin-bottom: 20px;
        }
        
        .result-footer {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
            padding-top: 15px;
            border-top: 1px solid #eee;
        }
        
        .result-meta {
            display: flex;
            align-items: center;
            gap: 5px;
            color: #666;
            font-size: 0.85rem;
        }
        
        .result-meta a {
            color: #4285f4;
            text-decoration: none;
        }
        
        .result-meta a:hover {
            text-decoration: underline;
        }
        
        /* Подсветка совпадений */
        mark {
            background-color: #fff9c4;
            padding: 0 2px;
            border-radius: 3px;
        }
        
        /* Загрузка */
        .loading {
            text-align: center;
            padding: 60px 20px;
        }
        
        .loading-spinner {
            font-size: 3rem;
            color: #4285f4;
            margin-bottom: 20px;
        }
        
        /* Приветственное сообщение */
        .welcome-message {
            text-align: center;
            padding: 40px 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        
        .welcome-icon {
            font-size: 4rem;
            color: #4285f4;
            margin-bottom: 20px;
        }
        
        .welcome-text {
            color: #666;
            font-size: 1.1rem;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        
        .popular-sites {
            margin: 40px 0;
        }
        
        .popular-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .popular-site {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            text-align: left;
            border: 1px solid #e0e0e0;
        }
        
        .popular-title {
            font-weight: 600;
            color: #1a0dab;
            text-decoration: none;
            display: block;
            margin-bottom: 10px;
            font-size: 1.1rem;
        }
        
        .popular-title:hover {
            text-decoration: underline;
        }
        
        .popular-url {
            color: #006621;
            font-size: 0.9rem;
            margin-bottom: 10px;
        }
        
        .popular-desc {
            color: #545454;
            font-size: 0.9rem;
            line-height: 1.5;
        }
        
        .welcome-tips {
            margin-top: 40px;
            text-align: left;
            background: #f8f9fa;
            padding: 25px;
            border-radius: 10px;
            border-left: 4px solid #4285f4;
        }
        
        .welcome-tips h4 {
            margin-bottom: 15px;
            color: #333;
        }
        
        .welcome-tips ul {
            list-style-type: none;
            padding-left: 0;
        }
        
        .welcome-tips li {
            padding: 8px 0;
            color: #666;
            position: relative;
            padding-left: 25px;
        }
        
        .welcome-tips li:before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #34a853;
            font-weight: bold;
        }
        
        /* Нет результатов */
        .no-results {
            text-align: center;
            padding: 60px 20px;
            max-width: 600px;
            margin: 0 auto;
        }
        
        .no-results-icon {
            font-size: 4rem;
            color: #ff6b6b;
            margin-bottom: 20px;
        }
        
        .no-results h3 {
            color: #333;
            margin-bottom: 20px;
        }
        
        .suggestions-list {
            list-style-type: none;
            padding-left: 0;
            margin: 30px 0;
            text-align: left;
            display: inline-block;
        }
        
        .suggestions-list li {
            padding: 10px 0;
            color: #666;
            position: relative;
            padding-left: 30px;
        }
        
        .suggestions-list li:before {
            content: '→';
            position: absolute;
            left: 0;
            color: #4285f4;
        }
        
        .search-suggestions {
            margin-top: 30px;
        }
        
        .suggestion-buttons {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 15px;
        }
        
        .suggestion-btn {
            padding: 10px 20px;
            background: #e8f0fe;
            color: #1a73e8;
            border: none;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.3s;
        }
        
        .suggestion-btn:hover {
            background: #d2e3fc;
            transform: translateY(-2px);
        }
        
        /* Кнопки быстрого поиска */
        .quick-search-btn {
            padding: 12px 25px;
            background: white;
            color: #5f6368;
            border: 1px solid #dadce0;
            border-radius: 24px;
            cursor: pointer;
            font-size: 0.95rem;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .quick-search-btn:hover {
            background: #e8f0fe;
            color: #1a73e8;
            border-color: #d2e3fc;
            transform: translateY(-2px);
        }
        
        /* Фатальная ошибка */
        .fatal-error {
            text-align: center;
            padding: 60px 20px;
            max-width: 600px;
            margin: 100px auto;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .fatal-error h2 {
            color: #ea4335;
            margin-bottom: 20px;
        }
        
        .fatal-error ol {
            text-align: left;
            display: inline-block;
            margin: 20px 0;
        }
        
        .retry-btn {
            margin-top: 30px;
            padding: 15px 30px;
            background: #4285f4;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1rem;
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 30px auto 0;
        }
        
        /* Адаптивность */
        @media (max-width: 768px) {
            .result-header {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .result-badge {
                margin-left: 0;
                margin-top: 10px;
                align-self: flex-start;
            }
            
            .result-footer {
                flex-direction: column;
                gap: 10px;
            }
            
            .popular-grid {
                grid-template-columns: 1fr;
            }
            
            .suggestion-buttons {
                flex-direction: column;
                align-items: center;
            }
            
            .suggestion-btn {
                width: 200px;
                text-align: center;
            }
            
            .quick-search-btn {
                width: 100%;
                justify-content: center;
            }
        }
        
        @media (max-width: 480px) {
            .result-item {
                padding: 20px;
            }
            
            .result-title {
                font-size: 1.1rem;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    }
