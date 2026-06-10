# telegram-ai-bot

> Telegram bot powered by Claude AI with conversation memory, inline queries, and command handling.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Claude](https://img.shields.io/badge/Claude-3.5_Sonnet-orange?style=flat-square)](https://anthropic.com)
[![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](LICENSE)

## Features

- **AI Chat** — Powered by Claude claude-sonnet-4-6 with streaming responses
- **Memory** — Per-user conversation history stored in Redis
- **Commands** — /start, /help, /clear, /settings
- **Inline Mode** — Answer queries from any chat without adding the bot
- **Webhook** — Deploy on any HTTPS server or serverless platform

## Stack

```
Runtime     Node.js 20 + TypeScript
AI          Anthropic Claude API (@anthropic-ai/sdk)
Bot         Telegraf v4
Memory      Redis (ioredis)
Deploy      Webhook via Express + Vercel / Railway
```

## Quick Start

```bash
git clone https://github.com/wpalish/telegram-ai-bot
cd telegram-ai-bot
npm install
cp .env.example .env
npm run dev
```

## Environment Variables

```env
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
ANTHROPIC_API_KEY=your_anthropic_api_key
REDIS_URL=redis://localhost:6379
WEBHOOK_URL=https://your-domain.com/webhook
PORT=3000
```

## Bot Commands

| Command | Description |
|---------|-------------|
| /start | Welcome message |
| /help | List available commands |
| /clear | Clear conversation history |
| /settings | Toggle response mode (streaming/complete) |

## Architecture

```
src/
├── bot.ts          # Telegraf bot setup + webhook
├── handlers/
│   ├── message.ts  # Text message handler with Claude
│   ├── commands.ts # /start, /help, /clear, /settings
│   └── inline.ts   # Inline query handler
├── services/
│   ├── claude.ts   # Anthropic API wrapper with streaming
│   └── memory.ts   # Redis conversation history
└── index.ts        # Entry point
```

## License

MIT
