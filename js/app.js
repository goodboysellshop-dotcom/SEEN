const DB_KEY = 'seen_db';

function loadDB() {
    return JSON.parse(localStorage.getItem(DB_KEY)) || { sites: [] };
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// ИНИЦИАЛИЗАЦИЯ ГЛАВНОЙ СТРАНИЦЫ (исправлено!)
function initSearchPage() {
    const db = loadDB();
    const approved = db.sites.filter(s => s.status === 'approved');
    
    // 1. Обновляем счётчик
    document.getElementById('totalSites').textContent = approved.length;
    
    // 2. Показываем недавние сайты (исправлен ID!)
    const recentContainer = document.getElementById('recentSites');
    if (approved.length === 0) {
        recentContainer.innerHTML = '<p class="no-sites">Пока нет добавленных сайтов</p>';
    } else {
        recentContainer.innerHTML = approved.slice(-5).reverse().map(site => `
            <a href="${site.url}" class="site-card" target="_blank">
                <h3 class="site-title">${site.title}</h3>
                <p class="site-description">${site.description}</p>
                <div class="site-url">${site.url.replace('https://', '')}</div>
            </a>
        `).join('');
    }
    
    // 3. Настраиваем поиск
    document.getElementById('searchBtn').onclick = doSearch;
    document.getElementById('searchInput').onkeypress = (e) => {
        if (e.key === 'Enter') doSearch();
    };
}

// ПОИСК (исправлено!)
function doSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const db = loadDB();
    const approved = db.sites.filter(s => s.status === 'approved');
    
    const resultsContainer = document.getElementById('searchResults');
    const popularContainer = document.getElementById('popularSites');
    
    if (!query) {
        // Если запрос пустой, показываем популярные
        resultsContainer.innerHTML = '';
        popularContainer.style.display = 'block';
        return;
    }
    
    // Скрываем популярные и ищем
    popularContainer.style.display = 'none';
    
    const found = approved.filter(site => 
        site.title.toLowerCase().includes(query) ||
        site.description.toLowerCase().includes(query) ||
        site.url.toLowerCase().includes(query) ||
        (site.keywords && site.keywords.toLowerCase().includes(query))
    );
    
    if (found.length === 0) {
        resultsContainer.innerHTML = '<p class="no-results">По запросу "<b>' + query + '</b>" ничего не найдено</p>';
    } else {
        resultsContainer.innerHTML = found.map(site => `
            <a href="${site.url}" class="site-card" target="_blank">
                <h3 class="site-title">${site.title}</h3>
                <p class="site-description">${site.description}</p>
                <div class="site-url">${site.url.replace('https://', '')}</div>
                <span class="site-category">${site.category || 'Без категории'}</span>
            </a>
        `).join('');
    }
}

// ДОБАВЛЕНИЕ САЙТА (исправлено под add.html)
function initAddPage() {
    const form = document.getElementById('addSiteForm');
    const successMessage = document.getElementById('successMessage');
    const textarea = document.getElementById('siteDescription');
    const charCount = document.getElementById('charCount');
    
    // Счётчик символов
    if (textarea && charCount) {
        textarea.addEventListener('input', () => {
            charCount.textContent = textarea.value.length;
        });
    }
    
    // Отправка формы
    if (form) {
        form.onsubmit = (e) => {
            e.preventDefault();
            
            const site = {
                id: Date.now(),
                url: document.getElementById('siteUrl').value,
                title: document.getElementById('siteTitle').value,
                description: document.getElementById('siteDescription').value,
                category: document.getElementById('siteCategory').value,
                keywords: document.getElementById('siteKeywords').value,
                status: 'pending',
                date: new Date().toISOString()
            };
            
            const db = loadDB();
            db.sites.push(site);
            saveDB(db);
            
            form.reset();
            if (charCount) charCount.textContent = '0';
            form.classList.add('hidden');
            successMessage.classList.remove('hidden');
        };
    }
}

// АДМИН-ПАНЕЛЬ (исправлено под admin.html)
function initAdminPage() {
    const loginForm = document.getElementById('loginForm');
    const adminPanel = document.getElementById('adminPanel');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    // Проверка входа
    if (loginBtn) {
        loginBtn.onclick = () => {
            const password = document.getElementById('adminPassword').value;
            if (password === 'admin123') {
                loginForm.classList.add('hidden');
                adminPanel.classList.remove('hidden');
                renderAdmin('pending');
            } else {
                alert('Неверный пароль! Попробуйте снова.');
            }
        };
    }
    
    // Выход
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            adminPanel.classList.add('hidden');
            loginForm.classList.remove('hidden');
            document.getElementById('adminPassword').value = '';
        };
    }
    
    // Переключение табов
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderAdmin(btn.dataset.tab);
        };
    });
    
    // Кнопки экспорта/импорта
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.onclick = () => {
            const db = loadDB();
            const dataStr = JSON.stringify(db, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            const url = URL.createObjectURL(dataBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'seen-backup.json';
            a.click();
            URL.revokeObjectURL(url);
        };
    }
}

// РЕНДЕР АДМИНКИ
function renderAdmin(status) {
    const db = loadDB();
    const sites = db.sites.filter(s => s.status === status);
    
    let listContainer;
    if (status === 'pending') listContainer = document.getElementById('pendingList');
    else if (status === 'approved') listContainer = document.getElementById('approvedList');
    else listContainer = document.getElementById('rejectedList');
    
    // Обновляем счётчики
    const allSites = db.sites;
    document.getElementById('statTotal').textContent = allSites.length;
    document.getElementById('statApproved').textContent = allSites.filter(s => s.status === 'approved').length;
    document.getElementById('statPending').textContent = allSites.filter(s => s.status === 'pending').length;
    
    document.getElementById('pendingCount').textContent = allSites.filter(s => s.status === 'pending').length;
    document.getElementById('approvedCount').textContent = allSites.filter(s => s.status === 'approved').length;
    document.getElementById('rejectedCount').textContent = allSites.filter(s => s.status === 'rejected').length;
    
    // Рендерим список
    if (sites.length === 0) {
        listContainer.innerHTML = '<p class="empty-list">Нет сайтов</p>';
        return;
    }
    
    listContainer.innerHTML = sites.map(site => `
        <div class="admin-site-card">
            <h4>${site.title}</h4>
            <a href="${site.url}" target="_blank">${site.url}</a>
            <p>${site.description}</p>
            <div class="site-meta">
                <span class="meta-category">${site.category}</span>
                <span class="meta-date">${new Date(site.date).toLocaleDateString()}</span>
            </div>
            <div class="admin-actions">
                ${status === 'pending' ? `
                    <button class="btn btn-approve" onclick="updateSiteStatus(${site.id}, 'approved')">✅ Одобрить</button>
                    <button class="btn btn-reject" onclick="updateSiteStatus(${site.id}, 'rejected')">❌ Отклонить</button>
                ` : ''}
                <button class="btn btn-delete" onclick="deleteSite(${site.id})">🗑️ Удалить</button>
            </div>
        </div>
    `).join('');
}

// Глобальные функции для админки
window.updateSiteStatus = function(id, status) {
    const db = loadDB();
    const site = db.sites.find(s => s.id === id);
    if (site) {
        site.status = status;
        saveDB(db);
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        renderAdmin(activeTab);
    }
};

window.deleteSite = function(id) {
    if (confirm('Удалить этот сайт навсегда?')) {
        const db = loadDB();
        db.sites = db.sites.filter(s => s.id !== id);
        saveDB(db);
        const activeTab = document.querySelector('.tab-btn.active').dataset.tab;
        renderAdmin(activeTab);
    }
};
