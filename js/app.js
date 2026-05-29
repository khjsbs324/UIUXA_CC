

    const defaultUnitSchedules = [
        {id:'us_1',title:'구현',startDate:'2026-05-21',endDate:'2026-06-12',status:'예정',color:'slate'},
        {id:'us_2',title:'시각디자인 리서치 조사',startDate:'2026-05-21',endDate:'2026-06-05',status:'예정',color:'slate'},
        {id:'us_3',title:'시각디자인 리서치 분석',startDate:'2026-06-08',endDate:'2026-06-19',status:'예정',color:'slate'},
        {id:'us_4',title:'구현 응용',startDate:'2026-06-15',endDate:'2026-07-03',status:'예정',color:'slate'},
        {id:'us_5',title:'시안 디자인 개발 심화',startDate:'2026-06-22',endDate:'2026-07-03',status:'예정',color:'slate'},
        {id:'us_6',title:'디자인 구성요소 설계',startDate:'2026-07-06',endDate:'2026-07-24',status:'예정',color:'slate'},
        {id:'us_7',title:'수정 보완',startDate:'2026-07-06',endDate:'2026-08-18',status:'예정',color:'slate'},
        {id:'us_8',title:'디자인 구성요소 제작',startDate:'2026-07-24',endDate:'2026-08-20',status:'예정',color:'slate'},
        {id:'us_9',title:'디지털디자인 사후관리',startDate:'2026-08-21',endDate:'2026-08-28',status:'예정',color:'slate'},
        {id:'us_10',title:'서비스ㆍ경험디자인 관찰조사',startDate:'2026-08-31',endDate:'2026-09-03',status:'예정',color:'slate'},
        {id:'us_11',title:'서비스ㆍ경험디자인 시나리오 개발',startDate:'2026-09-04',endDate:'2026-09-11',status:'예정',color:'slate'},
        {id:'us_12',title:'프로토타입 기초데이터 수집 및 스케치',startDate:'2026-09-14',endDate:'2026-09-21',status:'예정',color:'slate'},
        {id:'us_13',title:'프로토타입 제작 및 사용성 테스트',startDate:'2026-09-22',endDate:'2026-10-07',status:'예정',color:'slate'},
        {id:'us_14',title:'(비NCS 실기)AI 기획과 발상',startDate:'2026-10-08',endDate:'2026-10-12',status:'예정',color:'slate'},
        {id:'us_15',title:'스마트문화앱 UI 디자인',startDate:'2026-10-13',endDate:'2026-11-03',status:'예정',color:'slate'},
        {id:'us_16',title:'(비NCS 실기)취업포트폴리오 제작',startDate:'2026-11-04',endDate:'2026-12-01',status:'예정',color:'slate'}
    ];

    const studentsList = ['강민경','김정은','김지선','박주연','박찬미','이은경','이은수','이지희','임연우','최지혜','허지민'];
    const defaultWorkspaceData = studentsList.map((n,i)=>({
        id:'ws_'+i, name:n, avatar:n.charAt(0), email:'abcd123@gmail.com', links:[{name:'브랜딩',url:'#',icon:'layout'}]
    }));

    let isEditMode = false; let myChart = null; let currentEditingStudent = ''; let hasCheckedGlobalPopup = false;
    let currentTabId = 'roadmap'; let currentToolLayout = 'grid'; let currentDesignFilter = 'all'; let currentSortOrder = 'newest';
    let noticeData = {posts:[{id:'n_1',title:'UIUX 개강 안내',content:'개강을 환영합니다!\n잘 부탁드립니다.',date:'2026.05.20'}],activePopupId:'n_1'};
    let memoData = []; let designFilters = ['리서치','리서치와 브랜딩','브랜딩','설계','패키지']; let studentComments = {};
    let currentMemoTool = 'photoshop'; let currentMemoLevel = 'basic'; let currentViewMemoId = null; let currentDeleteMemoId = null; let currentDeleteToolCardInfo = null;
    let pwdActionType = 'editMode'; let pwdActionPayload = null; let teacherWritePassword = ''; let noticeDeleteTimer = null; let scrollDirection = 'down'; let lastScrollTopPos = 0; let scrollHideTimeout = null;
    let currentCalendarDate = new Date(); let currentScheduleDate = new Date();

    // 수업 게시판 글로벌 상태 변수 정의
    let boardData = [];
    let selectedBoardFile = null;
    let currentEditingPostId = null;

    let roadmapData = {
        todayTask: {title:"일러스트 심화과제",deadline:"~2026.04.24(금)",desc:"과제 안내",bText1:"자료이동",bUrl1:"",bText2:"제출",bUrl2:"#",cardId:"il_a_1"},
        dailyTasks: [{id:'dt_1',status:'완료',icon:'check-circle',title:'Design Copy',link:'',isHidden:false}],
        unitSchedules: JSON.parse(JSON.stringify(defaultUnitSchedules))
    };
    let toolData = {photoshop:{basic:[],advanced:[]},illustrator:{basic:[],advanced:[{id:'il_a_1',badge:'[라인]',title:'라인 일러스트',category:'',desc:'',links:[],buttons:[],badgeRight:'',isHidden:false}]},figma:{basic:[],advanced:[]},design:{basic:[],advanced:[]}};
    const tasksList = ['로고','패키지 초안','Web Wire']; const studentColors = ['#ef4444','#f97316','#f59e0b','#84cc16','#22c55e','#10b981','#06b6d4','#0ea5e9','#3b82f6','#6366f1','#8b5cf6'];
    const studentColorClass = (index) => `student-color-${(index % studentColors.length) + 1}`;
    let menuOrder = ['notice','roadmap','progress','tool','workspace','schedule','board'];
    let workspaceData = JSON.parse(JSON.stringify(defaultWorkspaceData));
    let progressData = {}; studentsList.forEach(s=>{progressData[s]={};studentComments[s]="";tasksList.forEach(t=>progressData[s][t]=0);});

    let scheduleData = [{id:'sch_1',date:'2026-05-20',title:'개강일',color:'indigo',noticeId:'',toolCardId:'',memoContent:''}];
    let dateData = {};

    const REMOTE_ROW_ID = 'shared_state';
    const LOCAL_STORAGE_KEYS = {
        menuOrder: ['menuOrder_v1', 'menuOrder'],
        noticeData: ['noticeData_v1', 'noticeData'],
        memoData: ['memoData_v1', 'memoData'],
        designFilters: ['designFilters_v1'],
        roadmapData: ['roadmapData_v1', 'roadmapData'],
        toolData: ['toolCardsData_v19'],
        workspaceData: ['workspaceData_v3'],
        progressData: ['assignmentData_v2'],
        studentComments: ['studentComments_v1'],
        scheduleData: ['scheduleData_v1'],
        dateData: ['dateLink_v1'],
        boardData: ['boardData_v1']
    };
    const {
        normalizeState: normalizeDashboardState,
        getLocalStateSnapshot: readLocalStateSnapshot,
        saveStateToLocal: persistStateToLocal
    } = window.UIUXA_STATE_UTILS;

    function getStateSnapshot() {
        return {
            menuOrder,
            noticeData,
            memoData,
            designFilters,
            progressData,
            toolData,
            roadmapData,
            workspaceData,
            studentComments,
            scheduleData,
            dateData,
            boardData
        };
    }

    function normalizeState(source = {}) {
        return normalizeDashboardState(source);
    }

    function applyStateSnapshot(source = {}) {
        const state = normalizeState(source);
        if (state.menuOrder) menuOrder = state.menuOrder;
        if (state.noticeData) noticeData = state.noticeData;
        if (state.memoData) memoData = state.memoData;
        if (state.designFilters) designFilters = state.designFilters;
        if (state.progressData) progressData = state.progressData;
        if (state.toolData) toolData = state.toolData;
        if (state.roadmapData) roadmapData = state.roadmapData;
        if (state.workspaceData) workspaceData = state.workspaceData;
        if (state.studentComments) studentComments = state.studentComments;
        if (state.scheduleData) scheduleData = state.scheduleData;
        if (state.dateData) dateData = state.dateData;
        if (state.boardData) boardData = state.boardData;
    }

    function getLocalStateSnapshot() {
        return readLocalStateSnapshot(LOCAL_STORAGE_KEYS);
    }

    function saveStateToLocal(state) {
        persistStateToLocal(state, LOCAL_STORAGE_KEYS);
    }

    async function loadStateFromNetlify() {
        return window.UIUXA_CLOUD_STATE.loadFromNetlify();
    }

    async function saveStateToNetlify(state) {
        const saved = await window.UIUXA_CLOUD_STATE.saveToNetlify(state, teacherWritePassword);
        if (saved) setCloudStatus('Netlify API 연동됨', 'text-sky-500');
        return saved;
    }

    function setCloudStatus(label, colorClass = 'text-emerald-500') {
        const cs = document.getElementById('cloud-status');
        if (!cs) return;
        cs.textContent = label;
        cs.classList.remove('opacity-0', 'text-slate-400', 'text-emerald-500', 'text-sky-500', 'text-amber-500');
        cs.classList.add('opacity-100', colorClass);
    }

    function isExpectedLocalNetlifyMiss(error) {
        const host = window.location.hostname;
        const message = String(error?.message || error);
        const isLocalStatic = window.location.protocol === 'file:' || host === 'localhost' || host === '127.0.0.1';
        return isLocalStatic && (message.includes('Failed to fetch') || message.includes(': 404'));
    }

    async function loadStateFromSupabase() {
        return window.UIUXA_CLOUD_STATE.loadFromSupabase();
    }

    async function saveStateToSupabase(state) {
        const saved = await window.UIUXA_CLOUD_STATE.saveToSupabase(state);
        if (saved) setCloudStatus('Supabase 연동됨', 'text-sky-500');
        return saved;
    }

    window.getDashboardState = getStateSnapshot;
    const { escapeAttr, actionAttrs, changeActionAttrs, bindDelegatedActions } = window.UIUXA_DOM_ACTIONS;

    window.copyToClipboard = function(t) {
        const e = document.createElement('textarea'); e.value = t; document.body.appendChild(e); e.select(); document.execCommand('copy'); document.body.removeChild(e);
        window.showToast("복사되었습니다.");
    };

    window.showToast = function(msg) {
        const t = document.getElementById('toast'); document.getElementById('toast-msg').textContent = msg; t.classList.remove('translate-y-full','opacity-0');
        setTimeout(() => t.classList.add('opacity-0','translate-y-full'), 2500);
    };

    window.toggleSidebar = function() {
        document.body.classList.toggle('sidebar-closed');
    };

    window.toggleEditMode = async function() {
        if (isEditMode) {
            await window.saveToFirebase();
            teacherWritePassword = '';
            isEditMode = false; window.renderAll(); window.updateEditModeUI(); window.showToast("저장 후 종료되었습니다."); return;
        }
        pwdActionType = 'editMode'; document.getElementById('pwd-modal-title').textContent = "강사 인증"; document.getElementById('pwd-input').value = ''; document.getElementById('pwd-error').classList.add('hidden');
        const m = document.getElementById('pwd-modal'); m.classList.remove('hidden'); m.classList.add('flex');
        setTimeout(() => { m.classList.add('opacity-100'); document.getElementById('pwd-input').focus(); }, 10);
    };

    window.promptPopupPwd = function(id) {
        pwdActionType = 'setPopup'; pwdActionPayload = id; document.getElementById('pwd-modal-title').textContent = "팝업 등록"; document.getElementById('pwd-input').value = ''; document.getElementById('pwd-error').classList.add('hidden');
        const m = document.getElementById('pwd-modal'); m.classList.remove('hidden'); m.classList.add('flex');
        setTimeout(() => { m.classList.add('opacity-100'); document.getElementById('pwd-input').focus(); }, 10);
    };

    window.closePwdModal = function() {
        const m = document.getElementById('pwd-modal'); m.classList.remove('opacity-100');
        setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300);
    };

    window.submitPwd = async function() {
        const pwd = document.getElementById('pwd-input').value;
        if (pwd === "0305@!") {
            if (pwdActionType === 'editMode') {
                teacherWritePassword = pwd;
                isEditMode = true; window.renderAll(); window.updateEditModeUI(); window.closePwdModal(); window.showToast("강사 모드 활성화");
            } else if (pwdActionType === 'clearBoard') {
                teacherWritePassword = pwd;
                window.executeClearBoard(); window.closePwdModal();
                if (!isEditMode) teacherWritePassword = '';
            } else {
                teacherWritePassword = pwd;
                noticeData.activePopupId = pwdActionPayload; await window.saveToFirebase(); window.renderNoticeBoard(); window.closePwdModal(); window.showToast("팝업 등록됨");
                if (!isEditMode) teacherWritePassword = '';
            }
        } else {
            document.getElementById('pwd-error').classList.remove('hidden');
        }
    };

    window.UIUXA_BOARD_VIEW.install({
        actionAttrs,
        studentsList,
        studentColorClass,
        getBoardData: () => boardData,
        setBoardData: (nextBoardData) => { boardData = nextBoardData; },
        getSelectedBoardFile: () => selectedBoardFile,
        setSelectedBoardFile: (nextFile) => { selectedBoardFile = nextFile; },
        getCurrentEditingPostId: () => currentEditingPostId,
        setCurrentEditingPostId: (nextPostId) => { currentEditingPostId = nextPostId; },
        setPwdActionType: (nextActionType) => { pwdActionType = nextActionType; }
    });

    window.updateEditModeUI = function() {
        const pc = document.getElementById('profile-container');
        const pib = document.getElementById('profile-icon-bg');
        const pi = document.getElementById('profile-icon');
        const pt = document.getElementById('profile-title');
        const pd = document.getElementById('profile-desc');
        if (isEditMode) {
            pib.className = "w-10 h-10 rounded-full bg-figjam flex items-center justify-center text-white shadow-md transform";
            pi.setAttribute('data-lucide', 'unlock');
            pt.textContent = "강사 모드 (수정 중)";
            pt.className = "text-sm font-bold text-figjam";
            pd.textContent = "클릭하여 저장 후 종료";
            pc.className = "flex items-center gap-3 bg-figjamLight p-3 rounded-2xl border border-figjamBorder cursor-pointer transition-all duration-300 group";
            document.getElementById('btn-backup-restore')?.classList.remove('hidden');
            document.getElementById('btn-manage-filters')?.classList.remove('hidden');
        } else {
            pib.className = "w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold transform";
            pi.setAttribute('data-lucide', 'user');
            pt.textContent = "학생 모드";
            pt.className = "text-sm font-bold text-slate-800";
            pd.textContent = "UI/UX 디자인 과정";
            pc.className = "flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 cursor-pointer hover:bg-slate-100 transition-all duration-300 group";
            document.getElementById('btn-backup-restore')?.classList.add('hidden');
            document.getElementById('btn-manage-filters')?.classList.add('hidden');
        }
        document.querySelectorAll('.menu-drag-item').forEach(item => {
            if (isEditMode) {
                item.setAttribute('draggable', 'true');
                item.classList.add('cursor-move', 'outline', 'outline-2', 'outline-dashed', 'outline-slate-300');
            } else {
                item.removeAttribute('draggable');
                item.classList.remove('cursor-move', 'outline', 'outline-2', 'outline-dashed', 'outline-slate-300');
            }
        });
        lucide.createIcons();
        window.bindToolCardDragAndDrop();
    };

    window.switchTab = function(id) {
        currentTabId = id;
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.getElementById('tab-' + id).classList.add('active');
        document.querySelectorAll('.gnb-item').forEach(el => {
            el.classList.remove('bg-figjam/10', 'text-figjam', 'font-bold');
            el.classList.add('text-slate-500', 'font-medium');
        });
        const ab = document.getElementById('btn-' + id);
        if (ab) {
            ab.classList.remove('text-slate-500', 'font-medium');
            ab.classList.add('bg-figjam/10', 'text-figjam', 'font-bold');
        }
        if (id === 'progress') setTimeout(() => { window.renderChart(); myChart?.resize(); }, 50);
        if (id === 'roadmap') setTimeout(() => { window.updateCourseProgress(); window.renderCalendar(); }, 50);
        if (id === 'schedule') setTimeout(() => { window.renderFullCalendar(); }, 50);
        if (id === 'board') setTimeout(() => { window.renderBoard(); }, 50);
        document.getElementById('main-scroll-container')?.dispatchEvent(new Event('scroll'));
    };

    window.switchRoadmapTab = function(id) {
        document.querySelectorAll('.roadmap-sub-content').forEach(el => {
            el.classList.add('hidden'); el.classList.remove('block');
        });
        document.getElementById('roadmap-' + id).classList.remove('hidden');
        document.getElementById('roadmap-' + id).classList.add('block');
        document.querySelectorAll('.roadmap-tab-btn').forEach(el => {
            el.classList.remove('font-bold', 'text-figjam', 'border-b-[3px]', 'border-figjam');
            el.classList.add('font-medium', 'text-slate-400');
        });
        const ab = document.getElementById('sub-roadmap-' + id);
        ab.classList.remove('font-medium', 'text-slate-400');
        ab.classList.add('font-bold', 'text-figjam', 'border-b-[3px]', 'border-figjam');
        if (id === 'schedule') setTimeout(window.updateCourseProgress, 50);
    };

    window.switchTool = function(id) {
        document.querySelectorAll('.tool-content').forEach(el => el.classList.remove('active'));
        document.getElementById('tool-' + id).classList.add('active');
        document.querySelectorAll('.sub-tab-btn').forEach(el => {
            el.classList.remove('font-bold', 'text-figjam', 'border-b-[3px]', 'border-figjam');
            el.classList.add('font-medium', 'text-slate-400');
        });
        const ab = document.getElementById('sub-' + id);
        ab.classList.remove('font-medium', 'text-slate-400');
        ab.classList.add('font-bold', 'text-figjam', 'border-b-[3px]', 'border-figjam');
        const fc = document.getElementById('design-filter-container');
        if (id === 'design' && fc) fc.classList.remove('hidden');
        else if (fc) fc.classList.add('hidden');
        window.renderAllToolCards();
    };

    window.switchLevel = function(id, lv) {
        document.querySelectorAll('#tool-' + id + ' .level-content').forEach(el => {
            el.classList.add('hidden'); el.classList.remove('block');
        });
        document.getElementById(id + '-' + lv).classList.remove('hidden');
        document.getElementById(id + '-' + lv).classList.add('block');
        document.querySelectorAll('#tool-' + id + ' .level-btn').forEach(btn => {
            btn.className = 'level-btn px-4 py-1.5 text-[14px] font-medium text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 rounded-full transition-all';
        });
        document.getElementById('btn-' + id + '-' + lv).className = 'level-btn px-4 py-1.5 text-[14px] font-bold text-figjam bg-figjamLight border border-figjamBorder rounded-full transition-all';
    };

    window.changeToolLayout = function(l) {
        currentToolLayout = l;
        document.getElementById('btn-layout-grid').className = l === 'grid' ? 'p-1 rounded-md bg-white shadow-sm text-figjam transition-all' : 'p-1 rounded-md text-slate-400 hover:text-slate-600 transition-all';
        document.getElementById('btn-layout-list').className = l === 'list' ? 'p-1 rounded-md bg-white shadow-sm text-figjam transition-all' : 'p-1 rounded-md text-slate-400 hover:text-slate-600 transition-all';
        window.renderAllToolCards();
    };

    window.changeToolSortOrder = function(o) {
        currentSortOrder = o; window.renderAllToolCards();
    };

    window.changeDesignFilter = function(v) {
        currentDesignFilter = v; window.renderAllToolCards();
    };

    window.goToToolCard = function(id, url) {
        if (!id) {
            if (url && url !== '#') { if (url.startsWith('javascript:')) eval(url.replace('javascript:', '')); else window.open(url, '_blank'); }
            return;
        }
        let tt = '', tl = '';
        ['photoshop', 'illustrator', 'figma', 'design'].forEach(t => {
            ['basic', 'advanced'].forEach(l => {
                if ((toolData[t][l] || []).find(x => x.id === id)) { tt = t; tl = l; }
            });
        });
        if (tt) {
            window.switchTab('tool'); window.switchTool(tt); window.switchLevel(tt, tl);
            setTimeout(() => {
                const c = document.querySelector(`[data-card-id="${id}"]`);
                if (c) {
                    c.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    c.style.transition = 'all 0.3s ease';
                    c.classList.add('ring-4', 'ring-figjam');
                    setTimeout(() => c.classList.remove('ring-4', 'ring-figjam'), 300);
                }
            }, 150);
        } else if (url && url !== '#') {
            if (url.startsWith('javascript:')) eval(url.replace('javascript:', '')); else window.open(url, '_blank');
        }
    };

    window.UIUXA_NOTICE_VIEW.install({
        actionAttrs,
        getIsEditMode: () => isEditMode,
        getNoticeData: () => noticeData
    });

    window.UIUXA_ROADMAP_SCHEDULE_VIEW.install({
        actionAttrs,
        getIsEditMode: () => isEditMode,
        getRoadmapData: () => roadmapData,
        setRoadmapData: (nextRoadmapData) => { roadmapData = nextRoadmapData; },
        getToolData: () => toolData,
        getNoticeData: () => noticeData,
        getScheduleData: () => scheduleData,
        setScheduleData: (nextScheduleData) => { scheduleData = nextScheduleData; },
        getDateData: () => dateData,
        getCurrentCalendarDate: () => currentCalendarDate,
        getCurrentScheduleDate: () => currentScheduleDate
    });

    window.UIUXA_TOOL_CARDS_VIEW.install({
        actionAttrs,
        changeActionAttrs,
        escapeAttr,
        getIsEditMode: () => isEditMode,
        getCurrentToolLayout: () => currentToolLayout,
        getCurrentDesignFilter: () => currentDesignFilter,
        setCurrentDesignFilter: (nextFilter) => { currentDesignFilter = nextFilter; },
        getCurrentSortOrder: () => currentSortOrder,
        getRoadmapData: () => roadmapData,
        getToolData: () => toolData,
        getMemoData: () => memoData,
        getDesignFilters: () => designFilters,
        setDesignFilters: (nextFilters) => { designFilters = nextFilters; },
        getCurrentDeleteToolCardInfo: () => currentDeleteToolCardInfo,
        setCurrentDeleteToolCardInfo: (nextInfo) => { currentDeleteToolCardInfo = nextInfo; }
    });

    window.UIUXA_WORKSPACE_MEMO_VIEW.install({
        actionAttrs,
        escapeAttr,
        getIsEditMode: () => isEditMode,
        getWorkspaceData: () => workspaceData,
        setWorkspaceData: (nextWorkspaceData) => { workspaceData = nextWorkspaceData; },
        getMemoData: () => memoData,
        setMemoData: (nextMemoData) => { memoData = nextMemoData; },
        getToolData: () => toolData,
        getCurrentMemoTool: () => currentMemoTool,
        setCurrentMemoTool: (nextTool) => { currentMemoTool = nextTool; },
        getCurrentMemoLevel: () => currentMemoLevel,
        setCurrentMemoLevel: (nextLevel) => { currentMemoLevel = nextLevel; },
        getCurrentViewMemoId: () => currentViewMemoId,
        setCurrentViewMemoId: (nextMemoId) => { currentViewMemoId = nextMemoId; },
        getCurrentDeleteMemoId: () => currentDeleteMemoId,
        setCurrentDeleteMemoId: (nextMemoId) => { currentDeleteMemoId = nextMemoId; }
    });

    window.UIUXA_PROGRESS_VIEW.install({
        actionAttrs,
        studentsList,
        tasksList,
        studentColors,
        studentColorClass,
        getProgressData: () => progressData,
        getStudentComments: () => studentComments,
        getIsEditMode: () => isEditMode,
        getMyChart: () => myChart,
        setMyChart: (nextChart) => { myChart = nextChart; },
        getCurrentEditingStudent: () => currentEditingStudent,
        setCurrentEditingStudent: (nextStudent) => { currentEditingStudent = nextStudent; }
    });

    window.renderAll = function() {
        window.applyMenuOrder(); window.renderNoticeBoard(); window.renderRoadmap(); window.renderAllToolCards();
        if (document.getElementById('memo-list-modal').classList.contains('flex')) { window.renderMemoList(); }
        window.renderWorkspace(); window.renderStudentLegend(); window.updateSummary();
        if (document.getElementById('tab-progress').classList.contains('active')) { window.renderChart(); }
        if (document.getElementById('tab-schedule').classList.contains('active')) { window.renderFullCalendar(); }
        if (document.getElementById('tab-board').classList.contains('active')) { window.renderBoard(); }
        lucide.createIcons();
        if (!hasCheckedGlobalPopup) { hasCheckedGlobalPopup = true; window.checkGlobalPopup(); }
        window.updateCourseProgress();
    };

    window.applyMenuOrder = function() {
        const c = document.getElementById('menu-item-container');
        menuOrder.forEach(id => { const e = document.getElementById('btn-' + id); if (e) c.appendChild(e); });
    };

window.saveAppState = async function() {
    const state = getStateSnapshot();

    try {
        if (await saveStateToNetlify(state)) {
            saveStateToLocal(state);
            return;
        }
    } catch (e) {
        if (!isExpectedLocalNetlifyMiss(e)) {
            console.warn("Netlify API 저장 실패, 로컬 저장으로 전환합니다.", e);
        }
    }

    try {
        if (await saveStateToSupabase(state)) {
            saveStateToLocal(state);
            return;
        }
    } catch (e) {
        console.warn("Supabase 저장 실패, 로컬 저장으로 전환합니다.", e);
    }

    saveStateToLocal(state);
    setCloudStatus('로컬 저장 중', 'text-amber-500');
};

window.saveToFirebase = window.saveAppState;

    window.forceDataSync = function() {
        const CURRENT_VER = "ver_0521_final_update_v3";
        if (localStorage.getItem('uiux_sync_ver') !== CURRENT_VER) {
            localStorage.setItem('uiux_sync_ver', CURRENT_VER);
            roadmapData.unitSchedules = JSON.parse(JSON.stringify(defaultUnitSchedules));
            let newWorkspace = [];
            studentsList.forEach((s, i) => {
                let existingByName = workspaceData.find(w => w.name === s);
                let existingByIndex = workspaceData[i];
                let existing = existingByName || existingByIndex;
                if (existing) {
                    newWorkspace.push({
                        id: existing.id || 'ws_' + Date.now() + i, name: s, avatar: s.charAt(0), email: existing.email || 'abcd123@gmail.com', links: (existing.links && existing.links.length > 0) ? existing.links : [{ name: '브랜딩', url: '#', icon: 'layout' }]
                    });
                } else {
                    newWorkspace.push({ id: 'ws_' + Date.now() + i, name: s, avatar: s.charAt(0), email: 'abcd123@gmail.com', links: [{ name: '브랜딩', url: '#', icon: 'layout' }] });
                }
            });
            workspaceData = newWorkspace; window.saveToFirebase();
        }
    };

    window.loadFromLocal = function() {
        applyStateSnapshot(getLocalStateSnapshot());
        window.forceDataSync(); window.updateDesignFilterSelects(); window.renderAll();
    };

window.initFirebaseAndLoad = async function() {
    try {
        const netlifyState = await loadStateFromNetlify();
        if (netlifyState) {
            applyStateSnapshot(netlifyState);
            saveStateToLocal(getStateSnapshot());
            window.forceDataSync();
            window.updateDesignFilterSelects();
            window.renderAll();
            setCloudStatus('Netlify API 연동됨', 'text-sky-500');
            return;
        }
    } catch (e) {
        if (!isExpectedLocalNetlifyMiss(e)) {
            console.warn("Netlify API 로드 실패, 로컬 저장소로 전환합니다.", e);
        }
    }

    try {
        const supabaseState = await loadStateFromSupabase();
        if (supabaseState) {
            applyStateSnapshot(supabaseState);
            saveStateToLocal(getStateSnapshot());
            window.forceDataSync();
            window.updateDesignFilterSelects();
            window.renderAll();
            setCloudStatus('Supabase 연동됨', 'text-sky-500');
            return;
        }
    } catch (e) {
        console.warn("Supabase 로드 실패, 로컬 저장소로 전환합니다.", e);
    }

    window.loadFromLocal();
};

    window.initScrollToggle = function() {
        const m = document.getElementById('main-scroll-container');
        const b = document.getElementById('scroll-toggle-btn');
        const iu = document.getElementById('scroll-icon-up-wrapper');
        const id = document.getElementById('scroll-icon-down-wrapper');
        if (!m || !b || !iu || !id) return;
        
        const cv = () => {
            const a = ['notice', 'tool', 'workspace', 'schedule', 'board'];
            if (!a.includes(currentTabId) || m.scrollHeight <= m.clientHeight + 10) {
                b.classList.add('hidden', 'translate-y-4');
                b.classList.remove('opacity-100', 'translate-y-0');
                return false;
            }
            return true;
        };
        
        m.addEventListener('scroll', () => {
            const t = m.scrollTop; const h = m.scrollHeight; const ch = m.clientHeight;
            if (!cv()) return;
            if (t <= 10 && scrollDirection !== 'down') { scrollDirection = 'down'; iu.classList.add('hidden'); id.classList.remove('hidden'); }
            else if (t + ch >= h - 10 && scrollDirection !== 'up') { scrollDirection = 'up'; id.classList.add('hidden'); iu.classList.remove('hidden'); }
            else if (t > lastScrollTopPos && scrollDirection !== 'down') { scrollDirection = 'down'; iu.classList.add('hidden'); id.classList.remove('hidden'); }
            else if (t < lastScrollTopPos && scrollDirection !== 'up') { scrollDirection = 'up'; id.classList.add('hidden'); iu.classList.remove('hidden'); }
            
            lastScrollTopPos = t <= 0 ? 0 : t;
            b.classList.remove('hidden', 'translate-y-4'); b.classList.add('opacity-100', 'translate-y-0');
            
            if (scrollHideTimeout) clearTimeout(scrollHideTimeout);
            scrollHideTimeout = setTimeout(() => {
                b.classList.add('translate-y-4', 'opacity-0');
                setTimeout(() => { if (b.classList.contains('opacity-0')) b.classList.add('hidden'); }, 300);
            }, 1500);
        });
        
        b.addEventListener('click', () => {
            if (scrollDirection === 'down') m.scrollTo({ top: m.scrollHeight, behavior: 'smooth' });
            else m.scrollTo({ top: 0, behavior: 'smooth' });
        });
    };

    window.onload = function() {
        bindDelegatedActions();
        window.initFirebaseAndLoad();
        window.initScrollToggle();
        lucide.createIcons();
        const mc = document.getElementById('menu-item-container');
        let dm = null;
        mc.addEventListener('dragstart', (e) => {
            if (!isEditMode) { e.preventDefault(); return; }
            dm = e.target.closest('.menu-drag-item'); e.dataTransfer.effectAllowed = 'move';
            setTimeout(() => dm.classList.add('opacity-50'), 0);
        });
        mc.addEventListener('dragover', (e) => {
            e.preventDefault(); if (!isEditMode || !dm) return;
            const t = e.target.closest('.menu-drag-item');
            if (t && t !== dm) {
                const b = t.getBoundingClientRect();
                if ((e.clientY - b.top) > b.height / 2) t.after(dm);
                else t.before(dm);
            }
        });
        mc.addEventListener('dragend', () => {
            if (!isEditMode || !dm) return;
            dm.classList.remove('opacity-50'); dm = null;
            menuOrder = Array.from(mc.children).map(x => x.getAttribute('data-tab-id'));
            window.saveToFirebase();
        });
    };

    window.openBackupModal = function() {
        document.getElementById('backup-textarea').value = JSON.stringify(getStateSnapshot());
        const m = document.getElementById('backup-modal'); m.classList.remove('hidden'); m.classList.add('flex');
        setTimeout(() => m.classList.add('opacity-100'), 10);
    };

    window.closeBackupModal = function() {
        const m = document.getElementById('backup-modal'); m.classList.remove('opacity-100');
        setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300);
    };

    window.copyBackup = function() {
        navigator.clipboard.writeText(document.getElementById('backup-textarea').value).then(() => window.showToast("복사됨")).catch(() => window.showToast("실패"));
    };

    window.restoreBackup = function() {
        try {
            const str = document.getElementById('backup-textarea').value; const st = JSON.parse(str);
            applyStateSnapshot(st);
            window.saveToFirebase(); window.renderAll(); window.updateEditModeUI(); window.closeBackupModal(); window.showToast("복원됨");
        } catch (e) {
            alert("코드형식 오류");
        }
    };
