// storage.js - Простое хранилище в памяти
class SimpleStorage {
    constructor() {
        this.sites = this.loadInitialSites();
        this.listeners = [];
    }

    loadInitialSites() {
        // Начальные данные с реальными сайтами
        return [
            {
                id: 1,
                title: 'Google - Поисковая система',
                url: 'https://www.google.com',
                description: 'Крупнейшая в мире поисковая система. Поиск информации в интернете, картинки, видео, карты, переводы и многое другое.',
                keywords: 'поиск, google, поисковая система, интернет, информация',
                category: 'Технологии',
                added_date: new Date().toISOString(),
                is_active: true
            },
            {
                id: 2,
                title: 'YouTube - Видеохостинг',
                url: 'https://www.youtube.com',
                description: 'Самый популярный видеохостинг в мире. Просмотр видео, музыка, обучающие ролики, блоги и развлечения.',
                keywords: 'видео, youtube, ютуб, музыка, развлечения',
                category: 'Развлечения',
                added_date: new Date(Date.now() - 86400000).toISOString(),
                is_active: true
            },
            {
                id: 3,
                title: 'Википедия - Свободная энциклопедия',
                url: 'https://www.wikipedia.org',
                description: 'Многоязычная общедоступная свободно распространяемая энциклопедия, поддерживаемая некоммерческой организацией Фонд Викимедиа.',
                keywords: 'энциклопедия, wikipedia, знания, информация, справочник',
                category: 'Образование',
                added_date: new Date(Date.now() - 172800000).toISOString(),
                is_active: true
            },
            {
                id: 4,
                title: 'GitHub - Платформа для разработчиков',
                url: 'https://www.github.com',
                description: 'Крупнейший веб-сервис для хостинга IT-проектов и их совместной разработки. Система контроля версий Git.',
                keywords: 'github, программирование, git, разработка, код',
                category: 'Технологии',
                added_date: new Date(Date.now() - 259200000).toISOString(),
                is_active: true
            }
        ];
    }

    // Получить все сайты
    getAllSites() {
        return this.sites;
    }

    // Получить сайт по ID
    getSiteById(id) {
        return this.sites.find(site => site.id === id);
    }

    // Добавить сайт
    addSite(siteData) {
        // Генерируем новый ID
        const newId = this.sites.length > 0 
            ? Math.max(...this.sites.map(s => s.id)) + 1 
            : 1;
        
        // Проверяем URL
        if (!siteData.url.startsWith('http://') && !siteData.url.startsWith('https://')) {
            throw new Error('URL должен начинаться с http:// или https://');
        }

        // Проверяем уникальность URL
        if (this.sites.some(site => site.url.toLowerCase() === siteData.url.toLowerCase())) {
            throw new Error('Сайт с таким URL уже существует');
        }

        const newSite = {
            id: newId,
            title: siteData.title.trim(),
            url: siteData.url.trim(),
            description: siteData.description.trim(),
            keywords: siteData.keywords ? siteData.keywords.trim() : '',
            category: siteData.category || 'Другое',
            added_date: new Date().toISOString(),
            is_active: true
        };

        // Добавляем в начало массива
        this.sites.unshift(newSite);
        
        // Уведомляем слушателей
        this.notifyListeners();
        
        return newSite;
    }

    // Обновить сайт
    updateSite(id, updates) {
        const index = this.sites.findIndex(site => site.id === id);
        if (index === -1) {
            throw new Error('Сайт не найден');
        }

        this.sites[index] = {
            ...this.sites[index],
            ...updates,
            id: this.sites[index].id // Сохраняем оригинальный ID
        };

        this.notifyListeners();
        return true;
    }

    // Удалить сайт
    deleteSite(id) {
        const initialLength = this.sites.length;
        this.sites = this.sites.filter(site => site.id !== id);
        
        if (this.sites.length === initialLength) {
            throw new Error('Сайт не найден');
        }

        this.notifyListeners();
        return true;
    }

    // Поиск сайтов
    searchSites(query, options = {}) {
        if (!query || query.trim() === '') {
            return [];
        }

        const searchTerm = query.toLowerCase().trim();
        const exactMatch = options.exactMatch || false;
        const searchTitles = options.searchTitles || false;

        return this.sites.filter(site => {
            if (!site.is_active) return false;

            const fields = searchTitles 
                ? [site.title]
                : [site.title, site.description, site.keywords];

            const text = fields.join(' ').toLowerCase();

            if (exactMatch) {
                return text.includes(searchTerm);
            } else {
                const words = searchTerm.split(' ').filter(w => w.length > 1);
                return words.some(word => text.includes(word));
            }
        });
    }

    // Получить статистику
    getStats() {
        const today = new Date().toDateString();
        const addedToday = this.sites.filter(site => {
            const siteDate = new Date(site.added_date).toDateString();
            return siteDate === today;
        }).length;

        const categories = {};
        this.sites.forEach(site => {
            const cat = site.category || 'Другое';
            categories[cat] = (categories[cat] || 0) + 1;
        });

        return {
            totalSites: this.sites.length,
            activeSites: this.sites.filter(s => s.is_active).length,
            addedToday: addedToday,
            byCategory: categories
        };
    }

    // Сбросить данные
    resetData() {
        this.sites = this.loadInitialSites();
        this.notifyListeners();
        return this.sites;
    }

    // Подписка на обновления
    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            const index = this.listeners.indexOf(callback);
            if (index > -1) this.listeners.splice(index, 1);
        };
    }

    // Уведомление слушателей
    notifyListeners() {
        this.listeners.forEach(callback => callback(this.sites));
    }
}

// Создаем глобальный экземпляр хранилища
window.storage = new SimpleStorage();
