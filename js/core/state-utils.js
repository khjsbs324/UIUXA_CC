(function() {
    const STATE_ALIASES = {
        noticeData: ['notice'],
        memoData: ['memo'],
        progressData: ['progress'],
        toolData: ['tool'],
        lessonData: ['lesson', 'lessons'],
        roadmapData: ['roadmap'],
        workspaceData: ['workspace'],
        scheduleData: ['schedule'],
        dateData: ['dateLink'],
        boardData: ['board']
    };

    function normalizeState(source = {}) {
        const normalized = {};
        Object.keys(source).forEach((key) => {
            normalized[key] = source[key];
        });

        Object.entries(STATE_ALIASES).forEach(([stateKey, aliases]) => {
            if (normalized[stateKey] !== undefined) return;
            const alias = aliases.find((aliasKey) => source[aliasKey] !== undefined);
            if (alias) normalized[stateKey] = source[alias];
        });

        return normalized;
    }

    function getStoredJson(keys) {
        for (const key of keys) {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            try {
                return JSON.parse(raw);
            } catch (error) {
                console.warn(`저장 데이터 파싱 실패: ${key}`, error);
            }
        }
        return undefined;
    }

    function getLocalStateSnapshot(storageKeys) {
        const state = {};
        Object.entries(storageKeys).forEach(([stateKey, keys]) => {
            const value = getStoredJson(keys);
            if (value !== undefined) state[stateKey] = value;
        });
        return state;
    }

    function saveStateToLocal(state, storageKeys) {
        Object.entries(storageKeys).forEach(([stateKey, keys]) => {
            localStorage.setItem(keys[0], JSON.stringify(state[stateKey]));
        });
    }

    window.UIUXA_STATE_UTILS = {
        normalizeState,
        getLocalStateSnapshot,
        saveStateToLocal
    };
})();
