// ===== БАЗА ДАННЫХ (localStorage) =====

const DB_KEY = 'seen_database';
const ADMIN_PASSWORD = 'admin123';

// Структура базы данных
function getDefaultDB() {
    return {
        sites: [],
        settings: {
            adminLoggedIn: false
        }
    };
}

// Загрузить базу данных
function loadDB() {
    try {
        const data = localStorage.getItem(DB_KEY);
        if (data) {
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Ошибка загрузки БД:', e);
    }
    return getDefaultDB();
}

// Сохранить базу данных
function saveDB(db) {
    try {
        localStorage.setItem(DB_KEY, JSON.stringify(db));
        return true;
    } catch (e) {
        console.error('Ошибка сохранения БД:', e);
        return false;
    }
}

// Генерация уникального ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ===== ОПЕРАЦИИ С САЙТАМИ =====

// Добавить сайт
function addSite(siteData) {
    const db = loadDB();
    const newSite = {
        id: generateId(),
        url: siteData.url,
        title: siteData.title,
        description: siteData.description,
        category: siteData.category,
        keywords: siteData.keywords || [],
        status: 'pending', // pending, approved, rejected
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    db.sites.push(newSite);
    saveDB(db);
    return newSite;
}

// Получить все сайты
function getAllSites() {
    const db = loadDB();
    return db.sites;
}

// Получить сайты по статусу
function getSitesByStatus(status) {
    const db = loadDB();
    return db.sites.filter(site => site.status === status);
}

// Получить одобренные сайты
function getApprovedSites() {
    return getSitesByStatus('approved');
}

// Поиск сайтов
function searchSites(query) {
    const approvedSites = getApprovedSites();
    const searchTerms = query.toLowerCase().split(' ').filter(t => t.length > 0);
    
    if (searchTerms.length === 0) {
        return approvedSites;
    }

    return approvedSites.filter(site => {
        const searchText = `${site.title} ${site.description} ${site.keywords.join(' ')} ${site.url}`.toLowerCase();
        return searchTerms.every(term => searchText.includes(term));
    }).sort((a, b) => {
        // Сортировка по релевантности
        const aTitle = a.title.toLowerCase();
        const bTitle = b.title.toLowerCase();
        const queryLower = query.toLowerCase();
        
        if (aTitle.includes(queryLower) && !bTitle.includes(queryLower)) return -1;
        if (!aTitle.includes(queryLower) && bTitle.includes(queryLower)) return 1;
        return 0;
    });
}

// Обновить статус сайта
function updateSiteStatus(siteId, newStatus) {
    const db = loadDB();
    const site = db.sites.find(s => s.id === siteId);
    if (site) {
        site.status = newStatus;
        site.updatedAt = new Date().toISOString();
        saveDB(db);
        return true;
    }
    return false;
}

// Удалить сайт
function deleteSite(siteId) {
    const db = loadDB();
    db.sites = db.sites.filter(s => s.id !== siteId);
    saveDB(db);
}

// ===== СТРАНИЦА ПОИСКА =====

function initSearchPage() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');
    const popularSites = document.getElementById('popularSites');
    const totalSitesEl = document.getElementById('totalSites');

    // Обновить счётчик сайтов
    const approvedCount = getApprovedSites().length;
    totalSitesEl.textContent = approvedCount;

    // Показать недавние сайты
    showRecentSites();

    // Обработчик поиска
    function performSearch() {
        const query = searchInput.value.trim();
        
        if (query.length === 0) {
            searchResults.classList.remove('active');
            searchResults.innerHTML = '';
            popularSites.style.display = 'block';
            return;
        }

        const results = searchSites(query);
        displaySearchResults(results, query);
        popularSites.style.display = 'none';
    }

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Живой поиск с задержкой
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 300);
    });
}

function displaySearchResults(results, query) {
    const searchResults = document.getElementById('searchResults');
    searchResults.classList.add('active');

    if (results.length === 0) {
        searchResults.innerHTML = `
            <div class="no-results">
                <h3>Ничего не найдено</h3>
                <p>По запросу "${escapeHtml(query)}" не найдено результатов.</p>
                <p>Попробуйте изменить запрос или <a href="add.html">добавить сайт</a>.</p>
            </div>
        `;
        return;
    }

    const resultsHtml = results.map(site => `
        <div class="result-card">
            <div class="result-url">${escapeHtml(site.url)}</div>
            <a href="${escapeHtml(site.url)}" target="_blank" class="result-title">
                ${highlightText(site.title, query)}
            </a>
            <div class="result-description">
                ${highlightText(site.description, query)}
            </div>
            <div class="result-meta">
                <span class="result-category">${getCategoryName(site.category)}</span>
                <span>Добавлен: ${formatDate(site.createdAt)}</span>
            </div>
        </div>
    `).join('');

    searchResults.innerHTML = `
        <div class="results-header">
            <p>Найдено результатов: ${results.length}</p>
        </div>
        ${resultsHtml}
    `;
}

function showRecentSites() {
    const recentSitesEl = document.getElementById('recentSites');
    const approvedSites = getApprovedSites();
    
    // Сортировка по дате (новые первые)
    const recentSites = approvedSites
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 6);

    if (recentSites.length === 0) {
        recentSitesEl.innerHTML = `
            <div class="empty-state">
                <p>Пока нет добавленных сайтов.</p>
                <p><a href="add.html">Добавьте первый сайт!</a></p>
            </div>
        `;
        return;
    }

    recentSitesEl.innerHTML = recentSites.map(site => `
        <div class="site-card">
            <div class="site-card-title">${escapeHtml(site.title)}</div>
            <div class="site-card-url">${escapeHtml(site.url)}</div>
            <div class="site-card-description">${escapeHtml(truncate(site.description, 100))}</div>
        </div>
    `).join('');
}

// ===== СТРАНИЦА ДОБАВЛЕНИЯ =====

function initAddPage() {
    const form = document.getElementById('addSiteForm');
    const successMessage = document.getElementById('successMessage');
    const descriptionInput = document.getElementById('siteDescription');
    const charCount = document.getElementById('charCount');

    // Счётчик символов
    descriptionInput.addEventListener('input', () => {
        charCount.textContent = descriptionInput.value.length;
    });

    // Обработка формы
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const siteData = {
            url: document.getElementById('siteUrl').value.trim(),
            title: document.getElementById('siteTitle').value.trim(),
            description: document.getElementById('siteDescription').value.trim(),
            category: document.getElementById('siteCategory').value,
            keywords: document.getElementById('siteKeywords').value
                .split(',')
                .map(k => k.trim())
                .filter(k => k.length > 0)
                .slice(0, 10)
        };

        // Валидация URL
        if (!isValidUrl(siteData.url)) {
            alert('Пожалуйста, введите корректный URL (начинающийся с http:// или https://)');
            return;
        }

        // Проверка на дубликат
        const existingSites = getAllSites();
        if (existingSites.some(s => s.url.toLowerCase() === siteData.url.toLowerCase())) {
            alert('Этот сайт уже добавлен в систему!');
            return;
        }

        // Добавление сайта
        addSite(siteData);

        // Показать сообщение об успехе
        form.classList.add('hidden');
        successMessage.classList.remove('hidden');
    });
}

// ===== АДМИН-ПАНЕЛЬ =====

function initAdminPage() {
    const loginForm = document.getElementById('loginForm');
    const adminPanel = document.getElementById('adminPanel');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const passwordInput = document.getElementById('adminPassword');

    // Проверка авторизации
    const db = loadDB();
    if (db.settings.adminLoggedIn) {
        showAdminPanel();
    }

    // Вход
    loginBtn.addEventListener('click', () => {
        if (passwordInput.value === ADMIN_PASSWORD) {
            const db = loadDB();
            db.settings.adminLoggedIn = true;
            saveDB(db);
            showAdminPanel();
        } else {
            alert('Неверный пароль!');
        }
    });

    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });

    // Выход
    logoutBtn.addEventListener('click', () => {
        const db = loadDB();
        db.settings.adminLoggedIn = false;
        saveDB(db);
        loginForm.classList.remove('hidden');
        adminPanel.classList.add('hidden');
    });

    // Табы
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });

    // Экспорт
    document.getElementById('exportBtn').addEventListener('click', exportData);

    // Импорт
    document.getElementById('importFile').addEventListener('change', importData);

    // Очистка
    document.getElementById('clearBtn').addEventListener('click', () => {
        if (confirm('Вы уверены? Все данные будут удалены!')) {
            localStorage.removeItem(DB_KEY);
            location.reload();
        }
    });
}

function showAdminPanel() {
    document.getElementById('loginForm').classList.add('hidden');
    document.getElementById('adminPanel').classList.remove('hidden');
    updateAdminStats();
    renderSitesLists();
}

function switchTab(tabName) {
    // Обновить кнопки
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Обновить контент
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.toggle('active', content.id === `${tabName}Tab`);
    });
}

function renderSitesLists() {
    renderSitesList('pending', 'pendingList');
    renderSitesList('approved', 'approvedList');
    renderSitesList('rejected', 'rejectedList');
    updateBadges();
}

function renderSitesList(status, containerId) {
    const container = document.getElementById(containerId);
    const sites = getSitesByStatus(status);

    if (sites.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>Нет сайтов в этой категории</p>
            </div>
        `;
        return;
    }

    container.innerHTML = sites.map(site => `
        <div class="admin-site-card" data-id="${site.id}">
            <div class="admin-site-info">
                <div class="admin-site-title">${escapeHtml(site.title)}</div>
                <div class="admin-site-url">${escapeHtml(site.url)}</div>
                <div class="admin-site-description">${escapeHtml(site.description)}</div>
                <div class="admin-site-meta">
                    Категория: ${getCategoryName(site.category)} | 
                    Добавлен: ${formatDate(site.createdAt)}
                </div>
            </div>
            <div class="admin-site-actions">
                ${getActionButtons(status, site.id)}
            </div>
        </div>
    `).join('');

    // Добавить обработчики кнопок
    container.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', handleSiteAction);
    });
}

function getActionButtons(status, siteId) {
    switch (status) {
        case 'pending':
            return `
                <button class="action-btn-small approve-btn" data-action="approve" data-id="${siteId}">
                    ✓ Одобрить
                </button>
                <button class="action-btn-small reject-btn" data-action="reject" data-id="${siteId}">
                    ✗ Отклонить
                </button>
            `;
        case 'approved':
            return `
                <button class="action-btn-small reject-btn" data-action="reject" data-id="${siteId}">
                    Отклонить
                </button>
                <button class="action-btn-small delete-btn" data-action="delete" data-id="${siteId}">
                    Удалить
                </button>
            `;
        case 'rejected':
            return `
                <button class="action-btn-small restore-btn" data-action="approve" data-id="${siteId}">
                    Восстановить
                </button>
                <button class="action-btn-small delete-btn" data-action="delete" data-id="${siteId}">
                    Удалить
                </button>
            `;
        default:
            return '';
    }
}

function handleSiteAction(e) {
    const action = e.target.dataset.action;
    const siteId = e.target.dataset.id;

    switch (action) {
        case 'approve':
            updateSiteStatus(siteId, 'approved');
            break;
        case 'reject':
            updateSiteStatus(siteId, 'rejected');
            break;
        case 'delete':
            if (confirm('Удалить этот сайт?')) {
                deleteSite(siteId);
            }
            break;
    }

    renderSitesLists();
    updateAdminStats();
}

function updateBadges() {
    document.getElementById('pendingCount').textContent = getSitesByStatus('pending').length;
    document.getElementById('approvedCount').textContent = getSitesByStatus('approved').length;
    document.getElementById('rejectedCount').textContent = getSitesByStatus('rejected').length;
}

function updateAdminStats() {
    const allSites = getAllSites();
    document.getElementById('statTotal').textContent = allSites.length;
    document.getElementById('statApproved').textContent = getSitesByStatus('approved').length;
    document.getElementById('statPending').textContent = getSitesByStatus('pending').length;
}

function exportData() {
    const db = loadDB();
    const dataStr = JSON.stringify(db, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `seen_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            if (data.sites && Array.isArray(data.sites)) {
                if (confirm(`Импортировать ${data.sites.length} сайтов? Текущие данные будут заменены.`)) {
                    saveDB(data);
                    location.reload();
                }
            } else {
                alert('Неверный формат файла!');
            }
        } catch (err) {
            alert('Ошибка чтения файла: ' + err.message);
        }
    };
    reader.readAsText(file);
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function highlightText(text, query) {
    if (!query) return escapeHtml(text);
    
    const escaped = escapeHtml(text);
    const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
    return escaped.replace(regex, '<mark>$1</mark>');
}

function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function isValidUrl(string) {
    try {
        const url = new URL(string);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch (_) {
        return false;
    }
}

function truncate(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
}

function getCategoryName(category) {
    const categories = {
        'business': 'Бизнес',
        'education': 'Образование',
        'entertainment': 'Развлечения',
        'news': 'Новости',
        'technology': 'Технологии',
        'social': 'Социальные сети',
        'shopping': 'Покупки',
        'other': 'Другое'
    };
    return categories[category] || category;
}

// ===== ИНИЦИАЛИЗАЦИЯ С ДЕМО-ДАННЫМИ =====

function initDemoData() {
    const db = loadDB();
    
    // Если база пустая, добавить демо-сайты
    if (db.sites.length === 0) {
        const demoSites = [
            {
                id: generateId(),
                url: 'https://github.com',
                title: 'GitHub',
                description: 'Платформа для хостинга кода и совместной разработки. Миллионы разработчиков используют GitHub для создания программного обеспечения.',
                category: 'technology',
                keywords: ['git', 'код', 'разработка', 'программирование'],
                status: 'approved',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: generateId(),
                url: 'https://wikipedia.org',
                title: 'Википедия',
                description: 'Свободная энциклопедия, которую может редактировать каждый. Миллионы статей на разных языках.',
                category: 'education',
                keywords: ['энциклопедия', 'знания', 'статьи', 'информация'],
                status: 'approved',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            },
            {
                id: generateId(),
                url: 'https://youtube.com',
                title: 'YouTube',
                description: 'Крупнейший видеохостинг в мире. Смотрите видео, музыку, обучающие материалы и многое другое.',
                category: 'entertainment',
                keywords: ['видео', 'музыка', 'стримы', 'контент'],
                status: 'approved',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            }
        ];

        db.sites = demoSites;
        saveDB(db);
    }
}

// Инициализация демо-данных при первой загрузке
initDemoData();
