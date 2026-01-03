// telegram-bot.js - Серверная часть для бота (нужен Node.js)
const TelegramBot = require('node-telegram-bot-api');

// Токен бота
const token = '8558546996:AAHXfcR_ozof_k1ZRYp5p-ls-AILzjiY8DQ';
const bot = new TelegramBot(token, { polling: true });

// Хранилище кодов (в реальном приложении используйте базу данных)
const authCodes = new Map();

// Команда /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userName = msg.from.first_name;
    
    bot.sendMessage(chatId, 
        `👋 Привет, ${userName}!\n\n` +
        `Я бот для авторизации в SEEN Search Admin.\n\n` +
        `Для получения кода доступа перейдите на страницу входа:\n` +
        `https://ваш-сайт.com/auth-login.html\n\n` +
        `Используйте команду /help для помощи`
    );
});

// Команда /help
bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId,
        `📚 Помощь по SEEN Search Admin Bot:\n\n` +
        `/start - Начать работу с ботом\n` +
        `/help - Показать это сообщение\n` +
        `/status - Проверить статус сервера\n\n` +
        `Для входа в панель управления:\n` +
        `1. Перейдите на страницу входа\n` +
        `2. Нажмите "Получить код"\n` +
        `3. Введите код из этого чата\n\n` +
        `⏰ Код действителен 5 минут\n` +
        `🔒 Никому не сообщайте коды!`
    );
});

// Команда /status
bot.onText(/\/status/, (msg) => {
    const chatId = msg.chat.id;
    
    bot.sendMessage(chatId,
        `📊 Статус системы:\n\n` +
        `✅ Бот активен\n` +
        `👥 Пользователей: ${authCodes.size}\n` +
        `🕐 Время сервера: ${new Date().toLocaleString('ru-RU')}\n` +
        `🚀 Версия: 1.0.0`
    );
});

// Генерация кода
function generateAuthCode(chatId) {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 300000; // 5 минут
    
    authCodes.set(chatId, {
        code: code,
        expiry: expiry,
        used: false
    });
    
    // Очистка устаревших кодов
    setTimeout(() => {
        if (authCodes.has(chatId)) {
            const data = authCodes.get(chatId);
            if (Date.now() > data.expiry && !data.used) {
                authCodes.delete(chatId);
            }
        }
    }, 300000);
    
    return code;
}

// API для фронтенда
const express = require('express');
const app = express();
app.use(express.json());

// Получить код (вызывается с фронтенда)
app.post('/api/get-code', (req, res) => {
    const { chatId } = req.body;
    
    if (!chatId) {
        return res.status(400).json({ error: 'Требуется chatId' });
    }
    
    const code = generateAuthCode(chatId);
    
    // Отправляем код в Telegram
    bot.sendMessage(chatId,
        `🔐 Код для входа в SEEN Search Admin:\n\n` +
        `📱 **${code}**\n\n` +
        `⏰ Действует 5 минут\n` +
        `⚠️ Никому не сообщайте этот код!\n\n` +
        `Введите этот код на странице входа для доступа к панели управления.`
    );
    
    res.json({ success: true });
});

// Проверить код (вызывается с фронтенда)
app.post('/api/verify-code', (req, res) => {
    const { chatId, code } = req.body;
    
    if (!chatId || !code) {
        return res.status(400).json({ error: 'Требуется chatId и code' });
    }
    
    if (!authCodes.has(chatId)) {
        return res.json({ success: false, message: 'Код не найден' });
    }
    
    const authData = authCodes.get(chatId);
    
    if (Date.now() > authData.expiry) {
        authCodes.delete(chatId);
        return res.json({ success: false, message: 'Код устарел' });
    }
    
    if (authData.code === code && !authData.used) {
        authData.used = true;
        return res.json({ 
            success: true, 
            message: 'Успешная авторизация',
            token: 'generated-jwt-token' // В реальном приложении генерируйте JWT
        });
    }
    
    return res.json({ success: false, message: 'Неверный код' });
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`🤖 Бот активен`);
});
