(function() {
    function escapeAttr(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function actionAttrs(action, args = [], options = {}) {
        const stop = options.stop ? ' data-stop-propagation="true"' : '';
        const prevent = options.prevent ? ' data-prevent-default="true"' : '';
        return `data-action="${action}" data-action-args='${escapeAttr(JSON.stringify(args))}'${stop}${prevent}`;
    }

    function changeActionAttrs(action, args = [], options = {}) {
        const mode = options.mode ? ` data-change-mode="${options.mode}"` : '';
        return `data-change-action="${action}" data-action-args='${escapeAttr(JSON.stringify(args))}'${mode}`;
    }

    function getActionArgs(el) {
        try {
            return el.dataset.actionArgs ? JSON.parse(el.dataset.actionArgs) : [];
        } catch (e) {
            console.warn('Invalid action args', e);
            return [];
        }
    }

    function callWindowAction(action, args = []) {
        const fn = window[action];
        if (typeof fn === 'function') fn(...args);
    }

    function bindDelegatedActions() {
        if (window.__staticActionsBound) return;
        window.__staticActionsBound = true;

        document.addEventListener('click', (event) => {
            const el = event.target.closest('[data-action]');
            if (!el) return;
            if (el.dataset.stopPropagation === 'true') event.stopPropagation();
            if (el.dataset.preventDefault === 'true') event.preventDefault();

            const action = el.dataset.action;
            if (action === 'clickBoardFileInput') {
                document.getElementById('board-file-input')?.click();
                return;
            }
            if (action === 'removeParentItem') {
                el.parentElement?.remove();
                return;
            }

            callWindowAction(action, getActionArgs(el));
        });

        document.addEventListener('change', (event) => {
            const el = event.target.closest('[data-change-action]');
            if (!el) return;

            const action = el.dataset.changeAction;
            const args = getActionArgs(el);
            if (el.dataset.changeMode === 'event') {
                callWindowAction(action, [event, ...args]);
            } else {
                callWindowAction(action, [...args, el.value]);
            }
        });

        document.addEventListener('keydown', (event) => {
            const el = event.target.closest('[data-enter-action]');
            if (!el || event.key !== 'Enter') return;
            callWindowAction(el.dataset.enterAction);
        });
    }

    window.UIUXA_DOM_ACTIONS = {
        escapeAttr,
        actionAttrs,
        changeActionAttrs,
        bindDelegatedActions
    };
})();
