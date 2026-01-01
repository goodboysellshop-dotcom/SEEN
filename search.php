<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// Настройки подключения к базе данных
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'seen_search_db');

// Функция для подключения к базе данных
function connectDB() {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    if ($conn->connect_error) {
        die(json_encode(['error' => 'Ошибка подключения к базе данных: ' . $conn->connect_error]));
    }
    
    $conn->set_charset("utf8");
    return $conn;
}

// Функция для безопасной обработки строк
function sanitize($input) {
    return htmlspecialchars(strip_tags(trim($input)));
}

// Получаем действие из запроса
$action = isset($_GET['action']) ? $_GET['action'] : 'search';

// Обработка различных действий
switch ($action) {
    case 'search':
        handleSearch();
        break;
    case 'count':
        handleCount();
        break;
    case 'example':
        handleExample();
        break;
    default:
        echo json_encode(['error' => 'Неизвестное действие']);
        break;
}

// Обработка поискового запроса
function handleSearch() {
    $conn = connectDB();
    
    // Получаем параметры поиска
    $query = isset($_GET['q']) ? sanitize($_GET['q']) : '';
    $exactMatch = isset($_GET['exact']) && $_GET['exact'] == '1';
    $searchTitles = isset($_GET['titles']) && $_GET['titles'] == '1';
    
    if (empty($query)) {
        echo json_encode(['results' => [], 'total' => 0]);
        return;
    }
    
    // Начало измерения времени выполнения
    $startTime = microtime(true);
    
    // Подготавливаем запрос в зависимости от параметров
    if ($exactMatch) {
        // Поиск точного совпадения
        $searchQuery = $query;
        $sql = "SELECT * FROM websites WHERE 
                (title LIKE ? OR description LIKE ? OR keywords LIKE ? OR url LIKE ?)";
        
        $likeParam = "%$searchQuery%";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ssss", $likeParam, $likeParam, $likeParam, $likeParam);
    } else {
        // Поиск по отдельным словам
        $words = explode(' ', $query);
        $words = array_filter($words, function($word) {
            return strlen($word) > 2;
        });
        
        if (empty($words)) {
            echo json_encode(['results' => [], 'total' => 0]);
            return;
        }
        
        // Строим сложный запрос для поиска по словам
        $conditions = [];
        $params = [];
        $types = '';
        
        foreach ($words as $word) {
            $likeWord = "%$word%";
            if ($searchTitles) {
                $conditions[] = "(title LIKE ?)";
            } else {
                $conditions[] = "(title LIKE ? OR description LIKE ? OR keywords LIKE ?)";
            }
            $params[] = $likeWord;
            $types .= 's';
            
            if (!$searchTitles) {
                $params[] = $likeWord;
                $params[] = $likeWord;
                $types .= 'ss';
            }
        }
        
        $sql = "SELECT * FROM websites WHERE " . implode(' OR ', $conditions) . " ORDER BY added_date DESC LIMIT 50";
        $stmt = $conn->prepare($sql);
        
        // Динамическое связывание параметров
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $results = [];
    while ($row = $result->fetch_assoc()) {
        $results[] = $row;
    }
    
    $stmt->close();
    $conn->close();
    
    // Время выполнения
    $endTime = microtime(true);
    $searchTime = round($endTime - $startTime, 3);
    
    echo json_encode([
        'results' => $results,
        'total' => count($results),
        'time' => $searchTime
    ]);
}

// Получение количества сайтов в системе
function handleCount() {
    $conn = connectDB();
    
    $sql = "SELECT COUNT(*) as count FROM websites";
    $result = $conn->query($sql);
    
    if ($result) {
        $row = $result->fetch_assoc();
        echo json_encode(['count' => $row['count']]);
    } else {
        echo json_encode(['count' => 0]);
    }
    
    $conn->close();
}

// Получение примеров сайтов для демонстрации
function handleExample() {
    $conn = connectDB();
    
    $sql = "SELECT * FROM websites ORDER BY added_date DESC LIMIT 5";
    $result = $conn->query($sql);
    
    $results = [];
    if ($result && $result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $results[] = $row;
        }
    } else {
        // Если в базе нет данных, возвращаем демонстрационные
        $results = getDemoData();
    }
    
    $conn->close();
    
    echo json_encode(['results' => $results]);
}

// Демонстрационные данные (если база данных пуста)
function getDemoData() {
    return [
        [
            'id' => 1,
            'title' => 'Технологии будущего',
            'url' => 'https://example-tech.ru',
            'description' => 'Современные технологии и инновации в IT-сфере. Новости, обзоры и аналитика технологического рынка.',
            'keywords' => 'технологии, IT, инновации, программирование',
            'added_date' => date('Y-m-d H:i:s')
        ],
        [
            'id' => 2,
            'title' => 'Научные исследования и открытия',
            'url' => 'https://science-discoveries.org',
            'description' => 'Последние научные открытия и исследования в различных областях науки. Статьи, публикации и новости науки.',
            'keywords' => 'наука, исследования, открытия, образование',
            'added_date' => date('Y-m-d H:i:s', strtotime('-1 day'))
        ],
        [
            'id' => 3,
            'title' => 'Путешествия по всему миру',
            'url' => 'https://world-travel.blog',
            'description' => 'Блог о путешествиях, достопримечательностях и культурах разных стран. Советы туристам и отчеты о поездках.',
            'keywords' => 'путешествия, туризм, страны, культура',
            'added_date' => date('Y-m-d H:i:s', strtotime('-2 days'))
        ]
    ];
}
?>
