document.addEventListener('DOMContentLoaded', function() {
    // Загружаем статистику при загрузке страницы
    loadStats();
    loadSites();
    
    // Обработчик формы добавления сайта
    document.getElementById('addSiteForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addSite();
    });
    
    // Обработчик поиска по сайтам
    document.getElementById('searchSites').addEventListener('input', function() {
        filterSites(this.value);
    });
});

// Функция показа раздела
function showSection(sectionId) {
    // Скрываем все разделы
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Убираем активный класс у всех ссылок навигации
    document.querySelectorAll('.admin-nav a').forEach(link => {
        link.classList.remove('active');
    });
    
    // Показываем выбранный раздел
    document.getElementById(sectionId).classList.add('active');
    
    // Активируем соответствующую ссылку навигации
    document.querySelector(`.admin-nav a[href="#${sectionId}"]`).classList.add('active');
    
    // Загружаем данные для раздела, если нужно
    if (sectionId === 'dashboard') {
        loadStats();
    } else if (sectionId === 'manage-sites') {
        loadSites();
    }
}

// Функция загрузки статистики
async function loadStats() {
    try {
        const response = await fetch('search.php?action=count');
        const data = await response.json();
        
        if (data.count !== undefined) {
            document.getElementById('total-sites').textContent = data.count;
        }
        
        // В реальном приложении здесь был бы запрос к API для получения дополнительной статистики
        document.getElementById('today-added').textContent = Math.floor(Math.random() * 5); // Демо-данные
        document.getElementById('db-size').textContent = (data.count * 0.5).toFixed(1) + " KB"; // Демо-данные
    } catch (error) {
        console.error('Ошибка при загрузке статистики:', error);
        showMessage('Ошибка при загрузке статистики', 'error');
    }
}

// Функция добавления сайта
async function addSite() {
    const title = document.getElementById('siteTitle').value.trim();
    const url = document.getElementById('siteUrl').value.trim();
    const description = document.getElementById('siteDescription').value.trim();
    const keywords = document.getElementById('siteKeywords').value.trim();
    const category = document.getElementById('siteCategory').value.trim();
    
    if (!title || !url || !description) {
        showMessage('Заполните все обязательные поля (отмеченные *)', 'error');
        return;
    }
    
    // Проверяем URL
    if (!isValidUrl(url)) {
        showMessage('Введите корректный URL (начинается с http:// или https://)', 'error');
        return;
    }
    
    try {
        // В реальном приложении здесь был бы запрос к API для добавления сайта в БД
        // Для демонстрации используем локальное хранилище
        
        // Получаем текущие сайты из localStorage
        let sites = JSON.parse(localStorage.getItem('seen_sites') || '[]');
        
        // Создаем новый сайт
        const newSite = {
            id: Date.now(),
            title: title,
            url: url,
            description: description,
            keywords: keywords,
            category: category,
            added_date: new Date().toISOString()
        };
        
        // Добавляем сайт в список
        sites.unshift(newSite);
        
        // Сохраняем в localStorage
        localStorage.setItem('seen_sites', JSON.stringify(sites));
        
        // Показываем сообщение об успехе
        showMessage(`Сайт "${title}" успешно добавлен в систему!`, 'success');
        
        // Очищаем форму
        clearForm();
        
        // Обновляем статистику
        loadStats();
        
        // Если мы в разделе управления сайтами, обновляем список
        if (document.getElementById('manage-sites').classList.contains('active')) {
            loadSites();
        }
        
    } catch (error) {
        console.error('Ошибка при добавлении сайта:', error);
        showMessage('Ошибка при добавлении сайта', 'error');
    }
}

// Функция загрузки списка сайтов
async function loadSites() {
    const sitesList = document.getElementById('sitesList');
    
    try {
        // В реальном приложении здесь был бы запрос к API для получения списка сайтов
        // Для демонстрации используем localStorage
        
        let sites = JSON.parse(localStorage.getItem('seen_sites') || '[]');
        
        // Если нет сайтов в localStorage, загружаем демо-данные
        if (sites.length === 0) {
            sites = [
                {
                    id: 1,
                    title: 'Технологии будущего',
                    url: 'https://example-tech.ru',
                    description: 'Современные технологии и инновации в IT-сфере. Новости, обзоры и аналитика технологического рынка.',
                    keywords: 'технологии, IT, инновации, программирование',
                    category: 'Технологии',
                    added_date: new Date().toISOString()
                },
                {
                    id: 2,
                    title: 'Научные исследования и открытия',
                    url: 'https://science-discoveries.org',
                    description: 'Последние научные открытия и исследования в различных областях науки. Статьи, публикации и новости науки.',
                    keywords: 'наука, исследования, открытия, образование',
                    category: 'Наука',
                    added_date: new Date(Date.now() - 86400000).toISOString()
                },
                {
                    id: 3,
                    title: 'Путешествия по всему миру',
                    url: 'https://world-travel.blog',
                    description: 'Блог о путешествиях, достопримечательностях и культурах разных стран. Советы туристам и отчеты о поездках.',
                    keywords: 'путешествия, туризм, страны, культура',
                    category: 'Путешествия',
                    added_date: new Date(Date.now() - 172800000).toISOString()
                }
            ];
            
            localStorage.setItem('seen_sites', JSON.stringify(sites));
        }
        
        // Отображаем список сайтов
        displaySites(sites);
        
    } catch (error) {
        console.error('Ошибка при загрузке сайтов:', error);
        sitesList.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #dc3545;">
                <i class="fas fa-exclamation-triangle fa-2x"></i>
                <p>Ошибка при загрузке списка сайтов</p>
            </div>
        `;
    }
}

// Функция отображения списка сайтов
function displaySites(sites) {
    const sitesList = document.getElementById('sitesList');
    
    if (!sites || sites.length === 0) {
        sitesList.innerHTML = `
            <div style="padding: 40px; text-align: center; color: #666;">
                <i class="fas fa-inbox fa-2x"></i>
                <p>Нет добавленных сайтов</p>
                <button class="btn" onclick="showSection('add-site')" style="margin-top: 15px;">
                    <i class="fas fa-plus"></i> Добавить первый сайт
                </button>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    sites.forEach(site => {
        const date = new Date(site.added_date);
        const formattedDate = date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        html += `
            <div class="site-item" data-site-id="${site.id}">
                <div class="site-info">
                    <h3>${site.title}</h3>
                    <p><strong>URL:</strong> ${site.url}</p>
                    <p>${site.description.substring(0, 100)}${site.description.length > 100 ? '...' : ''}</p>
                    <p><small>Добавлен: ${formattedDate} | Категория: ${site.category || 'Не указана'}</small></p>
                </div>
                <div class="site-actions">
                    <button class="action-btn edit-btn" onclick="editSite(${site.id})">
                        <i class="fas fa-edit"></i> Изменить
                    </button>
                    <button class="action-btn delete-btn" onclick="deleteSite(${site.id})">
                        <i class="fas fa-trash"></i> Удалить
                    </button>
                </div>
            </div>
        `;
    });
    
    sitesList.innerHTML = html;
}

// Функция фильтрации сайтов
function filterSites(query) {
    const sitesList = document.getElementById('sitesList');
    const siteItems = sitesList.querySelectorAll('.site-item');
    
    if (!query.trim()) {
        // Показываем все сайты, если запрос пустой
        siteItems.forEach(item => {
            item.style.display = 'flex';
        });
        return;
    }
    
    const searchTerm = query.toLowerCase();
    
    siteItems.forEach(item => {
        const siteInfo = item.querySelector('.site-info').textContent.toLowerCase();
        
        if (siteInfo.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Функция редактирования сайта
function editSite(siteId) {
    // В реальном приложении здесь была бы логика редактирования сайта
    showMessage('Функция редактирования находится в разработке', 'error');
}

// Функция удаления сайта
function deleteSite(siteId) {
    if (!confirm('Вы уверены, что хотите удалить этот сайт?')) {
        return;
    }
    
    try {
        // Получаем текущие сайты из localStorage
        let sites = JSON.parse(localStorage.getItem('seen_sites') || '[]');
        
        // Фильтруем сайты, удаляя выбранный
        sites = sites.filter(site => site.id !== siteId);
        
        // Сохраняем обновленный список
        localStorage.setItem('seen_sites', JSON.stringify(sites));
        
        // Показываем сообщение об успехе
        showMessage('Сайт успешно удален', 'success');
        
        // Обновляем список сайтов
        loadSites();
        
        // Обновляем статистику
        loadStats();
        
    } catch (error) {
        console.error('Ошибка при удалении сайта:', error);
        showMessage('Ошибка при удалении сайта', 'error');
    }
}

// Функция очистки формы
function clearForm() {
    document.getElementById('addSiteForm').reset();
}

// Функция показа сообщений
function showMessage(message, type = 'info') {
    const messageElement = document.getElementById('message');
    
    messageElement.textContent = message;
    messageElement.className = `message ${type}`;
    messageElement.style.display = 'block';
    
    // Скрываем сообщение через 5 секунд
    setTimeout(() => {
        messageElement.style.display = 'none';
    }, 5000);
}

// Функция проверки URL
function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

// Функция создания резервной копии (демо)
function backupDatabase() {
    showMessage('Резервная копия базы данных создана успешно (демо-функция)', 'success');
}
