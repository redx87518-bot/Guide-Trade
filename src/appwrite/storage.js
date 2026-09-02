import { Client, Storage } from 'appwrite';

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || '';
const databaseId = process.env.APPWRITE_DATABASE_ID || 'guide_trade';

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId)
  .setBearer(process.env.APPWRITE_API_KEY || '');

const storage = new Storage(client);

export { storage, client, databaseId as DATABASE_ID, databaseId };

export async function uploadFile(userId, fileName, fileBuffer, mimeType, bucketId = 'reports') {
  const file = await storage.createFile(
    bucketId,
    fileName,
    fileBuffer,
    [
      `read("user:${userId}")`,
      `write("user:${userId}")`,
    ],
    undefined,
    undefined,
    mimeType
  );
  return file;
}

export async function getFile(bucketId, fileId) {
  return await storage.getFile(bucketId, fileId);
}

export async function getFileDownload(bucketId, fileId) {
  return await storage.getFileDownload(bucketId, fileId);
}

export async function listFiles(bucketId, queries = []) {
  return await storage.listFiles(bucketId, queries);
}

export async function deleteFile(bucketId, fileId) {
  return await storage.deleteFile(bucketId, fileId);
}
