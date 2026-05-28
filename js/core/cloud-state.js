(function() {
    const SUPABASE_CDN_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    const REMOTE_ROW_ID = 'shared_state';

    let supabaseClient = null;
    let supabaseScriptPromise = null;

    function getSupabaseConfig() {
        const config = window.UIUXA_SUPABASE_CONFIG || {};
        return {
            enabled: Boolean(config.enabled),
            url: config.url || '',
            publishableKey: config.publishableKey || '',
            table: config.table || 'uiuxa_dashboard_state',
            rowId: config.rowId || REMOTE_ROW_ID
        };
    }

    function getNetlifyConfig() {
        const config = window.UIUXA_NETLIFY_CONFIG || {};
        return {
            enabled: config.enabled !== false,
            endpoint: config.endpoint || '/api/dashboard-state'
        };
    }

    async function loadFromNetlify() {
        const config = getNetlifyConfig();
        if (!config.enabled || !config.endpoint) return null;

        const response = await fetch(config.endpoint, {
            method: 'GET',
            headers: { Accept: 'application/json' },
            cache: 'no-store'
        });

        if (!response.ok) throw new Error(`Netlify API 로드 실패: ${response.status}`);
        const data = await response.json();
        return data?.state || null;
    }

    async function saveToNetlify(state, writePassword) {
        const config = getNetlifyConfig();
        if (!config.enabled || !config.endpoint) return false;

        const headers = {
            'Content-Type': 'application/json'
        };
        if (writePassword) {
            headers['X-Dashboard-Write-Password'] = writePassword;
        }
        const response = await fetch(config.endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({ state })
        });

        if (!response.ok) throw new Error(`Netlify API 저장 실패: ${response.status}`);
        return true;
    }

    function loadSupabaseScript() {
        if (window.supabase?.createClient) return Promise.resolve();
        if (!supabaseScriptPromise) {
            supabaseScriptPromise = new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = SUPABASE_CDN_URL;
                script.onload = resolve;
                script.onerror = () => reject(new Error('Supabase SDK 로드 실패'));
                document.head.appendChild(script);
            });
        }
        return supabaseScriptPromise;
    }

    async function initSupabaseClient() {
        const config = getSupabaseConfig();
        if (!config.enabled || !config.url || !config.publishableKey) return null;
        if (supabaseClient) return supabaseClient;

        await loadSupabaseScript();
        supabaseClient = window.supabase.createClient(config.url, config.publishableKey, {
            auth: { persistSession: false, autoRefreshToken: false }
        });
        return supabaseClient;
    }

    async function loadFromSupabase() {
        const config = getSupabaseConfig();
        const client = await initSupabaseClient();
        if (!client) return null;

        const { data, error } = await client
            .from(config.table)
            .select('payload')
            .eq('id', config.rowId)
            .single();

        if (error) throw error;
        return data?.payload || null;
    }

    async function saveToSupabase(state) {
        const config = getSupabaseConfig();
        const client = await initSupabaseClient();
        if (!client) return false;

        const { error } = await client
            .from(config.table)
            .upsert({
                id: config.rowId,
                payload: state,
                updated_at: new Date().toISOString()
            });

        if (error) throw error;
        return true;
    }

    window.UIUXA_CLOUD_STATE = {
        loadFromNetlify,
        saveToNetlify,
        loadFromSupabase,
        saveToSupabase
    };
})();
