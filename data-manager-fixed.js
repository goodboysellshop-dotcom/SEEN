// data-manager-fixed.js - Рабочий менеджер данных без localStorage проблем
class FixedDataManager {
    constructor() {
        this.categories = [
            'Технологии', 'Наука', 'Образование', 'Новости', 
            'Развлечения', 'Бизнес', 'Здоровье', 'Путешествия', 'Другое'
        ];
        
        // Инициализируем данные в памяти
        this.data = this.loadInitialData();
    }

    // Загружаем начальные данные
    loadInitialData() {
        // Проверяем, есть ли данные в sessionStorage (работает лучше чем localStorage)
        let savedData = null;
        try {
            savedData = sessionStorage.getItem('seen_search_data');
            if (savedData) {
                const parsed = JSON.parse(savedData);
                if (parsed && parsed.sites && Array.isArray(parsed.sites)) {
                    return parsed;
                }
            }
        } catch (e) {
            console.log('Не удалось загрузить из sessionStorage:', e);
        }
        
        // Если нет сохраненных данных, используем начальные
        const initialSites = [
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
            },
            {
                id: 5,
                title: 'BBC News - Новости',
                url: 'https://www.bbc.com/news',
                description: 'Британская новостная служба. Последние мировые новости, аналитика, репортажи и видео.',
                keywords: 'новости, bbc, мир, политика, события',
                category: 'Новости',
                added_date: new Date(Date.now() - 345600000).toISOString(),
                is_active: true
            },
            {
                id: 6,
                title: 'Amazon - Интернет-магазин',
                url: 'https://www.amazon.com',
                description: 'Крупнейшая в мире компания розничной торговли. Интернет-магазин электроники, книг, одежды и многого другого.',
                keywords: 'amazon, магазин, покупки, электронная коммерция',
                category: 'Бизнес',
                added_date: new Date(Date.now() - 432000000).toISOString(),
                is_active: true
            },
            {
                id: 7,
                title: 'National Geographic - Наука и природа',
                url: 'https://www.nationalgeographic.com',
                description: 'Научно-популярный журнал и медиа-компания. Статьи о природе, науке, истории и путешествиях.',
                keywords: 'наука, природа, путешествия, фотография, история',
                category: 'Наука',
                added_date: new Date(Date.now() - 518400000).toISOString(),
                is_active: true
            },
            {
                id: 8,
                title: 'Stack Overflow - Вопросы и ответы',
                url: 'https://www.stackoverflow.com',
                description: 'Крупнейший онлайн-сообщество программистов. Вопросы и ответы по программированию и разработке.',
                keywords: 'программирование, вопросы, ответы, разработка, помощь',
                category: 'Технологии',
                added_date: new Date(Date.now() - 604800000).toISOString(),
                is_active: true
            }
        ];

        return {
            sites: initialSites,
            stats: this.calculateStats(initialSites),
            settings: {
                resultsPerPage: 25,
                enableSuggestions: true,
                highlightResults: true,
                showMetadata: true
            },
            version: '2.0'
        };
    }

    // Сохраняем данные
    saveData() {
        try {
            sessionStorage.setItem('seen_search_data', JSON.stringify(this.data));
            return true;
        } catch (e) {
            console.warn('Не удалось сохранить в sessionStorage:', e);
            return false;
        }
    }

    // Получаем все сайты
    getSites() {
        return this.data.sites || [];
    }

    // Получаем статистику
    getStats() {
        if (!this.data.stats) {
            this.data.stats = this.calculateStats(this.data.sites);
        }
        return this.data.stats;
    }

    // Добавляем сайт (исправленная версия)
    addSite(siteData) {
        try {
            // Генерируем уникальный ID
            const maxId = this.data.sites.reduce((max, site) => Math.max(max, site.id), 0);
            const newId = maxId + 1;
            
            // Проверяем URL
            if (!this.isValidUrl(siteData.url)) {
                throw new Error('Неверный URL. Должен начинаться с http:// или https://');
            }
            
            // Проверяем уникальность URL
            const urlExists = this.data.sites.some(site => 
                site.url.toLowerCase() === siteData.url.toLowerCase()
            );
            
            if (urlExists) {
                throw new Error('Сайт с таким URL уже существует');
            }

            // Создаем новый сайт
            const newSite = {
                id: newId,
                title: siteData.title.trim(),
                url: siteData.url.trim(),
                description: siteData.description.trim(),
                keywords: (siteData.keywords || '').trim(),
                category: (siteData.category || 'Другое').trim(),
                added_date: new Date().toISOString(),
                is_active: true
            };

            // Добавляем в начало списка
            this.data.sites.unshift(newSite);
            
            // Обновляем статистику
            this.data.stats = this.calculateStats(this.data.sites);
            
            // Пытаемся сохранить
            this.saveData();
            
            // Отправляем событие обновления
            this.triggerUpdate();
            
            return newSite;
            
        } catch (error) {
            console.error('Ошибка добавления сайта:', error);
            throw error;
        }
    }

    // Обновляем сайт
    updateSite(id, updates) {
        const siteIndex = this.data.sites.findIndex(site => site.id === id);
        
        if (siteIndex === -1) {
            throw new Error('Сайт не найден');
        }

        this.data.sites[siteIndex] = {
            ...this.data.sites[siteIndex],
            ...updates
        };

        this.data.stats = this.calculateStats(this.data.sites);
        this.saveData();
        this.triggerUpdate();
        
        return true;
    }

    // Удаляем сайт
    deleteSite(id) {
        const initialLength = this.data.sites.length;
        this.data.sites = this.data.sites.filter(site => site.id !== id);
        
        if (this.data.sites.length === initialLength) {
            throw new Error('Сайт не найден');
        }

        this.data.stats = this.calculateStats(this.data.sites);
        this.saveData();
        this.triggerUpdate();
        
        return true;
    }

    // Поиск сайтов (упрощенный и работающий)
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

            let found = false;
            
            // Определяем, где искать
            const searchFields = searchTitles 
                ? [site.title]
                : [site.title, site.description, site.keywords];

            // Проверяем точное совпадение
            if (exactMatch) {
                const combinedText = searchFields.join(' ').toLowerCase();
                if (combinedText.includes(searchTerm)) {
                    found = true;
                }
            } else {
                // Ищем по словам
                const words = searchTerm.split(' ').filter(word => word.length > 1);
                
                for (const word of words) {
                    for (const field of searchFields) {
                        if (field && field.toLowerCase().includes(word)) {
                            found = true;
                            break;
                        }
                    }
                    if (found) break;
                }
            }

            if (found) {
                results.push(site);
            }
        });

        return results;
    }

    // Расчет статистики
    calculateStats(sites) {
        const today = new Date().toDateString();
        const addedToday = sites.filter(site => {
            const siteDate = new Date(site.added_date).toDateString();
            return siteDate === today;
        }).length;

        // Группировка по категориям
        const byCategory = {};
        sites.forEach(site => {
            const category = site.category || 'Другое';
            byCategory[category] = (byCategory[category] || 0) + 1;
        });

        return {
            totalSites: sites.length,
            activeSites: sites.filter(s => s.is_active).length,
            addedToday: addedToday,
            byCategory: byCategory,
            lastUpdated: new Date().toISOString()
        };
    }

    // Сбрасываем данные
    resetData() {
        const initialData = this.loadInitialData();
        this.data = initialData;
        
        try {
            sessionStorage.removeItem('seen_search_data');
        } catch (e) {
            // Игнорируем ошибку очистки
        }
        
        this.triggerUpdate();
        return this.data;
    }

    // Валидация URL
    isValidUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    // Событие обновления
    triggerUpdate() {
        try {
            const event = new CustomEvent('seenDataUpdated', {
                detail: { 
                    timestamp: new Date().toISOString(),
                    siteCount: this.data.sites.length
                }
            });
            window.dispatchEvent(event);
        } catch (e) {
            // Игнорируем ошибку события
        }
    }

    // Получаем популярные сайты
    getPopularSites(limit = 4) {
        return this.data.sites
            .filter(site => site.is_active)
            .slice(0, limit);
    }

    // Экспорт данных
    exportData(format = 'json') {
        switch(format) {
            case 'json':
                return JSON.stringify(this.data, null, 2);
            case 'csv':
                const headers = ['ID', 'Title', 'URL', 'Description', 'Keywords', 'Category', 'Added Date', 'Active'];
                const rows = this.data.sites.map(site => [
                    site.id,
                    `"${site.title.replace(/"/g, '""')}"`,
                    site.url,
                    `"${site.description.replace(/"/g, '""')}"`,
                    `"${site.keywords.replace(/"/g, '""')}"`,
                    site.category,
                    site.added_date,
                    site.is_active ? 'Yes' : 'No'
                ]);
                return [headers, ...rows].map(row => row.join(',')).join('\n');
            default:
                return '';
        }
    }
}

// Создаем глобальный экземпляр
window.dataManager = new FixedDataManager();
