const firebaseConfig = {
  apiKey: "AIzaSyBEjQfRd-9KcpbvybtTk0Gi0F470rTFGss",
  authDomain: "seen-8e1d0.firebaseapp.com",
  projectId: "seen-8e1d0",
  storageBucket: "seen-8e1d0.firebasestorage.app",
  messagingSenderId: "660108099626",
  appId: "1:660108099626:web:b547367fae9ede63d38353",
  measurementId: "G-99V6GK0G9J"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ... остальной код остаётся как был

// Получить сайты
async function getSites(status = null) {
    let query = db.collection('sites');
    if (status) query = query.where('status', '==', status);
    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Добавить сайт
async function addSite(site) {
    site.status = 'pending';
    site.date = new Date().toISOString();
    await db.collection('sites').add(site);
}

// Обновить статус
async function updateStatus(id, status) {
    await db.collection('sites').doc(id).update({ status });
}

// Удалить сайт
async function deleteSite(id) {
    await db.collection('sites').doc(id).delete();
}

// Поиск
async function initSearch() {
    const sites = await getSites('approved');
    document.getElementById('totalSites').textContent = sites.length;
    
    const recent = document.getElementById('recentList');
    if (sites.length === 0) {
        recent.innerHTML = '<p>Пока нет сайтов</p>';
    } else {
        recent.innerHTML = sites.slice(-5).reverse().map(s => `
            <div class="site-card">
                <a href="${s.url}" target="_blank">${s.title}</a>
                <div class="result-url">${s.url}</div>
                <div class="result-desc">${s.description}</div>
            </div>
        `).join('');
    }
    
    document.getElementById('searchBtn').onclick = doSearch;
    document.getElementById('searchInput').onkeypress = (e) => {
        if (e.key === 'Enter') doSearch();
    };
}

async function doSearch() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    const sites = await getSites('approved');
    
    if (!query) {
        document.getElementById('results').innerHTML = '';
        document.getElementById('recent').style.display = 'block';
        return;
    }
    
    document.getElementById('recent').style.display = 'none';
    
    const found = sites.filter(s => 
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query) ||
        s.url.toLowerCase().includes(query)
    );
    
    const results = document.getElementById('results');
    results.innerHTML = found.length === 0 
        ? '<p>Ничего не найдено</p>'
        : found.map(s => `
            <div class="result-card">
                <a href="${s.url}" target="_blank">${s.title}</a>
                <div class="result-url">${s.url}</div>
                <div class="result-desc">${s.description}</div>
            </div>
        `).join('');
}

// Добавление
function initAdd() {
    document.getElementById('addForm').onsubmit = async (e) => {
        e.preventDefault();
        
        await addSite({
            url: document.getElementById('url').value,
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            category: document.getElementById('category').value,
            keywords: document.getElementById('keywords').value
        });
        
        document.getElementById('addForm').classList.add('hidden');
        document.getElementById('success').classList.remove('hidden');
    };
}

// Админка
async function initAdmin() {
    const pass = prompt('Пароль:');
    if (pass !== 'admin123') {
        location.href = 'index.html';
        return;
    }
    
    await renderAdmin('pending');
    
    document.querySelectorAll('.tabs button').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderAdmin(btn.dataset.tab);
        };
    });
}

async function renderAdmin(status) {
    const sites = await getSites(status);
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
                <button class="btn-approve" onclick="approve('${s.id}')">Одобрить</button>
                <button class="btn-reject" onclick="reject('${s.id}')">Отклонить</button>
            ` : `
                <button class="btn-delete" onclick="remove('${s.id}')">Удалить</button>
            `}
        </div>
    `).join('');
}

async function approve(id) {
    await updateStatus(id, 'approved');
    renderAdmin('pending');
}

async function reject(id) {
    await updateStatus(id, 'rejected');
    renderAdmin('pending');
}

async function remove(id) {
    await deleteSite(id);
    renderAdmin(document.querySelector('.tabs button.active').dataset.tab);
}
