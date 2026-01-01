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
    
    // Загружаем количество сайтов в системе
    updateSiteCount();
    
    // Обработчик отправки формы поиска
    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        performSearch();
    });
    
    // Функция выполнения поиска
    async function performSearch() {
        const query = searchQuery.value.trim();
        
        if (!query) {
            showMessage('Введите поисковый запрос', 'error');
            return;
        }
        
        // Показываем индикатор загрузки
        showLoading();
        
        // Подготавливаем параметры запроса
        const params = new URLSearchParams({
            q: query,
            exact: exactMatchCheckbox.checked ? '1' : '0',
            titles: searchTitlesCheckbox.checked ? '1' : '0'
        });
        
        try {
            // Отправляем запрос к бэкенду
            const response = await fetch(`search.php?${params}`);
            const data = await response.json();
            
            // Отображаем результаты
            displayResults(data.results, query);
            
            // Обновляем статистику
            updateStats(data.total, query, data.time);
            
        } catch (error) {
            console.error('Ошибка при выполнении поиска:', error);
            showMessage('Произошла ошибка при выполнении поиска', 'error');
        }
    }
    
    // Функция отображения результатов поиска
    function displayResults(results, query) {
        resultsContainer.innerHTML = '';
        
        if (!results || results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <i class="fas fa-search"></i>
                    <h3>По запросу "${query}" ничего не найдено</h3>
                    <p>Попробуйте изменить запрос или проверьте правильность написания</p>
                </div>
            `;
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
            let displayUrl = result.url;
            if (displayUrl.length > 50) {
                displayUrl = displayUrl.substring(0, 50) + '...';
            }
            
            resultElement.innerHTML = `
                <a href="${result.url}" class="result-title" target="_blank">${highlightText(result.title, query)}</a>
                <div class="result-url">${displayUrl}</div>
                <div class="result-description">${description}</div>
                <div style="margin-top: 10px; font-size: 0.85rem; color: #777;">
                    <span>Добавлен: ${formatDate(result.added_date)}</span>
                    ${result.keywords ? `<span style="margin-left: 15px;">Ключевые слова: ${result.keywords}</span>` : ''}
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
    function updateStats(total, query, searchTime) {
        let timeText = '';
        if (searchTime) {
            timeText = ` • Запрос обработан за ${searchTime} сек.`;
        }
        
        statsContainer.innerHTML = `
            <p>Найдено ${total} результатов по запросу "${query}"${timeText}</p>
        `;
    }
    
    // Функция показа индикатора загрузки
    function showLoading() {
        resultsContainer.innerHTML = `
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Выполняется поиск...</p>
            </div>
        `;
        
        statsContainer.innerHTML = `
            <p>Выполняется поиск...</p>
        `;
    }
    
    // Функция показа сообщения
    function showMessage(message, type = 'info') {
        statsContainer.innerHTML = `
            <p style="color: ${type === 'error' ? '#d93025' : '#4285f4'}">${message}</p>
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
    async function updateSiteCount() {
        try {
            const response = await fetch('search.php?action=count');
            const data = await response.json();
            
            if (data.count !== undefined) {
                siteCountElement.textContent = data.count;
            }
        } catch (error) {
            console.error('Ошибка при получении количества сайтов:', error);
        }
    }
    
    // Загружаем примеры результатов при первой загрузке (для демонстрации)
    loadExampleResults();
    
    // Функция загрузки примеров результатов (для демонстрации)
    async function loadExampleResults() {
        try {
            const response = await fetch('search.php?action=example');
            const data = await response.json();
            
            if (data.results && data.results.length > 0) {
                // Показываем примеры результатов
                displayResults(data.results.slice(0, 3), 'пример');
                statsContainer.innerHTML = `
                    <p>Примеры сайтов в системе SEEN Search. Введите свой запрос выше.</p>
                `;
            }
        } catch (error) {
            console.error('Ошибка при загрузке примеров:', error);
        }
    }
});
