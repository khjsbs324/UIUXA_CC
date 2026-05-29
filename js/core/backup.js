(function() {
    function openFadeModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => modal.classList.add('opacity-100'), 10);
    }

    function closeFadeModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.remove('opacity-100');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }, 300);
    }

    function installBackupTools(context) {
        const {
            getStateSnapshot,
            applyStateSnapshot,
            saveState,
            renderAll,
            updateEditModeUI,
            showToast
        } = context;

        window.openBackupModal = function() {
            document.getElementById('backup-textarea').value = JSON.stringify(getStateSnapshot());
            openFadeModal('backup-modal');
        };

        window.closeBackupModal = function() {
            closeFadeModal('backup-modal');
        };

        window.copyBackup = function() {
            navigator.clipboard
                .writeText(document.getElementById('backup-textarea').value)
                .then(() => showToast('복사됨'))
                .catch(() => showToast('실패'));
        };

        window.restoreBackup = function() {
            try {
                const state = JSON.parse(document.getElementById('backup-textarea').value);
                applyStateSnapshot(state);
                saveState();
                renderAll();
                updateEditModeUI();
                window.closeBackupModal();
                showToast('복원됨');
            } catch (error) {
                alert('코드형식 오류');
            }
        };
    }

    window.UIUXA_BACKUP_TOOLS = { install: installBackupTools };
})();
