// auth-system.js - Система авторизации через Telegram бота
class AuthSystem {
    constructor() {
        this.storageKey = 'seen_auth_data';
        this.codeLength = 6;
        this.codeExpiry = 300000; // 5 минут (300000 мс)
        this.loginAttempts = {};
        this.maxAttempts = 3;
        this.lockTime = 300000; // 5 минут блокировки
        
        // Настройки Telegram бота (нужно заменить на ваши)
        this.botToken = '8558546996:AAHXfcR_ozof_k1ZRYp5p-ls-AILzjiY8DQ'; // Получите у @BotFather
        this.chatId = '6209084198'; // ID вашего чата с ботом
        
        this.init();
    }

    init() {
        // Проверяем сохраненную сессию
        this.checkSession();
        
        // Запускаем очистку устаревших кодов каждую минуту
        setInterval(() => this.cleanupExpiredCodes(), 60000);
    }

    // Генерация случайного кода
    generateCode() {
        const chars = '0123456789';
        let code = '';
        for (let i = 0; i < this.codeLength; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
    }

    // Отправка кода через Telegram бота
    async sendCodeViaTelegram(code) {
        try {
            if (!this.botToken || this.botToken === 'YOUR_BOT_TOKEN') {
                console.warn('Telegram бот не настроен. Используем демо-режим.');
                return this.demoSendCode(code);
            }

            const message = `🔐 Код для входа в SEEN Search Admin:\n\n` +
                          `📱 **${code}**\n\n` +
                          `⏰ Действует 5 минут\n` +
                          `⚠️ Никому не сообщайте этот код!`;
            
            const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: this.chatId,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });

            const data = await response.json();
            
            if (data.ok) {
                console.log('Код отправлен в Telegram');
                return true;
            } else {
                console.error('Ошибка отправки кода:', data);
                return this.demoSendCode(code);
            }
            
        } catch (error) {
            console.error('Ошибка отправки кода:', error);
            return this.demoSendCode(code);
        }
    }

    // Демо-режим отправки кода (если бот не настроен)
    demoSendCode(code) {
        // Сохраняем код для демо-режима
        sessionStorage.setItem('demo_auth_code', code);
        sessionStorage.setItem('demo_auth_time', Date.now().toString());
        
        alert(`📱 Демо-режим: код для входа: ${code}\n\n` +
              `В реальной системе этот код придет в Telegram бот.\n` +
              `Для настройки бота:\n` +
              `1. Создайте бота через @BotFather\n` +
              `2. Получите токен\n` +
              `3. Узнайте ваш chat_id через @userinfobot\n` +
              `4. Замените настройки в auth-system.js`);
        
        return true;
    }

    // Запрос кода для входа
    async requestLoginCode() {
        try {
            const code = this.generateCode();
            const expiryTime = Date.now() + this.codeExpiry;
            
            // Сохраняем код
            const authData = {
                code: code,
                expiry: expiryTime,
                used: false,
                ip: this.getUserIP()
            };
            
            sessionStorage.setItem('auth_code', JSON.stringify(authData));
            
            // Отправляем код
            const sent = await this.sendCodeViaTelegram(code);
            
            if (sent) {
                return {
                    success: true,
                    message: 'Код отправлен в Telegram',
                    code: code // Только для демо, в продакшене не отправляем
                };
            } else {
                return {
                    success: false,
                    message: 'Ошибка отправки кода'
                };
            }
            
        } catch (error) {
            console.error('Ошибка запроса кода:', error);
            return {
                success: false,
                message: 'Ошибка сервера'
            };
        }
    }

    // Проверка введенного кода
    verifyCode(inputCode) {
        const ip = this.getUserIP();
        
        // Проверяем блокировку
        if (this.loginAttempts[ip] && 
            this.loginAttempts[ip].attempts >= this.maxAttempts &&
            Date.now() - this.loginAttempts[ip].lastAttempt < this.lockTime) {
            
            const timeLeft = Math.ceil((this.lockTime - (Date.now() - this.loginAttempts[ip].lastAttempt)) / 1000 / 60);
            return {
                success: false,
                message: `Аккаунт заблокирован. Попробуйте через ${timeLeft} минут`
            };
        }

        try {
            // Пробуем получить код из sessionStorage
            const savedData = sessionStorage.getItem('auth_code');
            const demoData = sessionStorage.getItem('demo_auth_code');
            const demoTime = sessionStorage.getItem('demo_auth_time');

            let validCode = null;
            let expiryTime = null;

            if (savedData) {
                const authData = JSON.parse(savedData);
                validCode = authData.code;
                expiryTime = authData.expiry;
            } else if (demoData && demoTime) {
                validCode = demoData;
                expiryTime = parseInt(demoTime) + this.codeExpiry;
            }

            if (!validCode) {
                this.recordFailedAttempt(ip);
                return {
                    success: false,
                    message: 'Код не найден. Запросите новый код'
                };
            }

            // Проверяем срок действия
            if (Date.now() > expiryTime) {
                sessionStorage.removeItem('auth_code');
                sessionStorage.removeItem('demo_auth_code');
                sessionStorage.removeItem('demo_auth_time');
                
                this.recordFailedAttempt(ip);
                return {
                    success: false,
                    message: 'Код устарел. Запросите новый код'
                };
            }

            // Проверяем совпадение кода
            if (inputCode === validCode) {
                // Создаем сессию
                this.createSession();
                
                // Очищаем попытки
                delete this.loginAttempts[ip];
                
                // Удаляем использованный код
                sessionStorage.removeItem('auth_code');
                sessionStorage.removeItem('demo_auth_code');
                sessionStorage.removeItem('demo_auth_time');
                
                return {
                    success: true,
                    message: 'Успешный вход!'
                };
            } else {
                this.recordFailedAttempt(ip);
                return {
                    success: false,
                    message: 'Неверный код'
                };
            }
            
        } catch (error) {
            console.error('Ошибка проверки кода:', error);
            this.recordFailedAttempt(ip);
            return {
                success: false,
                message: 'Ошибка сервера'
            };
        }
    }

    // Запись неудачной попытки
    recordFailedAttempt(ip) {
        if (!this.loginAttempts[ip]) {
            this.loginAttempts[ip] = {
                attempts: 0,
                lastAttempt: Date.now()
            };
        }
        
        this.loginAttempts[ip].attempts++;
        this.loginAttempts[ip].lastAttempt = Date.now();
        
        const attemptsLeft = this.maxAttempts - this.loginAttempts[ip].attempts;
        
        if (attemptsLeft > 0) {
            console.log(`Неудачная попытка входа. Осталось попыток: ${attemptsLeft}`);
        } else {
            console.log(`Аккаунт заблокирован на 5 минут для IP: ${ip}`);
        }
    }

    // Создание сессии
    createSession() {
        const sessionData = {
            loggedIn: true,
            loginTime: Date.now(),
            expiry: Date.now() + (8 * 60 * 60 * 1000), // 8 часов
            token: this.generateSessionToken()
        };
        
        sessionStorage.setItem('admin_session', JSON.stringify(sessionData));
        
        // Также сохраняем в localStorage для более долгого хранения
        localStorage.setItem('admin_session', JSON.stringify(sessionData));
    }

    // Генерация токена сессии
    generateSessionToken() {
        return 'token_' + Math.random().toString(36).substr(2) + Date.now().toString(36);
    }

    // Проверка сессии
    checkSession() {
        // Сначала проверяем sessionStorage
        let sessionData = sessionStorage.getItem('admin_session');
        
        // Если нет в sessionStorage, проверяем localStorage
        if (!sessionData) {
            sessionData = localStorage.getItem('admin_session');
            if (sessionData) {
                sessionStorage.setItem('admin_session', sessionData);
            }
        }
        
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                
                // Проверяем срок действия
                if (Date.now() > session.expiry) {
                    this.logout();
                    return false;
                }
                
                return session.loggedIn === true;
                
            } catch (error) {
                console.error('Ошибка чтения сессии:', error);
                this.logout();
                return false;
            }
        }
        
        return false;
    }

    // Выход
    logout() {
        sessionStorage.removeItem('admin_session');
        localStorage.removeItem('admin_session');
        sessionStorage.removeItem('auth_code');
        sessionStorage.removeItem('demo_auth_code');
        sessionStorage.removeItem('demo_auth_time');
    }

    // Получение IP пользователя (упрощенный вариант)
    getUserIP() {
        // В реальном приложении IP должен получаться с сервера
        // Здесь используем user agent + некоторые характеристики
        return navigator.userAgent + '|' + navigator.language + '|' + screen.width;
    }

    // Очистка устаревших кодов
    cleanupExpiredCodes() {
        try {
            const savedData = sessionStorage.getItem('auth_code');
            if (savedData) {
                const authData = JSON.parse(savedData);
                if (Date.now() > authData.expiry) {
                    sessionStorage.removeItem('auth_code');
                }
            }
            
            const demoTime = sessionStorage.getItem('demo_auth_time');
            if (demoTime && Date.now() > (parseInt(demoTime) + this.codeExpiry)) {
                sessionStorage.removeItem('demo_auth_code');
                sessionStorage.removeItem('demo_auth_time');
            }
            
        } catch (error) {
            console.error('Ошибка очистки кодов:', error);
        }
    }

    // Получение статуса авторизации
    isAuthenticated() {
        return this.checkSession();
    }

    // Получение информации о сессии
    getSessionInfo() {
        try {
            const sessionData = sessionStorage.getItem('admin_session') || 
                               localStorage.getItem('admin_session');
            
            if (sessionData) {
                const session = JSON.parse(sessionData);
                const timeLeft = Math.ceil((session.expiry - Date.now()) / 1000 / 60);
                
                return {
                    loggedIn: true,
                    loginTime: new Date(session.loginTime).toLocaleTimeString(),
                    timeLeft: timeLeft + ' минут',
                    token: session.token.substring(0, 10) + '...'
                };
            }
            
            return { loggedIn: false };
            
        } catch (error) {
            return { loggedIn: false };
        }
    }
}

// Создаем глобальный экземпляр
window.authSystem = new AuthSystem();
