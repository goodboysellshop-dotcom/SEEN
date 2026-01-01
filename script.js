// script.js - Главный скрипт поисковой системы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация DataManager
    const dm = window.dataManager;
    
    // Элементы DOM
    const searchForm = document.getElementById('searchForm');
    const searchQuery = document.getElementById('searchQuery');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('results');
    const statsContainer = document.getElementById('stats');
    const siteCountElement = document.getElementById('siteCount');
    const exactMatchCheckbox = document.getElementById('exactMatch');
    const searchTitlesCheckbox = document.getElementById('searchTitles');
    
    // Инициализация
    init();
    
    function init() {
        updateSiteCount();
        showExamples();
        setupEventListeners();
        setupQuickSearch();
        setupPlaceholderRotation();
        
        // Фокус на поле поиска
        searchQuery.focus();
    }
    
    function setupEventListeners() {
        // Поиск при отправке формы
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            performSearch();
        });
        
        // Поиск при нажатии Enter
        searchQuery.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
        
        // Обновление данных при изменениях
        window.addEventListener('seenDataUpdated', function() {
            updateSiteCount();
            
            // Если есть активный поиск, обновляем результаты
            const currentQuery = searchQuery.value;
            if (currentQuery && currentQuery.trim() !== '') {
                setTimeout(() => performSearch(), 100);
            }
        });
        
        // Анимация кнопки поиска
        searchButton.addEventListener('click', function() {
            this.classList.add('searching');
            setTimeout(() => {
                this.classList.remove('searching');
            }, 300);
        });
    }
    
    // Основная функция поиска
    function performSearch() {
        const query = searchQuery.value.trim();
        
        if (!query) {
            showMessage('Введите поисковый запрос', 'error');
            return;
        }
        
        showLoading();
        
        // Имитация задержки сети
        setTimeout(() => {
            try {
                const results = dm.searchSites(query, {
                    exactMatch: exactMatchCheckbox.checked,
                    searchTitles: searchTitlesCheckbox.checked
                });
                
                displayResults(results, query);
                updateStats(results.length, query);
                
            } catch (error) {
                console.error('Ошибка поиска:', error);
                showMessage('Ошибка при выполнении поиска', 'error');
                resultsContainer.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-exclamation-triangle"></i>
                        <h3>Ошибка поиска</h3>
                        <p>${error.message}</p>
                    </div>
                `;
            }
        }, 150);
    }
    
    // Отображение результатов
    function displayResults(results, query) {
        resultsContainer.innerHTML = '';
        
        if (!results || results.length === 0) {
            showNoResults(query);
            return;
        }
        
        results.forEach(result => {
            const resultElement = createResultElement(result, query);
            resultsContainer.appendChild(resultElement);
        });
    }
    
    // Создание элемента результата
    function createResultElement(result, query) {
        const element = document.createElement('div');
        element.className = 'result-item';
        element.dataset.id = result.id;
        
        const displayUrl = formatUrl(result.url);
        const description = highlightText(result.description || 'Описание отсутствует', query);
        const title = highlightText(result.title, query);
        
        element.innerHTML = `
            <a href="${result.url}" class="result-title" target="_blank" rel="noopener noreferrer">
                ${title} ${result.category ? `<span class="result-category">${result.category}</span>` : ''}
            </a>
            <div class="result-url">
                <i class="fas fa-link"></i> ${displayUrl}
            </div>
            <div class="result-description">${description}</div>
            <div class="result-meta">
                <span><i class="far fa-calendar"></i> ${formatDate(result.added_date)}</span>
                <span><i class="fas fa-star"></i> Релевантность: ${calculateRelevance(result, query)}%</span>
                ${result.keywords ? `<span><i class="fas fa-hashtag"></i> ${result.keywords}</span>` : ''}
            </div>
        `;
        
        return element;
    }
    
    // Расчет релевантности (упрощенный)
    function calculateRelevance(result, query) {
        const queryWords = query.toLowerCase().split(' ').filter(w => w.length > 2);
        let matches = 0;
        
        const text = `${result.title} ${result.description} ${result.keywords}`.toLowerCase();
        
        queryWords.forEach(word => {
            if (text.includes(word)) matches++;
        });
        
        return Math.min(100, Math.round((matches / queryWords.length) * 100));
    }
    
    // Показать "нет результатов"
    function showNoResults(query) {
        const suggestions = getSuggestions(query);
        
        let suggestionsHTML = '';
        if (suggestions.length > 0) {
            suggestionsHTML = `
                <div class="suggestions">
                    <p>Возможно, вы ищете:</p>
                    <div class="suggestion-buttons">
                        ${suggestions.map(term => `
                            <button class="suggestion-btn" onclick="setSearchQuery('${term}')">
                                ${term}
                            </button>
                        `).join('')}
                    </div>
                </div>
            `;
        }
        
        resultsContainer.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>По запросу "${query}" ничего не найдено</h3>
                <p>Попробуйте:</p>
                <ul>
                    <li>Использовать другие ключевые слова</li>
                    <li>Проверить правильность написания</li>
                    <li>Искать более общие термины</li>
                </ul>
                ${suggestionsHTML}
            </div>
        `;
        
        // Глобальная функция для установки запроса
        window.setSearchQuery = function(term) {
            searchQuery.value = term;
            performSearch();
        };
    }
    
    // Получение подсказок
    function getSuggestions(query) {
        const allKeywords = dm.getSites()
            .flatMap(site => site.keywords ? site.keywords.split(',').map(k => k.trim()) : [])
            .filter(k => k.length > 0);
        
        const uniqueKeywords = [...new Set(allKeywords)];
        const queryLower = query.toLowerCase();
        
        return uniqueKeywords
            .filter(keyword => 
                keyword.toLowerCase().includes(queryLower) || 
                queryLower.includes(keyword.toLowerCase().substring(0, 3))
            )
            .slice(0, 5);
    }
    
    // Обновление статистики
    function updateStats(total, query) {
        const time = (Math.random() * 0.3 + 0.1).toFixed(2);
        const stats = dm.getStats();
        
        let optionsText = '';
        if (exactMatchCheckbox.checked) optionsText = ' (точное соответствие)';
        if (searchTitlesCheckbox.checked) optionsText = ' (в заголовках)';
        
        statsContainer.innerHTML = `
            <div class="stats-content">
                <p>
                    Найдено <strong>${total}</strong> результатов по запросу 
                    "<strong>${query}</strong>"${optionsText}
                </p>
                <div class="stats-details">
                    <span><i class="fas fa-clock"></i> ${time} сек.</span>
                    <span><i class="fas fa-database"></i> ${stats.totalSites || 0} сайтов в базе</span>
                    ${stats.addedToday > 0 ? `<span><i class="fas fa-calendar-day"></i> +${stats.addedToday} сегодня</span>` : ''}
                </div>
            </div>
        `;
    }
    
    // Показать загрузку
    function showLoading() {
        resultsContainer.innerHTML = `
            <div class="loading">
                <div class="spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                </div>
                <p>Ищем "${searchQuery.value}"...</p>
                <p class="loading-subtitle">Проверяем ${dm.getStats().totalSites || 0} сайтов</p>
            </div>
        `;
        
        statsContainer.innerHTML = `
            <p><i class="fas fa-spinner fa-spin"></i> Выполняется поиск...</p>
        `;
    }
    
    // Показать сообщение
    function showMessage(message, type = 'info') {
        const icon = type === 'error' ? 'exclamation-triangle' : 'info-circle';
        const color = type === 'error' ? '#d93025' : '#4285f4';
        
        statsContainer.innerHTML = `
            <p style="color: ${color}">
                <i class="fas fa-${icon}"></i> ${message}
            </p>
        `;
    }
    
    // Показать примеры
    function showExamples() {
        const examples = dm.getSites().slice(0, 3);
        displayResults(examples, 'пример');
        
        statsContainer.innerHTML = `
            <div class="stats-content">
                <p>Добро пожаловать в SEEN Search!</p>
                <div class="stats-details">
                    <span><i class="fas fa-globe"></i> ${dm.getStats().totalSites || 0} сайтов в системе</span>
                    <span><i class="fas fa-eye"></i> Примеры результатов выше</span>
                </div>
            </div>
        `;
    }
    
    // Обновить счетчик сайтов
    function updateSiteCount() {
        const stats = dm.getStats();
        siteCountElement.textContent = stats.totalSites || 0;
        siteCountElement.style.fontWeight = 'bold';
        siteCountElement.style.color = '#4285f4';
    }
    
    // Настройка быстрого поиска
    function setupQuickSearch() {
        const quickSearchDiv = document.createElement('div');
        quickSearchDiv.className = 'quick-search';
        quickSearchDiv.innerHTML = `
            <div class="quick-search-container">
                <p class="quick-search-title">Популярные запросы:</p>
                <div class="quick-search-buttons">
                    <button class="quick-btn" data-query="технологии">
                        <i class="fas fa-microchip"></i> Технологии
                    </button>
                    <button class="quick-btn" data-query="образование">
                        <i class="fas fa-graduation-cap"></i> Образование
                    </button>
                    <button class="quick-btn" data-query="новости">
                        <i class="fas fa-newspaper"></i> Новости
                    </button>
                    <button class="quick-btn" data-query="путешествия">
                        <i class="fas fa-plane"></i> Путешествия
                    </button>
                    <button class="quick-btn" data-query="здоровье">
                        <i class="fas fa-heartbeat"></i> Здоровье
                    </button>
                </div>
            </div>
        `;
        
        resultsContainer.parentNode.insertBefore(quickSearchDiv, resultsContainer.nextSibling);
        
        // Обработчики для кнопок быстрого поиска
        setTimeout(() => {
            document.querySelectorAll('.quick-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const query = this.getAttribute('data-query');
                    searchQuery.value = query;
                    performSearch();
                });
            });
        }, 100);
    }
    
    // Ротация placeholder
    function setupPlaceholderRotation() {
        const placeholders = [
            'технологии будущего',
            'онлайн образование', 
            'новости науки',
            'путешествия по миру',
            'здоровый образ жизни',
            'финансы и инвестиции'
        ];
        
        let index = 0;
        setInterval(() => {
            searchQuery.placeholder = `Например: "${placeholders[index]}"...`;
            index = (index + 1) % placeholders.length;
        }, 3000);
    }
    
    // Вспомогательные функции
    function highlightText(text, query) {
        if (!query || !text) return text || '';
        
        try {
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escapedQuery})`, 'gi');
            return text.toString().replace(regex, '<span class="highlight">$1</span>');
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
    
    function formatUrl(url) {
        try {
            return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
        } catch (error) {
            return url;
        }
    }
    
    // Добавляем стили для новых элементов
    addCustomStyles();
});

// Добавление кастомных стилей
function addCustomStyles() {
    const styles = `
        /* Анимация поиска */
        #searchButton.searching {
            background-color: #34a853 !important;
            transform: scale(0.95);
        }
        
        #searchButton.searching i {
            animation: spin 0.5s linear infinite;
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        
        /* Статистика */
        .stats-content {
            line-height: 1.6;
        }
        
        .stats-details {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 5px;
            font-size: 0.85rem;
            color: #666;
        }
        
        .stats-details span {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        /* Результаты */
        .result-category {
            background: #e8f0fe;
            color: #1a73e8;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8rem;
            margin-left: 10px;
            font-weight: normal;
        }
        
        .result-meta {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 12px;
            font-size: 0.85rem;
            color: #666;
        }
        
        .result-meta span {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        /* Загрузка */
        .loading {
            text-align: center;
            padding: 40px 20px;
        }
        
        .spinner {
            font-size: 2.5rem;
            color: #4285f4;
            margin-bottom: 15px;
        }
        
        .loading-subtitle {
            color: #666;
            font-size: 0.9rem;
            margin-top: 5px;
        }
        
        /* Быстрый поиск */
        .quick-search {
            margin: 30px 0;
        }
        
        .quick-search-container {
            text-align: center;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            border: 1px solid #e0e0e0;
        }
        
        .quick-search-title {
            color: #666;
            margin-bottom: 15px;
            font-weight: 500;
        }
        
        .quick-search-buttons {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 10px;
        }
        
        .quick-btn {
            padding: 10px 18px;
            background: white;
            color: #5f6368;
            border: 1px solid #dadce0;
            border-radius: 24px;
            cursor: pointer;
            font-size: 0.95rem;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .quick-btn:hover {
            background: #e8f0fe;
            color: #1a73e8;
            border-color: #d2e3fc;
            transform: translateY(-2px);
        }
        
        /* Подсказки */
        .suggestions {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }
        
        .suggestion-buttons {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
        }
        
        .suggestion-btn {
            padding: 8px 16px;
            background: #f1f3f4;
            color: #5f6368;
            border: none;
            border-radius: 16px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s;
        }
        
        .suggestion-btn:hover {
            background: #4285f4;
            color: white;
        }
        
        /* Адаптивность */
        @media (max-width: 768px) {
            .quick-search-buttons {
                flex-direction: column;
                align-items: center;
            }
            
            .quick-btn {
                width: 200px;
                justify-content: center;
            }
            
            .stats-details {
                flex-direction: column;
                gap: 8px;
            }
            
            .result-meta {
                flex-direction: column;
                gap: 8px;
            }
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}
