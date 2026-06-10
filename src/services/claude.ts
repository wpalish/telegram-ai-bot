import Anthropic from '@anthropic-ai/sdk';
import { Redis } from 'ioredis';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
const redis = new Redis(process.env.REDIS_URL!);

const HISTORY_TTL = 60 * 60 * 24; // 24 hours
const MAX_HISTORY = 20;

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

async function getHistory(userId: number): Promise<Message[]> {
  const raw = await redis.get(`history:${userId}`);
  return raw ? JSON.parse(raw) : [];
}

async function saveHistory(userId: number, messages: Message[]): Promise<void> {
  const trimmed = messages.slice(-MAX_HISTORY);
  await redis.setex(`history:${userId}`, HISTORY_TTL, JSON.stringify(trimmed));
}

export async function clearHistory(userId: number): Promise<void> {
  await redis.del(`history:${userId}`);
}

export async function chat(
  userId: number,
  userMessage: string,
  onChunk?: (text: string) => void
): Promise<string> {
  const history = await getHistory(userId);
  const messages: Message[] = [...history, { role: 'user', content: userMessage }];

  let fullResponse = '';

  if (onChunk) {
    const stream = await anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system:
        'You are a helpful AI assistant in Telegram. Be concise and friendly. ' +
        'Format responses with Telegram markdown when helpful.',
      messages,
    });

    for await (const chunk of stream) {
      if (
        chunk.type === 'content_block_delta' &&
        chunk.delta.type === 'text_delta'
      ) {
        fullResponse += chunk.delta.text;
        onChunk(chunk.delta.text);
      }
    }
  } else {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: 'You are a helpful AI assistant in Telegram. Be concise and friendly.',
      messages,
    });
    fullResponse =
      response.content[0].type === 'text' ? response.content[0].text : '';
  }

  await saveHistory(userId, [
    ...messages,
    { role: 'assistant', content: fullResponse },
  ]);

  return fullResponse;
}

export async function getUsageStats(userId: number): Promise<{
  messageCount: number;
  historySize: number;
}> {
  const history = await getHistory(userId);
  return {
    messageCount: Math.floor(history.length / 2),
    historySize: history.length,
  };
}
