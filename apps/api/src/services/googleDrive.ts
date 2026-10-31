import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { createReadStream } from 'node:fs';
import path from 'node:path';
import { env } from '../config/env.js';
import { isDatabaseConnected, prisma } from './prisma.js';
import { store } from './store.js';
import { AppError } from '../middleware/errorHandler.js';

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const CONNECTION_KEY = 'google_drive_connection_v1';
const FOLDER_KEY = 'google_drive_folder_v1';

type DriveConnection = { refreshToken: string };
type DriveFolder = { id: string; name: string };
type DriveFile = { id: string; name: string; mimeType: string; size?: string };

let accessTokenCache: { token: string; expiresAt: number } | undefined;

export class GoogleDriveError extends AppError {
  constructor(message: string, statusCode = 502) {
    super(message, statusCode);
    this.name = 'GoogleDriveError';
  }
}

function hasOAuthConfiguration() {
  return Boolean(env.GOOGLE_DRIVE_CLIENT_ID && env.GOOGLE_DRIVE_CLIENT_SECRET);
}

export function isGoogleDriveConfigured() {
  return hasOAuthConfiguration();
}

export function getDriveCallbackUrl() {
  return new URL('/api/v1/admin/drive/callback', env.FRONTEND_URL).toString();
}

function encryptionKey() {
  return createHash('sha256').update(`${env.SESSION_SECRET}:deutschwelt-google-drive-token`).digest();
}

function encrypt(value: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return [iv.toString('base64url'), cipher.getAuthTag().toString('base64url'), ciphertext.toString('base64url')].join('.');
}

function decrypt(value: string) {
  const [ivText, tagText, ciphertextText] = value.split('.');
  if (!ivText || !tagText || !ciphertextText) throw new GoogleDriveError('Saved Google Drive connection is invalid. Reconnect Drive from Admin settings.', 503);
  try {
    const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(ivText, 'base64url'));
    decipher.setAuthTag(Buffer.from(tagText, 'base64url'));
    return Buffer.concat([decipher.update(Buffer.from(ciphertextText, 'base64url')), decipher.final()]).toString('utf8');
  } catch {
    throw new GoogleDriveError('Google Drive credentials could not be decrypted. Check SESSION_SECRET and reconnect Drive.', 503);
  }
}

async function getSetting(key: string): Promise<string | null> {
  if (isDatabaseConnected) {
    const setting = await prisma.siteSetting.findUnique({ where: { key }, select: { value: true } });
    return setting?.value || null;
  }
  return store.siteSettings.find(setting => setting.key === key)?.value || null;
}

async function setSetting(key: string, value: string, description: string) {
  if (isDatabaseConnected) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value, description },
      create: { key, value, description }
    });
    return;
  }

  const setting = store.siteSettings.find(item => item.key === key);
  if (setting) {
    setting.value = value;
    setting.description = description;
    setting.updatedAt = new Date().toISOString();
  } else {
    store.siteSettings.push({ id: `set-${Date.now()}`, key, value, description, updatedAt: new Date().toISOString() });
  }
}

async function getConnection(): Promise<DriveConnection | null> {
  const encrypted = await getSetting(CONNECTION_KEY);
  if (!encrypted) return null;
  try {
    return JSON.parse(decrypt(encrypted)) as DriveConnection;
  } catch (error) {
    if (error instanceof GoogleDriveError) throw error;
    throw new GoogleDriveError('Saved Google Drive connection is invalid. Reconnect Drive from Admin settings.', 503);
  }
}

function signState(payload: string) {
  return createHmac('sha256', env.SESSION_SECRET).update(payload).digest('base64url');
}

export function createDriveOAuthState(userId: string) {
  const payload = Buffer.from(JSON.stringify({ userId, expiresAt: Date.now() + 10 * 60 * 1000, nonce: randomBytes(16).toString('base64url') })).toString('base64url');
  return `${payload}.${signState(payload)}`;
}

export function driveOAuthStateUserId(state: string) {
  const [payload, signature] = state.split('.');
  if (!payload || !signature) return null;
  const expected = Buffer.from(signState(payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { userId?: string; expiresAt?: number };
    return typeof data.userId === 'string' && typeof data.expiresAt === 'number' && data.expiresAt > Date.now() ? data.userId : null;
  } catch {
    return null;
  }
}

export function verifyDriveOAuthState(state: string, userId: string) {
  return driveOAuthStateUserId(state) === userId;
}

export function buildDriveAuthorizationUrl(state: string) {
  if (!hasOAuthConfiguration()) throw new GoogleDriveError('Google Drive OAuth credentials are not configured on the API.', 503);
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', env.GOOGLE_DRIVE_CLIENT_ID);
  url.searchParams.set('redirect_uri', getDriveCallbackUrl());
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', DRIVE_SCOPE);
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('include_granted_scopes', 'true');
  url.searchParams.set('prompt', 'consent');
  url.searchParams.set('state', state);
  return url.toString();
}

async function tokenRequest(params: Record<string, string>) {
  const body = new URLSearchParams({
    client_id: env.GOOGLE_DRIVE_CLIENT_ID,
    client_secret: env.GOOGLE_DRIVE_CLIENT_SECRET,
    ...params
  });
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  const data = await response.json().catch(() => ({})) as any;
  if (!response.ok) {
    throw new GoogleDriveError(data.error_description || 'Google could not complete the Drive authorization.', response.status === 400 ? 400 : 502);
  }
  return data;
}

export async function completeDriveOAuth(code: string) {
  const tokenData = await tokenRequest({
    code,
    grant_type: 'authorization_code',
    redirect_uri: getDriveCallbackUrl()
  });

  const previous = await getConnection();
  const refreshToken = tokenData.refresh_token || previous?.refreshToken;
  if (!refreshToken) throw new GoogleDriveError('Google did not return a refresh token. Reconnect Drive and approve offline access.', 400);

  await setSetting(CONNECTION_KEY, encrypt(JSON.stringify({ refreshToken })), 'Encrypted Google Drive OAuth refresh token');
  accessTokenCache = tokenData.access_token && tokenData.expires_in
    ? { token: tokenData.access_token, expiresAt: Date.now() + Number(tokenData.expires_in) * 1000 }
    : undefined;
}

export async function getDriveAccessToken() {
  if (!hasOAuthConfiguration()) throw new GoogleDriveError('Google Drive OAuth credentials are not configured on the API.', 503);
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now() + 60_000) return accessTokenCache.token;

  const connection = await getConnection();
  if (!connection?.refreshToken) throw new GoogleDriveError('Connect the academy Google account from Admin settings first.', 503);

  const data = await tokenRequest({ refresh_token: connection.refreshToken, grant_type: 'refresh_token' });
  if (!data.access_token) throw new GoogleDriveError('Google did not return an access token.', 502);
  accessTokenCache = { token: data.access_token, expiresAt: Date.now() + Number(data.expires_in || 3600) * 1000 };
  return accessTokenCache.token;
}

export async function getDriveStatus() {
  const [connection, savedFolder] = await Promise.all([getConnection(), getSetting(FOLDER_KEY)]);
  let folder: DriveFolder | null = null;
  if (savedFolder) {
    try { folder = JSON.parse(savedFolder) as DriveFolder; } catch { folder = null; }
  }
  return {
    databaseReady: isDatabaseConnected,
    configured: hasOAuthConfiguration(),
    connected: Boolean(connection?.refreshToken),
    folder,
    pickerReady: Boolean(env.GOOGLE_DRIVE_PICKER_API_KEY && env.GOOGLE_DRIVE_PROJECT_NUMBER)
  };
}

async function driveRequest(url: string, init: RequestInit = {}) {
  const token = await getDriveAccessToken();
  const response = await fetch(url, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init.headers || {}) }
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as any;
    const message = body?.error?.message || `Google Drive request failed (${response.status}).`;
    const status = response.status === 404 ? 404 : response.status === 403 ? 403 : response.status >= 400 && response.status < 500 ? 400 : 502;
    throw new GoogleDriveError(message, status);
  }
  return response;
}

export async function getDrivePickerConfig() {
  if (!env.GOOGLE_DRIVE_PICKER_API_KEY || !env.GOOGLE_DRIVE_PROJECT_NUMBER) {
    throw new GoogleDriveError('Google Picker API key and Google Cloud project number are required to select the storage folder.', 503);
  }
  return {
    accessToken: await getDriveAccessToken(),
    apiKey: env.GOOGLE_DRIVE_PICKER_API_KEY,
    projectNumber: env.GOOGLE_DRIVE_PROJECT_NUMBER
  };
}

export async function selectDriveFolder(id: string) {
  const file = await driveRequest(`${DRIVE_API}/files/${encodeURIComponent(id)}?supportsAllDrives=true&fields=id,name,mimeType`);
  const details = await file.json() as DriveFile;
  if (details.mimeType !== 'application/vnd.google-apps.folder') {
    throw new GoogleDriveError('Choose a Google Drive folder for file storage.', 400);
  }
  const folder = { id: details.id, name: details.name };
  await setSetting(FOLDER_KEY, JSON.stringify(folder), 'Google Drive folder used for DeutschWelt uploads');
  return folder;
}

export async function getSelectedDriveFolder(): Promise<DriveFolder | null> {
  const value = await getSetting(FOLDER_KEY);
  if (!value) return null;
  try { return JSON.parse(value) as DriveFolder; } catch { return null; }
}

export async function uploadDriveFile(localPath: string, originalName: string, mimeType: string) {
  const folder = await getSelectedDriveFolder();
  if (!folder) throw new GoogleDriveError('Select the Google Drive storage folder from Admin settings first.', 503);

  const safeName = path.basename(originalName.replace(/\\/g, '/')).replace(/[\u0000-\u001f]/g, '_');
  const stat = await import('node:fs/promises').then(fs => fs.stat(localPath));
  const token = await getDriveAccessToken();
  const start = await fetch(`${DRIVE_API}/files?uploadType=resumable&supportsAllDrives=true&fields=id,name,mimeType,size`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Type': mimeType || 'application/octet-stream',
      'X-Upload-Content-Length': String(stat.size)
    },
    body: JSON.stringify({ name: safeName, mimeType: mimeType || 'application/octet-stream', parents: [folder.id] })
  });
  if (!start.ok) {
    const body = await start.json().catch(() => ({})) as any;
    const status = start.status === 403 ? 403 : start.status >= 400 && start.status < 500 ? 400 : 502;
    throw new GoogleDriveError(body?.error?.message || `Could not start the Drive upload (${start.status}).`, status);
  }
  const sessionUrl = start.headers.get('location');
  if (!sessionUrl) throw new GoogleDriveError('Google Drive did not return an upload session.', 502);

  const stream = createReadStream(localPath);
  let uploaded: Response;
  try {
    uploaded = await fetch(sessionUrl, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': mimeType || 'application/octet-stream',
        'Content-Length': String(stat.size)
      },
      body: stream as any,
      duplex: 'half'
    } as RequestInit);
  } catch (error) {
    stream.destroy();
    throw new GoogleDriveError(error instanceof Error ? error.message : 'Drive upload was interrupted.', 502);
  }

  const result = await uploaded.json().catch(() => ({})) as any;
  if (!uploaded.ok || !result.id) {
    const status = uploaded.status === 403 ? 403 : uploaded.status >= 400 && uploaded.status < 500 ? 400 : 502;
    throw new GoogleDriveError(result?.error?.message || `Google Drive upload failed (${uploaded.status}).`, status);
  }
  return {
    driveFileId: result.id as string,
    fileName: result.name as string || safeName,
    mimeType: result.mimeType as string || mimeType,
    sizeBytes: Number(result.size || stat.size)
  };
}

export function driveFileUrl(fileId: string) {
  return `/api/v1/files/${encodeURIComponent(fileId)}`;
}

export async function streamDriveFile(fileId: string, range?: string) {
  const url = new URL(`${DRIVE_API}/files/${encodeURIComponent(fileId)}`);
  url.searchParams.set('alt', 'media');
  url.searchParams.set('supportsAllDrives', 'true');
  const headers: Record<string, string> = {};
  if (range) headers.Range = range;
  const token = await getDriveAccessToken();
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}`, ...headers } });
  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as any;
    const status = response.status === 404 ? 404 : response.status === 403 ? 403 : response.status >= 400 && response.status < 500 ? 400 : 502;
    throw new GoogleDriveError(body?.error?.message || `Could not download the Drive file (${response.status}).`, status);
  }
  return response;
}

export async function trashDriveFile(fileId: string) {
  const token = await getDriveAccessToken();
  const response = await fetch(`${DRIVE_API}/files/${encodeURIComponent(fileId)}?supportsAllDrives=true&fields=id,trashed`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ trashed: true })
  });
  if (!response.ok && response.status !== 404) {
    const body = await response.json().catch(() => ({})) as any;
    const status = response.status === 403 ? 403 : response.status >= 400 && response.status < 500 ? 400 : 502;
    throw new GoogleDriveError(body?.error?.message || `Could not move the Drive file to trash (${response.status}).`, status);
  }
}
