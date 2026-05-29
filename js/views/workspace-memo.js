(function() {
    const refreshIcons = () => window.lucide?.createIcons();
    const showToast = (message) => window.showToast?.(message);
    const saveToCloud = () => window.saveToFirebase?.();

    function openFadeModal(id) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => modal.classList.add('opacity-100'), 10);
    }

    function closeFadeModal(id, afterClose) {
        const modal = document.getElementById(id);
        if (!modal) return;
        modal.classList.remove('opacity-100');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            afterClose?.();
        }, 300);
    }

    function formatMemoDate(date) {
        return `${String(date.getFullYear()).slice(-2)}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    }

    function workspaceLinkForm(actionAttrs, escapeAttr, link = {}) {
        return `
            <div class="wsm-link-item bg-slate-50 p-4 rounded-xl relative group">
                <button type="button" ${actionAttrs('removeParentItem')} class="absolute top-2 right-2 text-slate-300 hover:text-red-500 bg-white rounded-md p-1"><i data-lucide="trash-2" class="w-3 h-3"></i></button>
                <div class="grid grid-cols-2 gap-3 mb-3">
                    <div><input type="text" value="${escapeAttr(link.name || '')}" placeholder="이름" class="w-full border-2 border-slate-200 rounded-lg p-2 text-xs font-bold bg-white link-name"></div>
                    <div><input type="text" value="${escapeAttr(link.icon || 'link')}" class="w-full border-2 border-slate-200 rounded-lg p-2 text-xs bg-white link-icon"></div>
                </div>
                <input type="text" value="${escapeAttr(link.url || '')}" placeholder="URL" class="w-full border-2 border-slate-200 rounded-lg p-2 text-xs bg-white link-url">
            </div>
        `;
    }

    function installWorkspaceMemoView(context) {
        const {
            actionAttrs,
            escapeAttr,
            getIsEditMode,
            getWorkspaceData,
            setWorkspaceData,
            getMemoData,
            setMemoData,
            getToolData,
            getCurrentMemoTool,
            setCurrentMemoTool,
            getCurrentMemoLevel,
            setCurrentMemoLevel,
            getCurrentViewMemoId,
            setCurrentViewMemoId,
            getCurrentDeleteMemoId,
            setCurrentDeleteMemoId
        } = context;

        window.renderWorkspace = function() {
            const container = document.getElementById('render-workspace-cards');
            if (!container) return;

            container.innerHTML = '';
            if (getIsEditMode()) {
                container.innerHTML += `<div ${actionAttrs('openWorkspaceModal', ['new'])} class="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[24px] p-6 flex flex-col items-center justify-center text-slate-400 hover:text-figjam cursor-pointer min-h-[250px]"><i data-lucide="plus-circle" class="w-10 h-10 mb-3"></i><span class="font-bold text-[15px]">추가</span></div>`;
            }

            getWorkspaceData().forEach((user) => {
                const editButton = getIsEditMode()
                    ? `<button ${actionAttrs('openWorkspaceModal', [user.id])} class="absolute top-4 right-4 text-slate-400 hover:text-figjam bg-slate-50 p-2 rounded-xl opacity-0 group-hover:opacity-100 z-20"><i data-lucide="edit" class="w-4 h-4"></i></button>`
                    : '';
                const linksHtml = (user.links || []).filter((link) => link.name).map((link) => `
                    <div class="flex items-center gap-2">
                        <a href="${link.url}" target="_blank" class="flex-1 flex justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 group/link transition-colors">
                            <div class="flex items-center gap-2.5">
                                <div class="w-8 h-8 rounded-lg bg-white flex justify-center items-center text-slate-400 shadow-sm"><i data-lucide="${link.icon || 'link'}" class="w-4 h-4"></i></div>
                                <span class="text-[13px] font-bold text-slate-700">${link.name}</span>
                            </div>
                            <i data-lucide="external-link" class="w-3.5 h-3.5 text-slate-300"></i>
                        </a>
                        <button ${actionAttrs('copyToClipboard', [link.url])} class="w-[46px] h-[46px] flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-figjam hover:bg-slate-100 transition-colors shrink-0 shadow-sm" title="링크 복사"><i data-lucide="copy" class="w-4 h-4"></i></button>
                    </div>
                `).join('');

                container.innerHTML += `
                    <div class="bg-white rounded-[24px] border border-slate-100 shadow-soft hover:shadow-hover p-6 relative group">${editButton}
                        <div class="flex gap-3.5 mb-5 border-b border-slate-50 pb-4">
                            <div class="w-12 h-12 rounded-2xl bg-figjam text-white flex justify-center items-center text-lg font-bold shadow-md shrink-0">${user.avatar || user.name.charAt(0)}</div>
                            <div class="flex-1 min-w-0">
                                <h3 class="font-bold text-slate-800 text-[16px] truncate">${user.name}</h3>
                                <div class="text-[12px] font-medium text-slate-400 mt-1 flex items-center gap-1">
                                    <i data-lucide="mail" class="w-3 h-3 shrink-0"></i>
                                    <span class="truncate">${user.email || 'abcd123@gmail.com'}</span>
                                    <button ${actionAttrs('copyToClipboard', [user.email || 'abcd123@gmail.com'])} class="ml-1 text-slate-300 hover:text-figjam transition-colors shrink-0" title="이메일 복사"><i data-lucide="copy" class="w-3 h-3"></i></button>
                                </div>
                            </div>
                        </div>
                        <div class="space-y-2.5">${linksHtml}</div>
                    </div>
                `;
            });
            refreshIcons();
        };

        window.addNewLinkToWorkspace = function() {
            document.getElementById('wsm-links-container')?.insertAdjacentHTML('beforeend', workspaceLinkForm(actionAttrs, escapeAttr));
            refreshIcons();
        };

        window.openWorkspaceModal = function(id) {
            document.getElementById('wsm-id').value = id;
            let user = { name: '', avatar: '', email: '', links: [] };
            if (id !== 'new') user = getWorkspaceData().find((item) => item.id === id) || user;

            document.getElementById('wsm-name').value = user.name;
            document.getElementById('wsm-avatar').value = user.avatar;
            document.getElementById('wsm-email').value = user.email || '';
            document.getElementById('btn-wsm-delete')?.classList.toggle('hidden', id === 'new');

            const container = document.getElementById('wsm-links-container');
            container.innerHTML = '';
            (user.links || []).forEach((link) => container.insertAdjacentHTML('beforeend', workspaceLinkForm(actionAttrs, escapeAttr, link)));
            if (id === 'new') window.addNewLinkToWorkspace();

            openFadeModal('workspace-modal');
            refreshIcons();
        };

        window.closeWorkspaceModal = function() {
            closeFadeModal('workspace-modal');
        };

        window.saveWorkspaceModal = function() {
            const id = document.getElementById('wsm-id').value;
            const name = document.getElementById('wsm-name').value.trim();
            const avatar = document.getElementById('wsm-avatar').value.trim() || name.charAt(0);
            const email = document.getElementById('wsm-email').value.trim();
            if (!name) return showToast('이름입력');

            const links = [];
            document.querySelectorAll('.wsm-link-item').forEach((item) => {
                const linkName = item.querySelector('.link-name').value.trim();
                const linkIcon = item.querySelector('.link-icon').value.trim();
                const linkUrl = item.querySelector('.link-url').value.trim();
                if (linkName || linkUrl) links.push({ name: linkName, icon: linkIcon, url: linkUrl });
            });

            const workspaceData = getWorkspaceData();
            if (id === 'new') {
                workspaceData.push({ id: `ws_${Date.now()}`, name, avatar, email, links });
            } else {
                const index = workspaceData.findIndex((item) => item.id === id);
                if (index > -1) workspaceData[index] = { ...workspaceData[index], name, avatar, email, links };
            }

            saveToCloud();
            window.renderWorkspace();
            window.closeWorkspaceModal();
            showToast('저장됨');
        };

        window.deleteWorkspaceCard = function() {
            const id = document.getElementById('wsm-id').value;
            setWorkspaceData(getWorkspaceData().filter((item) => item.id !== id));
            saveToCloud();
            window.renderWorkspace();
            window.closeWorkspaceModal();
            showToast('삭제됨');
        };

        window.openMemoListModal = function() {
            openFadeModal('memo-list-modal');
            window.renderMemoList();
        };

        window.closeMemoListModal = function() {
            closeFadeModal('memo-list-modal');
        };

        window.switchMemoTool = function(id) {
            setCurrentMemoTool(id);
            document.querySelectorAll('.memo-tool-tab').forEach((element) => {
                element.classList.remove('font-bold', 'text-indigo-600', 'border-b-[3px]', 'border-indigo-600');
                element.classList.add('font-medium', 'text-slate-400');
            });
            const activeButton = document.getElementById(`memotab-tool-${id}`);
            activeButton.classList.remove('font-medium', 'text-slate-400');
            activeButton.classList.add('font-bold', 'text-indigo-600', 'border-b-[3px]', 'border-indigo-600');
            window.renderMemoList();
        };

        window.switchMemoLevel = function(id) {
            setCurrentMemoLevel(id);
            document.querySelectorAll('.memo-level-tab').forEach((element) => {
                element.classList.remove('text-indigo-600', 'bg-white', 'shadow-sm', 'font-bold');
                element.classList.add('text-slate-500', 'font-medium');
            });
            const activeButton = document.getElementById(`memotab-level-${id}`);
            activeButton.classList.remove('text-slate-500', 'font-medium');
            activeButton.classList.add('text-indigo-600', 'bg-white', 'shadow-sm', 'font-bold');
            window.renderMemoList();
        };

        window.openMemoListForTool = function(toolId, levelId) {
            window.switchMemoTool(toolId);
            window.switchMemoLevel(levelId);
            window.openMemoListModal();
        };

        window.renderMemoList = function() {
            const container = document.getElementById('render-memo-list');
            if (!container) return;

            const memoData = getMemoData();
            const toolData = getToolData();
            const currentTool = getCurrentMemoTool();
            const currentLevel = getCurrentMemoLevel();
            const filteredMemos = memoData.filter((memo) => memo.toolId === currentTool && memo.levelId === currentLevel);

            container.innerHTML = '';
            filteredMemos.forEach((memo, index) => {
                const card = toolData[currentTool][currentLevel].find((item) => item.id === memo.cardId);
                const cardTitle = card ? (card.title || '없음') : '연결안됨';
                const editButton = getIsEditMode()
                    ? `<button ${actionAttrs('openMemoEditModal', [memo.id], { stop: true })} class="text-slate-400 hover:text-indigo-600 p-1.5 rounded-md hover:bg-indigo-50"><i data-lucide="edit" class="w-4 h-4"></i></button>`
                    : '';
                container.insertAdjacentHTML('beforeend', `<div ${actionAttrs('openMemoViewModal', [memo.id])} class="grid grid-cols-12 gap-4 p-4 border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer items-center group"><div class="col-span-1 text-center text-[13px] font-bold text-slate-400">${filteredMemos.length - index}</div><div class="col-span-3 truncate text-[12px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md" title="${cardTitle}">${cardTitle}</div><div class="col-span-5 md:col-span-6 flex items-center gap-3"><h3 class="text-[14px] font-bold text-slate-700 truncate group-hover:text-indigo-600">${memo.title}</h3></div><div class="col-span-3 md:col-span-2 flex justify-end gap-3 pr-2"><span class="text-[12px] font-medium text-slate-400">${memo.date}</span>${editButton}</div></div>`);
            });

            if (getIsEditMode()) {
                container.insertAdjacentHTML('beforeend', `<div ${actionAttrs('openMemoEditModal', ['new'])} class="p-6 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 bg-slate-50/50 cursor-pointer h-[100px]"><i data-lucide="plus-circle" class="w-5 h-5 mb-1.5"></i><span class="font-bold text-[13px]">새 작성</span></div>`);
            } else if (filteredMemos.length === 0) {
                container.innerHTML = `<div class="p-12 text-center text-slate-400">등록된 메모가 없습니다.</div>`;
            }
            refreshIcons();
        };

        window.openMemoEditModal = function(id) {
            document.getElementById('mem-id').value = id;
            let memo = { title: '', content: '', cardId: '' };
            if (id !== 'new') memo = getMemoData().find((item) => item.id === id) || memo;

            document.getElementById('mem-title').value = memo.title;
            document.getElementById('mem-content').value = memo.content;
            const cardSelect = document.getElementById('mem-cardId');
            cardSelect.innerHTML = `<option value="">연결 안함</option>`;
            (getToolData()[getCurrentMemoTool()][getCurrentMemoLevel()] || []).forEach((card) => {
                const selected = memo.cardId === card.id ? 'selected' : '';
                cardSelect.innerHTML += `<option value="${card.id}" ${selected}>${card.title}</option>`;
            });

            document.getElementById('btn-mem-delete')?.classList.toggle('hidden', id === 'new');
            openFadeModal('memo-edit-modal');
        };

        window.closeMemoEditModal = function() {
            closeFadeModal('memo-edit-modal');
        };

        window.saveMemo = function() {
            const id = document.getElementById('mem-id').value;
            const title = document.getElementById('mem-title').value.trim();
            const content = document.getElementById('mem-content').value.trim();
            const cardId = document.getElementById('mem-cardId').value;
            if (!title) return showToast('제목입력');

            const memoData = getMemoData();
            if (id === 'new') {
                memoData.unshift({
                    id: `m_${Date.now()}`,
                    toolId: getCurrentMemoTool(),
                    levelId: getCurrentMemoLevel(),
                    cardId,
                    title,
                    content,
                    date: formatMemoDate(new Date())
                });
            } else {
                const index = memoData.findIndex((memo) => memo.id === id);
                if (index > -1) memoData[index] = { ...memoData[index], title, content, cardId };
            }

            saveToCloud();
            window.renderMemoList();
            window.renderAllToolCards();
            window.closeMemoEditModal();
            showToast('저장됨');
        };

        window.deleteMemo = function() {
            window.promptDeleteMemo(document.getElementById('mem-id').value);
            window.closeMemoEditModal();
        };

        window.promptDeleteMemo = function(id) {
            setCurrentDeleteMemoId(id);
            openFadeModal('memo-delete-confirm-modal');
        };

        window.closeMemoDeleteConfirm = function() {
            closeFadeModal('memo-delete-confirm-modal', () => setCurrentDeleteMemoId(null));
        };

        window.executeDeleteMemo = function() {
            const deleteId = getCurrentDeleteMemoId();
            if (!deleteId) return;
            setMemoData(getMemoData().filter((memo) => memo.id !== deleteId));
            saveToCloud();
            window.renderMemoList();
            window.renderAllToolCards();
            window.closeMemoDeleteConfirm();
            showToast('삭제됨');
        };

        window.openMemoViewModal = function(id) {
            const memo = getMemoData().find((item) => item.id === id);
            if (!memo) return;
            setCurrentViewMemoId(id);

            document.getElementById('mvm-title').textContent = memo.title;
            document.getElementById('mvm-date').textContent = memo.date;

            const card = getToolData()[memo.toolId][memo.levelId].find((item) => item.id === memo.cardId);
            const cardButton = document.getElementById('mvm-card');
            if (card) {
                cardButton.classList.remove('hidden');
                cardButton.classList.add('flex');
                document.getElementById('mvm-card-text').textContent = card.title;
            } else {
                cardButton.classList.add('hidden');
                cardButton.classList.remove('flex');
            }

            document.getElementById('mvm-content').innerHTML = memo.content.replace(/\n/g, '<br>');
            openFadeModal('memo-view-modal');
        };

        window.closeMemoViewModal = function() {
            closeFadeModal('memo-view-modal');
        };

        window.openMemoListFromView = function() {
            const memo = getMemoData().find((item) => item.id === getCurrentViewMemoId());
            window.closeMemoViewModal();
            if (memo) {
                window.switchMemoTool(memo.toolId);
                window.switchMemoLevel(memo.levelId);
            }
            window.openMemoListModal();
        };

        window.copyMemoContent = function() {
            const memo = getMemoData().find((item) => item.id === getCurrentViewMemoId());
            if (!memo) return;
            navigator.clipboard.writeText(`[${memo.title}]\n\n${memo.content}`).then(() => showToast('복사됨')).catch(() => showToast('실패'));
        };
    }

    window.UIUXA_WORKSPACE_MEMO_VIEW = { install: installWorkspaceMemoView };
})();
