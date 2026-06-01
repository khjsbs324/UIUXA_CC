(function() {
    const refreshIcons = () => window.lucide?.createIcons();
    const showToast = (message) => window.showToast?.(message);
    const saveToCloud = () => window.saveToFirebase?.();

    const itemTypeOrder = ['goal', 'material', 'link', 'assignment', 'submission', 'notice', 'checklist', 'supplement', 'feedback'];
    const itemTypes = {
        goal: { label: '오늘의 목표', icon: 'target', badge: 'bg-purple-50 text-purple-600 border-purple-100' },
        material: { label: '수업 자료', icon: 'file-text', badge: 'bg-blue-50 text-blue-600 border-blue-100' },
        link: { label: '참고 링크', icon: 'link', badge: 'bg-sky-50 text-sky-600 border-sky-100' },
        assignment: { label: '실습 과제', icon: 'pen-tool', badge: 'bg-amber-50 text-amber-600 border-amber-100' },
        submission: { label: '제출 안내', icon: 'send', badge: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
        notice: { label: '공지/안내', icon: 'megaphone', badge: 'bg-rose-50 text-rose-600 border-rose-100' },
        checklist: { label: '체크리스트', icon: 'check-square', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
        supplement: { label: '보충 자료', icon: 'archive', badge: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
        feedback: { label: '피드백', icon: 'message-square', badge: 'bg-teal-50 text-teal-600 border-teal-100' }
    };

    let activeSessionId = '';
    let previewMode = false;

    function todayString() {
        const today = new Date();
        return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    }

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

    function escapeHtml(value) {
        return String(value ?? '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function withLineBreaks(value) {
        return escapeHtml(value).replace(/\n/g, '<br>');
    }

    function installLessonManagementView(context) {
        const {
            actionAttrs,
            escapeAttr,
            getIsEditMode,
            getLessonData,
            setLessonData
        } = context;

        function normalizeLessonData() {
            const source = getLessonData() || {};
            const sessions = Array.isArray(source.sessions) ? source.sessions : [];
            const normalized = {
                sessions: sessions.map((session) => ({
                    id: session.id || `lesson_${Date.now()}`,
                    date: session.date || todayString(),
                    title: session.title || '새 수업',
                    summary: session.summary || '',
                    isPublic: session.isPublic !== false,
                    items: Array.isArray(session.items) ? session.items.map((item) => ({
                        id: item.id || `lesson_item_${Date.now()}`,
                        type: itemTypes[item.type] ? item.type : 'material',
                        title: item.title || '',
                        content: item.content || '',
                        url: item.url || '',
                        isPublic: item.isPublic !== false,
                        isRequired: item.isRequired === true,
                        createdAt: item.createdAt || new Date().toISOString(),
                        updatedAt: item.updatedAt || item.createdAt || new Date().toISOString()
                    })) : []
                }))
            };
            setLessonData(normalized);
            return normalized;
        }

        function getSortedSessions(includeHidden = true) {
            const data = normalizeLessonData();
            return data.sessions
                .filter((session) => includeHidden || session.isPublic)
                .sort((a, b) => String(a.date).localeCompare(String(b.date)));
        }

        function getActiveSession(includeHidden = true) {
            const sessions = getSortedSessions(includeHidden);
            if (!sessions.length) return null;
            const found = sessions.find((session) => session.id === activeSessionId);
            if (found) return found;
            const today = todayString();
            const todaySession = sessions.find((session) => session.date === today);
            const fallback = todaySession || sessions[sessions.length - 1];
            activeSessionId = fallback.id;
            return fallback;
        }

        function persistAndRender(message) {
            saveToCloud();
            window.renderLessonManager();
            if (message) showToast(message);
        }

        function renderModeStatus(isEditMode) {
            const status = document.getElementById('lesson-mode-status');
            if (!status) return;
            if (isEditMode) {
                status.innerHTML = `
                    <span class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-figjamLight text-figjam text-[12px] font-extrabold border border-figjamBorder">
                        <i data-lucide="unlock" class="w-3.5 h-3.5"></i> 강사 편집 가능
                    </span>
                    <button ${actionAttrs('toggleLessonPreview')} class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-figjam hover:border-figjam text-[12px] font-extrabold shadow-sm">
                        <i data-lucide="${previewMode ? 'wrench' : 'eye'}" class="w-3.5 h-3.5"></i> ${previewMode ? '편집 보기' : '학생 보기'}
                    </button>
                `;
            } else {
                status.innerHTML = `
                    <span class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white text-slate-500 text-[12px] font-extrabold border border-slate-200">
                        <i data-lucide="eye" class="w-3.5 h-3.5"></i> 학생 보기
                    </span>
                `;
            }
        }

        function renderSessionRail(sessions, activeSession, isEditableView) {
            const addButton = isEditableView ? `
                <button ${actionAttrs('openLessonSessionModal', ['new'])} class="w-full min-h-[92px] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 hover:bg-white hover:border-figjam text-slate-400 hover:text-figjam flex flex-col items-center justify-center gap-1 font-bold transition-all">
                    <i data-lucide="plus-circle" class="w-6 h-6"></i>
                    <span class="text-[13px]">수업 추가</span>
                </button>
            ` : '';

            const sessionButtons = sessions.map((session) => {
                const isActive = activeSession?.id === session.id;
                const publicBadge = session.isPublic
                    ? '<span class="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">공개</span>'
                    : '<span class="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">숨김</span>';
                return `
                    <button ${actionAttrs('selectLessonSession', [session.id])} class="w-full text-left rounded-2xl border p-4 transition-all ${isActive ? 'bg-figjamLight border-figjamBorder shadow-sm' : 'bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm'}">
                        <div class="flex items-center justify-between gap-2 mb-2">
                            <span class="text-[12px] font-extrabold ${isActive ? 'text-figjam' : 'text-slate-400'}">${escapeHtml(session.date)}</span>
                            ${publicBadge}
                        </div>
                        <p class="text-[14px] font-extrabold text-slate-800 leading-tight line-clamp-2">${escapeHtml(session.title)}</p>
                        <p class="text-[11px] font-bold text-slate-400 mt-2">${session.items.length}개 항목</p>
                    </button>
                `;
            }).join('');

            return `<div class="space-y-3">${addButton}${sessionButtons}</div>`;
        }

        function renderQuickActions(sessionId) {
            return `
                <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2">
                    ${[
                        ['goal', '목표'],
                        ['material', '자료'],
                        ['link', '링크'],
                        ['assignment', '과제'],
                        ['submission', '제출'],
                        ['notice', '공지']
                    ].map(([type, label]) => `
                        <button ${actionAttrs('openLessonItemModal', [sessionId, type, 'new'])} class="px-3 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-figjam hover:text-figjam text-slate-600 text-[13px] font-extrabold flex items-center justify-center gap-1.5 shadow-sm transition-all">
                            <i data-lucide="${itemTypes[type].icon}" class="w-4 h-4"></i> + ${label}
                        </button>
                    `).join('')}
                </div>
            `;
        }

        function renderItemCard(session, item, isEditableView) {
            const type = itemTypes[item.type] || itemTypes.material;
            const visibilityBadge = item.isPublic
                ? '<span class="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">공개</span>'
                : '<span class="text-[11px] font-extrabold text-amber-600 bg-amber-50 px-2 py-1 rounded-md">숨김</span>';
            const requiredBadge = item.isRequired
                ? '<span class="text-[11px] font-extrabold text-red-500 bg-red-50 px-2 py-1 rounded-md">필수</span>'
                : '<span class="text-[11px] font-extrabold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">선택</span>';
            const urlButton = item.url ? `
                <a href="${escapeAttr(item.url)}" target="_blank" class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-figjam border border-slate-100 text-[12px] font-extrabold">
                    <i data-lucide="external-link" class="w-3.5 h-3.5"></i> 열기
                </a>
            ` : '';
            const editControls = isEditableView ? `
                <div class="flex items-center gap-1">
                    <button ${actionAttrs('toggleLessonItemPublic', [session.id, item.id])} class="w-8 h-8 rounded-lg bg-slate-50 hover:bg-amber-50 text-slate-400 hover:text-amber-500 flex items-center justify-center" title="공개/숨김">
                        <i data-lucide="${item.isPublic ? 'eye' : 'eye-off'}" class="w-4 h-4"></i>
                    </button>
                    <button ${actionAttrs('openLessonItemModal', [session.id, item.type, item.id])} class="w-8 h-8 rounded-lg bg-slate-50 hover:bg-figjamLight text-slate-400 hover:text-figjam flex items-center justify-center" title="수정">
                        <i data-lucide="edit-3" class="w-4 h-4"></i>
                    </button>
                </div>
            ` : '';

            return `
                <article class="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4 ${item.isPublic ? '' : 'opacity-60'}">
                    <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                            <div class="flex flex-wrap items-center gap-2 mb-2">
                                <span class="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-2.5 py-1 rounded-lg border ${type.badge}">
                                    <i data-lucide="${type.icon}" class="w-3.5 h-3.5"></i> ${type.label}
                                </span>
                                ${visibilityBadge}
                                ${requiredBadge}
                            </div>
                            <h3 class="text-[16px] font-extrabold text-slate-800 leading-snug">${escapeHtml(item.title || '제목 없음')}</h3>
                        </div>
                        ${editControls}
                    </div>
                    ${item.content ? `<p class="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap">${withLineBreaks(item.content)}</p>` : ''}
                    ${urlButton ? `<div>${urlButton}</div>` : ''}
                </article>
            `;
        }

        function renderSessionDetail(session, isEditableView, studentView) {
            if (!session) {
                return `
                    <div class="bg-white rounded-[24px] border border-slate-100 shadow-soft p-10 min-h-[360px] flex flex-col items-center justify-center text-center">
                        <div class="w-14 h-14 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center mb-4"><i data-lucide="calendar-plus" class="w-7 h-7"></i></div>
                        <h2 class="text-xl font-extrabold text-slate-800 mb-2">등록된 수업 운영 항목이 없습니다</h2>
                        <p class="text-sm text-slate-500 mb-5">강사모드에서 날짜별 수업을 만들고 자료, 과제, 링크를 묶어보세요.</p>
                        ${isEditableView ? `<button ${actionAttrs('openLessonSessionModal', ['new'])} class="px-5 py-3 bg-figjam text-white rounded-xl text-sm font-extrabold shadow-md hover:bg-[#7c4ced] flex items-center gap-2"><i data-lucide="plus" class="w-4 h-4"></i> 첫 수업 만들기</button>` : ''}
                    </div>
                `;
            }

            const visibleItems = studentView ? session.items.filter((item) => item.isPublic) : session.items;
            const grouped = itemTypeOrder.map((typeId) => ({
                typeId,
                items: visibleItems.filter((item) => item.type === typeId)
            })).filter((group) => group.items.length > 0);

            const groupsHtml = grouped.length ? grouped.map((group) => {
                const type = itemTypes[group.typeId];
                return `
                    <section class="space-y-3">
                        <h3 class="text-[14px] font-extrabold text-slate-700 flex items-center gap-2">
                            <i data-lucide="${type.icon}" class="w-4 h-4 text-figjam"></i> ${type.label}
                        </h3>
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            ${group.items.map((item) => renderItemCard(session, item, isEditableView)).join('')}
                        </div>
                    </section>
                `;
            }).join('') : `
                <div class="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center text-slate-400">
                    <i data-lucide="inbox" class="w-8 h-8 mx-auto mb-2"></i>
                    <p class="text-sm font-bold">${studentView ? '학생에게 공개된 항목이 없습니다.' : '아직 등록된 항목이 없습니다.'}</p>
                </div>
            `;

            const editSessionControls = isEditableView ? `
                <div class="flex flex-wrap gap-2">
                    <button ${actionAttrs('toggleLessonSessionPublic', [session.id])} class="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-amber-500 hover:border-amber-200 text-[12px] font-extrabold flex items-center gap-1.5 shadow-sm">
                        <i data-lucide="${session.isPublic ? 'eye' : 'eye-off'}" class="w-3.5 h-3.5"></i> ${session.isPublic ? '공개 중' : '숨김'}
                    </button>
                    <button ${actionAttrs('openLessonSessionModal', [session.id])} class="px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-figjam hover:border-figjam text-[12px] font-extrabold flex items-center gap-1.5 shadow-sm">
                        <i data-lucide="settings" class="w-3.5 h-3.5"></i> 수업 정보
                    </button>
                </div>
            ` : '';

            return `
                <div class="space-y-5">
                    <div class="bg-white rounded-[24px] border border-slate-100 shadow-soft p-6">
                        <div class="flex flex-col xl:flex-row xl:items-start justify-between gap-5">
                            <div class="min-w-0">
                                <div class="flex flex-wrap items-center gap-2 mb-3">
                                    <span class="text-[12px] font-extrabold text-figjam bg-figjamLight border border-figjamBorder px-3 py-1 rounded-lg">${escapeHtml(session.date)}</span>
                                    <span class="text-[12px] font-extrabold ${session.isPublic ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'} px-3 py-1 rounded-lg">${session.isPublic ? '학생 공개' : '강사 전용'}</span>
                                    ${studentView ? '<span class="text-[12px] font-extrabold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">학생 보기 기준</span>' : ''}
                                </div>
                                <h2 class="text-[24px] font-extrabold text-slate-900 tracking-tight">${escapeHtml(session.title)}</h2>
                                ${session.summary ? `<p class="text-[14px] text-slate-500 mt-2 leading-relaxed whitespace-pre-wrap">${withLineBreaks(session.summary)}</p>` : ''}
                            </div>
                            ${editSessionControls}
                        </div>
                    </div>
                    ${isEditableView ? renderQuickActions(session.id) : ''}
                    <div class="space-y-7">${groupsHtml}</div>
                </div>
            `;
        }

        window.renderLessonManager = function() {
            const container = document.getElementById('render-lesson-manager');
            if (!container) return;

            const isEditMode = getIsEditMode();
            if (!isEditMode) previewMode = false;
            const studentView = !isEditMode || previewMode;
            const isEditableView = isEditMode && !previewMode;
            renderModeStatus(isEditMode);

            const sessions = getSortedSessions(!studentView);
            const activeSession = getActiveSession(!studentView);

            container.innerHTML = `
                <div class="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6 items-start">
                    <aside class="xl:sticky xl:top-24 space-y-3">
                        <div class="flex items-center justify-between">
                            <h2 class="text-[14px] font-extrabold text-slate-700 flex items-center gap-2"><i data-lucide="calendar-days" class="w-4 h-4 text-figjam"></i> 수업 목록</h2>
                            <span class="text-[11px] font-bold text-slate-400">${sessions.length}개</span>
                        </div>
                        ${renderSessionRail(sessions, activeSession, isEditableView)}
                    </aside>
                    <section class="min-w-0">${renderSessionDetail(activeSession, isEditableView, studentView)}</section>
                </div>
            `;
            refreshIcons();
        };

        window.selectLessonSession = function(sessionId) {
            activeSessionId = sessionId;
            window.renderLessonManager();
        };

        window.toggleLessonPreview = function() {
            previewMode = !previewMode;
            window.renderLessonManager();
        };

        window.openLessonSessionModal = function(id = 'new') {
            if (!getIsEditMode()) return;
            const data = normalizeLessonData();
            const session = id === 'new'
                ? { id: 'new', date: todayString(), title: '', summary: '', isPublic: true }
                : data.sessions.find((item) => item.id === id);
            if (!session) return;

            document.getElementById('lsm-id').value = id;
            document.getElementById('lsm-date').value = session.date || todayString();
            document.getElementById('lsm-title').value = session.title || '';
            document.getElementById('lsm-summary').value = session.summary || '';
            document.getElementById('lsm-public').checked = session.isPublic !== false;
            document.getElementById('btn-lsm-delete')?.classList.toggle('hidden', id === 'new');
            openFadeModal('lesson-session-modal');
            refreshIcons();
        };

        window.closeLessonSessionModal = function() {
            closeFadeModal('lesson-session-modal');
        };

        window.saveLessonSession = function() {
            if (!getIsEditMode()) return;
            const id = document.getElementById('lsm-id').value;
            const title = document.getElementById('lsm-title').value.trim();
            if (!title) return showToast('수업 제목을 입력해주세요.');

            const data = normalizeLessonData();
            const session = {
                id: id === 'new' ? `lesson_${Date.now()}` : id,
                date: document.getElementById('lsm-date').value || todayString(),
                title,
                summary: document.getElementById('lsm-summary').value.trim(),
                isPublic: document.getElementById('lsm-public').checked,
                items: []
            };

            if (id === 'new') {
                data.sessions.push(session);
                activeSessionId = session.id;
            } else {
                const index = data.sessions.findIndex((item) => item.id === id);
                if (index > -1) {
                    session.items = data.sessions[index].items || [];
                    data.sessions[index] = session;
                    activeSessionId = session.id;
                }
            }

            setLessonData(data);
            window.closeLessonSessionModal();
            persistAndRender('수업 정보가 저장되었습니다.');
        };

        window.deleteLessonSession = function() {
            if (!getIsEditMode()) return;
            const id = document.getElementById('lsm-id').value;
            if (id === 'new' || !confirm('이 수업과 연결된 모든 항목을 삭제할까요?')) return;
            const data = normalizeLessonData();
            data.sessions = data.sessions.filter((session) => session.id !== id);
            activeSessionId = '';
            setLessonData(data);
            window.closeLessonSessionModal();
            persistAndRender('수업이 삭제되었습니다.');
        };

        window.toggleLessonSessionPublic = function(sessionId) {
            if (!getIsEditMode()) return;
            const data = normalizeLessonData();
            const session = data.sessions.find((item) => item.id === sessionId);
            if (!session) return;
            session.isPublic = !session.isPublic;
            setLessonData(data);
            persistAndRender(session.isPublic ? '수업을 공개했습니다.' : '수업을 숨겼습니다.');
        };

        window.openLessonItemModal = function(sessionId, type = 'material', id = 'new') {
            if (!getIsEditMode()) return;
            const data = normalizeLessonData();
            const session = data.sessions.find((item) => item.id === sessionId);
            if (!session) return;
            const item = id === 'new'
                ? { id: 'new', type, title: '', content: '', url: '', isPublic: true, isRequired: false }
                : session.items.find((entry) => entry.id === id);
            if (!item) return;

            document.getElementById('lim-session-id').value = sessionId;
            document.getElementById('lim-item-id').value = id;
            document.getElementById('lim-type').value = item.type || type;
            document.getElementById('lim-title').value = item.title || '';
            document.getElementById('lim-content').value = item.content || '';
            document.getElementById('lim-url').value = item.url || '';
            document.getElementById('lim-public').checked = item.isPublic !== false;
            document.getElementById('lim-required').checked = item.isRequired === true;
            document.getElementById('btn-lim-delete')?.classList.toggle('hidden', id === 'new');
            openFadeModal('lesson-item-modal');
            refreshIcons();
        };

        window.closeLessonItemModal = function() {
            closeFadeModal('lesson-item-modal');
        };

        window.saveLessonItem = function() {
            if (!getIsEditMode()) return;
            const sessionId = document.getElementById('lim-session-id').value;
            const id = document.getElementById('lim-item-id').value;
            const title = document.getElementById('lim-title').value.trim();
            if (!title) return showToast('항목 제목을 입력해주세요.');

            const data = normalizeLessonData();
            const session = data.sessions.find((item) => item.id === sessionId);
            if (!session) return;
            const now = new Date().toISOString();
            const nextItem = {
                id: id === 'new' ? `lesson_item_${Date.now()}` : id,
                type: document.getElementById('lim-type').value,
                title,
                content: document.getElementById('lim-content').value.trim(),
                url: document.getElementById('lim-url').value.trim(),
                isPublic: document.getElementById('lim-public').checked,
                isRequired: document.getElementById('lim-required').checked,
                createdAt: now,
                updatedAt: now
            };

            if (id === 'new') session.items.push(nextItem);
            else {
                const index = session.items.findIndex((item) => item.id === id);
                if (index > -1) {
                    nextItem.createdAt = session.items[index].createdAt || now;
                    session.items[index] = nextItem;
                }
            }

            setLessonData(data);
            window.closeLessonItemModal();
            persistAndRender('수업 항목이 저장되었습니다.');
        };

        window.deleteLessonItem = function() {
            if (!getIsEditMode()) return;
            const sessionId = document.getElementById('lim-session-id').value;
            const itemId = document.getElementById('lim-item-id').value;
            if (itemId === 'new' || !confirm('이 수업 항목을 삭제할까요?')) return;
            const data = normalizeLessonData();
            const session = data.sessions.find((item) => item.id === sessionId);
            if (!session) return;
            session.items = session.items.filter((item) => item.id !== itemId);
            setLessonData(data);
            window.closeLessonItemModal();
            persistAndRender('수업 항목이 삭제되었습니다.');
        };

        window.toggleLessonItemPublic = function(sessionId, itemId) {
            if (!getIsEditMode()) return;
            const data = normalizeLessonData();
            const session = data.sessions.find((item) => item.id === sessionId);
            const item = session?.items.find((entry) => entry.id === itemId);
            if (!item) return;
            item.isPublic = !item.isPublic;
            item.updatedAt = new Date().toISOString();
            setLessonData(data);
            persistAndRender(item.isPublic ? '항목을 공개했습니다.' : '항목을 숨겼습니다.');
        };
    }

    window.UIUXA_LESSON_MANAGEMENT_VIEW = { install: installLessonManagementView };
})();
