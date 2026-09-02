import { createDocumentSafe, getDocument, updateDocument, listDocumentsUserScoped } from '../appwrite/database.js';
import { logger } from '../utils/logger.js';

const COLLECTION = 'user_settings';

export async function getUserSettings({ userId }) {
  try {
    const queries = [`equal("userId", "${userId}")`, 'limit=1'];
    const result = await listDocumentsUserScoped(userId, COLLECTION, queries);
    if (result.total > 0) return result.documents[0];
    return null;
  } catch (err) {
    logger.warn('Failed to get user settings', { userId, error: err.message });
    return null;
  }
}

export async function createDefaultSettings({ userId }) {
  return await createDocumentSafe(userId, COLLECTION, {
    userId,
    voiceEnabled: false,
    autoReadResearch: false,
    elevenLabsApiKey: null,
    elevenLabsVoiceId: null,
    telegramEnabled: false,
    telegramBotToken: null,
    telegramChatId: null,
    discordEnabled: false,
    discordWebhookUrl: null,
  });
}

export async function updateSettings({ userId, settings }) {
  let existing = await getUserSettings({ userId });
  if (!existing) {
    existing = await createDefaultSettings({ userId });
  }
  return await updateDocument(userId, COLLECTION, existing.$id, settings);
}

export async function getElevenLabsCredentials({ userId }) {
  const settings = await getUserSettings({ userId });
  if (!settings) return { apiKey: null, voiceId: null };
  return {
    apiKey: settings.elevenLabsApiKey || null,
    voiceId: settings.elevenLabsVoiceId || null,
  };
}

export async function getTelegramConfig({ userId }) {
  const settings = await getUserSettings({ userId });
  if (!settings) return { enabled: false };
  return {
    enabled: settings.telegramEnabled || false,
    botToken: settings.telegramBotToken || null,
    chatId: settings.telegramChatId || null,
  };
}

export async function getDiscordConfig({ userId }) {
  const settings = await getUserSettings({ userId });
  if (!settings) return { enabled: false };
  return {
    enabled: settings.discordEnabled || false,
    webhookUrl: settings.discordWebhookUrl || null,
  };
}


export default {
  getUserSettings,
  createDefaultSettings,
  updateSettings,
  getElevenLabsCredentials,
  getTelegramConfig,
  getDiscordConfig,
};
