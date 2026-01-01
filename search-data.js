// Данные для поиска (заменили PHP на JavaScript)
const websitesData = [
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
    },
    {
        id: 4,
        title: 'Онлайн-образование для всех',
        url: 'https://online-education.com',
        description: 'Платформа онлайн-курсов по программированию, дизайну и маркетингу. Обучение с нуля до профессионала.',
        keywords: 'образование, курсы, обучение, программирование',
        category: 'Образование',
        added_date: new Date(Date.now() - 259200000).toISOString()
    },
    {
        id: 5,
        title: 'Новости технологий 2024',
        url: 'https://tech-news.ru',
        description: 'Самые свежие новости из мира технологий, искусственного интеллекта и кибербезопасности.',
        keywords: 'технологии, новости, AI, искусственный интеллект',
        category: 'Технологии',
        added_date: new Date(Date.now() - 345600000).toISOString()
    }
];

// Функция поиска (работает полностью на клиенте)
function searchWebsites(query, exactMatch = false, searchTitles = false) {
    if (!query || query.trim() === '') {
        return [];
    }
    
    const searchTerm = query.toLowerCase().trim();
    const results = [];
    
    websitesData.forEach(website => {
        let score = 0;
        const fieldsToSearch = [];
        
        if (searchTitles) {
            fieldsToSearch.push(website.title);
        } else {
            fieldsToSearch.push(website.title, website.description, website.keywords);
        }
        
        // Проверяем точное совпадение
        if (exactMatch) {
            const combinedText = fieldsToSearch.join(' ').toLowerCase();
            if (combinedText.includes(searchTerm)) {
                score = 100; // Высокий балл за точное совпадение
            }
        } else {
            // Ищем по словам
            const words = searchTerm.split(' ').filter(word => word.length > 2);
            
            words.forEach(word => {
                fieldsToSearch.forEach(field => {
                    if (field.toLowerCase().includes(word)) {
                        score += 10; // Начисляем баллы за каждое совпадение
                        
                        // Дополнительные баллы за совпадение в заголовке
                        if (field === website.title) {
                            score += 5;
                        }
                    }
                });
            });
        }
        
        if (score > 0) {
            results.push({
                ...website,
                score: score
            });
        }
    });
    
    // Сортируем по релевантности
    results.sort((a, b) => b.score - a.score);
    
    return results.map(item => {
        const { score, ...rest } = item;
        return rest;
    });
}

// Экспортируем функции для использования в других файлах
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { websitesData, searchWebsites };
}
