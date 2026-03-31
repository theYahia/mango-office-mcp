# @theyahia/mango-office-mcp

MCP-сервер для Mango Office API — звонки, пользователи. **2 инструмента.**

[![npm](https://img.shields.io/npm/v/@theyahia/mango-office-mcp)](https://www.npmjs.com/package/@theyahia/mango-office-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Часть серии [Russian API MCP](https://github.com/theYahia/russian-mcp) (50 серверов) by [@theYahia](https://github.com/theYahia).

## Установка

### Claude Desktop

```json
{
  "mcpServers": {
    "mango-office": {
      "command": "npx",
      "args": ["-y", "@theyahia/mango-office-mcp"],
      "env": { "MANGO_API_KEY": "your-key", "MANGO_API_SALT": "your-salt" }
    }
  }
}
```

### Claude Code

```bash
claude mcp add mango-office -e MANGO_API_KEY=your-key -e MANGO_API_SALT=your-salt -- npx -y @theyahia/mango-office-mcp
```

### VS Code / Cursor

```json
{ "servers": { "mango-office": { "command": "npx", "args": ["-y", "@theyahia/mango-office-mcp"], "env": { "MANGO_API_KEY": "your-key", "MANGO_API_SALT": "your-salt" } } } }
```

> Требуется `MANGO_API_KEY` и `MANGO_API_SALT`. Получите в личном кабинете [Mango Office](https://www.mango-office.ru).

## Инструменты (2)

| Инструмент | Описание |
|------------|----------|
| `get_calls` | История звонков за период |
| `get_users` | Список пользователей |

## Примеры

```
Покажи звонки за последний час
Список пользователей Mango Office
```

## Лицензия

MIT
