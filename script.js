// Данные для поиска (хранятся локально в JS)
const websitesData = [
    {
        id: 1,
        title: 'Технологии будущего',
        url: 'https://example-tech.ru',
        description: 'Современные технологии и инновации в IT-сфере. Новости, обзоры и аналитика технологического рынка.',
        keywords: 'технологии, IT, инновации, программирование',
        category: 'Технологии',
        added_date: '2023-10-15T10:30:00Z'
    },
    {
        id: 2,
        title: 'Научные исследования и открытия',
        url: 'https://science-discoveries.org',
        description: 'Последние научные открытия и исследования в различных областях науки. Статьи, публикации и новости науки.',
        keywords: 'наука, исследования, открытия, образование',
        category: 'Наука',
        added_date: '2023-10-14T14:20:00Z'
    },
    {
        id: 3,
        title: 'Путешествия по всему миру',
        url: 'https://world-travel.blog',
        description: 'Блог о путешествиях, достопримечательностях и культурах разных стран. Советы туристам и отчеты о поездках.',
        keywords: 'путешествия, туризм, страны, культура',
        category: 'Путешествия',
        added_date: '2023-10-13T09:15:00Z'
    },
    {
        id: 4,
        title: 'Онлайн-образование для всех',
        url: 'https://online-education.com',
        description: 'Платформа онлайн-курсов по программированию, дизайну и маркетингу. Обучение с нуля до профессионала.',
        keywords: 'образование, курсы, обучение, программирование',
        category: 'Образование',
        added_date: '2023-10-12T11:45:00Z'
    },
    {
        id: 5,
        title: 'Новости технологий 2024',
        url: 'https://tech-news.ru',
        description: 'Самые свежие новости из мира технологий, искусственного интеллекта и кибербезопасности.',
        keywords: 'технологии, новости, AI, искусственный интеллект',
        category: 'Технологии',
        added_date: '2023-10-11T16:30:00Z'
    },
    {
        id: 6,
        title: 'Здоровый образ жизни',
        url: 'https://health-life.org',
        description: 'Советы по здоровому питанию, фитнесу и wellness. Медицинские рекомендации и здоровые привычки.',
        keywords: 'здоровье, спорт, питание, медицина',
        category: 'Здоровье',
        added_date: '2023-10-10T08:20:00Z'
    },
    {
        id: 7,
        title: 'Финансы и инвестиции',
        url: 'https://finance-invest.com',
        description: 'Анализ финансовых рынков, советы по инвестированию и управлению личными финансами.',
        keywords: 'финансы, инвестиции, деньги, экономика',
        category: 'Бизнес',
        added_date: '2023-10-09T13:10:00Z'
    },
    {
        id: 8,
        title: 'Кулинарные рецепты',
        url: 'https://cooking-recipes.net',
        description: 'Тысячи рецептов блюд со всего мира. Пошаговые инструкции и кулинарные советы.',
        keywords: 'кулинария, рецепты, еда, готовка',
        category: 'Кулинария',
        added_date: '2023-10-08T17:40:00Z'
    }
];

// Основная функция поиска
function searchWebsites(query, exactMatch = false, searchTitles = false) {
    if (!query || query.trim() === '') {
        return [];
    }
    
    const searchTerm = query.toLowerCase().trim();
    const results = [];
    
    websitesData.forEach(website => {
        let score = 0;
        const fieldsToSearch = [];
        
        // Определяем, где искать
        if (searchTitles) {
            fieldsToSearch.push(website.title);
        } else {
            fieldsToSearch.push(website.title, website.description, website.keywords);
        }
        
        // Проверяем точное совпадение
        if (exactMatch) {
            const combinedText = fieldsToSearch.join(' ').toLowerCase();
            if (combinedText.includes(searchTerm)) {
                score = 100;
            }
        } else {
            // Ищем по отдельным словам
            const words = searchTerm.split(' ').filter(word => word.length > 2);
            
            words.forEach(word => {
                fieldsToSearch.forEach(field => {
                    if (field.toLowerCase().includes(word)) {
                        score += 10;
                        
                        // Дополнительные баллы за совпадение в заголовке
                        if (field === website.title) {
                            score += 5;
                        }
                    }
                });
            });
        }
        
        if (score > 0) {
            results.push({
                ...website,
                score: score
            });
        }
    });
    
    // Сортируем по релевантности
    results.sort((a, b) => b.score - a.score);
    
    // Убираем score из результата
    return results.map(item => {
        const { score, ...rest } = item;
        return rest;
    });
}

// Главная функция после загрузки DOM
document.addEventListener('DOMContentLoaded', function() {
    // Элементы DOM
    const searchForm = document.getElementById('searchForm');
    const searchQuery = document.getElementById('searchQuery');
    const searchButton = document.getElementById('searchButton');
    const resultsContainer = document.getElementById('results');
    const statsContainer = document.getElementById('stats');
    const siteCountElement = document.getElementById('siteCount');
    const exactMatchCheckbox = document.getElementById('exactMatch');
    const searchTitlesCheckbox = document.getElementById('searchTitles');
    
    // Обновляем счетчик сайтов
    updateSiteCount();
    
    // Показываем примеры при загрузке
    showExamples();
    
    // Обработчик отправки формы поиска
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        performSearch();
    });
    
    // Поиск при нажатии Enter (на всякий случай)
    searchQuery.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });
    
    // Быстрый доступ к популярным запросам
    setupQuickSearch();
    
    // Функция выполнения поиска
    function performSearch() {
        const query = searchQuery.value.trim();
        
        if (!query) {
            showMessage('Введите поисковый запрос', 'error');
            return;
        }
        
        // Показываем индикатор загрузки
        showLoading();
        
        // Имитируем небольшую задержку для реалистичности
        setTimeout(() => {
            // Выполняем поиск
            const results = searchWebsites(
                query, 
                exactMatchCheckbox.checked, 
                searchTitlesCheckbox.checked
            );
            
            // Отображаем результаты
            displayResults(results, query);
            
            // Обновляем статистику
            updateStats(results.length, query);
            
        }, 200);
    }
    
    // Функция отображения результатов поиска
    function displayResults(results, query) {
        resultsContainer.innerHTML = '';
        
        if (!results || results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>По запросу "${query}" ничего не найдено</h3>
                    <p>Попробуйте:</p>
                    <ul style="text-align: left; display: inline-block; margin-top: 10px;">
                        <li>Использовать другие ключевые слова</li>
                        <li>Проверить правильность написания</li>
                        <li>Убрать фильтр "Точное соответствие"</li>
                        <li>Воспользоваться быстрым поиском ниже</li>
                    </ul>
                </div>
            `;
            
            // Показываем быстрые подсказки
            showQuickSuggestions(query);
            return;
        }
        
        // Создаем элементы для каждого результата
        results.forEach(result => {
            const resultElement = document.createElement('div');
            resultElement.className = 'result-item';
            
            // Подсветка совпадений в описании
            let description = result.description || 'Описание отсутствует';
            description = highlightText(description, query);
            
            // Форматируем URL для отображения
            let displayUrl = result.url.replace(/^https?:\/\//, '');
            if (displayUrl.length > 50) {
                displayUrl = displayUrl.substring(0, 50) + '...';
            }
            
            resultElement.innerHTML = `
                <a href="${result.url}" class="result-title" target="_blank" rel="noopener noreferrer">
                    ${highlightText(result.title, query)}
                </a>
                <div class="result-url">${displayUrl}</div>
                <div class="result-description">${description}</div>
                <div class="result-meta">
                    <span><i class="far fa-calendar"></i> ${formatDate(result.added_date)}</span>
                    <span><i class="fas fa-tag"></i> ${result.category || 'Без категории'}</span>
                    ${result.keywords ? `<span><i class="fas fa-hashtag"></i> ${result.keywords}</span>` : ''}
                </div>
            `;
            
            resultsContainer.appendChild(resultElement);
        });
    }
    
    // Функция подсветки текста
    function highlightText(text, query) {
        if (!query || !text) return text;
        
        const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        return text.toString().replace(regex, '<span class="highlight">$1</span>');
    }
    
    // Функция обновления статистики
    function updateStats(total, query) {
        const time = (Math.random() * 0.5 + 0.1).toFixed(3); // Имитация времени поиска
        
        let matchType = '';
        if (exactMatchCheckbox.checked) {
            matchType = ' (точное соответствие)';
        } else if (searchTitlesCheckbox.checked) {
            matchType = ' (в заголовках)';
        }
        
        statsContainer.innerHTML = `
            <p>Найдено <strong>${total}</strong> результатов по запросу "<strong>${query}</strong>"${matchType}</p>
            <p style="font-size: 0.9rem; margin-top: 5px;">Поиск выполнен за ${time} сек.</p>
        `;
    }
    
    // Функция показа индикатора загрузки
    function showLoading() {
        resultsContainer.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Ищем "${searchQuery.value}" в ${websitesData.length} сайтах...</p>
            </div>
        `;
        
        statsContainer.innerHTML = `
            <p>Выполняется поиск...</p>
        `;
    }
    
    // Функция показа сообщения
    function showMessage(message, type = 'info') {
        statsContainer.innerHTML = `
            <p style="color: ${type === 'error' ? '#d93025' : '#4285f4'}">
                <i class="fas fa-${type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
                ${message}
            </p>
        `;
    }
    
    // Функция форматирования даты
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }
    
    // Функция обновления счетчика сайтов
    function updateSiteCount() {
        siteCountElement.textContent = websitesData.length;
    }
    
    // Функция показа примеров сайтов
    function showExamples() {
        const exampleResults = websitesData.slice(0, 4);
        displayResults(exampleResults, 'пример');
        statsContainer.innerHTML = `
            <p>Примеры сайтов в системе SEEN Search</p>
            <p style="font-size: 0.9rem; margin-top: 5px;">Введите свой запрос в поле выше</p>
        `;
    }
    
    // Функция быстрых подсказок при отсутствии результатов
    function showQuickSuggestions(failedQuery) {
        // Находим похожие запросы
        const suggestions = [
            'технологии',
            'образование', 
            'новости',
            'здоровье',
            'финансы'
        ].filter(word => 
            word.toLowerCase().includes(failedQuery.toLowerCase().substring(0, 3)) ||
            failedQuery.toLowerCase().substring(0, 3).includes(word.toLowerCase().substring(0, 3))
        );
        
        if (suggestions.length > 0) {
            const suggestionsDiv = document.createElement('div');
            suggestionsDiv.className = 'quick-suggestions';
            suggestionsDiv.innerHTML = `
                <p style="margin-top: 20px; color: #666;">Возможно, вы ищете:</p>
                <div class="suggestion-buttons">
                    ${suggestions.map(word => `
                        <button class="suggestion-btn" onclick="document.getElementById('searchQuery').value='${word}'; document.getElementById('searchForm').submit();">
                            ${word}
                        </button>
                    `).join('')}
                </div>
            `;
            
            resultsContainer.appendChild(suggestionsDiv);
            
            // Добавляем стили для кнопок
            const style = document.createElement('style');
            style.textContent = `
                .quick-suggestions {
                    text-align: center;
                    margin-top: 30px;
                    padding: 20px;
                    background-color: #f8f9fa;
                    border-radius: 8px;
                }
                .suggestion-buttons {
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-top: 15px;
                }
                .suggestion-btn {
                    padding: 8px 16px;
                    background-color: #4285f4;
                    color: white;
                    border: none;
                    border-radius: 20px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: background-color 0.3s;
                }
                .suggestion-btn:hover {
                    background-color: #3367d6;
                }
                .result-meta {
                    margin-top: 10px;
                    font-size: 0.85rem;
                    color: #777;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                }
                .result-meta span {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Настройка быстрого поиска
    function setupQuickSearch() {
        const quickSearchDiv = document.createElement('div');
        quickSearchDiv.className = 'quick-search';
        quickSearchDiv.innerHTML = `
            <div style="margin: 30px 0; text-align: center;">
                <p style="color: #666; margin-bottom: 10px;">Попробуйте быстрый поиск:</p>
                <div class="quick-search-buttons">
                    <button class="quick-btn" data-query="технологии">Технологии</button>
                    <button class="quick-btn" data-query="образование">Образование</button>
                    <button class="quick-btn" data-query="новости">Новости</button>
                    <button class="quick-btn" data-query="путешествия">Путешествия</button>
                    <button class="quick-btn" data-query="здоровье">Здоровье</button>
                </div>
            </div>
        `;
        
        // Добавляем перед результатами
        resultsContainer.parentNode.insertBefore(quickSearchDiv, resultsContainer.nextSibling);
        
        // Обработчики для кнопок быстрого поиска
        setTimeout(() => {
            document.querySelectorAll('.quick-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const query = this.getAttribute('data-query');
                    searchQuery.value = query;
                    performSearch();
                });
            });
        }, 100);
        
        // Добавляем стили для быстрого поиска
        const quickSearchStyle = document.createElement('style');
        quickSearchStyle.textContent = `
            .quick-search-buttons {
                display: flex;
                justify-content: center;
                flex-wrap: wrap;
                gap: 10px;
            }
            .quick-btn {
                padding: 10px 20px;
                background-color: #f1f3f4;
                color: #5f6368;
                border: 1px solid #dadce0;
                border-radius: 24px;
                cursor: pointer;
                font-size: 0.95rem;
                transition: all 0.3s;
            }
            .quick-btn:hover {
                background-color: #e8f0fe;
                color: #1a73e8;
                border-color: #d2e3fc;
            }
        `;
        document.head.appendChild(quickSearchStyle);
    }
    
    // Добавляем обработчик для кнопки поиска (анимация)
    searchButton.addEventListener('click', function() {
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ищем...';
        this.disabled = true;
        
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-search"></i> Поиск';
            this.disabled = false;
        }, 300);
    });
    
    // Фокус на поле поиска при загрузке
    searchQuery.focus();
    
    // Добавляем примеры популярных запросов в placeholder
    const placeholders = [
        'технологии',
        'образование онлайн', 
        'новости науки',
        'путешествия по миру',
        'здоровый образ жизни'
    ];
    
    let placeholderIndex = 0;
    setInterval(() => {
        searchQuery.placeholder = `Например: "${placeholders[placeholderIndex]}"...`;
        placeholderIndex = (placeholderIndex + 1) % placeholders.length;
    }, 3000);
});
