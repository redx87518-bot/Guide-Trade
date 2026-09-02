import { Client, Account, Databases, Functions, Storage } from 'appwrite';

const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '6a980c230037eb465e11';
const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID || 'guide_trade';

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

export const appwriteClient = client;
export const account = new Account(client);
export const databases = new Databases(client);
export const functions = new Functions(client);
export const storage = new Storage(client);
export { databaseId, projectId, endpoint };

export const COLLECTIONS = {
  PROFILES: 'profiles',
  WATCHLISTS: 'watchlists',
  RESEARCH_SESSIONS: 'research_sessions',
  RESEARCH_RESULTS: 'research_results',
  SAVED_REPORTS: 'saved_reports',
  USER_SETTINGS: 'user_settings',
  NOTIFICATIONS: 'notifications',
};

export function isAuthed() {
  return new Promise((resolve) => {
    account.get()
      .then(() => resolve(true))
      .catch(() => resolve(false));
  });
}

export async function getCurrentUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

export async function signIn(email, password) {
  return await account.createEmailPasswordSession({ email, password, duration: 86400 });
}

export async function signUp(email, password, name) {
  await account.create('unique()', email, password, name);
  return await signIn(email, password);
}

export async function signOut() {
  const sessions = await account.listSessions();
  for (const session of sessions.sessions) {
    await account.deleteSession(session.$id);
  }
}

export async function createOrGetProfile(userId, userData) {
  try {
    return await databases.getDocument(databaseId, COLLECTIONS.PROFILES, userId);
  } catch {
    return await databases.createDocument(
      databaseId,
      COLLECTIONS.PROFILES,
      userId,
      {
        userId,
        name: userData?.name || '',
        email: userData?.email || '',
        avatarUrl: userData?.avatarUrl || '',
      },
      ['read("user")', 'write("user")']
    );
  }
}

export async function callFunction(route, body = {}) {
  const res = await fetch(`${endpoint}/functions/${process.env.VITE_APPWRITE_FUNCTION_ID || 'guide-trade-api'}/executions`, {
    method: 'POST',
    headers: {
      'X-Appwrite-Project': projectId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      route,
      ...body,
    }),
  });
  return await res.json();
}
