import { Telegraf } from 'telegraf';
import { Redis } from 'ioredis';
import { handleMessage, handleClearCommand, handleStatsCommand, handleStartCommand } from './handlers/message';

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);
export const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');

bot.start(handleStartCommand);
bot.command('clear', handleClearCommand);
bot.command('stats', handleStatsCommand);
bot.on('message', handleMessage);

bot.catch((err, ctx) => {
  console.error('[Bot Error]', ctx.updateType, err);
});

const shutdown = async () => {
  await bot.stop('SIGTERM');
  await redis.quit();
  process.exit(0);
};

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

if (process.env.WEBHOOK_URL) {
  const path = `/webhook/${process.env.TELEGRAM_BOT_TOKEN}`;
  bot.launch({ webhook: { domain: process.env.WEBHOOK_URL, path, port: Number(process.env.PORT ?? 3000) } });
  console.log(`Bot running via webhook on port ${process.env.PORT ?? 3000}`);
} else {
  bot.launch();
  console.log('Bot running via long-polling');
}
