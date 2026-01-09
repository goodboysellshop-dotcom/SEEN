const DB_KEY = 'seen_db';

function loadDB() {
    return JSON.parse(localStorage.getItem(DB_KEY)) || { sites: [] };
}

function saveDB(db) {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function initSearch() {
    const db = loadDB();
    const approved = db.sites.filter(s => s.status === 'approved');
    
    document.getElementById('totalSites').textContent = approved.length;
    
    // Показать недавние
    const recent = document.getElementById('recentList');
    if (approved.length === 0) {
        recent.innerHTML = '<p>Пока нет сайтов</p>';
    } else {
        recent.innerHTML = approved.slice(-5).reverse().map(s => `
            <div class="site-card">
                <a href="${s.url}" target="_blank">${s.title}</a>
                <div class="result-url">${s.url}</div>
                <div class="result-desc">${s.description}</div>
            </div>
        `).join('');
    }
    
    // Поиск
    document.getElementById('searchBtn').onclick = doSearch;
    document.getElementById('searchInput').onkeypress = (e) => {
        if (e.key === 'Enter') doSearch();
    };
}

function doSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const db = loadDB();
    const approved = db.sites.filter(s => s.status === 'approved');
    
    if (!query) {
        document.getElementById('results').innerHTML = '';
        document.getElementById('recent').style.display = 'block';
        return;
    }
    
    document.getElementById('recent').style.display = 'none';
    
    const found = approved.filter(s => 
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.url.toLowerCase().includes(query) ||
        (s.keywords && s.keywords.toLowerCase().includes(query))
    );
    
    const results = document.getElementById('results');
    if (found.length === 0) {
        results.innerHTML = '<p>Ничего не найдено</p>';
    } else {
        results.innerHTML = found.map(s => `
            <div class="result-card">
                <a href="${s.url}" target="_blank">${s.title}</a>
                <div class="result-url">${s.url}</div>
                <div class="result-desc">${s.description}</div>
            </div>
        `).join('');
    }
}

function initAdd() {
    document.getElementById('addForm').onsubmit = (e) => {
        e.preventDefault();
        
        const site = {
            id: Date.now(),
            url: document.getElementById('url').value,
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            category: document.getElementById('category').value,
            keywords: document.getElementById('keywords').value,
            status: 'pending',
            date: new Date().toISOString()
        };
        
        const db = loadDB();
        db.sites.push(site);
        saveDB(db);
        
        document.getElementById('addForm').classList.add('hidden');
        document.getElementById('success').classList.remove('hidden');
    };
}

function initAdmin() {
    const pass = prompt('Пароль:');
    if (pass !== 'admin123') {
        alert('Неверный пароль');
        location.href = 'index.html';
        return;
    }
    
    renderAdmin('pending');
    
    document.querySelectorAll('.tabs button').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderAdmin(btn.dataset.tab);
        };
    });
}

function renderAdmin(status) {
    const db = loadDB();
    const sites = db.sites.filter(s => s.status === status);
    const list = document.getElementById('siteList');
    
    if (sites.length === 0) {
        list.innerHTML = '<p>Пусто</p>';
        return;
    }
    
    list.innerHTML = sites.map(s => `
        <div class="admin-card">
            <strong>${s.title}</strong><br>
            <a href="${s.url}" target="_blank">${s.url}</a><br>
            <small>${s.description}</small><br><br>
            ${status === 'pending' ? `
                <button class="btn-approve" onclick="updateStatus(${s.id}, 'approved')">Одобрить</button>
                <button class="btn-reject" onclick="updateStatus(${s.id}, 'rejected')">Отклонить</button>
            ` : `
                <button class="btn-delete" onclick="deleteSite(${s.id})">Удалить</button>
            `}
        </div>
    `).join('');
}

function updateStatus(id, status) {
    const db = loadDB();
    const site = db.sites.find(s => s.id === id);
    if (site) {
        site.status = status;
        saveDB(db);
        renderAdmin(document.querySelector('.tabs button.active').dataset.tab);
    }
}

function deleteSite(id) {
    const db = loadDB();
    db.sites = db.sites.filter(s => s.id !== id);
    saveDB(db);
    renderAdmin(document.querySelector('.tabs button.active').dataset.tab);
}
