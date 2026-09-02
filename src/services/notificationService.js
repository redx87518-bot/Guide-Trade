import { createDocumentSafe, getDocument, updateDocument, listDocumentsUserScoped } from '../appwrite/database.js';
import { logger } from '../utils/logger.js';
import { ProviderError } from '../utils/errors.js';
import { getTelegramConfig, getDiscordConfig } from './userSettingsService.js';

const COLLECTION = 'notifications';

export async function sendNotification({ userId, type, title, message }) {
  try {
    const doc = await createDocumentSafe(userId, COLLECTION, {
      userId,
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString(),
    });
    logger.info('Notification created', { userId, type, notifId: doc.$id });

    if (type === 'research_completed') {
      const [telegramResult, discordResult] = await Promise.allSettled([
        sendTelegramNotification({ userId, message }),
        sendDiscordNotification({ userId, message }),
      ]);
      return doc;
    }

    return doc;
  } catch (err) {
    logger.error('Failed to create notification', { userId, error: err.message });
    throw err;
  }
}

export async function sendTelegramNotification({ userId, message }) {
  const config = await getTelegramConfig({ userId });
  if (!config.enabled || !config.botToken || !config.chatId) {
    logger.debug('Telegram not configured, skipping', { userId });
    return { sent: false, reason: 'not_configured' };
  }

  try {
    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: message,
        parse_mode: 'Markdown',
      }),
    });

    if (!res.ok) {
      throw new Error(`Telegram API error: ${res.status}`);
    }
    logger.info('Telegram notification sent', { userId });
    return { sent: true };
  } catch (err) {
    logger.error('Telegram notification failed', { userId, error: err.message });
    return { sent: false, error: err.message };
  }
}

export async function sendDiscordNotification({ userId, message }) {
  const config = await getDiscordConfig({ userId });
  if (!config.enabled || !config.webhookUrl) {
    logger.debug('Discord not configured, skipping', { userId });
    return { sent: false, reason: 'not_configured' };
  }

  try {
    const res = await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: message,
        username: 'Guide Trade',
      }),
    });

    if (!res.ok) {
      throw new Error(`Discord webhook error: ${res.status}`);
    }
    logger.info('Discord notification sent', { userId });
    return { sent: true };
  } catch (err) {
    logger.error('Discord notification failed', { userId, error: err.message });
    return { sent: false, error: err.message };
  }
}

export async function markNotificationRead({ userId, notificationId }) {
  const doc = await getDocument(userId, COLLECTION, notificationId);
  return await updateDocument(userId, COLLECTION, notificationId, { read: true });
}

export async function getUnreadNotifications({ userId, limit = 50 }) {
  const queries = [`equal("userId", "${userId}")`, 'equal("read", false)', `orderDesc("createdAt")`, `limit=${limit}`];
  return await listDocumentsUserScoped(userId, COLLECTION, queries);
}


export default {
  sendNotification,
  sendTelegramNotification,
  sendDiscordNotification,
  markNotificationRead,
  getUnreadNotifications,
};
