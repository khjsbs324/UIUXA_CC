const JSON_HEADERS = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
};

function getEnv(name) {
    return globalThis.Netlify?.env?.get(name) || process.env[name] || '';
}

function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: JSON_HEADERS
    });
}

function getRequiredConfig() {
    const supabaseUrl = getEnv('SUPABASE_URL');
    const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
    const table = getEnv('DASHBOARD_STATE_TABLE') || 'uiuxa_dashboard_state';
    const rowId = getEnv('DASHBOARD_STATE_ID') || 'shared_state';
    const writePassword = getEnv('DASHBOARD_WRITE_PASSWORD') || '0305@!';

    if (!supabaseUrl || !serviceRoleKey) {
        return {
            error: 'Supabase environment variables are not configured.',
            missing: [
                !supabaseUrl ? 'SUPABASE_URL' : '',
                !serviceRoleKey ? 'SUPABASE_SERVICE_ROLE_KEY' : ''
            ].filter(Boolean)
        };
    }

    return {
        supabaseUrl: supabaseUrl.replace(/\/$/, ''),
        serviceRoleKey,
        table,
        rowId,
        writePassword
    };
}

function isConfig(config) {
    return !('error' in config);
}

async function callSupabase(config, path, init = {}) {
    return fetch(`${config.supabaseUrl}/rest/v1/${path}`, {
        ...init,
        headers: {
            apikey: config.serviceRoleKey,
            Authorization: `Bearer ${config.serviceRoleKey}`,
            ...init.headers
        }
    });
}

async function handleGet() {
    const config = getRequiredConfig();
    if (!isConfig(config)) return jsonResponse({ error: config.error, missing: config.missing }, 500);

    const response = await callSupabase(
        config,
        `${config.table}?id=eq.${encodeURIComponent(config.rowId)}&select=payload`
    );

    if (!response.ok) {
        return jsonResponse({ error: 'Supabase read failed.' }, response.status);
    }

    const rows = await response.json();
    return jsonResponse({ state: rows?.[0]?.payload || null });
}

async function handlePost(req) {
    const config = getRequiredConfig();
    if (!isConfig(config)) return jsonResponse({ error: config.error, missing: config.missing }, 500);

    const body = await req.json().catch(() => null);
    const password = req.headers.get('x-dashboard-write-password') || body?.password || '';
    const state = body?.state;

    if (!state || typeof state !== 'object' || Array.isArray(state)) {
        return jsonResponse({ error: 'Invalid dashboard state.' }, 400);
    }

    if (!config.writePassword) {
        return jsonResponse({ error: 'Write password is not configured.' }, 500);
    }

    if (password !== config.writePassword) {
        return jsonResponse({ error: 'Invalid write password.' }, 403);
    }

    const response = await callSupabase(
        config,
        `${config.table}?on_conflict=id`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Prefer: 'resolution=merge-duplicates'
            },
            body: JSON.stringify({
                id: config.rowId,
                payload: state,
                updated_at: new Date().toISOString()
            })
        }
    );

    if (!response.ok) {
        return jsonResponse({ error: 'Supabase write failed.' }, response.status);
    }

    return jsonResponse({ ok: true });
}

export default async (req) => {
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: JSON_HEADERS });
    if (req.method === 'GET') return handleGet();
    if (req.method === 'POST') return handlePost(req);
    return jsonResponse({ error: 'Method not allowed.' }, 405);
};

export const config = {
    path: '/api/dashboard-state',
    method: ['GET', 'POST', 'OPTIONS']
};
