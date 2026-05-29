(function() {
    const toolIds = ['photoshop', 'illustrator', 'figma', 'design'];
    const levelIds = ['basic', 'advanced'];
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
            getCurrentDesignFilter,
            setCurrentDesignFilter,
            getCurrentSortOrder,
            getRoadmapData,
            getToolData,
            getMemoData,
            getDesignFilters,
            setDesignFilters,
            getCurrentDeleteToolCardInfo,
            setCurrentDeleteToolCardInfo
        } = context;

        window.renderAllToolCards = function() {
            toolIds.forEach((toolId) => {
                levelIds.forEach((levelId) => window.renderToolCards(toolId, levelId));
            });
            if (getIsEditMode()) window.bindToolCardDragAndDrop();
            refreshIcons();
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
            if (id !== 'new') card = getToolData()[toolId][levelId].find((item) => item.id === id) || card;

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
                const existingCard = toolData[toolId][levelId].find((card) => card.id === id);
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
            getToolData()[toolId][levelId] = getToolData()[toolId][levelId].filter((card) => card.id !== cardId);
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
                toolIds.forEach((toolId) => {
                    levelIds.forEach((levelId) => {
                        getToolData()[toolId][levelId].forEach((card) => {
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
            toolIds.forEach((toolId) => {
                levelIds.forEach((levelId) => {
                    getToolData()[toolId][levelId].forEach((card) => {
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
