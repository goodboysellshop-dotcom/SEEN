// data-manager.js - Улучшенный менеджер данных
class DataManager {
    constructor() {
        this.storageKey = 'seen_search_engine_data';
        this.categories = [
            'Технологии', 'Наука', 'Образование', 'Новости', 
            'Развлечения', 'Бизнес', 'Здоровье', 'Путешествия', 'Другое'
        ];
        
        // Начальные данные с реальными сайтами
        this.defaultSites = [
            {
                id: 1,
                title: 'Google - Поисковая система',
                url: 'https://www.google.com',
                description: 'Крупнейшая в мире поисковая система. Поиск информации в интернете, картинки, видео, карты, переводы и многое другое.',
                keywords: 'поиск, google, поисковая система, интернет, информация',
                category: 'Технологии',
                added_date: '2023-10-01T10:30:00Z',
                is_active: true
            },
            {
                id: 2,
                title: 'YouTube - Видеохостинг',
                url: 'https://www.youtube.com',
                description: 'Самый популярный видеохостинг в мире. Просмотр видео, музыка, обучающие ролики, блоги и развлечения.',
                keywords: 'видео, youtube, ютуб, музыка, развлечения',
                category: 'Развлечения',
                added_date: '2023-10-02T14:20:00Z',
                is_active: true
            },
            {
                id: 3,
                title: 'Википедия - Свободная энциклопедия',
                url: 'https://www.wikipedia.org',
                description: 'Многоязычная общедоступная свободно распространяемая энциклопедия, поддерживаемая некоммерческой организацией Фонд Викимедиа.',
                keywords: 'энциклопедия, wikipedia, знания, информация, справочник',
                category: 'Образование',
                added_date: '2023-10-03T09:15:00Z',
                is_active: true
            },
            {
                id: 4,
                title: 'GitHub - Платформа для разработчиков',
                url: 'https://www.github.com',
                description: 'Крупнейший веб-сервис для хостинга IT-проектов и их совместной разработки. Система контроля версий Git.',
                keywords: 'github, программирование, git, разработка, код',
                category: 'Технологии',
                added_date: '2023-10-04T11:45:00Z',
                is_active: true
            },
            {
                id: 5,
                title: 'BBC News - Новости',
                url: 'https://www.bbc.com/news',
                description: 'Британская новостная служба. Последние мировые новости, аналитика, репортажи и видео.',
                keywords: 'новости, bbc, мир, политика, события',
                category: 'Новости',
                added_date: '2023-10-05T16:30:00Z',
                is_active: true
            },
            {
                id: 6,
                title: 'Amazon - Интернет-магазин',
                url: 'https://www.amazon.com',
                description: 'Крупнейшая в мире компания розничной торговли. Интернет-магазин электроники, книг, одежды и многого другого.',
                keywords: 'amazon, магазин, покупки, электронная коммерция',
                category: 'Бизнес',
                added_date: '2023-10-06T08:20:00Z',
                is_active: true
            },
            {
                id: 7,
                title: 'National Geographic - Наука и природа',
                url: 'https://www.nationalgeographic.com',
                description: 'Научно-популярный журнал и медиа-компания. Статьи о природе, науке, истории и путешествиях.',
                keywords: 'наука, природа, путешествия, фотография, история',
                category: 'Наука',
                added_date: '2023-10-07T13:10:00Z',
                is_active: true
            },
            {
                id: 8,
                title: 'Stack Overflow - Вопросы и ответы',
                url: 'https://www.stackoverflow.com',
                description: 'Крупнейший онлайн-сообщество программистов. Вопросы и ответы по программированию и разработке.',
                keywords: 'программирование, вопросы, ответы, разработка, помощь',
                category: 'Технологии',
                added_date: '2023-10-08T17:40:00Z',
                is_active: true
            },
            {
                id: 9,
                title: 'CNN - Новости',
                url: 'https://www.cnn.com',
                description: 'Американская телевизионная новостная компания. Новости США и мира, политика, бизнес, технологии.',
                keywords: 'новости, cnn, сша, мир, телевидение',
                category: 'Новости',
                added_date: '2023-10-09T10:15:00Z',
                is_active: true
            },
            {
                id: 10,
                title: 'TripAdvisor - Путешествия',
                url: 'https://www.tripadvisor.com',
                description: 'Крупнейший в мире сайт о путешествиях. Отзывы о отелях, ресторанах, достопримечательностях.',
                keywords: 'путешествия, отзывы, отели, рестораны, туризм',
                category: 'Путешествия',
                added_date: '2023-10-10T14:50:00Z',
                is_active: true
            },
            {
                id: 11,
                title: 'WebMD - Здоровье и медицина',
                url: 'https://www.webmd.com',
                description: 'Американская компания, публикующая новости и информацию, касающуюся здоровья человека.',
                keywords: 'здоровье, медицина, болезни, лечение, врачи',
                category: 'Здоровье',
                added_date: '2023-10-11T09:30:00Z',
                is_active: true
            },
            {
                id: 12,
                title: 'Coursera - Онлайн-образование',
                url: 'https://www.coursera.org',
                description: 'Платформа онлайн-образования. Курсы от ведущих университетов мира, специализации и дипломные программы.',
                keywords: 'образование, курсы, онлайн, обучение, университеты',
                category: 'Образование',
                added_date: '2023-10-12T16:20:00Z',
                is_active: true
            }
        ];
        
        this.init();
    }

    // Инициализация данных
    init() {
        // Проверяем доступность localStorage
        this.isLocalStorageAvailable = this.checkLocalStorage();
        
        if (this.isLocalStorageAvailable) {
            // Пытаемся загрузить данные из localStorage
            const savedData = this.loadFromStorage();
            if (!savedData || !savedData.sites || savedData.sites.length === 0) {
                // Если нет сохраненных данных, загружаем начальные
                this.saveToStorage({
                    sites: this.defaultSites,
                    stats: this.calculateStats(this.defaultSites),
                    settings: this.getDefaultSettings()
                });
            }
        } else {
            // Если localStorage недоступен, используем данные в памяти
            this.currentData = {
                sites: this.defaultSites,
                stats: this.calculateStats(this.defaultSites),
                settings: this.getDefaultSettings()
            };
        }
    }

    // Проверка доступности localStorage
    checkLocalStorage() {
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            console.warn('localStorage недоступен, используем данные в памяти');
            return false;
        }
    }

    // Загрузка из localStorage
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Ошибка загрузки данных из localStorage:', e);
            return null;
        }
    }

    // Сохранение в localStorage
    saveToStorage(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Ошибка сохранения в localStorage:', e);
            return false;
        }
    }

    // Получение текущих данных
    getData() {
        if (this.isLocalStorageAvailable) {
            const data = this.loadFromStorage();
            return data || {
                sites: this.defaultSites,
                stats: this.calculateStats(this.defaultSites),
                settings: this.getDefaultSettings()
            };
        } else {
            return this.currentData || {
                sites: this.defaultSites,
                stats: this.calculateStats(this.defaultSites),
                settings: this.getDefaultSettings()
            };
        }
    }

    // Сохранение данных
    saveData(data) {
        if (this.isLocalStorageAvailable) {
            return this.saveToStorage(data);
        } else {
            this.currentData = data;
            this.triggerUpdate();
            return true;
        }
    }

    // Получение сайтов
    getSites() {
        return this.getData().sites;
    }

    // Получение статистики
    getStats() {
        const data = this.getData();
        if (!data.stats) {
            data.stats = this.calculateStats(data.sites);
            this.saveData(data);
        }
        return data.stats;
    }

    // Получение настроек
    getSettings() {
        const data = this.getData();
        if (!data.settings) {
            data.settings = this.getDefaultSettings();
            this.saveData(data);
        }
        return data.settings;
    }

    // Настройки по умолчанию
    getDefaultSettings() {
        return {
            resultsPerPage: 25,
            enableSuggestions: true,
            highlightResults: true,
            showMetadata: true,
            searchAlgorithm: 'standard'
        };
    }

    // Добавление сайта
    addSite(siteData) {
        const data = this.getData();
        
        // Генерируем уникальный ID
        const newId = Math.max(...data.sites.map(s => s.id), 0) + 1;
        
        // Проверяем уникальность URL
        const urlExists = data.sites.some(site => 
            site.url.toLowerCase() === siteData.url.toLowerCase()
        );
        
        if (urlExists) {
            throw new Error('Сайт с таким URL уже существует');
        }

        const newSite = {
            id: newId,
            title: siteData.title.trim(),
            url: siteData.url.trim(),
            description: siteData.description.trim(),
            keywords: siteData.keywords ? siteData.keywords.trim() : '',
            category: siteData.category?.trim() || 'Другое',
            added_date: new Date().toISOString(),
            last_updated: new Date().toISOString(),
            is_active: true
        };

        data.sites.unshift(newSite);
        data.stats = this.calculateStats(data.sites);
        
        const success = this.saveData(data);
        if (success) {
            this.triggerUpdate();
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

        data.stats = this.calculateStats(data.sites);
        const success = this.saveData(data);
        
        if (success) {
            this.triggerUpdate();
            return true;
        }
        throw new Error('Ошибка при обновлении сайта');
    }

    // Удаление сайта
    deleteSite(id) {
        const data = this.getData();
        const initialLength = data.sites.length;
        
        data.sites = data.sites.filter(site => site.id !== id);
        
        if (data.sites.length === initialLength) {
            throw new Error('Сайт не найден');
        }

        data.stats = this.calculateStats(data.sites);
        const success = this.saveData(data);
        
        if (success) {
            this.triggerUpdate();
            return true;
        }
        throw new Error('Ошибка при удалении сайта');
    }

    // Поиск сайтов (улучшенный алгоритм)
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
            
            // Поиск в разных полях с разным весом
            const fields = [
                { text: site.title, weight: 3 }, // Заголовок самый важный
                { text: site.description, weight: 2 },
                { text: site.keywords, weight: 1.5 },
                { text: site.category, weight: 1 },
                { text: site.url, weight: 0.5 }
            ];

            // Проверяем точное совпадение
            if (exactMatch) {
                const combinedText = fields.map(f => f.text).join(' ').toLowerCase();
                if (combinedText.includes(searchTerm)) {
                    score = 100;
                }
            } else {
                // Ищем по отдельным словам
                const words = searchTerm.split(' ')
                    .filter(word => word.length > 1) // Слова из 1 буквы игнорируем
                    .map(word => word.toLowerCase());

                words.forEach(word => {
                    fields.forEach(field => {
                        if (field.text && field.text.toLowerCase().includes(word)) {
                            // Добавляем баллы с учетом веса поля
                            score += field.weight * 10;
                            
                            // Дополнительные баллы за полное совпадение
                            if (field.text.toLowerCase() === word) {
                                score += 5;
                            }
                        }
                    });
                });
                
                // Дополнительные баллы за количество совпадений
                const totalMatches = words.filter(word => {
                    return fields.some(field => 
                        field.text && field.text.toLowerCase().includes(word)
                    );
                }).length;
                
                score += totalMatches * 2;
            }

            if (score > 0) {
                results.push({
                    ...site,
                    score: Math.min(100, score) // Ограничиваем максимальный балл
                });
            }
        });

        // Сортируем по релевантности
        results.sort((a, b) => b.score - a.score);
        
        // Убираем score из результата
        return results.map(({ score, ...rest }) => rest);
    }

    // Расчет статистики
    calculateStats(sites) {
        const activeSites = sites.filter(s => s.is_active);
        const today = new Date().toDateString();
        
        const addedToday = sites.filter(site => {
            const siteDate = new Date(site.added_date).toDateString();
            return siteDate === today;
        }).length;

        // Группировка по категориям
        const byCategory = {};
        sites.forEach(site => {
            const category = site.category || 'Другое';
            if (!byCategory[category]) {
                byCategory[category] = 0;
            }
            byCategory[category]++;
        });

        // Самые популярные ключевые слова
        const allKeywords = sites
            .flatMap(site => site.keywords ? site.keywords.split(',').map(k => k.trim()) : [])
            .filter(k => k.length > 0);
        
        const keywordCounts = {};
        allKeywords.forEach(keyword => {
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        });

        const topKeywords = Object.entries(keywordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([keyword, count]) => ({ keyword, count }));

        return {
            totalSites: sites.length,
            activeSites: activeSites.length,
            addedToday: addedToday,
            byCategory: byCategory,
            topKeywords: topKeywords,
            lastUpdated: new Date().toISOString()
        };
    }

    // Сброс данных
    resetData() {
        const resetData = {
            sites: this.defaultSites,
            stats: this.calculateStats(this.defaultSites),
            settings: this.getDefaultSettings()
        };
        
        const success = this.saveData(resetData);
        if (success) {
            this.triggerUpdate();
            return resetData;
        }
        throw new Error('Ошибка при сбросе данных');
    }

    // Экспорт данных
    exportData(format = 'json') {
        const data = this.getData();
        
        switch(format) {
            case 'json':
                return JSON.stringify(data, null, 2);
                
            case 'csv':
                // Простой CSV экспорт
                const headers = ['ID', 'Title', 'URL', 'Description', 'Keywords', 'Category', 'Added Date', 'Active'];
                const rows = data.sites.map(site => [
                    site.id,
                    `"${site.title.replace(/"/g, '""')}"`,
                    site.url,
                    `"${site.description.replace(/"/g, '""')}"`,
                    `"${site.keywords.replace(/"/g, '""')}"`,
                    site.category,
                    site.added_date,
                    site.is_active ? 'Yes' : 'No'
                ]);
                
                return [headers, ...rows]
                    .map(row => row.join(','))
                    .join('\n');
                    
            default:
                throw new Error(`Неизвестный формат: ${format}`);
        }
    }

    // Импорт данных
    importData(dataString, format = 'json') {
        try {
            let importedData;
            
            switch(format) {
                case 'json':
                    importedData = JSON.parse(dataString);
                    break;
                    
                case 'csv':
                    // Простой CSV парсинг
                    const lines = dataString.trim().split('\n');
                    const headers = lines[0].split(',');
                    importedData = {
                        sites: lines.slice(1).map(line => {
                            const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/)
                                .map(v => v.trim().replace(/^"|"$/g, ''));
                            
                            return {
                                id: parseInt(values[0]) || Date.now(),
                                title: values[1],
                                url: values[2],
                                description: values[3],
                                keywords: values[4],
                                category: values[5] || 'Другое',
                                added_date: values[6] || new Date().toISOString(),
                                is_active: values[7]?.toLowerCase() === 'yes'
                            };
                        }),
                        stats: null,
                        settings: this.getDefaultSettings()
                    };
                    break;
                    
                default:
                    throw new Error(`Неизвестный формат: ${format}`);
            }

            // Валидация данных
            if (!importedData.sites || !Array.isArray(importedData.sites)) {
                throw new Error('Некорректный формат данных');
            }

            // Добавляем недостающие поля
            importedData.sites = importedData.sites.map(site => ({
                id: site.id || Date.now() + Math.random(),
                title: site.title || 'Без названия',
                url: site.url || '',
                description: site.description || '',
                keywords: site.keywords || '',
                category: site.category || 'Другое',
                added_date: site.added_date || new Date().toISOString(),
                last_updated: new Date().toISOString(),
                is_active: site.is_active !== false
            }));

            importedData.stats = this.calculateStats(importedData.sites);
            importedData.settings = importedData.settings || this.getDefaultSettings();

            const success = this.saveData(importedData);
            if (success) {
                this.triggerUpdate();
                return importedData;
            }
            
            throw new Error('Ошибка при сохранении импортированных данных');
            
        } catch (error) {
            console.error('Ошибка импорта:', error);
            throw error;
        }
    }

    // Событие обновления данных
    triggerUpdate() {
        try {
            const event = new CustomEvent('seenDataUpdated', {
                detail: { 
                    timestamp: new Date().toISOString(),
                    siteCount: this.getSites().length
                }
            });
            window.dispatchEvent(event);
        } catch (e) {
            console.warn('Не удалось отправить событие обновления:', e);
        }
    }

    // Быстрый поиск популярных сайтов
    getPopularSites(limit = 5) {
        const sites = this.getSites();
        return sites
            .filter(site => site.is_active)
            .slice(0, limit);
    }

    // Получить сайты по категории
    getSitesByCategory(category) {
        const sites = this.getSites();
        return sites.filter(site => 
            site.is_active && 
            (site.category === category || category === 'Все')
        );
    }
}

// Создаем глобальный экземпляр DataManager
try {
    window.dataManager = new DataManager();
} catch (error) {
    console.error('Ошибка инициализации DataManager:', error);
    // Fallback: создаем простой объект с данными
    window.dataManager = {
        getSites: () => [],
        searchSites: () => [],
        addSite: () => { throw new Error('DataManager не инициализирован'); }
    };
          }
