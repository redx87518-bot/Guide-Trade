import { Client, Account } from 'appwrite';

const endpoint = process.env.APPWRITE_ENDPOINT || 'https://nyc.cloud.appwrite.io/v1';
const projectId = process.env.APPWRITE_PROJECT_ID || '';

const client = new Client()
  .setEndpoint(endpoint)
  .setProject(projectId);

export function createAccountClient(userJwt) {
  const c = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setJWT(userJwt);
  return { client: c, account: new Account(c) };
}

export async function getUserFromSession(jwt) {
  if (!jwt) throw new Error('JWT token required');
  const { account } = createAccountClient(jwt);
  return await account.get();
}

export async function createSession(email, password) {
  const { account } = createAccountClient('');
  const c = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);
  const a = new Account(c);
  return await a.createEmailPasswordSession({ email, password, duration: 86400 });
}

export async function deleteSession(jwt) {
  const { account } = createAccountClient(jwt);
  const sessions = await account.listSessions();
  for (const session of sessions.sessions) {
    await account.deleteSession(session.$id);
  }
}

export async function createJWT(jwt) {
  const { account } = createAccountClient(jwt);
  const result = await account.createJWT();
  return result;
}
