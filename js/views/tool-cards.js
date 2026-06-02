(function() {
    const levelIds = ['basic', 'advanced'];
    const levelLabels = { basic: '기초', advanced: '심화' };
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

    function installToolCardsView(context) {
        const {
            actionAttrs,
            changeActionAttrs,
            escapeAttr,
            getIsEditMode,
            getCurrentToolLayout,
            getCurrentToolId,
            setCurrentToolId,
            getCurrentToolLevel,
            setCurrentToolLevel,
            getCurrentDesignFilter,
            setCurrentDesignFilter,
            getCurrentSortOrder,
            getRoadmapData,
            getToolData,
            getToolTabs,
            setToolTabs,
            getMemoData,
            setMemoData,
            getDesignFilters,
            setDesignFilters,
            getCurrentDeleteToolCardInfo,
            setCurrentDeleteToolCardInfo
        } = context;

        const toolIds = () => getToolTabs().map((tab) => tab.id);
        const toolLabel = (toolId) => getToolTabs().find((tab) => tab.id === toolId)?.label || toolId;
        const levelsForTool = (toolId) => getToolTabs().find((tab) => tab.id === toolId)?.levels || levelIds;
        const makeToolId = (label) => {
            const base = String(label || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
            let id = base || `tool-${Date.now()}`;
            const used = new Set(toolIds());
            let counter = 2;
            while (used.has(id)) id = `${base || 'tool'}-${counter++}`;
            return id;
        };
        const ensureCurrentTool = () => {
            const tabs = getToolTabs();
            if (!tabs.some((tab) => tab.id === getCurrentToolId())) setCurrentToolId(tabs[0]?.id || '');
            const currentToolId = getCurrentToolId();
            const levels = levelsForTool(currentToolId);
            if (!levels.includes(getCurrentToolLevel(currentToolId))) setCurrentToolLevel(currentToolId, levels[0] || 'basic');
            return currentToolId;
        };

        window.renderToolShell = function() {
            const currentToolId = ensureCurrentTool();
            const nav = document.getElementById('tool-tab-nav');
            const content = document.getElementById('tool-dynamic-content');
            const manager = document.getElementById('tool-tab-manager');
            const toolTabs = getToolTabs();

            if (nav) {
                nav.innerHTML = toolTabs.map((tab) => {
                    const active = tab.id === currentToolId;
                    const activeClass = active ? 'font-bold text-figjam border-b-[3px] border-figjam' : 'font-medium text-slate-400 hover:text-slate-700';
                    return `<button id="sub-${tab.id}" ${actionAttrs('switchTool', [tab.id])} class="sub-tab-btn pb-3 text-[16px] ${activeClass} transition-colors">${tab.label}</button>`;
                }).join('');
            }

            if (manager) {
                if (!getIsEditMode()) {
                    manager.classList.add('hidden');
                    manager.innerHTML = '';
                } else {
                    manager.classList.remove('hidden');
                    const rows = toolTabs.map((tab, index) => {
                        const isOnly = toolTabs.length <= 1;
                        const cardCount = (tab.levels || levelIds).reduce((sum, levelId) => sum + (getToolData()[tab.id]?.[levelId]?.length || 0), 0);
                        return `
                            <div class="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-2">
                                <span class="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-400 text-[12px] font-extrabold flex items-center justify-center shrink-0">${index + 1}</span>
                                <input type="text" value="${escapeAttr(tab.label)}" ${changeActionAttrs('renameToolTab', [index])} class="flex-1 min-w-0 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-figjam">
                                <span class="hidden sm:inline-flex text-[11px] font-bold text-slate-400 bg-white border border-slate-100 rounded-lg px-2 py-2">${cardCount}</span>
                                <button type="button" ${actionAttrs('moveToolTab', [index, -1])} ${index === 0 ? 'disabled' : ''} class="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-400 ${index === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:text-figjam'} flex items-center justify-center"><i data-lucide="arrow-up" class="w-4 h-4"></i></button>
                                <button type="button" ${actionAttrs('moveToolTab', [index, 1])} ${index === toolTabs.length - 1 ? 'disabled' : ''} class="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-400 ${index === toolTabs.length - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:text-figjam'} flex items-center justify-center"><i data-lucide="arrow-down" class="w-4 h-4"></i></button>
                                <button type="button" ${actionAttrs('deleteToolTab', [index])} ${isOnly ? 'disabled' : ''} class="w-9 h-9 rounded-lg bg-white border border-slate-200 text-slate-400 ${isOnly ? 'opacity-40 cursor-not-allowed' : 'hover:text-red-500 hover:border-red-200'} flex items-center justify-center"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                            </div>
                        `;
                    }).join('');
                    manager.innerHTML = `
                        <div class="bg-white border border-slate-100 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5">
                            <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                <div class="flex items-center gap-3">
                                    <div class="w-10 h-10 rounded-2xl bg-figjamLight text-figjam flex items-center justify-center"><i data-lucide="folder-tree" class="w-5 h-5"></i></div>
                                    <h3 class="text-[16px] font-extrabold text-slate-800">Tool 탭</h3>
                                </div>
                                <div class="flex items-center gap-2 w-full lg:w-auto">
                                    <input id="tool-new-tab-label" type="text" data-enter-action="addToolTab" class="flex-1 lg:w-[220px] border-2 border-slate-100 rounded-xl px-3 py-2.5 text-sm font-bold outline-none focus:border-figjam bg-slate-50" placeholder="탭 추가">
                                    <button type="button" ${actionAttrs('addToolTab')} class="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-figjam text-white rounded-xl font-bold text-sm hover:bg-[#7c4ced] transition-colors"><i data-lucide="plus" class="w-4 h-4"></i> 추가</button>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 xl:grid-cols-2 gap-2 mt-4">${rows}</div>
                        </div>
                    `;
                }
            }

            if (content) {
                content.innerHTML = toolTabs.map((tab) => {
                    const levels = tab.levels || levelIds;
                    const activeTool = tab.id === currentToolId;
                    const activeLevel = getCurrentToolLevel(tab.id);
                    const levelTabs = levels.length > 1 ? `<div class="flex items-center gap-2 mb-8">${levels.map((levelId) => {
                        const levelActive = levelId === activeLevel;
                        const levelClass = levelActive ? 'font-bold text-figjam bg-figjamLight border border-figjamBorder' : 'font-medium text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-700 shadow-sm';
                        return `<button id="btn-${tab.id}-${levelId}" ${actionAttrs('switchLevel', [tab.id, levelId])} class="level-btn px-4 py-1.5 text-[14px] ${levelClass} rounded-full transition-all">${levelLabels[levelId] || levelId}</button>`;
                    }).join('')}</div>` : '';
                    const levelContents = levels.map((levelId) => {
                        const levelActive = levelId === activeLevel;
                        const title = levels.length > 1 ? `${tab.label}(${levelLabels[levelId] || levelId} Tool)` : tab.label;
                        return `
                            <div id="${tab.id}-${levelId}" class="level-content ${levelActive ? 'block' : 'hidden'}">
                                <div class="mb-10">
                                    <h1 class="text-[32px] font-bold text-slate-900 tracking-tight flex items-center gap-2 mb-2">${title} ${tab.icon || ''}</h1>
                                </div>
                                <div id="grid-${tab.id}-${levelId}" data-tool-id="${tab.id}" data-level-id="${levelId}" class="tool-card-container"></div>
                            </div>
                        `;
                    }).join('');
                    return `<div id="tool-${tab.id}" class="tool-content ${activeTool ? 'active' : ''}">${levelTabs}${levelContents}</div>`;
                }).join('');
            }
            refreshIcons();
        };

        window.renderAllToolCards = function() {
            window.renderToolShell();
            getToolTabs().forEach((tab) => {
                (tab.levels || levelIds).forEach((levelId) => window.renderToolCards(tab.id, levelId));
            });
            if (getIsEditMode()) window.bindToolCardDragAndDrop();
            refreshIcons();
        };

        window.addToolTab = function() {
            const input = document.getElementById('tool-new-tab-label');
            const label = String(input?.value || '').trim();
            if (!label) return showToast('탭 이름을 입력하세요.');
            const tabs = [...getToolTabs()];
            const id = makeToolId(label);
            tabs.push({ id, label, icon: '📌', levels: ['basic', 'advanced'] });
            getToolData()[id] = { basic: [], advanced: [] };
            setToolTabs(tabs);
            setCurrentToolId(id);
            if (input) input.value = '';
            saveToCloud();
            window.renderAllToolCards();
            window.updateDesignFilterSelects();
            window.renderMemoToolTabs?.();
            showToast('추가됨');
        };

        window.renameToolTab = function(index, nextLabel) {
            const tabs = [...getToolTabs()];
            const tab = tabs[index];
            const label = String(nextLabel || '').trim();
            if (!tab) return;
            if (!label) {
                window.renderToolShell();
                return showToast('탭 이름을 입력하세요.');
            }
            tab.label = label;
            setToolTabs(tabs);
            saveToCloud();
            window.renderAllToolCards();
            window.renderMemoToolTabs?.();
            showToast('저장됨');
        };

        window.moveToolTab = function(index, direction) {
            const tabs = [...getToolTabs()];
            const nextIndex = index + direction;
            if (nextIndex < 0 || nextIndex >= tabs.length) return;
            [tabs[index], tabs[nextIndex]] = [tabs[nextIndex], tabs[index]];
            setToolTabs(tabs);
            saveToCloud();
            window.renderAllToolCards();
            window.renderMemoToolTabs?.();
        };

        window.deleteToolTab = function(index) {
            const tabs = [...getToolTabs()];
            if (tabs.length <= 1) return showToast('탭은 1개 이상 필요합니다.');
            const tab = tabs[index];
            if (!tab) return;
            const cardCount = (tab.levels || levelIds).reduce((sum, levelId) => sum + (getToolData()[tab.id]?.[levelId]?.length || 0), 0);
            if (cardCount > 0 && !window.confirm(`${tab.label} 탭과 카드 ${cardCount}개를 삭제할까요?`)) return;
            if (cardCount === 0 && !window.confirm(`${tab.label} 탭을 삭제할까요?`)) return;

            const deletedCardIds = new Set();
            (tab.levels || levelIds).forEach((levelId) => {
                (getToolData()[tab.id]?.[levelId] || []).forEach((card) => deletedCardIds.add(card.id));
            });
            delete getToolData()[tab.id];

            const roadmapData = getRoadmapData();
            if (deletedCardIds.has(roadmapData.todayTask?.cardId)) roadmapData.todayTask.cardId = '';
            setMemoData(getMemoData().filter((memo) => memo.toolId !== tab.id && !deletedCardIds.has(memo.cardId)));

            tabs.splice(index, 1);
            setToolTabs(tabs);
            if (getCurrentToolId() === tab.id) setCurrentToolId(tabs[Math.max(0, index - 1)]?.id || tabs[0].id);
            saveToCloud();
            window.renderAllToolCards();
            window.renderMemoToolTabs?.();
            showToast('삭제됨');
        };

        window.renderToolCards = function(toolId, levelId) {
            const container = document.getElementById(`grid-${toolId}-${levelId}`);
            if (!container) return;

            const isEditMode = getIsEditMode();
            const layout = getCurrentToolLayout();
            const toolData = getToolData();
            const roadmapData = getRoadmapData();
            const memoData = getMemoData();
            const designFilter = getCurrentDesignFilter();

            container.innerHTML = '';
            container.className = layout === 'grid'
                ? 'tool-card-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                : 'tool-card-container flex flex-col gap-4';

            if (!toolData[toolId]) toolData[toolId] = {};
            if (!Array.isArray(toolData[toolId][levelId])) toolData[toolId][levelId] = [];
            let cards = [...(toolData[toolId][levelId] || [])];
            if (getCurrentSortOrder() === 'newest') cards.reverse();

            if (isEditMode) {
                const addClass = layout === 'grid'
                    ? 'bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[24px] p-6 flex flex-col items-center justify-center text-slate-400 hover:text-figjam cursor-pointer min-h-[220px]'
                    : 'bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[20px] p-4 flex items-center justify-center text-slate-400 hover:text-figjam cursor-pointer w-full h-[100px]';
                container.innerHTML += `<div ${actionAttrs('openToolCardModal', [toolId, levelId, 'new'])} class="${addClass}"><i data-lucide="plus-circle" class="w-8 h-8 mb-2"></i><span class="font-bold">카드 추가</span></div>`;
            }

            cards.forEach((card) => {
                if (!isEditMode && card.isHidden) return;
                if (toolId === 'design' && designFilter !== 'all' && card.category !== designFilter) return;

                const isTodayTask = roadmapData.todayTask && roadmapData.todayTask.cardId === card.id;
                const todayBadge = isTodayTask ? `<div class="absolute -top-3 -right-3 bg-red-500 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-md z-20 flex gap-1"><i data-lucide="star" class="w-3.5 h-3.5"></i> 오늘 과제</div>` : '';
                const linkedMemos = memoData.filter((memo) => memo.cardId === card.id);
                const memoBadge = linkedMemos.length > 0 ? `<button ${actionAttrs('openMemoListForTool', [toolId, levelId])} class="absolute -top-3 -left-3 bg-indigo-500 text-white text-[11px] font-extrabold px-2.5 py-1.5 rounded-full shadow-md z-20 flex gap-1 hover:bg-indigo-600"><i data-lucide="file-text" class="w-3.5 h-3.5"></i> ${linkedMemos.length}</button>` : '';
                const hiddenClass = card.isHidden ? 'opacity-50 grayscale' : '';
                const editButtons = isEditMode ? `<div class="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 z-20"><button ${actionAttrs('promptDeleteToolCard', [toolId, levelId, card.id], { stop: true })} class="text-slate-400 hover:text-red-500 bg-white shadow-sm p-1.5 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4"></i></button><button ${actionAttrs('openToolCardModal', [toolId, levelId, card.id], { stop: true })} class="text-slate-400 hover:text-figjam bg-white shadow-sm p-1.5 rounded-lg"><i data-lucide="edit" class="w-4 h-4"></i></button></div>` : '';
                const linksHtml = (card.links || []).map((link) => `<a href="${link.url || '#'}" target="_blank" class="block text-[13px] font-bold text-slate-600 hover:text-figjam truncate py-1 flex gap-2"><i data-lucide="play-circle" class="w-4 h-4 shrink-0"></i> <span>${link.text}</span></a>`).join('');
                const buttonsHtml = (card.buttons || []).map((button) => `<a href="${button.url || '#'}" target="_blank" class="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[12px] font-bold flex justify-center items-center gap-1.5 border border-slate-100"><i data-lucide="external-link" class="w-3.5 h-3.5"></i> ${button.text}</a>`).join('');
                const buttonWrap = buttonsHtml ? `<div class="flex gap-2 mt-4 pt-4 border-t border-slate-50">${buttonsHtml}</div>` : '';
                const descHtml = card.desc ? `<p class="text-[13px] text-slate-500 font-medium leading-relaxed mb-4 line-clamp-3">${card.desc.replace(/\n/g, '<br>')}</p>` : '';
                const categoryHtml = (toolId === 'design' && card.category) ? `<span class="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md mb-2 inline-block">${card.category}</span>` : '';
                const leftBadge = card.badge ? `<span class="text-[12px] font-extrabold text-figjam bg-figjamLight px-2 py-1 rounded-md shadow-sm border border-figjamBorder">${card.badge}</span>` : '';
                const rightBadge = card.badgeRight ? `<span class="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md shadow-sm border border-emerald-100">${card.badgeRight}</span>` : '';
                const badges = (leftBadge || rightBadge) ? `<div class="flex justify-between items-center mb-3">${leftBadge} ${rightBadge}</div>` : '';

                if (layout === 'grid') {
                    container.innerHTML += `<div class="tool-card-item bg-white p-6 rounded-[24px] border border-slate-100 shadow-soft hover:shadow-hover transition-all flex flex-col relative group min-h-[220px] ${hiddenClass}" data-card-id="${card.id}">${todayBadge}${memoBadge}${editButtons}${categoryHtml}${badges}<h3 class="font-bold text-slate-800 text-[17px] mb-3 pr-8">${card.title || '제목 없음'}</h3>${descHtml}<div class="space-y-1 mb-2 flex-1">${linksHtml}</div>${buttonWrap}</div>`;
                } else {
                    container.innerHTML += `<div class="tool-card-item bg-white p-5 rounded-[20px] border border-slate-100 shadow-soft hover:shadow-hover transition-all flex flex-col md:flex-row gap-5 relative group items-start md:items-center ${hiddenClass}" data-card-id="${card.id}">${todayBadge}${memoBadge}${editButtons}<div class="flex-1 min-w-0 pr-8 md:pr-0">${categoryHtml}${badges}<h3 class="font-bold text-slate-800 text-[17px] mb-2">${card.title || '제목 없음'}</h3>${descHtml}</div><div class="w-full md:w-[280px] shrink-0 flex flex-col gap-3 md:pl-5 md:border-l border-slate-100"><div class="space-y-1">${linksHtml}</div>${buttonWrap}</div></div>`;
                }
            });
        };

        window.addToolLinkRow = function(text = '', url = '') {
            document.getElementById('tcm-links-container').insertAdjacentHTML('beforeend', `<div class="flex gap-2 tcm-link-item bg-white p-2 rounded-lg border border-slate-100"><div class="flex-1 flex flex-col gap-2"><input type="text" placeholder="텍스트" value="${escapeAttr(text)}" class="link-text w-full border-2 border-slate-100 rounded-md p-2 text-xs font-bold outline-none bg-slate-50"><input type="text" placeholder="URL" value="${escapeAttr(url)}" class="link-url w-full border-2 border-slate-100 rounded-md p-2 text-xs outline-none bg-slate-50"></div><button type="button" ${actionAttrs('removeParentItem')} class="text-slate-300 hover:text-red-500 p-2 shrink-0 bg-slate-50"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div>`);
            refreshIcons();
        };

        window.addToolButtonRow = function(text = '', url = '') {
            document.getElementById('tcm-buttons-container').insertAdjacentHTML('beforeend', `<div class="flex gap-2 tcm-button-item bg-white p-2 rounded-lg border border-slate-100"><div class="flex-1 flex flex-col gap-2"><input type="text" placeholder="버튼 텍스트" value="${escapeAttr(text)}" class="btn-text w-full border-2 border-slate-100 rounded-md p-2 text-xs font-bold outline-none bg-slate-50"><input type="text" placeholder="URL" value="${escapeAttr(url)}" class="btn-url w-full border-2 border-slate-100 rounded-md p-2 text-xs outline-none bg-slate-50"></div><button type="button" ${actionAttrs('removeParentItem')} class="text-slate-300 hover:text-red-500 p-2 shrink-0 bg-slate-50"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div>`);
            refreshIcons();
        };

        window.openToolCardModal = function(toolId, levelId, id) {
            document.getElementById('tcm-toolId').value = toolId;
            document.getElementById('tcm-levelId').value = levelId;
            document.getElementById('tcm-cardId').value = id;

            let card = { badge: '', badgeRight: '', title: '', desc: '', category: '', links: [], buttons: [] };
            if (id !== 'new') card = (getToolData()[toolId]?.[levelId] || []).find((item) => item.id === id) || card;

            document.getElementById('tcm-badge').value = card.badge;
            document.getElementById('tcm-badgeRight').value = card.badgeRight;
            document.getElementById('tcm-title').value = card.title;
            document.getElementById('tcm-desc').value = card.desc;

            const categoryWrapper = document.getElementById('tcm-category-wrapper');
            if (toolId === 'design') {
                categoryWrapper.classList.remove('hidden');
                document.getElementById('tcm-category').value = card.category;
            } else {
                categoryWrapper.classList.add('hidden');
            }

            document.getElementById('tcm-links-container').innerHTML = '';
            document.getElementById('tcm-buttons-container').innerHTML = '';
            (card.links || []).forEach((link) => window.addToolLinkRow(link.text, link.url));
            (card.buttons || []).forEach((button) => window.addToolButtonRow(button.text, button.url));
            if (id === 'new' && !card.links.length) window.addToolLinkRow();
            if (id === 'new' && !card.buttons.length) window.addToolButtonRow();
            openFadeModal('tool-card-modal');
        };

        window.closeToolCardModal = function() {
            closeFadeModal('tool-card-modal');
        };

        window.saveToolCard = function() {
            const toolId = document.getElementById('tcm-toolId').value;
            const levelId = document.getElementById('tcm-levelId').value;
            const id = document.getElementById('tcm-cardId').value;
            const toolData = getToolData();
            if (!toolData[toolId]) toolData[toolId] = {};
            if (!Array.isArray(toolData[toolId][levelId])) toolData[toolId][levelId] = [];

            const links = [];
            document.querySelectorAll('.tcm-link-item').forEach((item) => {
                const text = item.querySelector('.link-text').value.trim();
                const url = item.querySelector('.link-url').value.trim();
                if (text || url) links.push({ text, url });
            });

            const buttons = [];
            document.querySelectorAll('.tcm-button-item').forEach((item) => {
                const text = item.querySelector('.btn-text').value.trim();
                const url = item.querySelector('.btn-url').value.trim();
                if (text || url) buttons.push({ text, url });
            });

            let isHidden = false;
            if (id !== 'new') {
                const existingCard = (toolData[toolId]?.[levelId] || []).find((card) => card.id === id);
                if (existingCard) isHidden = existingCard.isHidden;
            }

            const card = {
                id: id === 'new' ? `card_${Date.now()}` : id,
                badge: document.getElementById('tcm-badge').value.trim(),
                badgeRight: document.getElementById('tcm-badgeRight').value.trim(),
                title: document.getElementById('tcm-title').value.trim(),
                desc: document.getElementById('tcm-desc').value.trim(),
                category: toolId === 'design' ? document.getElementById('tcm-category').value.trim() : '',
                isHidden,
                links,
                buttons
            };

            if (id === 'new') toolData[toolId][levelId].push(card);
            else {
                const index = toolData[toolId][levelId].findIndex((item) => item.id === id);
                if (index > -1) toolData[toolId][levelId][index] = card;
            }

            saveToCloud();
            window.renderAllToolCards();
            window.closeToolCardModal();
            showToast('저장됨');
        };

        window.promptDeleteToolCard = function(toolId, levelId, cardId) {
            setCurrentDeleteToolCardInfo({ toolId, levelId, cardId });
            openFadeModal('tool-delete-confirm-modal');
        };

        window.closeToolDeleteConfirm = function() {
            closeFadeModal('tool-delete-confirm-modal', () => setCurrentDeleteToolCardInfo(null));
        };

        window.executeDeleteToolCard = function() {
            const deleteInfo = getCurrentDeleteToolCardInfo();
            if (!deleteInfo) return;

            const { toolId, levelId, cardId } = deleteInfo;
            if (getRoadmapData().todayTask?.cardId === cardId) getRoadmapData().todayTask.cardId = '';
            setMemoData(getMemoData().filter((memo) => memo.cardId !== cardId));
            if (getToolData()[toolId]?.[levelId]) getToolData()[toolId][levelId] = getToolData()[toolId][levelId].filter((card) => card.id !== cardId);
            saveToCloud();
            window.renderAllToolCards();
            window.closeToolDeleteConfirm();
            showToast('삭제됨');
        };

        window.bindToolCardDragAndDrop = function() {
            document.querySelectorAll('.tool-card-container').forEach((container) => {
                let draggedItem = null;
                container.querySelectorAll('.tool-card-item').forEach((item) => {
                    item.addEventListener('dragstart', function(event) {
                        if (!getIsEditMode()) {
                            event.preventDefault();
                            return;
                        }
                        draggedItem = this;
                        event.dataTransfer.effectAllowed = 'move';
                        setTimeout(() => this.classList.add('opacity-40', 'scale-95'), 0);
                    });
                    item.addEventListener('dragover', function(event) {
                        event.preventDefault();
                        if (!getIsEditMode() || !draggedItem || this === draggedItem) return;
                        const bounds = this.getBoundingClientRect();
                        const offset = getCurrentToolLayout() === 'grid' ? event.clientX - bounds.left : event.clientY - bounds.top;
                        const threshold = getCurrentToolLayout() === 'grid' ? bounds.width / 2 : bounds.height / 2;
                        if (offset > threshold) this.after(draggedItem);
                        else this.before(draggedItem);
                    });
                    item.addEventListener('dragend', function() {
                        if (!getIsEditMode()) return;
                        this.classList.remove('opacity-40', 'scale-95');
                        window.saveToolCardOrder(container.getAttribute('data-tool-id'), container.getAttribute('data-level-id'));
                        draggedItem = null;
                    });
                });
            });
        };

        window.saveToolCardOrder = function(toolId, levelId) {
            const container = document.getElementById(`grid-${toolId}-${levelId}`);
            if (!container || !getToolData()[toolId]?.[levelId]) return;
            const orderedIds = Array.from(container.querySelectorAll('.tool-card-item')).map((node) => node.getAttribute('data-card-id'));
            if (getCurrentSortOrder() === 'newest') orderedIds.reverse();
            getToolData()[toolId][levelId] = orderedIds.map((id) => getToolData()[toolId][levelId].find((card) => card.id === id)).filter(Boolean);
            saveToCloud();
        };

        window.openFilterModal = function() {
            window.renderFilterManageList();
            openFadeModal('filter-manage-modal');
        };

        window.closeFilterModal = function() {
            closeFadeModal('filter-manage-modal');
        };

        window.renderFilterManageList = function() {
            const container = document.getElementById('fm-list-container');
            container.innerHTML = '';
            getDesignFilters().forEach((filter, index) => {
                container.innerHTML += `<div class="flex items-center gap-2"><input type="text" value="${escapeAttr(filter)}" ${changeActionAttrs('updateDesignFilter', [index])} class="flex-1 border-2 border-slate-100 rounded-xl p-2 text-sm font-bold"><button ${actionAttrs('deleteDesignFilter', [index])} class="text-slate-300 hover:text-red-500 bg-slate-50 p-2.5 rounded-xl"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div>`;
            });
            refreshIcons();
        };

        window.addDesignFilter = function() {
            const value = document.getElementById('fm-new-filter').value.trim();
            const designFilters = getDesignFilters();
            if (value && !designFilters.includes(value)) {
                designFilters.push(value);
                document.getElementById('fm-new-filter').value = '';
                saveToCloud();
                window.renderFilterManageList();
                window.updateDesignFilterSelects();
            }
        };

        window.updateDesignFilter = function(index, value) {
            value = value.trim();
            const designFilters = getDesignFilters();
            if (value && value !== designFilters[index]) {
                getToolTabs().forEach((tab) => {
                    (tab.levels || levelIds).forEach((levelId) => {
                        (getToolData()[tab.id]?.[levelId] || []).forEach((card) => {
                            if (card.category === designFilters[index]) card.category = value;
                        });
                    });
                });
                designFilters[index] = value;
                saveToCloud();
                window.updateDesignFilterSelects();
                window.renderAllToolCards();
            }
        };

        window.deleteDesignFilter = function(index) {
            const designFilters = getDesignFilters();
            getToolTabs().forEach((tab) => {
                (tab.levels || levelIds).forEach((levelId) => {
                    (getToolData()[tab.id]?.[levelId] || []).forEach((card) => {
                        if (card.category === designFilters[index]) card.category = '';
                    });
                });
            });
            designFilters.splice(index, 1);
            setDesignFilters(designFilters);
            saveToCloud();
            window.renderFilterManageList();
            window.updateDesignFilterSelects();
            window.renderAllToolCards();
        };

        window.updateDesignFilterSelects = function() {
            const mainSelect = document.getElementById('design-category-filter');
            const modalSelect = document.getElementById('tcm-category');
            const designFilters = getDesignFilters();

            if (mainSelect) {
                const currentValue = mainSelect.value;
                mainSelect.innerHTML = `<option value="all">전체</option>`;
                designFilters.forEach((filter) => mainSelect.innerHTML += `<option value="${filter}">${filter}</option>`);
                if (designFilters.includes(currentValue)) mainSelect.value = currentValue;
                else {
                    mainSelect.value = 'all';
                    setCurrentDesignFilter('all');
                }
            }

            if (modalSelect) {
                const currentValue = modalSelect.value;
                modalSelect.innerHTML = `<option value="">없음</option>`;
                designFilters.forEach((filter) => modalSelect.innerHTML += `<option value="${filter}">${filter}</option>`);
                if (designFilters.includes(currentValue)) modalSelect.value = currentValue;
                else modalSelect.value = '';
            }
        };
    }

    window.UIUXA_TOOL_CARDS_VIEW = { install: installToolCardsView };
})();
