import { createDefaultState } from '../constants.js';

const API_ENDPOINT = '/api/dashboard-state';
const LOCAL_STORAGE_KEY = 'uiuxa_react_dashboard_state';

function mergeState(baseState, nextState) {
  return {
    ...baseState,
    ...nextState,
    boardData: nextState?.boardData || baseState.boardData,
    progressData: nextState?.progressData || baseState.progressData,
    studentComments: nextState?.studentComments || baseState.studentComments
  };
}

function readLocalState() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeLocalState(state) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
}

export async function loadDashboardState() {
  const fallback = mergeState(createDefaultState(), readLocalState());

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) return fallback;

    const data = await response.json();
    const state = mergeState(createDefaultState(), data?.state || {});
    writeLocalState(state);
    return state;
  } catch {
    return fallback;
  }
}

export async function saveDashboardState(state, writePassword = '') {
  writeLocalState(state);

  const headers = {
    'Content-Type': 'application/json'
  };

  if (writePassword) {
    headers['X-Dashboard-Write-Password'] = writePassword;
  }

  const response = await fetch(API_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify({ state })
  });

  if (!response.ok) {
    throw new Error(`서버 저장 실패: ${response.status}`);
  }

  return response.json();
}
