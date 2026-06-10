import { Context } from 'telegraf';
import { chat, clearHistory, getUsageStats } from '../services/claude';

export async function handleMessage(ctx: Context) {
  if (!ctx.message || !('text' in ctx.message)) return;

  const userId = String(ctx.from?.id);
  const text = ctx.message.text;

  if (text.startsWith('/')) return;

  const typingInterval = setInterval(() => ctx.sendChatAction('typing'), 4500);
  await ctx.sendChatAction('typing');

  try {
    let accumulated = '';
    const placeholder = await ctx.reply('...', { parse_mode: 'Markdown' });

    await chat(userId, text, (chunk: string) => {
      accumulated += chunk;
    });

    clearInterval(typingInterval);

    await ctx.telegram.editMessageText(
      ctx.chat!.id,
      placeholder.message_id,
      undefined,
      accumulated || '\u200B',
      { parse_mode: 'Markdown' }
    );
  } catch (err) {
    clearInterval(typingInterval);
    if (err instanceof Error && err.message.includes('message is not modified')) return;
    console.error('[handleMessage]', err);
    await ctx.reply('\u26A0\uFE0F An error occurred. Please try again.');
  }
}

export async function handleClearCommand(ctx: Context) {
  const userId = String(ctx.from?.id);
  await clearHistory(userId);
  await ctx.reply('\u2705 Conversation history cleared.');
}

export async function handleStatsCommand(ctx: Context) {
  const userId = String(ctx.from?.id);
  const stats = await getUsageStats(userId);
  const kb = (stats.historySize / 1024).toFixed(1);
  await ctx.replyWithMarkdown(
    `*Your stats*\n\u2022 Messages in history: ${stats.messageCount}\n\u2022 Memory used: ${kb} KB`
  );
}

export async function handleStartCommand(ctx: Context) {
  const name = ctx.from?.first_name ?? 'there';
  await ctx.replyWithMarkdown(
    `*Hello, ${name}!* \u{1F916}\n\nI'm an AI assistant powered by Claude.\n\n*Commands:*\n/clear — reset conversation\n/stats — view your usage\n\nJust type a message to begin!`
  );
}
