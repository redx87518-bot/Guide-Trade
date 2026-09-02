import { Client, Databases } from 'appwrite';

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || '';
const databaseId = process.env.APPWRITE_DATABASE_ID || 'guide_trade';

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setKey(process.env.APPWRITE_API_KEY || '');

const databases = new Databases(client);

export { client, databases, databaseId };
export { databaseId as DATABASE_ID };

export async function createDocumentSafe(userId, collectionId, data, documentId = undefined) {
  const permissions = [
    `read("user:${userId}")`,
    `write("user:${userId}")`,
    `update("user:${userId}")`,
    `delete("user:${userId}")`,
  ];

  const config = {
    databaseId,
    collectionId,
    data,
    permissions,
    ...(documentId ? { documentId } : {}),
  };

  try {
    if (documentId) {
      return await databases.create(config.databaseId, config.collectionId, config.documentId, config.data, config.permissions);
    }
    return await databases.create(config.databaseId, config.collectionId, config.documentId, config.data, config.permissions);
  } catch (error) {
    if (documentId) {
      return await databases.update(config.databaseId, config.collectionId, config.documentId, config.data, config.permissions);
    }
    throw error;
  }
}

export async function listDocumentsUserScoped(userId, collectionId, queries = []) {
  const perms = queries.includes(`userId="${userId}"`)
    ? queries
    : [...queries, `userId="${userId}"`];
  return await databases.list(databaseId, collectionId, perms);
}

export async function getDocument(userId, collectionId, documentId) {
  return await databases.getDocument(databaseId, collectionId, documentId);
}

export async function updateDocument(userId, collectionId, documentId, data) {
  const permissions = [
    `read("user:${userId}")`,
    `write("user:${userId}")`,
    `update("user:${userId}")`,
    `delete("user:${userId}")`,
  ];
  return await databases.update(databaseId, collectionId, documentId, data, permissions);
}

export async function deleteDocument(userId, collectionId, documentId) {
  return await databases.delete(databaseId, collectionId, documentId);
}
