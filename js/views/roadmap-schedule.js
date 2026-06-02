(function() {
    const levelIds = ['basic', 'advanced'];
    const refreshIcons = () => window.lucide?.createIcons();
    const showToast = (message) => window.showToast?.(message);
    const saveToCloud = () => window.saveToFirebase?.();
    const escapeHtml = (value) => String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    const dateInfoHasContent = (dateInfo = {}) => Boolean(dateInfo.title || dateInfo.noticeId || dateInfo.toolCardId || dateInfo.memoContent);
    const formatDateText = (dateString = '') => String(dateString).replace(/-/g, '. ');

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

    function findToolCard(toolData, toolTabs, cardId) {
        let found = null;
        (toolTabs || []).forEach((tab) => {
            (tab.levels || levelIds).forEach((levelId) => {
                const card = (toolData[tab.id]?.[levelId] || []).find((item) => item.id === cardId);
                if (card) found = { card, toolId: tab.id, levelId, toolLabel: tab.label };
            });
        });
        return found;
    }

    function fillLinkedSelects(noticeData, toolData, toolTabs, noticeSelect, toolSelect, selected = {}) {
        noticeSelect.innerHTML = '<option value="">연결 안함</option>';
        (noticeData.posts || []).forEach((post) => {
            noticeSelect.innerHTML += `<option value="${post.id}">${post.title}</option>`;
        });
        noticeSelect.value = selected.noticeId || '';

        toolSelect.innerHTML = '<option value="">연결 안함</option>';
        (toolTabs || []).forEach((tab) => {
            (tab.levels || levelIds).forEach((levelId) => {
                (toolData[tab.id]?.[levelId] || []).forEach((card) => {
                    toolSelect.innerHTML += `<option value="${card.id}">[${tab.label}] ${card.title}</option>`;
                });
            });
        });
        toolSelect.value = selected.toolCardId || '';
    }

    function installRoadmapScheduleView(context) {
        const {
            actionAttrs,
            getIsEditMode,
            getRoadmapData,
            setRoadmapData,
            getToolTabs,
            getToolData,
            getNoticeData,
            getScheduleData,
            setScheduleData,
            getDateData,
            getCurrentCalendarDate,
            getCurrentScheduleDate
        } = context;

        let hasCheckedTodayDateAlert = false;

        const renderCalGrid = function(calendarDate, gridId, captionId, minHeightClass) {
            const grid = document.getElementById(gridId);
            if (!grid) return;

            const roadmapData = getRoadmapData();
            const scheduleData = getScheduleData();
            const dateData = getDateData();
            const isEditMode = getIsEditMode();
            const year = calendarDate.getFullYear();
            const month = calendarDate.getMonth();
            const today = new Date();
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            grid.innerHTML = '';
            document.getElementById(captionId).textContent = `${year}. ${String(month + 1).padStart(2, '0')}`;

            for (let index = 0; index < firstDay; index++) {
                grid.innerHTML += `<div class="bg-slate-50 ${minHeightClass} p-2 opacity-50"></div>`;
            }

            for (let day = 1; day <= daysInMonth; day++) {
                const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const weekday = new Date(year, month, day).getDay();
                const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
                let dayClass = 'text-slate-700 font-bold';
                if (isToday) dayClass = 'bg-figjam text-white w-7 h-7 flex items-center justify-center rounded-full shadow-md';
                else if (weekday === 0) dayClass = 'text-red-500 font-bold';
                else if (weekday === 6) dayClass = 'text-blue-500 font-bold';

                let scheduleHtml = '';
                (roadmapData.unitSchedules || [])
                    .filter((unit) => dateString >= unit.startDate && dateString <= unit.endDate)
                    .forEach((unit) => {
                        scheduleHtml += `<div class="mt-1 flex flex-col gap-1"><span class="text-[10px] font-bold bg-${unit.color}-50 text-${unit.color}-500 px-1 py-0.5 rounded border border-${unit.color}-100/50 truncate">${unit.title}</span></div>`;
                    });

                scheduleData.filter((event) => event.date === dateString).forEach((event) => {
                    let icons = '';
                    if (event.noticeId) icons += '<i data-lucide="bell" class="w-3 h-3"></i>';
                    if (event.toolCardId) icons += '<i data-lucide="image" class="w-3 h-3"></i>';
                    if (event.memoContent) icons += '<i data-lucide="file-text" class="w-3 h-3"></i>';
                    const action = isEditMode
                        ? actionAttrs('openScheduleModal', [dateString, event.id], { stop: true })
                        : actionAttrs('openGeneralViewModal', ['event', event.id], { stop: true });
                    scheduleHtml += `<div ${action} class="mt-1.5 flex flex-col gap-1 cursor-pointer hover:opacity-80"><span class="text-[11px] font-bold bg-${event.color}-50 text-${event.color}-600 px-1.5 py-1 rounded flex items-center gap-1 border border-${event.color}-100"><span class="w-1.5 h-1.5 rounded-full bg-${event.color}-500 shrink-0"></span><span class="truncate">${event.title}</span><span class="flex gap-0.5 ml-auto opacity-70">${icons}</span></span></div>`;
                });

                const dateInfo = dateData[dateString] || {};
                let dateIcons = '';
                if (dateInfo.noticeId) dateIcons += '<i data-lucide="bell" class="w-3 h-3 text-orange-500"></i>';
                if (dateInfo.toolCardId) dateIcons += '<i data-lucide="image" class="w-3 h-3 text-blue-500"></i>';
                if (dateInfo.memoContent) dateIcons += `<button type="button" ${actionAttrs('openGeneralViewModal', ['date', dateString], { stop: true })} class="text-indigo-500 hover:text-figjam rounded"><i data-lucide="file-text" class="w-3 h-3"></i></button>`;
                const dateIconHtml = dateIcons ? `<span class="flex gap-1 ml-1 bg-slate-100 px-1 rounded">${dateIcons}</span>` : '';
                const hasDateInfo = dateInfoHasContent(dateInfo);
                const dateAction = isEditMode ? actionAttrs('openDateEditModal', [dateString]) : (hasDateInfo ? actionAttrs('openGeneralViewModal', ['date', dateString]) : '');
                const cellClass = isEditMode || hasDateInfo ? 'cursor-pointer hover:bg-slate-50 hover:ring-2 hover:ring-figjam/50 hover:z-10' : '';
                const dateTitleAction = isEditMode ? actionAttrs('openDateEditModal', [dateString], { stop: true }) : actionAttrs('openGeneralViewModal', ['date', dateString], { stop: true });
                const dateTitleHtml = dateInfo.title
                    ? `<button type="button" ${dateTitleAction} class="mt-1 flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded px-1.5 py-1 truncate hover:border-figjam"><i data-lucide="calendar-check" class="w-3 h-3 shrink-0"></i><span class="truncate">${escapeHtml(dateInfo.title)}</span></button>`
                    : '';

                grid.innerHTML += `<div class="bg-white ${minHeightClass} p-2 border-t border-transparent relative flex flex-col group ${cellClass}" ${dateAction}><div class="flex items-center mb-1"><span class="text-[14px] ${isToday ? 'flex justify-center w-full' : 'ml-1'}"><span class="${dayClass} ${!isToday ? 'inline-block' : ''}">${day}</span></span>${!isToday ? dateIconHtml : ''}</div>${isToday ? `<div class="flex justify-center w-full mb-1">${dateIconHtml}</div>` : ''}${dateTitleHtml}${scheduleHtml}${isEditMode ? `<button ${actionAttrs('openScheduleModal', [dateString], { stop: true })} class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-figjam bg-white rounded-full shadow-sm p-0.5"><i data-lucide="plus" class="w-4 h-4"></i></button>` : ''}</div>`;
            }

            const remainder = (7 - ((firstDay + daysInMonth) % 7)) % 7;
            for (let index = 0; index < remainder; index++) {
                grid.innerHTML += `<div class="bg-slate-50 ${minHeightClass} p-2 opacity-50"></div>`;
            }
            refreshIcons();
        };

        window.renderTodayTask = function() {
            const container = document.getElementById('render-today-task');
            if (!container) return;

            const todayTask = getRoadmapData().todayTask;
            const editButton = getIsEditMode() ? `<button ${actionAttrs('openTodayModal')} class="absolute top-4 right-4 text-slate-400 hover:text-figjam z-20 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-all opacity-0 group-hover/today:opacity-100"><i data-lucide="edit" class="w-4 h-4"></i></button>` : '';
            const description = todayTask.desc ? todayTask.desc.split('\n').map((line) => `<li>${line}</li>`).join('') : '';
            const primaryAction = todayTask.cardId ? `href="#" ${actionAttrs('goToToolCard', [todayTask.cardId, ''], { prevent: true })}` : 'href="#"';
            const primaryButton = todayTask.bText1 ? `<a ${primaryAction} class="flex items-center justify-center w-full md:w-auto min-w-[160px] gap-2 px-5 py-3.5 bg-white border-2 border-figjam text-figjam hover:bg-figjam hover:text-white rounded-xl font-bold shadow-sm text-[14px] transition-colors"><i data-lucide="arrow-right-circle" class="w-5 h-5"></i> ${todayTask.bText1}</a>` : '';
            const secondaryButton = todayTask.bText2 ? `<a href="${todayTask.bUrl2 || '#'}" ${todayTask.bUrl2 && !todayTask.bUrl2.startsWith('javascript:') ? 'target="_blank"' : ''} class="flex items-center justify-center w-full md:w-auto min-w-[160px] gap-2 px-5 py-3.5 bg-figjam text-white hover:bg-[#7c4ced] rounded-xl font-bold shadow-md text-[14px]"><i data-lucide="check-square" class="w-5 h-5"></i> ${todayTask.bText2}</a>` : '';

            container.innerHTML = `<div class="bg-white rounded-[24px] border border-slate-100 shadow-soft p-8 relative overflow-hidden group/today">${editButton}<div class="absolute top-0 left-0 w-1.5 h-full bg-figjam"></div><div class="flex flex-col md:flex-row md:items-start justify-between gap-6"><div class="flex-1 space-y-4"><div><h3 class="text-[20px] font-bold text-slate-800">${todayTask.title}</h3><p class="text-[14px] text-slate-500 font-medium flex items-center gap-1.5 mt-1.5"><i data-lucide="clock" class="w-4 h-4"></i> 기한: ${todayTask.deadline}</p></div><div class="bg-slate-50 rounded-xl p-5 border border-slate-100"><h4 class="text-[13px] font-bold text-slate-700 mb-2">과제 내용:</h4><ul class="text-[14px] text-slate-600 space-y-1.5 list-none marker:text-slate-400">${description}</ul></div></div><div class="flex-shrink-0 mt-2 md:mt-0 flex flex-col gap-2.5">${primaryButton}${secondaryButton}</div></div></div>`;
        };

        window.openTodayModal = function() {
            const todayTask = getRoadmapData().todayTask;
            document.getElementById('ttm-title').value = todayTask.title || '';
            document.getElementById('ttm-deadline').value = todayTask.deadline || '';
            document.getElementById('ttm-desc').value = todayTask.desc || '';
            document.getElementById('ttm-bText1').value = todayTask.bText1 || '';
            document.getElementById('ttm-bText2').value = todayTask.bText2 || '';
            document.getElementById('ttm-bUrl2').value = todayTask.bUrl2 || '';

            const cardSelect = document.getElementById('ttm-cardId');
            if (cardSelect) {
                cardSelect.innerHTML = `<option value="">연결 안함</option>`;
                (getToolTabs() || []).forEach((tab) => {
                    (tab.levels || levelIds).forEach((levelId) => {
                        (getToolData()[tab.id]?.[levelId] || []).forEach((card) => {
                            const selected = todayTask.cardId === card.id ? 'selected' : '';
                            cardSelect.innerHTML += `<option value="${card.id}" ${selected}>[${tab.label}] ${card.title}</option>`;
                        });
                    });
                });
            }
            openFadeModal('today-task-modal');
        };

        window.closeTodayModal = function() {
            closeFadeModal('today-task-modal');
        };

        window.saveTodayModal = function() {
            const roadmapData = getRoadmapData();
            roadmapData.todayTask = {
                title: document.getElementById('ttm-title').value.trim(),
                deadline: document.getElementById('ttm-deadline').value.trim(),
                desc: document.getElementById('ttm-desc').value.trim(),
                bText1: document.getElementById('ttm-bText1').value.trim(),
                bUrl1: '',
                bText2: document.getElementById('ttm-bText2').value.trim(),
                bUrl2: document.getElementById('ttm-bUrl2').value.trim(),
                cardId: document.getElementById('ttm-cardId').value
            };
            setRoadmapData(roadmapData);
            saveToCloud();
            window.renderTodayTask();
            window.renderAllToolCards();
            window.closeTodayModal();
            showToast('저장됨');
        };

        window.toggleDailyTaskVisibility = function(id) {
            const roadmapData = getRoadmapData();
            const index = roadmapData.dailyTasks.findIndex((task) => task.id === id);
            if (index > -1) {
                roadmapData.dailyTasks[index].isHidden = !roadmapData.dailyTasks[index].isHidden;
                saveToCloud();
                window.renderDailyTasks();
            }
        };

        window.renderDailyTasks = function() {
            const container = document.getElementById('render-daily-tasks');
            if (!container) return;

            const statusClasses = {
                '완료': { bg: 'bg-emerald-50', text: 'text-emerald-500', label: 'bg-emerald-50' },
                '진행중': { bg: 'bg-blue-50', text: 'text-blue-500', label: 'bg-blue-50' },
                '대기': { bg: 'bg-slate-100', text: 'text-slate-500', label: 'bg-slate-100' }
            };
            const isEditMode = getIsEditMode();
            container.innerHTML = '';

            getRoadmapData().dailyTasks.forEach((task) => {
                if (!isEditMode && task.isHidden) return;
                const status = statusClasses[task.status] || statusClasses['대기'];
                const hiddenClass = task.isHidden ? 'opacity-50 grayscale' : '';
                const editButton = isEditMode ? `<div class="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover/daily:opacity-100 z-20"><button ${actionAttrs('toggleDailyTaskVisibility', [task.id])} class="text-slate-400 hover:text-amber-500 bg-slate-50 p-1.5 rounded-lg shadow-sm"><i data-lucide="${task.isHidden ? 'eye-off' : 'eye'}" class="w-4 h-4"></i></button><button ${actionAttrs('openDailyModal', [task.id])} class="text-slate-400 hover:text-figjam bg-slate-50 p-1.5 rounded-lg shadow-sm"><i data-lucide="edit" class="w-4 h-4"></i></button></div>` : '';
                const buttonHtml = task.link ? `<a href="${task.link}" target="_blank" class="flex justify-center gap-1.5 py-2.5 bg-figjam text-white rounded-xl text-[13px] font-bold mt-auto"><i data-lucide="check-square" class="w-4 h-4"></i> 제출하기</a>` : '<div class="mt-auto"></div>';
                container.innerHTML += `<div class="bg-white p-6 rounded-[24px] border border-slate-100 shadow-soft hover:shadow-hover transition-all flex flex-col relative group/daily min-h-[180px] ${hiddenClass}">${editButton}<div class="flex justify-between items-start mb-5"><div class="w-11 h-11 rounded-[14px] ${status.bg} ${status.text} flex items-center justify-center"><i data-lucide="${task.icon || 'circle'}" class="w-5 h-5"></i></div><span class="text-[11px] font-bold text-slate-600 ${status.label} px-3 py-1.5 rounded-md">${task.status}</span></div><h3 class="font-bold text-slate-800 text-[15px] leading-tight mb-4">${task.title}</h3>${buttonHtml}</div>`;
            });
            if (isEditMode) container.innerHTML += `<div ${actionAttrs('openDailyModal', ['new'])} class="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[24px] p-6 flex flex-col items-center justify-center text-slate-400 hover:text-figjam cursor-pointer min-h-[180px]"><i data-lucide="plus-circle" class="w-8 h-8 mb-2"></i><span class="font-bold text-[14px]">추가</span></div>`;
        };

        window.openDailyModal = function(id) {
            document.getElementById('dtm-id').value = id;
            let task = { status: '진행중', icon: 'pen-tool', title: '', link: '' };
            if (id !== 'new') task = getRoadmapData().dailyTasks.find((item) => item.id === id) || task;
            document.getElementById('dtm-status').value = task.status;
            document.getElementById('dtm-icon').value = task.icon;
            document.getElementById('dtm-title').value = task.title;
            document.getElementById('dtm-link').value = task.link;
            document.getElementById('btn-dtm-delete')?.classList.toggle('hidden', id === 'new');
            openFadeModal('daily-task-modal');
        };

        window.closeDailyModal = function() {
            closeFadeModal('daily-task-modal');
        };

        window.saveDailyModal = function() {
            const id = document.getElementById('dtm-id').value;
            const title = document.getElementById('dtm-title').value.trim();
            if (!title) return showToast('제목입력');

            const roadmapData = getRoadmapData();
            const task = {
                id: id === 'new' ? `dt_${Date.now()}` : id,
                status: document.getElementById('dtm-status').value,
                icon: document.getElementById('dtm-icon').value,
                title,
                link: document.getElementById('dtm-link').value.trim(),
                isHidden: false
            };
            if (id === 'new') roadmapData.dailyTasks.push(task);
            else {
                const index = roadmapData.dailyTasks.findIndex((item) => item.id === id);
                if (index > -1) {
                    task.isHidden = roadmapData.dailyTasks[index].isHidden;
                    roadmapData.dailyTasks[index] = task;
                }
            }
            setRoadmapData(roadmapData);
            saveToCloud();
            window.renderDailyTasks();
            window.closeDailyModal();
            showToast('저장됨');
        };

        window.deleteDailyTask = function() {
            const id = document.getElementById('dtm-id').value;
            const roadmapData = getRoadmapData();
            roadmapData.dailyTasks = roadmapData.dailyTasks.filter((task) => task.id !== id);
            setRoadmapData(roadmapData);
            saveToCloud();
            window.renderDailyTasks();
            window.closeDailyModal();
            showToast('삭제됨');
        };

        window.updateCourseProgress = function() {
            const startDate = new Date('2026-05-20T00:00:00');
            const endDate = new Date('2026-12-02T23:59:59');
            const today = new Date();
            const total = endDate.getTime() - startDate.getTime();
            const elapsed = Math.max(0, Math.min(today.getTime() - startDate.getTime(), total));
            const percent = Math.floor((elapsed / total) * 100);

            const percentElement = document.getElementById('course-progress-percent');
            const barElement = document.getElementById('course-progress-bar');
            if (percentElement) percentElement.textContent = `${percent}%`;
            if (barElement) barElement.style.width = `${percent}%`;

            const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
            const diff = Math.ceil((endOnly - todayOnly) / (1000 * 60 * 60 * 24));
            const dday = document.getElementById('course-dday');
            if (dday) dday.textContent = diff > 0 ? `D-${diff}` : (diff === 0 ? 'D-Day' : '종료');

            const todayLabel = document.getElementById('course-today-label');
            if (todayLabel) todayLabel.innerHTML = `오늘 (${String(today.getFullYear()).slice(-2)}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')})<div class="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-figjam rounded-full"></div>`;
        };

        window.prevMonth = function() {
            getCurrentCalendarDate().setMonth(getCurrentCalendarDate().getMonth() - 1);
            window.renderCalendar();
        };

        window.nextMonth = function() {
            getCurrentCalendarDate().setMonth(getCurrentCalendarDate().getMonth() + 1);
            window.renderCalendar();
        };

        window.renderCalendar = function() {
            renderCalGrid(getCurrentCalendarDate(), 'calendar-grid', 'calendar-month-year', 'min-h-[100px]');
        };

        window.renderUnitSchedules = function() {
            const container = document.getElementById('render-unit-schedules');
            if (!container) return;

            const roadmapData = getRoadmapData();
            const today = new Date();
            const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            container.innerHTML = '';

            (roadmapData.unitSchedules || []).forEach((unit) => {
                let status = '예정';
                let color = 'slate';
                if (todayString > unit.endDate) status = '완료';
                else if (todayString >= unit.startDate && todayString <= unit.endDate) {
                    status = '진행중';
                    color = 'indigo';
                }
                unit.status = status;
                unit.color = color;
                const colors = unit.color === 'indigo'
                    ? { bg: 'bg-indigo-50/60', border: 'border-indigo-100', text: 'text-indigo-900', label: 'bg-white text-indigo-600', dot: 'bg-indigo-500', ping: 'bg-indigo-400' }
                    : { bg: 'hover:bg-slate-50 border-transparent', border: '', text: 'text-slate-700', label: 'bg-slate-100 text-slate-500', dot: 'bg-slate-300', ping: '' };
                const dot = unit.status === '진행중' ? `<span class="relative flex h-3 w-3 shrink-0"><span class="animate-ping absolute h-full w-full rounded-full ${colors.ping} opacity-75"></span><span class="relative rounded-full h-3 w-3 ${colors.dot}"></span></span>` : `<span class="w-2.5 h-2.5 rounded-full ${colors.dot}"></span>`;
                container.innerHTML += `<div class="flex flex-col lg:flex-row lg:items-center justify-between p-4 px-5 rounded-2xl ${colors.bg} border ${colors.border} shadow-sm"><div class="flex items-center gap-3 mb-2 lg:mb-0">${dot}<span class="font-bold text-[15px] ${colors.text}">${unit.title}</span></div><div class="flex items-center gap-3"><span class="text-[12px] font-bold ${colors.label} px-2 py-1 rounded shadow-sm">${unit.status}</span><span class="text-[13px] ${unit.color === 'indigo' ? 'text-indigo-600' : 'text-slate-500'} font-semibold">${unit.startDate.replace(/-/g, '.')} ~ ${unit.endDate.replace(/-/g, '.')}</span></div></div>`;
            });
        };

        window.renderRoadmap = function() {
            window.renderTodayTask();
            window.renderDailyTasks();
            window.renderUnitSchedules();
            window.renderCalendar();
            refreshIcons();
        };

        window.prevScheduleMonth = function() {
            getCurrentScheduleDate().setMonth(getCurrentScheduleDate().getMonth() - 1);
            window.renderFullCalendar();
        };

        window.nextScheduleMonth = function() {
            getCurrentScheduleDate().setMonth(getCurrentScheduleDate().getMonth() + 1);
            window.renderFullCalendar();
        };

        window.renderFullCalendar = function() {
            renderCalGrid(getCurrentScheduleDate(), 'full-calendar-grid', 'full-calendar-month-year', 'min-h-[140px]');
        };

        window.openScheduleModal = function(dateString, id = null) {
            document.getElementById('shm-date').value = dateString;
            document.getElementById('shm-id').value = id || 'new';

            const noticeSelect = document.getElementById('shm-noticeId');
            const toolSelect = document.getElementById('shm-toolCardId');
            const memoContent = document.getElementById('shm-memoContent');
            const deleteButton = document.getElementById('btn-shm-delete');

            fillLinkedSelects(getNoticeData(), getToolData(), getToolTabs(), noticeSelect, toolSelect);
            if (id) {
                const event = getScheduleData().find((item) => item.id === id);
                if (event) {
                    document.getElementById('shm-title').value = event.title;
                    const colorRadio = document.querySelector(`input[name="shm-color"][value="${event.color}"]`);
                    if (colorRadio) colorRadio.checked = true;
                    noticeSelect.value = event.noticeId || '';
                    toolSelect.value = event.toolCardId || '';
                    memoContent.value = event.memoContent || '';
                }
                deleteButton.classList.remove('hidden');
            } else {
                document.getElementById('shm-title').value = '';
                document.querySelector('input[name="shm-color"][value="figjam"]').checked = true;
                noticeSelect.value = '';
                toolSelect.value = '';
                memoContent.value = '';
                deleteButton.classList.add('hidden');
            }
            openFadeModal('schedule-edit-modal');
        };

        window.closeScheduleModal = function() {
            closeFadeModal('schedule-edit-modal');
        };

        window.saveSchedule = function() {
            const id = document.getElementById('shm-id').value;
            const title = document.getElementById('shm-title').value.trim();
            if (!title) return showToast('입력요망');

            const event = {
                id: id === 'new' ? `sch_${Date.now()}` : id,
                date: document.getElementById('shm-date').value,
                title,
                color: document.querySelector('input[name="shm-color"]:checked').value,
                noticeId: document.getElementById('shm-noticeId').value,
                toolCardId: document.getElementById('shm-toolCardId').value,
                memoContent: document.getElementById('shm-memoContent').value.trim()
            };

            const scheduleData = getScheduleData();
            if (id === 'new') scheduleData.push(event);
            else {
                const index = scheduleData.findIndex((item) => item.id === id);
                if (index > -1) scheduleData[index] = event;
            }
            saveToCloud();
            window.renderFullCalendar();
            window.renderCalendar();
            window.closeScheduleModal();
            showToast('저장됨');
        };

        window.deleteSchedule = function() {
            const id = document.getElementById('shm-id').value;
            setScheduleData(getScheduleData().filter((event) => event.id !== id));
            saveToCloud();
            window.renderFullCalendar();
            window.renderCalendar();
            window.closeScheduleModal();
            showToast('삭제됨');
        };

        window.openDateEditModal = function(dateString) {
            document.getElementById('dem-date').value = dateString;
            const dateInfo = getDateData()[dateString] || {};
            fillLinkedSelects(getNoticeData(), getToolData(), getToolTabs(), document.getElementById('dem-noticeId'), document.getElementById('dem-toolCardId'), dateInfo);
            document.getElementById('dem-title').value = dateInfo.title || '';
            document.getElementById('dem-memoContent').value = dateInfo.memoContent || '';
            openFadeModal('date-edit-modal');
        };

        window.closeDateEditModal = function() {
            closeFadeModal('date-edit-modal');
        };

        window.saveDateEditModal = function() {
            const dateString = document.getElementById('dem-date').value;
            const title = document.getElementById('dem-title').value.trim();
            const noticeId = document.getElementById('dem-noticeId').value;
            const toolCardId = document.getElementById('dem-toolCardId').value;
            const memoContent = document.getElementById('dem-memoContent').value.trim();
            const dateData = getDateData();
            if (!title && !noticeId && !toolCardId && !memoContent) delete dateData[dateString];
            else dateData[dateString] = { title, noticeId, toolCardId, memoContent };
            saveToCloud();
            window.renderFullCalendar();
            window.renderCalendar();
            window.closeDateEditModal();
            showToast('저장됨');
        };

        window.openGeneralViewModal = function(type, payload) {
            const dateData = getDateData();
            const scheduleData = getScheduleData();
            const noticeData = getNoticeData();
            const toolData = getToolData();
            let title = '';
            let dateText = '';
            let target = null;

            if (type === 'date') {
                target = dateData[payload] || {};
                title = target.title || '날짜 메모';
                dateText = formatDateText(payload);
            } else {
                target = scheduleData.find((event) => event.id === payload) || {};
                title = target.title;
                dateText = formatDateText(target.date);
            }

            document.getElementById('gvm-title').textContent = title;
            document.getElementById('gvm-date').textContent = dateText;
            const links = document.getElementById('gvm-links');
            links.innerHTML = '';
            let hasContent = false;

            if (target.memoContent) {
                hasContent = true;
                links.innerHTML += `<div class="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl mb-3"><div class="flex gap-2 mb-2 text-indigo-600"><i data-lucide="file-text" class="w-4 h-4"></i><span class="text-xs font-bold">작성 메모</span></div><div class="text-[13px] text-slate-700 whitespace-pre-wrap">${escapeHtml(target.memoContent)}</div></div>`;
            }
            if (target.noticeId) {
                const notice = noticeData.posts.find((post) => post.id === target.noticeId);
                if (notice) {
                    hasContent = true;
                    links.innerHTML += `<button ${actionAttrs('openLinkedNoticeFromView', [notice.id])} class="w-full flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-figjam rounded-xl transition-all text-left mb-2"><div class="flex gap-3"><div class="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex justify-center items-center"><i data-lucide="bell" class="w-4 h-4"></i></div><div><p class="text-[11px] font-bold text-slate-400">공지사항</p><p class="text-[14px] font-bold text-slate-700 truncate max-w-[200px]">${notice.title}</p></div></div><i data-lucide="chevron-right" class="w-4 h-4 text-slate-300"></i></button>`;
                }
            }
            if (target.toolCardId) {
                const match = findToolCard(toolData, getToolTabs(), target.toolCardId);
                if (match) {
                    hasContent = true;
                    links.innerHTML += `<button ${actionAttrs('openLinkedToolCardFromView', [match.toolId, match.levelId, match.card.id])} class="w-full flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-figjam rounded-xl transition-all text-left mb-2"><div class="flex gap-3"><div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex justify-center items-center"><i data-lucide="image" class="w-4 h-4"></i></div><div><p class="text-[11px] font-bold text-slate-400">Tool 카드</p><p class="text-[14px] font-bold text-slate-700 truncate max-w-[200px]">[${match.toolId}] ${match.card.title}</p></div></div><i data-lucide="chevron-right" class="w-4 h-4 text-slate-300"></i></button>`;
                }
            }

            if (!hasContent) links.innerHTML = '<p class="text-sm text-slate-400 text-center py-4">연결된 항목이나 작성된 메모가 없습니다.</p>';
            openFadeModal('general-view-modal');
            refreshIcons();
        };

        window.checkTodayDateAlert = function() {
            if (hasCheckedTodayDateAlert) return;
            hasCheckedTodayDateAlert = true;

            const today = new Date();
            const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const todayInfo = getDateData()[todayString];
            if (!dateInfoHasContent(todayInfo)) return;

            const openTodayAlert = () => {
                const globalNotice = document.getElementById('global-notice-modal');
                if (globalNotice?.classList.contains('flex')) {
                    setTimeout(openTodayAlert, 800);
                    return;
                }
                window.openGeneralViewModal('date', todayString);
            };

            setTimeout(openTodayAlert, 650);
        };

        window.closeViewModal = function() {
            closeFadeModal('general-view-modal');
        };

        window.openLinkedNoticeFromView = function(id) {
            window.closeViewModal();
            window.switchTab('notice');
            window.openNoticeViewModal(id);
        };

        window.openLinkedToolCardFromView = function(toolId, levelId, cardId) {
            window.closeViewModal();
            window.switchTab('tool');
            window.switchTool(toolId);
            window.switchLevel(toolId, levelId);
            setTimeout(() => {
                const card = document.querySelector(`[data-card-id="${cardId}"]`);
                if (!card) return;
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                card.classList.add('ring-4', 'ring-figjam');
                setTimeout(() => card.classList.remove('ring-4', 'ring-figjam'), 300);
            }, 150);
        };
    }

    window.UIUXA_ROADMAP_SCHEDULE_VIEW = { install: installRoadmapScheduleView };
})();
