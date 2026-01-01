-- Создание базы данных для поисковой системы SEEN
CREATE DATABASE IF NOT EXISTS `seen_search_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE `seen_search_db`;

-- Таблица веб-сайтов
CREATE TABLE IF NOT EXISTS `websites` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `url` VARCHAR(500) NOT NULL,
  `description` TEXT,
  `keywords` VARCHAR(500),
  `category` VARCHAR(100),
  `added_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `last_crawled` DATETIME,
  `is_active` TINYINT(1) DEFAULT 1,
  UNIQUE KEY `url` (`url`(255)),
  FULLTEXT KEY `search_index` (`title`, `description`, `keywords`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица поисковых запросов (для статистики)
CREATE TABLE IF NOT EXISTS `search_queries` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `query` VARCHAR(255) NOT NULL,
  `results_count` INT DEFAULT 0,
  `search_date` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `user_ip` VARCHAR(45)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица категорий
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT,
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Вставка начальных данных
INSERT IGNORE INTO `categories` (`name`, `description`) VALUES
('Технологии', 'Технологии, IT, программирование, софт'),
('Наука', 'Научные исследования, открытия, образование'),
('Образование', 'Образовательные ресурсы, курсы, учебные материалы'),
('Новости', 'Новостные сайты, СМИ, блоги'),
('Развлечения', 'Кино, музыка, игры, развлечения'),
('Бизнес', 'Бизнес, финансы, экономика, предпринимательство'),
('Здоровье', 'Медицина, здоровье, спорт, диеты'),
('Путешествия', 'Туризм, путешествия, достопримечательности');

-- Вставка демонстрационных сайтов
INSERT IGNORE INTO `websites` (`title`, `url`, `description`, `keywords`, `category`, `added_date`) VALUES
('Технологии будущего', 'https://example-tech.ru', 'Современные технологии и инновации в IT-сфере. Новости, обзоры и аналитика технологического рынка.', 'технологии, IT, инновации, программирование', 'Технологии', NOW()),
('Научные исследования и открытия', 'https://science-discoveries.org', 'Последние научные открытия и исследования в различных областях науки. Статьи, публикации и новости науки.', 'наука, исследования, открытия, образование', 'Наука', DATE_SUB(NOW(), INTERVAL 1 DAY)),
('Путешествия по всему миру', 'https://world-travel.blog', 'Блог о путешествиях, достопримечательностях и культурах разных стран. Советы туристам и отчеты о поездках.', 'путешествия, туризм, страны, культура', 'Путешествия', DATE_SUB(NOW(), INTERVAL 2 DAY)),
('Онлайн-образование', 'https://edu-online.com', 'Платформа для онлайн-обучения с курсами по различным направлениям. Интерактивные уроки и сертификация.', 'образование, курсы, обучение, онлайн', 'Образование', DATE_SUB(NOW(), INTERVAL 3 DAY)),
('Новости технологий', 'https://tech-news.net', 'Свежие новости из мира технологий, гаджетов и инноваций. Обзоры новой техники и технологические тренды.', 'технологии, новости, гаджеты, инновации', 'Технологии', DATE_SUB(NOW(), INTERVAL 4 DAY)),
('Бизнес и финансы', 'https://business-finance.ru', 'Аналитика бизнеса и финансовых рынков. Советы предпринимателям и новости экономики.', 'бизнес, финансы, экономика, предпринимательство', 'Бизнес', DATE_SUB(NOW(), INTERVAL 5 DAY));

-- Создание пользователя для базы данных (замените 'password' на безопасный пароль)
CREATE USER IF NOT EXISTS 'seen_search_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON `seen_search_db`.* TO 'seen_search_user'@'localhost';
FLUSH PRIVILEGES;
