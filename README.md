# AI Commerce Platform

## 📋 Описание

Мультиарендная AI-платформа для автоматизации продаж через мессенджеры Telegram и WhatsApp. Система позволяет арендаторам развернуть интеллектуальных ассистентов для обработки запросов клиентов, подбора товаров, формирования документов и приема заказов.

## 🚀 Основные возможности

### Для арендаторов (B2B/B2C компании)
- **Мультиканальность**: Telegram и WhatsApp боты
- **AI-ассистент**: Понимание запросов, подбор товаров, сравнение
- **Голос и фото**: Обработка голосовых сообщений и изображений
- **Документооборот**: Автоматическое создание КП, счетов
- **Аналитика спроса**: Отслеживание популярных запросов и "дыр" в ассортименте
- **Эскалация**: Автоматическая передача сложных случаев операторам

### Технические особенности
- **Мультитенантность**: Полная изоляция данных между арендаторами
- **JSON-протокол**: Структурированный внутренний протокол для всех операций
- **RAG**: Ответы только на основе фактов из базы знаний
- **Масштабируемость**: PostgreSQL + Neon для облачного деплоя

## 📦 Установка и настройка

### Требования
- Node.js 20+
- PostgreSQL (или Neon Database)
- OpenAI API ключ
- Telegram Bot Token (опционально)
- WhatsApp Business API доступ (опционально)

### Переменные окружения

Создайте файл `.env`:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/dbname

# OpenAI
OPENAI_API_KEY=sk-...

# Server
BASE_URL=https://your-domain.com
PORT=5000

# Optional: для production
NODE_ENV=production
```

### Установка зависимостей

```bash
npm install
```

### Инициализация базы данных

```bash
npm run db:push
```

### Запуск в режиме разработки

```bash
npm run dev
```

### Сборка для production

```bash
npm run build
npm start
```

## 🤖 Настройка ботов

### Telegram Bot

1. Создайте бота через [@BotFather](https://t.me/botfather)
2. Получите токен бота
3. Добавьте токен в настройки арендатора:

```json
{
  "settings": {
    "telegramBotToken": "YOUR_BOT_TOKEN",
    "operatorGroupId": "-1001234567890"
  }
}
```

### WhatsApp Business

1. Зарегистрируйтесь в [Meta for Developers](https://developers.facebook.com)
2. Создайте WhatsApp Business приложение
3. Получите Access Token и Phone Number ID
4. Добавьте в настройки арендатора:

```json
{
  "settings": {
    "whatsappAccessToken": "YOUR_ACCESS_TOKEN",
    "whatsappPhoneNumberId": "YOUR_PHONE_NUMBER_ID",
    "whatsappVerifyToken": "custom_verify_token",
    "operatorWhatsApp": "+7XXXXXXXXXX"
  }
}
```

## 📊 API Endpoints

### Арендаторы (Tenants)
- `GET /api/tenants` - Список арендаторов
- `POST /api/tenants` - Создать арендатора
- `GET /api/tenants/:id` - Получить арендатора
- `PUT /api/tenants/:id` - Обновить арендатора

### Товары (Products)
- `GET /api/products?tenantId=X` - Список товаров
- `POST /api/products` - Создать товар
- `PUT /api/products/:id` - Обновить товар
- `DELETE /api/products/:id` - Удалить товар
- `POST /api/products/compare` - Сравнить товары
- `POST /api/products/search` - Умный поиск

### AI Chat
- `POST /api/ai/chat` - Обработать сообщение
- `POST /api/ai/voice` - Обработать голос
- `POST /api/ai/image` - Анализ изображения

### Аналитика
- `GET /api/analytics/stats` - Статистика
- `GET /api/analytics/demand-tracking` - Анализ спроса
- `GET /api/analytics/demand-insights` - AI-инсайты

### Webhooks
- `POST /api/webhooks/telegram/:tenantId` - Telegram webhook
- `GET/POST /api/webhooks/whatsapp/:tenantId` - WhatsApp webhook

## 🏗 Архитектура

```
┌─────────────┐     ┌─────────────┐
│  Telegram   │     │  WhatsApp   │
└──────┬──────┘     └──────┬──────┘
       │                   │
       └───────┬───────────┘
               │
        ┌──────▼──────┐
        │  Webhooks   │
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │  AI Service │◄────► OpenAI GPT-4
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │   Storage   │
        └──────┬──────┘
               │
        ┌──────▼──────┐
        │ PostgreSQL  │
        └─────────────┘
```

## 🎯 Примеры использования

### Создание арендатора

```bash
curl -X POST http://localhost:5000/api/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ТОО Ромашка",
    "slug": "romashka",
    "industry": "retail",
    "settings": {
      "telegramBotToken": "YOUR_TOKEN"
    }
  }'
```

### Добавление товара

```bash
curl -X POST http://localhost:5000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "TENANT_UUID",
    "sku": "DR-001",
    "name": "Дрель ударная BOSCH",
    "price": "27990",
    "category": "Электроинструменты"
  }'
```

### Тестирование AI чата

```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "TENANT_UUID",
    "message": "Покажи дрели до 30000 тг",
    "channel": "telegram"
  }'
```

## 📈 Мониторинг и логирование

Система автоматически логирует:
- Все API запросы с временем выполнения
- Ошибки обработки сообщений
- Метрики AI (уверенность, интенты)
- Эскалации к операторам

## 🔒 Безопасность

- **Изоляция данных**: Row-Level Security для арендаторов
- **Валидация**: Zod схемы для всех входных данных
- **Секреты**: Храните ключи в переменных окружения
- **HTTPS**: Используйте SSL для production

## 🚀 Деплой на Replit

1. Форкните проект
2. Настройте Secrets:
   - DATABASE_URL
   - OPENAI_API_KEY
3. Запустите команду `npm run db:push`
4. Нажмите Run

## 🤝 Поддержка

При возникновении вопросов:
1. Проверьте логи в консоли
2. Убедитесь в правильности настроек ботов
3. Проверьте доступность внешних сервисов

## 📝 Лицензия

MIT

## 🔄 Обновления

### v1.0.0 (2024)
- ✅ Базовая мультиарендность
- ✅ Интеграция Telegram/WhatsApp
- ✅ AI обработка запросов
- ✅ Внутренний JSON-протокол
- ✅ Голосовые сообщения и фото
- ✅ Аналитика спроса
- ✅ Эскалация к операторам

### Roadmap
- 🔄 Google Drive интеграция для документов
- 🔄 Платежные системы (Kaspi, PayBox)
- 🔄 Маркетинговые инструменты
- 🔄 A/B тестирование промптов
- 🔄 Проактивные уведомления
