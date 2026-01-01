// data-manager.js - Единый менеджер данных для всей системы
class DataManager {
    constructor() {
        this.storageKey = 'seen_search_data_v2';
        this.categories = [
            'Технологии', 'Наука', 'Образование', 'Новости', 
            'Развлечения', 'Бизнес', 'Здоровье', 'Путешествия', 'Другое'
        ];
        this.init();
    }

    // Инициализация данных
    init() {
        // Проверяем, есть ли данные в localStorage
        if (!this.getData().sites || this.getData().sites.length === 0) {
            this.loadDemoData();
        }
    }

    // Получение всех данных
    getData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : { sites: [], stats: {} };
        } catch (error) {
            console.error('Ошибка при чтении данных:', error);
            return { sites: [], stats: {} };
        }
    }

    // Сохранение данных
    saveData(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            this.triggerUpdate();
            return true;
        } catch (error) {
            console.error('Ошибка при сохранении данных:', error);
            return false;
        }
    }

    // Получение всех сайтов
    getSites() {
        return this.getData().sites;
    }

    // Получение статистики
    getStats() {
        const data = this.getData();
        if (!data.stats) {
            data.stats = this.calculateStats();
            this.saveData(data);
        }
        return data.stats;
    }

    // Добавление сайта
    addSite(siteData) {
        const data = this.getData();
        
        // Генерируем уникальный ID
        const newId = Date.now();
        
        // Проверяем уникальность URL
        const urlExists = data.sites.some(site => 
            site.url.toLowerCase() === siteData.url.toLowerCase()
        );
        
        if (urlExists) {
            throw new Error('Сайт с таким URL уже существует');
        }

        const newSite = {
            id: newId,
            title: siteData.title,
            url: siteData.url,
            description: siteData.description,
            keywords: siteData.keywords || '',
            category: siteData.category || 'Другое',
            added_date: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            is_active: true
        };

        data.sites.unshift(newSite);
        data.stats = this.calculateStats();
        
        const success = this.saveData(data);
        if (success) {
            return newSite;
        }
        throw new Error('Ошибка при сохранении сайта');
    }

    // Обновление сайта
    updateSite(id, updates) {
        const data = this.getData();
        const siteIndex = data.sites.findIndex(site => site.id === id);
        
        if (siteIndex === -1) {
            throw new Error('Сайт не найден');
        }

        data.sites[siteIndex] = {
            ...data.sites[siteIndex],
            ...updates,
            last_updated: new Date().toISOString()
        };

        data.stats = this.calculateStats();
        return this.saveData(data);
    }

    // Удаление сайта
    deleteSite(id) {
        const data = this.getData();
        const initialLength = data.sites.length;
        
        data.sites = data.sites.filter(site => site.id !== id);
        
        if (data.sites.length === initialLength) {
            throw new Error('Сайт не найден');
        }

        data.stats = this.calculateStats();
        return this.saveData(data);
    }

    // Поиск сайтов
    searchSites(query, options = {}) {
        const { exactMatch = false, searchTitles = false } = options;
        const sites = this.getSites();
        
        if (!query || query.trim() === '') {
            return [];
        }

        const searchTerm = query.toLowerCase().trim();
        const results = [];

        sites.forEach(site => {
            if (!site.is_active) return;

            let score = 0;
            const fieldsToSearch = [];
            
            if (searchTitles) {
                fieldsToSearch.push(site.title);
            } else {
                fieldsToSearch.push(site.title, site.description, site.keywords);
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
                        if (field && field.toLowerCase().includes(word)) {
                            score += 10;
                            if (field === site.title) {
                                score += 5;
                            }
                        }
                    });
                });
            }

            if (score > 0) {
                results.push({
                    ...site,
                    score: score
                });
            }
        });

        // Сортируем по релевантности
        results.sort((a, b) => b.score - a.score);
        
        // Убираем score из результата
        return results.map(({ score, ...rest }) => rest);
    }

    // Расчет статистики
    calculateStats() {
        const sites = this.getSites();
        const activeSites = sites.filter(s => s.is_active);
        const today = new Date().toDateString();
        
        const addedToday = sites.filter(site => {
            const siteDate = new Date(site.added_date).toDateString();
            return siteDate === today;
        }).length;

        return {
            totalSites: sites.length,
            activeSites: activeSites.length,
            addedToday: addedToday,
            byCategory: this.getSitesByCategory(),
            lastUpdated: new Date().toISOString()
        };
    }

    // Группировка сайтов по категориям
    getSitesByCategory() {
        const sites = this.getSites();
        const categories = {};
        
        sites.forEach(site => {
            const category = site.category || 'Другое';
            if (!categories[category]) {
                categories[category] = 0;
            }
            categories[category]++;
        });
        
        return categories;
    }

    // Загрузка демо-данных
    loadDemoData() {
        const demoData = {
            sites: [
                {
                    id: 1,
                    title: 'Технологии будущего',
                    url: 'https://example-tech.ru',
                    description: 'Современные технологии и инновации в IT-сфере. Новости, обзоры и аналитика технологического рынка.',
                    keywords: 'технологии, IT, инновации, программирование',
                    category: 'Технологии',
                    added_date: '2023-10-15T10:30:00Z',
                    last_updated: '2023-10-15T10:30:00Z',
                    is_active: true
                },
                {
                    id: 2,
                    title: 'Научные исследования и открытия',
                    url: 'https://science-discoveries.org',
                    description: 'Последние научные открытия и исследования в различных областях науки. Статьи, публикации и новости науки.',
                    keywords: 'наука, исследования, открытия, образование',
                    category: 'Наука',
                    added_date: '2023-10-14T14:20:00Z',
                    last_updated: '2023-10-14T14:20:00Z',
                    is_active: true
                },
                {
                    id: 3,
                    title: 'Путешествия по всему миру',
                    url: 'https://world-travel.blog',
                    description: 'Блог о путешествиях, достопримечательностях и культурах разных стран. Советы туристам и отчеты о поездках.',
                    keywords: 'путешествия, туризм, страны, культура',
                    category: 'Путешествия',
                    added_date: '2023-10-13T09:15:00Z',
                    last_updated: '2023-10-13T09:15:00Z',
                    is_active: true
                }
            ],
            stats: {}
        };

        demoData.stats = this.calculateStats();
        this.saveData(demoData);
        return demoData;
    }

    // Сброс данных
    resetData() {
        localStorage.removeItem(this.storageKey);
        this.loadDemoData();
        return this.getData();
    }

    // Экспорт данных
    exportData() {
        return JSON.stringify(this.getData(), null, 2);
    }

    // Импорт данных
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            if (!data.sites || !Array.isArray(data.sites)) {
                throw new Error('Некорректный формат данных');
            }
            this.saveData(data);
            return true;
        } catch (error) {
            console.error('Ошибка при импорте данных:', error);
            throw error;
        }
    }

    // Событие обновления данных
    triggerUpdate() {
        const event = new CustomEvent('seenDataUpdated', {
            detail: { timestamp: new Date().toISOString() }
        });
        window.dispatchEvent(event);
    }
}

// Создаем глобальный экземпляр DataManager
window.dataManager = new DataManager();
