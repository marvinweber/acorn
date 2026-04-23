import type { AppState, WebDAVConfig } from './types';

const FILE_PATH = '/acorn-state.json';

function headers(config: WebDAVConfig) {
  const creds = btoa(`${config.username}:${config.password}`);
  return {
    Authorization: `Basic ${creds}`,
    'Content-Type': 'application/json',
  };
}

function url(config: WebDAVConfig) {
  return config.url.replace(/\/$/, '') + FILE_PATH;
}

export async function webdavLoad(config: WebDAVConfig): Promise<AppState | null> {
  const res = await fetch(url(config), {
    method: 'GET',
    headers: headers(config),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`WebDAV GET failed: ${res.status}`);
  return res.json();
}

export async function webdavSave(config: WebDAVConfig, state: AppState): Promise<void> {
  const res = await fetch(url(config), {
    method: 'PUT',
    headers: headers(config),
    body: JSON.stringify(state),
  });
  if (!res.ok) throw new Error(`WebDAV PUT failed: ${res.status}`);
}

export async function syncWithWebDAV(
  config: WebDAVConfig,
  localState: AppState
): Promise<AppState> {
  const remote = await webdavLoad(config);
  if (!remote) {
    await webdavSave(config, localState);
    return localState;
  }
  // Last-write-wins
  if (new Date(remote.lastModified) > new Date(localState.lastModified)) {
    return remote;
  }
  await webdavSave(config, localState);
  return localState;
}
