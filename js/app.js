    let initializeApp = null;
    let getAuth = null;
    let signInAnonymously = null;
    let onAuthStateChanged = null;
    let getFirestore = null;
    let doc = null;
    let setDoc = null;
    let onSnapshot = null;
    let app = null; let auth = null; let db = null;
    let firebaseModulesPromise = null;
    const fc = {
        apiKey: "AIzaSyDrYbVeQx7uEYjyBVaolJ4_UwyLYkZ8RNk",
        authDomain: "uiuxa-771e9.firebaseapp.com",
        projectId: "uiuxa-771e9",
        storageBucket: "uiuxa-771e9.firebasestorage.app",
        messagingSenderId: "1099220914447",
        appId: "1:1099220914447:web:5ea11d41a19c39a0cdee7a",
        measurementId: "G-WSZBG27G5Z"
    };

    async function initFirebaseModules() {
        if (app || fc.apiKey === "여기에_API_KEY_입력") return;
        if (!firebaseModulesPromise) {
            firebaseModulesPromise = (async () => {
                try {
                    ({ initializeApp } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js"));
                    ({ getAuth, signInAnonymously, onAuthStateChanged } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js"));
                    ({ getFirestore, doc, setDoc, onSnapshot } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"));
                    app = initializeApp(fc);
                    auth = getAuth(app);
                    db = getFirestore(app);
                } catch (e) {
                    console.warn("Firebase 모듈을 불러오지 못해 로컬 데이터로 실행합니다.", e);
                    app = null;
                    auth = null;
                    db = null;
                }
            })();
        }
        await firebaseModulesPromise;
    }

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

    const FIREBASE_COLLECTION = 'uiux_dashboard';
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
        return {
            menuOrder: source.menuOrder,
            noticeData: source.noticeData || source.notice,
            memoData: source.memoData || source.memo,
            designFilters: source.designFilters,
            progressData: source.progressData || source.progress,
            toolData: source.toolData || source.tool,
            roadmapData: source.roadmapData || source.roadmap,
            workspaceData: source.workspaceData || source.workspace,
            studentComments: source.studentComments,
            scheduleData: source.scheduleData || source.schedule,
            dateData: source.dateData || source.dateLink,
            boardData: source.boardData || source.board
        };
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

    function toFirebaseDocument(state) {
        return {
            menuOrder: state.menuOrder,
            notice: state.noticeData,
            memo: state.memoData,
            designFilters: state.designFilters,
            progress: state.progressData,
            tool: state.toolData,
            roadmap: state.roadmapData,
            workspace: state.workspaceData,
            studentComments: state.studentComments,
            schedule: state.scheduleData,
            dateLink: state.dateData,
            board: state.boardData,
            lastUpdated: Date.now()
        };
    }

    function getStoredJson(keys) {
        for (const key of keys) {
            const raw = localStorage.getItem(key);
            if (!raw) continue;
            try {
                return JSON.parse(raw);
            } catch (e) {
                console.warn(`저장 데이터 파싱 실패: ${key}`, e);
            }
        }
        return undefined;
    }

    function getLocalStateSnapshot() {
        const state = {};
        Object.entries(LOCAL_STORAGE_KEYS).forEach(([stateKey, storageKeys]) => {
            const value = getStoredJson(storageKeys);
            if (value !== undefined) state[stateKey] = value;
        });
        return state;
    }

    function saveStateToLocal(state) {
        localStorage.setItem('menuOrder_v1', JSON.stringify(state.menuOrder));
        localStorage.setItem('noticeData_v1', JSON.stringify(state.noticeData));
        localStorage.setItem('memoData_v1', JSON.stringify(state.memoData));
        localStorage.setItem('designFilters_v1', JSON.stringify(state.designFilters));
        localStorage.setItem('roadmapData_v1', JSON.stringify(state.roadmapData));
        localStorage.setItem('toolCardsData_v19', JSON.stringify(state.toolData));
        localStorage.setItem('workspaceData_v3', JSON.stringify(state.workspaceData));
        localStorage.setItem('assignmentData_v2', JSON.stringify(state.progressData));
        localStorage.setItem('studentComments_v1', JSON.stringify(state.studentComments));
        localStorage.setItem('scheduleData_v1', JSON.stringify(state.scheduleData));
        localStorage.setItem('dateLink_v1', JSON.stringify(state.dateData));
        localStorage.setItem('boardData_v1', JSON.stringify(state.boardData));
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

    // 수업 게시판 내부 함수들
    function getFileIcon(type) {
        if(!type) return 'file';
        if(type.startsWith('image/')) return 'image';
        if(type.startsWith('video/')) return 'video';
        if(type.startsWith('audio/')) return 'music';
        if(type.includes('pdf')) return 'file-text';
        if(type.includes('zip') || type.includes('rar')) return 'archive';
        return 'file';
    }

    function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    window.handleBoardFileSelect = function(event) {
        const file = event.target.files[0];
        if(!file) return;
        selectedBoardFile = {
            name: file.name,
            size: file.size,
            type: file.type
        };
        const indicator = document.getElementById('board-file-indicator');
        if(indicator) {
            indicator.innerHTML = `
                <span class="text-xs font-bold text-figjam bg-figjamLight px-2.5 py-1.5 rounded-lg border border-figjamBorder flex items-center gap-1.5 truncate max-w-[180px]">
                    <i data-lucide="file" class="w-3.5 h-3.5"></i> ${file.name}
                    <button ${actionAttrs('clearBoardFile', [], { stop: true })} class="text-slate-400 hover:text-red-500"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
                </span>
            `;
            lucide.createIcons();
        }
    };

    window.clearBoardFile = function() {
        selectedBoardFile = null;
        const input = document.getElementById('board-file-input');
        if(input) input.value = '';
        const indicator = document.getElementById('board-file-indicator');
        if(indicator) indicator.innerHTML = '<span class="text-xs text-slate-400 font-medium">선택된 파일 없음</span>';
    };

    window.handleBoardNameSelect = function(val) {
        const wrapper = document.getElementById('board-custom-name-wrapper');
        if(val === 'custom') {
            wrapper.classList.remove('hidden');
        } else {
            wrapper.classList.add('hidden');
        }
    };

    window.selectBoardStudent = function(val) {
        document.getElementById('board-student-name').value = val;
        
        document.querySelectorAll('.board-student-chip').forEach(chip => {
            chip.classList.remove('ring-2', 'ring-figjam', 'border-figjam', 'bg-figjamLight');
            chip.classList.add('border-slate-200', 'bg-white');
        });
        
        const selectedChip = document.getElementById('chip-' + val);
        if(selectedChip) {
            selectedChip.classList.remove('border-slate-200', 'bg-white');
            selectedChip.classList.add('ring-2', 'ring-figjam', 'border-figjam', 'bg-figjamLight');
        }
        
        window.handleBoardNameSelect(val);
    };

    window.submitBoardPost = function() {
        const selectName = document.getElementById('board-student-name').value;
        const customName = document.getElementById('board-custom-name').value.trim();
        const studentName = selectName === 'custom' ? customName : selectName;
        const content = document.getElementById('board-content').value.trim();
        
        if(!studentName) {
            window.showToast("작성자 이름을 선택하거나 입력해 주세요.");
            return;
        }
        if(!content && !selectedBoardFile) {
            window.showToast("내용이나 파일을 채운 뒤 공유해 주세요.");
            return;
        }
        
        const now = new Date();
        const dateStr = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} ${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
        
        if(currentEditingPostId) {
            const idx = boardData.findIndex(x => x.id === currentEditingPostId);
            if(idx > -1) {
                boardData[idx].studentName = studentName;
                boardData[idx].content = content;
                boardData[idx].file = selectedBoardFile;
                boardData[idx].date = dateStr + " (수정됨)";
            }
            currentEditingPostId = null;
            document.getElementById('board-submit-btn').innerHTML = `<i data-lucide="send" class="w-4 h-4"></i> 공유 게시판에 전송`;
            document.getElementById('board-form-title').innerHTML = `<i data-lucide="plus-circle" class="text-figjam w-5 h-5"></i> 결과물 등록`;
        } else {
            const newPost = {
                id: 'post_' + Date.now(),
                studentName: studentName,
                content: content,
                file: selectedBoardFile,
                date: dateStr
            };
            boardData.unshift(newPost);
        }
        
        document.getElementById('board-content').value = '';
        document.getElementById('board-custom-name').value = '';
        document.getElementById('board-student-name').value = '';
        document.querySelectorAll('.board-student-chip').forEach(chip => {
            chip.classList.remove('ring-2', 'ring-figjam', 'border-figjam', 'bg-figjamLight');
            chip.classList.add('border-slate-200', 'bg-white');
        });
        document.getElementById('board-custom-name-wrapper').classList.add('hidden');
        window.clearBoardFile();
        
        window.saveToFirebase();
        window.renderBoard();
        window.showToast("결과물 카드가 공유되었습니다.");
    };

    window.editBoardPost = function(id) {
        const post = boardData.find(x => x.id === id);
        if(!post) return;
        
        currentEditingPostId = id;
        
        const customWrapper = document.getElementById('board-custom-name-wrapper');
        const customNameInput = document.getElementById('board-custom-name');
        
        if(studentsList.includes(post.studentName)) {
            window.selectBoardStudent(post.studentName);
        } else {
            window.selectBoardStudent('custom');
            customNameInput.value = post.studentName;
        }
        
        document.getElementById('board-content').value = post.content;
        
        if(post.file) {
            selectedBoardFile = post.file;
            const indicator = document.getElementById('board-file-indicator');
            if(indicator) {
                indicator.innerHTML = `
                    <span class="text-xs font-bold text-figjam bg-figjamLight px-2.5 py-1.5 rounded-lg border border-figjamBorder flex items-center gap-1.5 truncate max-w-[180px]">
                        <i data-lucide="file" class="w-3.5 h-3.5"></i> ${post.file.name}
                        <button ${actionAttrs('clearBoardFile', [], { stop: true })} class="text-slate-400 hover:text-red-500"><i data-lucide="x" class="w-3.5 h-3.5"></i></button>
                    </span>
                `;
                lucide.createIcons();
            }
        } else {
            window.clearBoardFile();
        }
        
        document.getElementById('board-form-card').scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        const formCard = document.getElementById('board-form-card');
        formCard.classList.add('ring-2', 'ring-figjam');
        setTimeout(() => formCard.classList.remove('ring-2', 'ring-figjam'), 1000);
        
        document.getElementById('board-submit-btn').innerHTML = `<i data-lucide="check" class="w-4 h-4"></i> 데이터 교체 완료`;
        document.getElementById('board-form-title').innerHTML = `<i data-lucide="edit-3" class="text-figjam w-5 h-5"></i> 공유 결과물 수정`;
        lucide.createIcons();
    };

    window.deleteBoardPost = function(id) {
        boardData = boardData.filter(x => x.id !== id);
        window.saveToFirebase();
        window.renderBoard();
        window.showToast("결과물 카드가 삭제되었습니다.");
    };

    window.promptClearBoard = function() {
        pwdActionType = 'clearBoard';
        document.getElementById('pwd-modal-title').textContent = "게시판 모든 리스트 초기화";
        document.getElementById('pwd-input').value = '';
        document.getElementById('pwd-error').classList.add('hidden');
        const m = document.getElementById('pwd-modal');
        m.classList.remove('hidden');
        m.classList.add('flex');
        setTimeout(() => {
            m.classList.add('opacity-100');
            document.getElementById('pwd-input').focus();
        }, 10);
    };

    window.executeClearBoard = function() {
        boardData = [];
        window.saveToFirebase();
        window.renderBoard();
        window.showToast("게시판 모든 데이터가 초기화되었습니다.");
    };

    window.downloadMockFile = function(id) {
        const post = boardData.find(x => x.id === id);
        if(!post || !post.file) return;
        window.showToast(`[${post.file.name}] 가상 다운로드를 수행합니다.`);
    };

    window.renderBoard = function() {
        const container = document.getElementById('render-board-list');
        if(!container) return;
        container.innerHTML = '';
        
        const chipContainer = document.getElementById('board-student-chips');
        if (chipContainer && chipContainer.children.length === 0) {
            let chipsHtml = '';
            studentsList.forEach((s, idx) => {
                chipsHtml += `<button type="button" ${actionAttrs('selectBoardStudent', [s])} id="chip-${s}" class="board-student-chip flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-figjam hover:bg-slate-50 transition-all group/chip"><span class="w-5 h-5 rounded-md text-[10px] font-extrabold flex items-center justify-center text-white shadow-sm transition-transform group-hover/chip:scale-110 ${studentColorClass(idx)}">${s.charAt(0)}</span><span class="text-[13px] font-bold text-slate-600">${s}</span></button>`;
            });
            chipsHtml += `<button type="button" ${actionAttrs('selectBoardStudent', ['custom'])} id="chip-custom" class="board-student-chip flex items-center gap-1.5 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg hover:border-figjam hover:bg-slate-50 transition-all"><span class="w-5 h-5 rounded-md text-[10px] font-extrabold flex items-center justify-center bg-slate-200 text-slate-500 shadow-sm"><i data-lucide="edit-2" class="w-3 h-3"></i></span><span class="text-[13px] font-bold text-slate-600">직접 입력</span></button>`;
            chipContainer.innerHTML = chipsHtml;
            lucide.createIcons();
        }

        if(boardData.length === 0) {
            container.innerHTML = `
                <div class="col-span-full py-16 text-center text-slate-400 font-medium bg-white rounded-[24px] border border-slate-100 shadow-sm flex flex-col items-center justify-center">
                    <i data-lucide="inbox" class="w-12 h-12 mb-3 text-slate-300"></i>
                    게시판에 공유된 디자인 결과물이 없습니다.<br>첫 번째 작업 결과물을 우측 상단에서 전송해 보세요!
                </div>
            `;
            lucide.createIcons();
            return;
        }

        boardData.forEach((post) => {
            const hasFile = post.file && post.file.name;
            const fileSection = hasFile ? `
                <div class="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between group/file">
                    <div class="flex items-center gap-2.5 min-w-0">
                        <div class="w-9 h-9 rounded-lg bg-white flex items-center justify-center text-figjam shadow-sm border border-slate-100">
                            <i data-lucide="${getFileIcon(post.file.type)}" class="w-5 h-5"></i>
                        </div>
                        <div class="min-w-0">
                            <p class="text-[13px] font-bold text-slate-700 truncate" title="${post.file.name}">${post.file.name}</p>
                            <p class="text-[11px] text-slate-400 font-medium">${formatBytes(post.file.size)}</p>
                        </div>
                    </div>
                    <button ${actionAttrs('downloadMockFile', [post.id])} class="w-8 h-8 rounded-lg bg-white hover:bg-figjamLight hover:text-figjam border border-slate-100 text-slate-400 flex items-center justify-center transition-all shadow-sm">
                        <i data-lucide="download" class="w-4 h-4"></i>
                    </button>
                </div>
            ` : '';

            container.insertAdjacentHTML('beforeend', `
                <div class="bg-white p-6 rounded-[24px] border border-slate-100 shadow-soft hover:shadow-hover transition-all duration-500 transform scale-100 hover:-translate-y-1 relative group/post animate-fadeIn" id="post-card-${post.id}">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex gap-3 items-center">
                            <div class="w-10 h-10 rounded-xl bg-figjamLight text-figjam flex justify-center items-center font-bold text-[15px] shadow-sm">
                                ${post.studentName.charAt(0)}
                            </div>
                            <div class="min-w-0">
                                <h4 class="font-extrabold text-slate-800 text-[15px] truncate">${post.studentName}</h4>
                                <span class="text-[11px] text-slate-400 font-medium">${post.date}</span>
                            </div>
                        </div>
                        <div class="flex gap-1 opacity-0 group-hover/post:opacity-100 transition-opacity">
                            <button ${actionAttrs('editBoardPost', [post.id])} class="text-slate-400 hover:text-figjam bg-slate-50 p-1.5 rounded-lg border border-slate-100" title="결과물 교체/수정"><i data-lucide="edit-3" class="w-4 h-4"></i></button>
                            <button ${actionAttrs('deleteBoardPost', [post.id])} class="text-slate-400 hover:text-red-500 bg-slate-50 p-1.5 rounded-lg border border-slate-100" title="삭제"><i data-lucide="trash-2" class="w-4 h-4"></i></button>
                        </div>
                    </div>
                    <p class="text-[14px] text-slate-600 leading-relaxed whitespace-pre-wrap">${post.content}</p>
                    ${fileSection}
                </div>
            `);
        });
        lucide.createIcons();
    };

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

    window.renderNoticeBoard = function() {
        const c = document.getElementById('render-notice-board'); if (!c) return; c.innerHTML = '';
        const p = noticeData.posts || [];
        p.forEach((pt, i) => {
            const ia = noticeData.activePopupId === pt.id;
            const pb = ia ? "bg-figjam text-white" : "bg-slate-100 text-slate-500";
            const pbt = ia ? "작동중" : "등록";
            const eb = isEditMode ? `<div class="flex gap-2 shrink-0"><button ${actionAttrs('openNoticeEditModal', [pt.id], { stop: true })} class="text-slate-400 hover:text-figjam p-1.5 rounded-md hover:bg-slate-100 transition-colors"><i data-lucide="edit" class="w-4 h-4"></i></button></div>` : '';
            c.insertAdjacentHTML('beforeend', `<div ${actionAttrs('openNoticeViewModal', [pt.id])} class="grid grid-cols-12 gap-4 p-5 border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer items-center group"><div class="col-span-1 text-center text-[13px] font-bold text-slate-400">${p.length - i}</div><div class="col-span-7 md:col-span-8 flex items-center gap-3">${ia ? `<span class="bg-red-50 text-red-500 px-2 py-0.5 rounded text-[11px] font-bold shrink-0">중요</span>` : ''}<h3 class="text-[15px] font-bold text-slate-700 truncate group-hover:text-figjam transition-colors">${pt.title}</h3></div><div class="col-span-4 md:col-span-3 flex items-center justify-end gap-4 pr-2"><span class="text-[13px] text-slate-400 hidden md:block">${pt.date}</span><button ${actionAttrs('promptPopupPwd', [pt.id], { stop: true })} class="px-3 py-1.5 rounded-lg text-[12px] flex items-center gap-1.5 shadow-sm ${pb}"><i data-lucide="bell" class="w-3.5 h-3.5"></i> ${pbt}</button>${eb}</div></div>`);
        });
        if (isEditMode) c.insertAdjacentHTML('beforeend', `<div ${actionAttrs('openNoticeEditModal', ['new'])} class="p-6 flex flex-col items-center justify-center text-slate-400 hover:text-figjam bg-slate-50/50 cursor-pointer h-[120px]"><i data-lucide="plus-circle" class="w-6 h-6 mb-2"></i><span class="font-bold text-[14px]">새 작성</span></div>`);
        else if (p.length === 0) c.innerHTML = `<div class="p-12 text-center text-slate-400 font-medium">없음</div>`;
    };

    window.openNoticeViewModal = function(id) {
        const p = noticeData.posts.find(x => x.id === id); if (!p) return;
        document.getElementById('nvm-title').textContent = p.title;
        document.getElementById('nvm-date').textContent = p.date;
        document.getElementById('nvm-content').innerHTML = p.content.replace(/\n/g, '<br>');
        const m = document.getElementById('notice-view-modal'); m.classList.remove('hidden'); m.classList.add('flex');
        setTimeout(() => m.classList.add('opacity-100'), 10);
    };

    window.closeNoticeViewModal = function() {
        const m = document.getElementById('notice-view-modal'); m.classList.remove('opacity-100');
        setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300);
    };

    window.openNoticeEditModal = function(id) {
        document.getElementById('nem-id').value = id; let p = { title: '', content: '' };
        if (id !== 'new') p = noticeData.posts.find(x => x.id === id) || p;
        document.getElementById('nem-title').value = p.title;
        document.getElementById('nem-content').value = p.content;
        const d = document.getElementById('btn-nem-delete');
        if (id === 'new') d.classList.add('hidden');
        else {
            d.classList.remove('hidden'); d.setAttribute('data-confirm', 'false'); d.innerHTML = '삭제';
            d.className = 'px-5 py-2.5 text-sm font-bold text-red-500 bg-white border border-red-200 rounded-xl mr-auto';
        }
        const m = document.getElementById('notice-edit-modal'); m.classList.remove('hidden'); m.classList.add('flex');
        setTimeout(() => m.classList.add('opacity-100'), 10);
    };

    window.closeNoticeEditModal = function() {
        const m = document.getElementById('notice-edit-modal'); m.classList.remove('opacity-100');
        setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300);
    };

    window.saveNotice = function() {
        const id = document.getElementById('nem-id').value;
        const t = document.getElementById('nem-title').value.trim();
        const c = document.getElementById('nem-content').value;
        if (!t) return window.showToast("제목 입력");
        if (id === 'new') {
            const d = new Date();
            noticeData.posts.unshift({
                id: 'n_' + Date.now(), title: t, content: c, date: `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
            });
        } else {
            const idx = noticeData.posts.findIndex(x => x.id === id);
            if (idx > -1) { noticeData.posts[idx].title = t; noticeData.posts[idx].content = c; }
        }
        window.saveToFirebase(); window.renderNoticeBoard(); window.closeNoticeEditModal(); window.showToast('저장됨');
    };

    window.deleteNotice = function() {
        const b = document.getElementById('btn-nem-delete');
        if (b.getAttribute('data-confirm') === 'true') {
            const id = document.getElementById('nem-id').value;
            noticeData.posts = noticeData.posts.filter(x => x.id !== id);
            if (noticeData.activePopupId === id) noticeData.activePopupId = null;
            window.saveToFirebase(); window.renderNoticeBoard(); window.closeNoticeEditModal(); window.showToast('삭제됨');
        } else {
            b.setAttribute('data-confirm', 'true'); b.innerHTML = '정말 삭제할까요?';
            b.className = 'px-5 py-2.5 text-sm font-bold text-white bg-red-500 border border-red-500 rounded-xl mr-auto';
            setTimeout(() => {
                b.setAttribute('data-confirm', 'false'); b.innerHTML = '삭제';
                b.className = 'px-5 py-2.5 text-sm font-bold text-red-500 bg-white border border-red-200 rounded-xl mr-auto';
            }, 3000);
        }
    };

    window.checkGlobalPopup = function() {
        if (!noticeData.activePopupId) return;
        const p = noticeData.posts.find(x => x.id === noticeData.activePopupId); if (!p) return;
        const hu = localStorage.getItem('hideNoticePopupUntil'); if (hu && Date.now() < parseInt(hu)) return;
        document.getElementById('global-notice-title').textContent = p.title;
        document.getElementById('global-notice-content').innerHTML = p.content.replace(/\n/g, '<br>');
        document.getElementById('global-notice-date').textContent = p.date;
        const m = document.getElementById('global-notice-modal'); const bx = document.getElementById('global-notice-box');
        m.classList.remove('hidden'); m.classList.add('flex');
        setTimeout(() => { m.classList.add('opacity-100'); bx.classList.remove('scale-95'); bx.classList.add('scale-100'); }, 10);
    };

    window.closeGlobalPopup = function() {
        const cb = document.getElementById('hide-12h');
        if (cb && cb.checked) localStorage.setItem('hideNoticePopupUntil', Date.now() + 12 * 60 * 60 * 1000);
        const m = document.getElementById('global-notice-modal'); const bx = document.getElementById('global-notice-box');
        m.classList.remove('opacity-100'); bx.classList.remove('scale-100'); bx.classList.add('scale-95');
        setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300);
    };

    window.renderTodayTask = function() {
        const c = document.getElementById('render-today-task'); if (!c) return;
        const d = roadmapData.todayTask;
        const eb = isEditMode ? `<button ${actionAttrs('openTodayModal')} class="absolute top-4 right-4 text-slate-400 hover:text-figjam z-20 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-all opacity-0 group-hover/today:opacity-100"><i data-lucide="edit" class="w-4 h-4"></i></button>` : '';
        const dh = d.desc ? d.desc.split('\n').map(l => `<li>${l}</li>`).join('') : '';
        const b1Action = d.cardId ? `href="#" ${actionAttrs('goToToolCard', [d.cardId, d.bUrl1 || ''], { prevent: true })}` : `href="${d.bUrl1 || '#'}" ${d.bUrl1 && !d.bUrl1.startsWith('javascript:') ? 'target="_blank"' : ''}`;
        const b1 = d.bText1 ? `<a ${b1Action} class="flex items-center justify-center w-full md:w-auto min-w-[160px] gap-2 px-5 py-3.5 bg-white border-2 border-figjam text-figjam hover:bg-figjam hover:text-white rounded-xl font-bold shadow-sm text-[14px] transition-colors"><i data-lucide="arrow-right-circle" class="w-5 h-5"></i> ${d.bText1}</a>` : '';
        const b2 = d.bText2 ? `<a href="${d.bUrl2 || '#'}" ${d.bUrl2 && !d.bUrl2.startsWith('javascript:') ? 'target="_blank"' : ''} class="flex items-center justify-center w-full md:w-auto min-w-[160px] gap-2 px-5 py-3.5 bg-figjam text-white hover:bg-[#7c4ced] rounded-xl font-bold shadow-md text-[14px]"><i data-lucide="check-square" class="w-5 h-5"></i> ${d.bText2}</a>` : '';
        c.innerHTML = `<div class="bg-white rounded-[24px] border border-slate-100 shadow-soft p-8 relative overflow-hidden group/today">${eb}<div class="absolute top-0 left-0 w-1.5 h-full bg-figjam"></div><div class="flex flex-col md:flex-row md:items-start justify-between gap-6"><div class="flex-1 space-y-4"><div><h3 class="text-[20px] font-bold text-slate-800">${d.title}</h3><p class="text-[14px] text-slate-500 font-medium flex items-center gap-1.5 mt-1.5"><i data-lucide="clock" class="w-4 h-4"></i> 기한: ${d.deadline}</p></div><div class="bg-slate-50 rounded-xl p-5 border border-slate-100"><h4 class="text-[13px] font-bold text-slate-700 mb-2">과제 내용:</h4><ul class="text-[14px] text-slate-600 space-y-1.5 list-none marker:text-slate-400">${dh}</ul></div></div><div class="flex-shrink-0 mt-2 md:mt-0 flex flex-col gap-2.5">${b1}${b2}</div></div></div>`;
    };

    window.openTodayModal = function() {
        const d = roadmapData.todayTask; document.getElementById('ttm-title').value = d.title || ''; document.getElementById('ttm-deadline').value = d.deadline || ''; document.getElementById('ttm-desc').value = d.desc || ''; document.getElementById('ttm-bText1').value = d.bText1 || ''; document.getElementById('ttm-bUrl1').value = d.bUrl1 || ''; document.getElementById('ttm-bText2').value = d.bText2 || ''; document.getElementById('ttm-bUrl2').value = d.bUrl2 || '';
        const cs = document.getElementById('ttm-cardId');
        if (cs) {
            cs.innerHTML = `<option value="">연결 안함</option>`;
            ['photoshop', 'illustrator', 'figma', 'design'].forEach(t => {
                ['basic', 'advanced'].forEach(l => {
                    (toolData[t][l] || []).forEach(c => {
                        const is = d.cardId === c.id ? 'selected' : ''; cs.innerHTML += `<option value="${c.id}" ${is}>[${t}] ${c.title}</option>`;
                    });
                });
            });
        }
        const m = document.getElementById('today-task-modal'); m.classList.remove('hidden'); m.classList.add('flex');
        setTimeout(() => m.classList.add('opacity-100'), 10);
    };

    window.closeTodayModal = function() {
        const m = document.getElementById('today-task-modal'); m.classList.remove('opacity-100');
        setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300);
    };

    window.saveTodayModal = function() {
        roadmapData.todayTask = {
            title: document.getElementById('ttm-title').value.trim(), deadline: document.getElementById('ttm-deadline').value.trim(), desc: document.getElementById('ttm-desc').value.trim(), bText1: document.getElementById('ttm-bText1').value.trim(), bUrl1: document.getElementById('ttm-bUrl1').value.trim(), bText2: document.getElementById('ttm-bText2').value.trim(), bUrl2: document.getElementById('ttm-bUrl2').value.trim(), cardId: document.getElementById('ttm-cardId').value
        };
        window.saveToFirebase(); window.renderTodayTask(); window.renderAllToolCards(); window.closeTodayModal(); window.showToast('저장됨');
    };

    window.toggleDailyTaskVisibility = function(id) {
        const idx = roadmapData.dailyTasks.findIndex(t => t.id === id);
        if (idx > -1) { roadmapData.dailyTasks[idx].isHidden = !roadmapData.dailyTasks[idx].isHidden; window.saveToFirebase(); window.renderDailyTasks(); }
    };

    window.renderDailyTasks = function() {
        const c = document.getElementById('render-daily-tasks'); if (!c) return; c.innerHTML = '';
        const cm = { '완료': { bg: 'bg-emerald-50', t: 'text-emerald-500', lb: 'bg-emerald-50' }, '진행중': { bg: 'bg-blue-50', t: 'text-blue-500', lb: 'bg-blue-50' }, '대기': { bg: 'bg-slate-100', t: 'text-slate-500', lb: 'bg-slate-100' } };
        roadmapData.dailyTasks.forEach(t => {
            if (!isEditMode && t.isHidden) return;
            let co = cm[t.status] || cm['대기']; let hc = t.isHidden ? 'opacity-50 grayscale' : '';
            let eb = isEditMode ? `<div class="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover/daily:opacity-100 z-20"><button ${actionAttrs('toggleDailyTaskVisibility', [t.id])} class="text-slate-400 hover:text-amber-500 bg-slate-50 p-1.5 rounded-lg shadow-sm"><i data-lucide="${t.isHidden ? 'eye-off' : 'eye'}" class="w-4 h-4"></i></button><button ${actionAttrs('openDailyModal', [t.id])} class="text-slate-400 hover:text-figjam bg-slate-50 p-1.5 rounded-lg shadow-sm"><i data-lucide="edit" class="w-4 h-4"></i></button></div>` : '';
            let bh = t.link ? `<a href="${t.link}" target="_blank" class="flex justify-center gap-1.5 py-2.5 bg-figjam text-white rounded-xl text-[13px] font-bold mt-auto"><i data-lucide="check-square" class="w-4 h-4"></i> 제출하기</a>` : '<div class="mt-auto"></div>';
            c.innerHTML += `<div class="bg-white p-6 rounded-[24px] border border-slate-100 shadow-soft hover:shadow-hover transition-all flex flex-col relative group/daily min-h-[180px] ${hc}">${eb}<div class="flex justify-between items-start mb-5"><div class="w-11 h-11 rounded-[14px] ${co.bg} ${co.t} flex items-center justify-center"><i data-lucide="${t.icon || 'circle'}" class="w-5 h-5"></i></div><span class="text-[11px] font-bold text-slate-600 ${co.lb} px-3 py-1.5 rounded-md">${t.status}</span></div><h3 class="font-bold text-slate-800 text-[15px] leading-tight mb-4">${t.title}</h3>${bh}</div>`;
        });
        if (isEditMode) c.innerHTML += `<div ${actionAttrs('openDailyModal', ['new'])} class="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[24px] p-6 flex flex-col items-center justify-center text-slate-400 hover:text-figjam cursor-pointer min-h-[180px]"><i data-lucide="plus-circle" class="w-8 h-8 mb-2"></i><span class="font-bold text-[14px]">추가</span></div>`;
    };

    window.openDailyModal = function(id) {
        document.getElementById('dtm-id').value = id; let tk = { status: '진행중', icon: 'pen-tool', title: '', link: '' };
        if (id !== 'new') tk = roadmapData.dailyTasks.find(t => t.id === id) || tk;
        document.getElementById('dtm-status').value = tk.status; document.getElementById('dtm-icon').value = tk.icon; document.getElementById('dtm-title').value = tk.title; document.getElementById('dtm-link').value = tk.link;
        const db = document.getElementById('btn-dtm-delete');
        if (id === 'new') db.classList.add('hidden'); else db.classList.remove('hidden');
        const m = document.getElementById('daily-task-modal'); m.classList.remove('hidden'); m.classList.add('flex');
        setTimeout(() => m.classList.add('opacity-100'), 10);
    };

    window.closeDailyModal = function() {
        const m = document.getElementById('daily-task-modal'); m.classList.remove('opacity-100');
        setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300);
    };

    window.saveDailyModal = function() {
        const id = document.getElementById('dtm-id').value; const t = document.getElementById('dtm-title').value.trim();
        if (!t) return window.showToast("제목입력");
        const d = {
            id: id === 'new' ? 'dt_' + Date.now() : id, status: document.getElementById('dtm-status').value, icon: document.getElementById('dtm-icon').value, title: t, link: document.getElementById('dtm-link').value.trim(), isHidden: false
        };
        if (id === 'new') roadmapData.dailyTasks.push(d);
        else { const idx = roadmapData.dailyTasks.findIndex(x => x.id === id); if (idx > -1) { d.isHidden = roadmapData.dailyTasks[idx].isHidden; roadmapData.dailyTasks[idx] = d; } }
        window.saveToFirebase(); window.renderDailyTasks(); window.closeDailyModal(); window.showToast('저장됨');
    };

    window.deleteDailyTask = function() {
        const id = document.getElementById('dtm-id').value; roadmapData.dailyTasks = roadmapData.dailyTasks.filter(t => t.id !== id);
        window.saveToFirebase(); window.renderDailyTasks(); window.closeDailyModal(); window.showToast('삭제됨');
    };

    const renderCalGrid = function(cDate, gId, cId, minH) {
        const g = document.getElementById(gId); if (!g) return; g.innerHTML = '';
        const y = cDate.getFullYear(); const m = cDate.getMonth(); const t = new Date();
        document.getElementById(cId).textContent = `${y}. ${String(m + 1).padStart(2, '0')}`;
        const fd = new Date(y, m, 1).getDay(); const dm = new Date(y, m + 1, 0).getDate();
        for (let i = 0; i < fd; i++) g.innerHTML += `<div class="bg-slate-50 ${minH} p-2 opacity-50"></div>`;
        for (let i = 1; i <= dm; i++) {
            const it = (y === t.getFullYear() && m === t.getMonth() && i === t.getDate()); const is = new Date(y, m, i).getDay() === 0; const is2 = new Date(y, m, i).getDay() === 6;
            let dc = "text-slate-700 font-bold";
            if (it) dc = "bg-figjam text-white w-7 h-7 flex items-center justify-center rounded-full shadow-md";
            else if (is) dc = "text-red-500 font-bold";
            else if (is2) dc = "text-blue-500 font-bold";
            let sh = ''; const ds = `${y}-${String(m + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            const du = (roadmapData.unitSchedules || []).filter(u => ds >= u.startDate && ds <= u.endDate);
            du.forEach(u => { sh += `<div class="mt-1 flex flex-col gap-1"><span class="text-[10px] font-bold bg-${u.color}-50 text-${u.color}-500 px-1 py-0.5 rounded border border-${u.color}-100/50 truncate">${u.title}</span></div>`; });
            const de = scheduleData.filter(s => s.date === ds);
            de.forEach(e => {
                let ic = ''; if (e.noticeId) ic += '<i data-lucide="bell" class="w-3 h-3"></i>'; if (e.toolCardId) ic += '<i data-lucide="image" class="w-3 h-3"></i>'; if (e.memoContent) ic += '<i data-lucide="file-text" class="w-3 h-3"></i>';
                const ca = isEditMode ? actionAttrs('openScheduleModal', [ds, e.id], { stop: true }) : actionAttrs('openGeneralViewModal', ['event', e.id], { stop: true });
                sh += `<div ${ca} class="mt-1.5 flex flex-col gap-1 cursor-pointer hover:opacity-80"><span class="text-[11px] font-bold bg-${e.color}-50 text-${e.color}-600 px-1.5 py-1 rounded flex items-center gap-1 border border-${e.color}-100"><span class="w-1.5 h-1.5 rounded-full bg-${e.color}-500 shrink-0"></span><span class="truncate">${e.title}</span><span class="flex gap-0.5 ml-auto opacity-70">${ic}</span></span></div>`;
            });
            let dInfo = dateData[ds] || {}; let dIc = '';
            if (dInfo.noticeId) dIc += '<i data-lucide="bell" class="w-3 h-3 text-orange-500"></i>';
            if (dInfo.toolCardId) dIc += '<i data-lucide="image" class="w-3 h-3 text-blue-500"></i>';
            if (dInfo.memoContent) dIc += '<i data-lucide="file-text" class="w-3 h-3 text-indigo-500"></i>';
            let dih = dIc ? `<span class="flex gap-1 ml-1 bg-slate-100 px-1 rounded">${dIc}</span>` : ''; const hDi = Object.keys(dInfo).length > 0;
            const dca = isEditMode ? actionAttrs('openDateEditModal', [ds]) : (hDi ? actionAttrs('openGeneralViewModal', ['date', ds]) : ''); const cc = isEditMode || hDi ? 'cursor-pointer hover:bg-slate-50 hover:ring-2 hover:ring-figjam/50 hover:z-10' : '';
            g.innerHTML += `<div class="bg-white ${minH} p-2 border-t border-transparent relative flex flex-col group ${cc}" ${dca}><div class="flex items-center mb-1"><span class="text-[14px] ${it ? 'flex justify-center w-full' : 'ml-1'}"><span class="${dc} ${!it ? 'inline-block' : ''}">${i}</span></span>${!it ? dih : ''}</div>${it ? `<div class="flex justify-center w-full mb-1">${dih}</div>` : ''}${sh}${isEditMode ? `<button ${actionAttrs('openScheduleModal', [ds], { stop: true })} class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-figjam bg-white rounded-full shadow-sm p-0.5"><i data-lucide="plus" class="w-4 h-4"></i></button>` : ''}</div>`;
        }
        const rs = (7 - ((fd + dm) % 7)) % 7;
        for (let i = 0; i < rs; i++) g.innerHTML += `<div class="bg-slate-50 ${minH} p-2 opacity-50"></div>`;
        lucide.createIcons();
    };

    window.updateCourseProgress = function() {
        const sd = new Date('2026-05-20T00:00:00'); const ed = new Date('2026-12-02T23:59:59'); const t = new Date(); const td = ed.getTime() - sd.getTime();
        let el = Math.max(0, Math.min(t.getTime() - sd.getTime(), td)); const pp = Math.floor((el / td) * 100);
        const pe = document.getElementById('course-progress-percent'); const be = document.getElementById('course-progress-bar');
        if (pe) pe.textContent = `${pp}%`; if (be) be.style.width = `${pp}%`;
        const td2 = new Date(t.getFullYear(), t.getMonth(), t.getDate()); const ed2 = new Date(ed.getFullYear(), ed.getMonth(), ed.getDate());
        const df = Math.ceil((ed2 - td2) / (1000 * 60 * 60 * 24));
        const de = document.getElementById('course-dday'); if (de) de.textContent = (df > 0) ? `D-${df}` : ((df === 0) ? `D-Day` : `종료`);
        const tl = document.getElementById('course-today-label');
        if (tl) tl.innerHTML = `오늘 (${String(t.getFullYear()).slice(-2)}.${String(t.getMonth() + 1).padStart(2, '0')}.${String(t.getDate()).padStart(2, '0')})<div class="absolute -top-6 left-1/2 -translate-x-1/2 w-0.5 h-4 bg-figjam rounded-full"></div>`;
    };

    window.prevMonth = function() { currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1); window.renderCalendar(); };
    window.nextMonth = function() { currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1); window.renderCalendar(); };
    window.renderCalendar = function() { renderCalGrid(currentCalendarDate, 'calendar-grid', 'calendar-month-year', 'min-h-[100px]'); };

    window.renderUnitSchedules = function() {
        const c = document.getElementById('render-unit-schedules'); if (!c) return; c.innerHTML = '';
        const td = new Date(); const tds = `${td.getFullYear()}-${String(td.getMonth() + 1).padStart(2, '0')}-${String(td.getDate()).padStart(2, '0')}`;
        (roadmapData.unitSchedules || []).forEach(u => {
            let st = '예정'; let cl = 'slate';
            if (tds > u.endDate) { st = '완료'; }
            else if (tds >= u.startDate && tds <= u.endDate) { st = '진행중'; cl = 'indigo'; }
            u.status = st; u.color = cl;
            const co = u.color === 'indigo' ? { bg: 'bg-indigo-50/60', b: 'border-indigo-100', t: 'text-indigo-900', lb: 'bg-white text-indigo-600', d: 'bg-indigo-500', p: 'bg-indigo-400' } : { bg: 'hover:bg-slate-50 border-transparent', b: '', t: 'text-slate-700', lb: 'bg-slate-100 text-slate-500', d: 'bg-slate-300', p: '' };
            const dh = u.status === '진행중' ? `<span class="relative flex h-3 w-3 shrink-0"><span class="animate-ping absolute h-full w-full rounded-full ${co.p} opacity-75"></span><span class="relative rounded-full h-3 w-3 ${co.d}"></span></span>` : `<span class="w-2.5 h-2.5 rounded-full ${co.d}"></span>`;
            c.innerHTML += `<div class="flex flex-col lg:flex-row lg:items-center justify-between p-4 px-5 rounded-2xl ${co.bg} border ${co.b} shadow-sm"><div class="flex items-center gap-3 mb-2 lg:mb-0">${dh}<span class="font-bold text-[15px] ${co.t}">${u.title}</span></div><div class="flex items-center gap-3"><span class="text-[12px] font-bold ${co.lb} px-2 py-1 rounded shadow-sm">${u.status}</span><span class="text-[13px] ${u.color === 'indigo' ? 'text-indigo-600' : 'text-slate-500'} font-semibold">${u.startDate.replace(/-/g, '.')} ~ ${u.endDate.replace(/-/g, '.')}</span></div></div>`;
        });
    };

    window.renderRoadmap = function() { window.renderTodayTask(); window.renderDailyTasks(); window.renderUnitSchedules(); window.renderCalendar(); lucide.createIcons(); };
    window.prevScheduleMonth = function() { currentScheduleDate.setMonth(currentScheduleDate.getMonth() - 1); window.renderFullCalendar(); };
    window.nextScheduleMonth = function() { currentScheduleDate.setMonth(currentScheduleDate.getMonth() + 1); window.renderFullCalendar(); };
    window.renderFullCalendar = function() { renderCalGrid(currentScheduleDate, 'full-calendar-grid', 'full-calendar-month-year', 'min-h-[140px]'); };

    window.openScheduleModal = function(d, id = null) {
        document.getElementById('shm-date').value = d; document.getElementById('shm-id').value = id || 'new';
        const ns = document.getElementById('shm-noticeId'); const ts = document.getElementById('shm-toolCardId'); const mc = document.getElementById('shm-memoContent');
        ns.innerHTML = '<option value="">연결 안함</option>'; (noticeData.posts || []).forEach(p => ns.innerHTML += `<option value="${p.id}">${p.title}</option>`);
        ts.innerHTML = '<option value="">연결 안함</option>';
        ['photoshop', 'illustrator', 'figma', 'design'].forEach(tt => {
            ['basic', 'advanced'].forEach(l => {
                (toolData[tt][l] || []).forEach(c => { ts.innerHTML += `<option value="${c.id}">[${tt}] ${c.title}</option>`; });
            });
        });
        const db = document.getElementById('btn-shm-delete');
        if (id) {
            const e = scheduleData.find(x => x.id === id);
            if (e) {
                document.getElementById('shm-title').value = e.title; const r = document.querySelector(`input[name="shm-color"][value="${e.color}"]`); if (r) r.checked = true;
                ns.value = e.noticeId || ''; ts.value = e.toolCardId || ''; mc.value = e.memoContent || '';
            }
            db.classList.remove('hidden');
        } else {
            document.getElementById('shm-title').value = ''; document.querySelector(`input[name="shm-color"][value="figjam"]`).checked = true; ns.value = ''; ts.value = ''; mc.value = ''; db.classList.add('hidden');
        }
        const m = document.getElementById('schedule-edit-modal'); m.classList.remove('hidden'); m.classList.add('flex');
        setTimeout(() => m.classList.add('opacity-100'), 10);
    };

    window.closeScheduleModal = function() {
        const m = document.getElementById('schedule-edit-modal'); m.classList.remove('opacity-100');
        setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300);
    };

    window.saveSchedule = function() {
        const id = document.getElementById('shm-id').value; const d = document.getElementById('shm-date').value; const t = document.getElementById('shm-title').value.trim();
        if (!t) return window.showToast('입력요망');
        const c = document.querySelector('input[name="shm-color"]:checked').value; const n = document.getElementById('shm-noticeId').value; const tc = document.getElementById('shm-toolCardId').value; const mc = document.getElementById('shm-memoContent').value.trim();
        const data = { id: id === 'new' ? 'sch_' + Date.now() : id, date: d, title: t, color: c, noticeId: n, toolCardId: tc, memoContent: mc };
        if (id === 'new') scheduleData.push(data);
        else { const i = scheduleData.findIndex(x => x.id === id); if (i > -1) scheduleData[i] = data; }
        window.saveToFirebase(); window.renderFullCalendar(); window.renderCalendar(); window.closeScheduleModal(); window.showToast('저장됨');
    };

    window.deleteSchedule = function() {
        const id = document.getElementById('shm-id').value; scheduleData = scheduleData.filter(x => x.id !== id);
        window.saveToFirebase(); window.renderFullCalendar(); window.renderCalendar(); window.closeScheduleModal(); window.showToast('삭제됨');
    };

    window.openDateEditModal = function(dStr) {
        document.getElementById('dem-date').value = dStr; const di = dateData[dStr] || {};
        const ns = document.getElementById('dem-noticeId'); const ts = document.getElementById('dem-toolCardId');
        ns.innerHTML = '<option value="">연결 안함</option>'; (noticeData.posts || []).forEach(p => ns.innerHTML += `<option value="${p.id}">${p.title}</option>`); ns.value = di.noticeId || '';
        ts.innerHTML = '<option value="">연결 안함</option>';
        ['photoshop', 'illustrator', 'figma', 'design'].forEach(tt => {
            ['basic', 'advanced'].forEach(l => {
                (toolData[tt][l] || []).forEach(c => { ts.innerHTML += `<option value="${c.id}">[${tt}] ${c.title}</option>`; });
            });
        });
        ts.value = di.toolCardId || ''; document.getElementById('dem-memoContent').value = di.memoContent || '';
        const m = document.getElementById('date-edit-modal'); m.classList.remove('hidden'); m.classList.add('flex');
        setTimeout(() => m.classList.add('opacity-100'), 10);
    };

    window.closeDateEditModal = function() {
        const m = document.getElementById('date-edit-modal'); m.classList.remove('opacity-100');
        setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300);
    };

    window.saveDateEditModal = function() {
        const d = document.getElementById('dem-date').value; const n = document.getElementById('dem-noticeId').value; const t = document.getElementById('dem-toolCardId').value; const m = document.getElementById('dem-memoContent').value.trim();
        if (!n && !t && !m) delete dateData[d]; else dateData[d] = { noticeId: n, toolCardId: t, memoContent: m };
        window.saveToFirebase(); window.renderFullCalendar(); window.renderCalendar(); window.closeDateEditModal(); window.showToast('저장됨');
    };

    window.openGeneralViewModal = function(type, payload) {
        let tit = ''; let ds = ''; let tg = null;
        if (type === 'date') { tg = dateData[payload] || {}; tit = "날짜 연결 정보"; ds = payload.replace(/-/g, '. '); }
        else { tg = scheduleData.find(x => x.id === payload) || {}; tit = tg.title; ds = tg.date.replace(/-/g, '. '); }
        document.getElementById('gvm-title').textContent = tit; document.getElementById('gvm-date').textContent = ds;
        const lc = document.getElementById('gvm-links'); lc.innerHTML = ''; let hc = false;
        if (tg.memoContent) {
            hc = true; lc.innerHTML += `<div class="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl mb-3"><div class="flex gap-2 mb-2 text-indigo-600"><i data-lucide="file-text" class="w-4 h-4"></i><span class="text-xs font-bold">작성 메모</span></div><div class="text-[13px] text-slate-700 whitespace-pre-wrap">${tg.memoContent}</div></div>`;
        }
        if (tg.noticeId) {
            const n = noticeData.posts.find(x => x.id === tg.noticeId);
            if (n) {
                hc = true; lc.innerHTML += `<button ${actionAttrs('openLinkedNoticeFromView', [n.id])} class="w-full flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-figjam rounded-xl transition-all text-left mb-2"><div class="flex gap-3"><div class="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex justify-center items-center"><i data-lucide="bell" class="w-4 h-4"></i></div><div><p class="text-[11px] font-bold text-slate-400">공지사항</p><p class="text-[14px] font-bold text-slate-700 truncate max-w-[200px]">${n.title}</p></div></div><i data-lucide="chevron-right" class="w-4 h-4 text-slate-300"></i></button>`;
            }
        }
        if (tg.toolCardId) {
            let tc = null; let ft = ''; let fl = '';
            ['photoshop', 'illustrator', 'figma', 'design'].forEach(tt => {
                ['basic', 'advanced'].forEach(ll => {
                    const c = (toolData[tt][ll] || []).find(x => x.id === tg.toolCardId); if (c) { tc = c; ft = tt; fl = ll; }
                });
            });
            if (tc) {
                hc = true; lc.innerHTML += `<button ${actionAttrs('openLinkedToolCardFromView', [ft, fl, tc.id])} class="w-full flex items-center justify-between p-3 bg-white border border-slate-200 hover:border-figjam rounded-xl transition-all text-left mb-2"><div class="flex gap-3"><div class="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex justify-center items-center"><i data-lucide="image" class="w-4 h-4"></i></div><div><p class="text-[11px] font-bold text-slate-400">Tool 카드</p><p class="text-[14px] font-bold text-slate-700 truncate max-w-[200px]">[${ft}] ${tc.title}</p></div></div><i data-lucide="chevron-right" class="w-4 h-4 text-slate-300"></i></button>`;
            }
        }
        if (!hc) lc.innerHTML = '<p class="text-sm text-slate-400 text-center py-4">연결된 항목이나 작성된 메모가 없습니다.</p>';
        const m = document.getElementById('general-view-modal'); m.classList.remove('hidden'); m.classList.add('flex');
        setTimeout(() => m.classList.add('opacity-100'), 10); lucide.createIcons();
    };

    window.closeViewModal = function() {
        const m = document.getElementById('general-view-modal'); m.classList.remove('opacity-100');
        setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300);
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
            const cd = document.querySelector(`[data-card-id="${cardId}"]`);
            if (!cd) return;
            cd.scrollIntoView({ behavior: 'smooth', block: 'center' });
            cd.classList.add('ring-4', 'ring-figjam');
            setTimeout(() => cd.classList.remove('ring-4', 'ring-figjam'), 300);
        }, 150);
    };

    window.renderAllToolCards = function() {
        ['photoshop', 'illustrator', 'figma', 'design'].forEach(t => {
            ['basic', 'advanced'].forEach(l => { window.renderToolCards(t, l); });
        });
        if (isEditMode) window.bindToolCardDragAndDrop(); lucide.createIcons();
    };

    window.renderToolCards = function(tId, lId) {
        const c = document.getElementById(`grid-${tId}-${lId}`); if (!c) return; c.innerHTML = '';
        if (currentToolLayout === 'grid') c.className = 'tool-card-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
        else c.className = 'tool-card-container flex flex-col gap-4';
        let cds = [...(toolData[tId][lId] || [])]; if (currentSortOrder === 'newest') cds.reverse();
        if (isEditMode) {
            const ac = currentToolLayout === 'grid' ? 'bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[24px] p-6 flex flex-col items-center justify-center text-slate-400 hover:text-figjam cursor-pointer min-h-[220px]' : 'bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[20px] p-4 flex items-center justify-center text-slate-400 hover:text-figjam cursor-pointer w-full h-[100px]';
            c.innerHTML += `<div ${actionAttrs('openToolCardModal', [tId, lId, 'new'])} class="${ac}"><i data-lucide="plus-circle" class="w-8 h-8 mb-2"></i><span class="font-bold">카드 추가</span></div>`;
        }
        cds.forEach(cd => {
            if (!isEditMode && cd.isHidden) return;
            if (tId === 'design' && currentDesignFilter !== 'all' && cd.category !== currentDesignFilter) return;
            const it = roadmapData.todayTask && roadmapData.todayTask.cardId === cd.id;
            const tb = it ? `<div class="absolute -top-3 -right-3 bg-red-500 text-white text-[11px] font-extrabold px-3 py-1.5 rounded-full shadow-md z-20 flex gap-1"><i data-lucide="star" class="w-3.5 h-3.5"></i> 오늘 과제</div>` : '';
            const lm = memoData.filter(m => m.cardId === cd.id);
            const mb = lm.length > 0 ? `<button ${actionAttrs('openMemoListForTool', [tId, lId])} class="absolute -top-3 -left-3 bg-indigo-500 text-white text-[11px] font-extrabold px-2.5 py-1.5 rounded-full shadow-md z-20 flex gap-1 hover:bg-indigo-600"><i data-lucide="file-text" class="w-3.5 h-3.5"></i> ${lm.length}</button>` : '';
            const hc = cd.isHidden ? 'opacity-50 grayscale' : '';
            const eb = isEditMode ? `<div class="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 z-20"><button ${actionAttrs('promptDeleteToolCard', [tId, lId, cd.id], { stop: true })} class="text-slate-400 hover:text-red-500 bg-white shadow-sm p-1.5 rounded-lg"><i data-lucide="trash-2" class="w-4 h-4"></i></button><button ${actionAttrs('openToolCardModal', [tId, lId, cd.id], { stop: true })} class="text-slate-400 hover:text-figjam bg-white shadow-sm p-1.5 rounded-lg"><i data-lucide="edit" class="w-4 h-4"></i></button></div>` : '';
            let lh = ''; (cd.links || []).forEach(l => { lh += `<a href="${l.url || '#'}" target="_blank" class="block text-[13px] font-bold text-slate-600 hover:text-figjam truncate py-1 flex gap-2"><i data-lucide="play-circle" class="w-4 h-4 shrink-0"></i> <span>${l.text}</span></a>`; });
            let bh = ''; (cd.buttons || []).forEach(b => { bh += `<a href="${b.url || '#'}" target="_blank" class="flex-1 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[12px] font-bold flex justify-center items-center gap-1.5 border border-slate-100"><i data-lucide="external-link" class="w-3.5 h-3.5"></i> ${b.text}</a>`; });
            const bc = bh ? `<div class="flex gap-2 mt-4 pt-4 border-t border-slate-50">${bh}</div>` : ''; const dh = cd.desc ? `<p class="text-[13px] text-slate-500 font-medium leading-relaxed mb-4 line-clamp-3">${cd.desc.replace(/\n/g, '<br>')}</p>` : '';
            const ch = (tId === 'design' && cd.category) ? `<span class="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md mb-2 inline-block">${cd.category}</span>` : '';
            const bl = cd.badge ? `<span class="text-[12px] font-extrabold text-figjam bg-figjamLight px-2 py-1 rounded-md shadow-sm border border-figjamBorder">${cd.badge}</span>` : '';
            const br = cd.badgeRight ? `<span class="text-[12px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md shadow-sm border border-emerald-100">${cd.badgeRight}</span>` : '';
            const bw = (bl || br) ? `<div class="flex justify-between items-center mb-3">${bl} ${br}</div>` : '';
            if (currentToolLayout === 'grid') {
                c.innerHTML += `<div class="tool-card-item bg-white p-6 rounded-[24px] border border-slate-100 shadow-soft hover:shadow-hover transition-all flex flex-col relative group min-h-[220px] ${hc}" data-card-id="${cd.id}">${tb}${mb}${eb}${ch}${bw}<h3 class="font-bold text-slate-800 text-[17px] mb-3 pr-8">${cd.title || '제목 없음'}</h3>${dh}<div class="space-y-1 mb-2 flex-1">${lh}</div>${bc}</div>`;
            } else {
                c.innerHTML += `<div class="tool-card-item bg-white p-5 rounded-[20px] border border-slate-100 shadow-soft hover:shadow-hover transition-all flex flex-col md:flex-row gap-5 relative group items-start md:items-center ${hc}" data-card-id="${cd.id}">${tb}${mb}${eb}<div class="flex-1 min-w-0 pr-8 md:pr-0">${ch}${bw}<h3 class="font-bold text-slate-800 text-[17px] mb-2">${cd.title || '제목 없음'}</h3>${dh}</div><div class="w-full md:w-[280px] shrink-0 flex flex-col gap-3 md:pl-5 md:border-l border-slate-100"><div class="space-y-1">${lh}</div>${bc}</div></div>`;
            }
        });
    };

    window.addToolLinkRow = function(t = '', u = '') {
        document.getElementById('tcm-links-container').insertAdjacentHTML('beforeend', `<div class="flex gap-2 tcm-link-item bg-white p-2 rounded-lg border border-slate-100"><div class="flex-1 flex flex-col gap-2"><input type="text" placeholder="텍스트" value="${escapeAttr(t)}" class="link-text w-full border-2 border-slate-100 rounded-md p-2 text-xs font-bold outline-none bg-slate-50"><input type="text" placeholder="URL" value="${escapeAttr(u)}" class="link-url w-full border-2 border-slate-100 rounded-md p-2 text-xs outline-none bg-slate-50"></div><button type="button" ${actionAttrs('removeParentItem')} class="text-slate-300 hover:text-red-500 p-2 shrink-0 bg-slate-50"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div>`); lucide.createIcons();
    };

    window.addToolButtonRow = function(t = '', u = '') {
        document.getElementById('tcm-buttons-container').insertAdjacentHTML('beforeend', `<div class="flex gap-2 tcm-button-item bg-white p-2 rounded-lg border border-slate-100"><div class="flex-1 flex flex-col gap-2"><input type="text" placeholder="버튼 텍스트" value="${escapeAttr(t)}" class="btn-text w-full border-2 border-slate-100 rounded-md p-2 text-xs font-bold outline-none bg-slate-50"><input type="text" placeholder="URL" value="${escapeAttr(u)}" class="btn-url w-full border-2 border-slate-100 rounded-md p-2 text-xs outline-none bg-slate-50"></div><button type="button" ${actionAttrs('removeParentItem')} class="text-slate-300 hover:text-red-500 p-2 shrink-0 bg-slate-50"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div>`); lucide.createIcons();
    };

    window.openToolCardModal = function(t, l, id) {
        document.getElementById('tcm-toolId').value = t; document.getElementById('tcm-levelId').value = l; document.getElementById('tcm-cardId').value = id;
        let cd = { badge: '', badgeRight: '', title: '', desc: '', category: '', links: [], buttons: [] };
        if (id !== 'new') cd = toolData[t][l].find(x => x.id === id) || cd;
        document.getElementById('tcm-badge').value = cd.badge; document.getElementById('tcm-badgeRight').value = cd.badgeRight; document.getElementById('tcm-title').value = cd.title; document.getElementById('tcm-desc').value = cd.desc;
        const cw = document.getElementById('tcm-category-wrapper');
        if (t === 'design') { cw.classList.remove('hidden'); document.getElementById('tcm-category').value = cd.category; }
        else cw.classList.add('hidden');
        document.getElementById('tcm-links-container').innerHTML = ''; document.getElementById('tcm-buttons-container').innerHTML = '';
        (cd.links || []).forEach(x => window.addToolLinkRow(x.text, x.url));
        (cd.buttons || []).forEach(x => window.addToolButtonRow(x.text, x.url));
        if (id === 'new' && !cd.links.length) window.addToolLinkRow();
        if (id === 'new' && !cd.buttons.length) window.addToolButtonRow();
        const m = document.getElementById('tool-card-modal'); m.classList.remove('hidden'); m.classList.add('flex');
        setTimeout(() => m.classList.add('opacity-100'), 10);
    };

    window.closeToolCardModal = function() {
        const m = document.getElementById('tool-card-modal'); m.classList.remove('opacity-100');
        setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300);
    };

    window.saveToolCard = function() {
        const t = document.getElementById('tcm-toolId').value; const l = document.getElementById('tcm-levelId').value; let id = document.getElementById('tcm-cardId').value;
        const nl = []; document.querySelectorAll('.tcm-link-item').forEach(x => { const txt = x.querySelector('.link-text').value.trim(); const url = x.querySelector('.link-url').value.trim(); if (txt || url) nl.push({ text: txt, url: url }); });
        const nb = []; document.querySelectorAll('.tcm-button-item').forEach(x => { const txt = x.querySelector('.btn-text').value.trim(); const url = x.querySelector('.btn-url').value.trim(); if (txt || url) nb.push({ text: txt, url: url }); });
        let ih = false; if (id !== 'new') { const ec = toolData[t][l].find(x => x.id === id); if (ec) ih = ec.isHidden; }
        const d = { id: id === 'new' ? `card_${Date.now()}` : id, badge: document.getElementById('tcm-badge').value.trim(), badgeRight: document.getElementById('tcm-badgeRight').value.trim(), title: document.getElementById('tcm-title').value.trim(), desc: document.getElementById('tcm-desc').value.trim(), category: t === 'design' ? document.getElementById('tcm-category').value.trim() : '', isHidden: ih, links: nl, buttons: nb };
        if (id === 'new') toolData[t][l].push(d);
        else { const idx = toolData[t][l].findIndex(x => x.id === id); if (idx > -1) toolData[t][l][idx] = d; }
        window.saveToFirebase(); window.renderAllToolCards(); window.closeToolCardModal(); window.showToast('저장됨');
    };

    window.promptDeleteToolCard = function(t, l, id) {
        currentDeleteToolCardInfo = { toolId: t, levelId: l, cardId: id };
        const m = document.getElementById('tool-delete-confirm-modal'); m.classList.remove('hidden'); m.classList.add('flex');
        setTimeout(() => m.classList.add('opacity-100'), 10);
    };

    window.closeToolDeleteConfirm = function() {
        const m = document.getElementById('tool-delete-confirm-modal'); m.classList.remove('opacity-100');
        setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); currentDeleteToolCardInfo = null; }, 300);
    };

    window.executeDeleteToolCard = function() {
        if (!currentDeleteToolCardInfo) return;
        const { toolId: t, levelId: l, cardId: id } = currentDeleteToolCardInfo;
        toolData[t][l] = toolData[t][l].filter(x => x.id !== id);
        window.saveToFirebase(); window.renderAllToolCards(); window.closeToolDeleteConfirm(); window.showToast('삭제됨');
    };

    window.bindToolCardDragAndDrop = function() {
        document.querySelectorAll('.tool-card-container').forEach(c => {
            let d = null;
            c.querySelectorAll('.tool-card-item').forEach(i => {
                i.addEventListener('dragstart', function(e) {
                    if (!isEditMode) { e.preventDefault(); return; }
                    d = this; e.dataTransfer.effectAllowed = 'move'; setTimeout(() => this.classList.add('opacity-40', 'scale-95'), 0);
                });
                i.addEventListener('dragover', function(e) {
                    e.preventDefault(); if (!isEditMode || !d || this === d) return;
                    const b = this.getBoundingClientRect(); const o = (currentToolLayout === 'grid') ? e.clientX - b.left : e.clientY - b.top; const th = (currentToolLayout === 'grid') ? b.width / 2 : b.height / 2;
                    if (o > th) this.after(d); else this.before(d);
                });
                i.addEventListener('dragend', function() {
                    if (!isEditMode) return;
                    this.classList.remove('opacity-40', 'scale-95'); window.saveToolCardOrder(c.getAttribute('data-tool-id'), c.getAttribute('data-level-id')); d = null;
                });
            });
        });
    };

    window.saveToolCardOrder = function(t, l) {
        const c = document.getElementById(`grid-${t}-${l}`); const ns = c.querySelectorAll('.tool-card-item');
        let ids = Array.from(ns).map(n => n.getAttribute('data-card-id')); if (currentSortOrder === 'newest') ids.reverse();
        toolData[t][l] = ids.map(id => toolData[t][l].find(x => x.id === id)).filter(Boolean);
        window.saveToFirebase();
    };

    window.openFilterModal = function() {
        window.renderFilterManageList(); const m = document.getElementById('filter-manage-modal'); m.classList.remove('hidden'); m.classList.add('flex');
        setTimeout(() => m.classList.add('opacity-100'), 10);
    };

    window.closeFilterModal = function() {
        const m = document.getElementById('filter-manage-modal'); m.classList.remove('opacity-100');
        setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300);
    };

    window.renderFilterManageList = function() {
        const c = document.getElementById('fm-list-container'); c.innerHTML = '';
        designFilters.forEach((f, i) => {
            c.innerHTML += `<div class="flex items-center gap-2"><input type="text" value="${escapeAttr(f)}" ${changeActionAttrs('updateDesignFilter', [i])} class="flex-1 border-2 border-slate-100 rounded-xl p-2 text-sm font-bold"><button ${actionAttrs('deleteDesignFilter', [i])} class="text-slate-300 hover:text-red-500 bg-slate-50 p-2.5 rounded-xl"><i data-lucide="trash-2" class="w-4 h-4"></i></button></div>`;
        });
        lucide.createIcons();
    };

    window.addDesignFilter = function() {
        const v = document.getElementById('fm-new-filter').value.trim();
        if (v && !designFilters.includes(v)) {
            designFilters.push(v); document.getElementById('fm-new-filter').value = '';
            window.saveToFirebase(); window.renderFilterManageList(); window.updateDesignFilterSelects();
        }
    };

    window.updateDesignFilter = function(i, v) {
        v = v.trim();
        if (v && v !== designFilters[i]) {
            ['photoshop', 'illustrator', 'figma', 'design'].forEach(t => {
                ['basic', 'advanced'].forEach(l => {
                    toolData[t][l].forEach(c => { if (c.category === designFilters[i]) c.category = v; });
                });
            });
            designFilters[i] = v; window.saveToFirebase(); window.updateDesignFilterSelects(); window.renderAllToolCards();
        }
    };

    window.deleteDesignFilter = function(i) {
        ['photoshop', 'illustrator', 'figma', 'design'].forEach(t => {
            ['basic', 'advanced'].forEach(l => {
                toolData[t][l].forEach(c => { if (c.category === designFilters[i]) c.category = ''; });
            });
        });
        designFilters.splice(i, 1); window.saveToFirebase(); window.renderFilterManageList(); window.updateDesignFilterSelects(); window.renderAllToolCards();
    };

    window.updateDesignFilterSelects = function() {
        const ms = document.getElementById('design-category-filter'); const mds = document.getElementById('tcm-category');
        if (ms) {
            let cv = ms.value; ms.innerHTML = `<option value="all">전체</option>`;
            designFilters.forEach(f => ms.innerHTML += `<option value="${f}">${f}</option>`);
            if (designFilters.includes(cv)) ms.value = cv; else { ms.value = 'all'; window.changeDesignFilter('all'); }
        }
        if (mds) {
            let cv = mds.value; mds.innerHTML = `<option value="">없음</option>`;
            designFilters.forEach(f => mds.innerHTML += `<option value="${f}">${f}</option>`);
            if (designFilters.includes(cv)) mds.value = cv; else mds.value = '';
        }
    };

    window.renderWorkspace = function() {
        const c = document.getElementById('render-workspace-cards'); if (!c) return; c.innerHTML = '';
        if (isEditMode) c.innerHTML += `<div ${actionAttrs('openWorkspaceModal', ['new'])} class="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[24px] p-6 flex flex-col items-center justify-center text-slate-400 hover:text-figjam cursor-pointer min-h-[250px]"><i data-lucide="plus-circle" class="w-10 h-10 mb-3"></i><span class="font-bold text-[15px]">추가</span></div>`;
        workspaceData.forEach(u => {
            let eb = isEditMode ? `<button ${actionAttrs('openWorkspaceModal', [u.id])} class="absolute top-4 right-4 text-slate-400 hover:text-figjam bg-slate-50 p-2 rounded-xl opacity-0 group-hover:opacity-100 z-20"><i data-lucide="edit" class="w-4 h-4"></i></button>` : '';
            let lh = '';
            (u.links || []).forEach(l => {
                if (!l.name) return;
                lh += `<div class="flex items-center gap-2">
                    <a href="${l.url}" target="_blank" class="flex-1 flex justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 group/link transition-colors">
                        <div class="flex items-center gap-2.5">
                            <div class="w-8 h-8 rounded-lg bg-white flex justify-center items-center text-slate-400 shadow-sm"><i data-lucide="${l.icon || 'link'}" class="w-4 h-4"></i></div>
                            <span class="text-[13px] font-bold text-slate-700">${l.name}</span>
                        </div>
                        <i data-lucide="external-link" class="w-3.5 h-3.5 text-slate-300"></i>
                    </a>
                    <button ${actionAttrs('copyToClipboard', [l.url])} class="w-[46px] h-[46px] flex items-center justify-center bg-slate-50 border border-slate-100 rounded-xl text-slate-400 hover:text-figjam hover:bg-slate-100 transition-colors shrink-0 shadow-sm" title="링크 복사"><i data-lucide="copy" class="w-4 h-4"></i></button>
                </div>`;
            });
            c.innerHTML += `<div class="bg-white rounded-[24px] border border-slate-100 shadow-soft hover:shadow-hover p-6 relative group">${eb}
                <div class="flex gap-3.5 mb-5 border-b border-slate-50 pb-4">
                    <div class="w-12 h-12 rounded-2xl bg-figjam text-white flex justify-center items-center text-lg font-bold shadow-md shrink-0">${u.avatar || u.name.charAt(0)}</div>
                    <div class="flex-1 min-w-0">
                        <h3 class="font-bold text-slate-800 text-[16px] truncate">${u.name}</h3>
                        <div class="text-[12px] font-medium text-slate-400 mt-1 flex items-center gap-1">
                            <i data-lucide="mail" class="w-3 h-3 shrink-0"></i> 
                            <span class="truncate">${u.email || 'abcd123@gmail.com'}</span>
                            <button ${actionAttrs('copyToClipboard', [u.email || 'abcd123@gmail.com'])} class="ml-1 text-slate-300 hover:text-figjam transition-colors shrink-0" title="이메일 복사"><i data-lucide="copy" class="w-3 h-3"></i></button>
                        </div>
                    </div>
                </div>
                <div class="space-y-2.5">${lh}</div>
            </div>`;
        });
        lucide.createIcons();
    };

    window.addNewLinkToWorkspace = function() {
        document.getElementById('wsm-links-container').insertAdjacentHTML('beforeend', `<div class="wsm-link-item bg-slate-50 p-4 rounded-xl relative group"><button type="button" ${actionAttrs('removeParentItem')} class="absolute top-2 right-2 text-slate-300 hover:text-red-500 bg-white rounded-md p-1"><i data-lucide="trash-2" class="w-3 h-3"></i></button><div class="grid grid-cols-2 gap-3 mb-3"><div><input type="text" placeholder="이름" class="w-full border-2 border-slate-200 rounded-lg p-2 text-xs font-bold bg-white link-name"></div><div><input type="text" value="link" class="w-full border-2 border-slate-200 rounded-lg p-2 text-xs bg-white link-icon"></div></div><input type="text" placeholder="URL" class="w-full border-2 border-slate-200 rounded-lg p-2 text-xs bg-white link-url"></div>`); lucide.createIcons();
    };

    window.openWorkspaceModal = function(id) {
        document.getElementById('wsm-id').value = id; let u = { name: '', avatar: '', email: '', links: [] };
        if (id !== 'new') u = workspaceData.find(x => x.id === id) || u;
        document.getElementById('wsm-name').value = u.name; document.getElementById('wsm-avatar').value = u.avatar; document.getElementById('wsm-email').value = u.email || '';
        const db = document.getElementById('btn-wsm-delete'); if (id === 'new') db.classList.add('hidden'); else db.classList.remove('hidden');
        const c = document.getElementById('wsm-links-container'); c.innerHTML = '';
        (u.links || []).forEach(l => {
            c.insertAdjacentHTML('beforeend', `<div class="wsm-link-item bg-slate-50 p-4 rounded-xl relative group"><button type="button" ${actionAttrs('removeParentItem')} class="absolute top-2 right-2 text-slate-300 hover:text-red-500 bg-white rounded-md p-1"><i data-lucide="trash-2" class="w-3 h-3"></i></button><div class="grid grid-cols-2 gap-3 mb-3"><div><input type="text" value="${escapeAttr(l.name)}" class="w-full border-2 border-slate-200 rounded-lg p-2 text-xs font-bold bg-white link-name"></div><div><input type="text" value="${escapeAttr(l.icon || 'link')}" class="w-full border-2 border-slate-200 rounded-lg p-2 text-xs bg-white link-icon"></div></div><input type="text" value="${escapeAttr(l.url)}" class="w-full border-2 border-slate-200 rounded-lg p-2 text-xs bg-white link-url"></div>`);
        });
        if (id === 'new') window.addNewLinkToWorkspace();
        const m = document.getElementById('workspace-modal'); m.classList.remove('hidden'); m.classList.add('flex');
        setTimeout(() => m.classList.add('opacity-100'), 10); lucide.createIcons();
    };

    window.closeWorkspaceModal = function() {
        const m = document.getElementById('workspace-modal'); m.classList.remove('opacity-100');
        setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300);
    };

    window.saveWorkspaceModal = function() {
        const id = document.getElementById('wsm-id').value; const n = document.getElementById('wsm-name').value.trim(); const a = document.getElementById('wsm-avatar').value.trim() || n.charAt(0); const e = document.getElementById('wsm-email').value.trim();
        if (!n) return window.showToast("이름입력");
        const nl = []; document.querySelectorAll('.wsm-link-item').forEach(x => { const ln = x.querySelector('.link-name').value.trim(); const li = x.querySelector('.link-icon').value.trim(); const lu = x.querySelector('.link-url').value.trim(); if (ln || lu) nl.push({ name: ln, icon: li, url: lu }); });
        if (id === 'new') workspaceData.push({ id: 'ws_' + Date.now(), name: n, avatar: a, email: e, links: nl });
        else { const i = workspaceData.findIndex(x => x.id === id); if (i > -1) { workspaceData[i].name = n; workspaceData[i].avatar = a; workspaceData[i].email = e; workspaceData[i].links = nl; } }
        window.saveToFirebase(); window.renderWorkspace(); window.closeWorkspaceModal(); window.showToast('저장됨');
    };

    window.deleteWorkspaceCard = function() {
        const id = document.getElementById('wsm-id').value; workspaceData = workspaceData.filter(x => x.id !== id);
        window.saveToFirebase(); window.renderWorkspace(); window.closeWorkspaceModal(); window.showToast('삭제됨');
    };

    window.openMemoListModal = function() {
        const m = document.getElementById('memo-list-modal'); m.classList.remove('hidden'); m.classList.add('flex');
        setTimeout(() => m.classList.add('opacity-100'), 10); window.renderMemoList();
    };

    window.closeMemoListModal = function() {
        const m = document.getElementById('memo-list-modal'); m.classList.remove('opacity-100');
        setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300);
    };

    window.switchMemoTool = function(id) {
        currentMemoTool = id;
        document.querySelectorAll('.memo-tool-tab').forEach(el => { el.classList.remove('font-bold', 'text-indigo-600', 'border-b-[3px]', 'border-indigo-600'); el.classList.add('font-medium', 'text-slate-400'); });
        const ab = document.getElementById('memotab-tool-' + id); ab.classList.remove('font-medium', 'text-slate-400'); ab.classList.add('font-bold', 'text-indigo-600', 'border-b-[3px]', 'border-indigo-600');
        window.renderMemoList();
    };

    window.switchMemoLevel = function(id) {
        currentMemoLevel = id;
        document.querySelectorAll('.memo-level-tab').forEach(el => { el.classList.remove('text-indigo-600', 'bg-white', 'shadow-sm', 'font-bold'); el.classList.add('text-slate-500', 'font-medium'); });
        const ab = document.getElementById('memotab-level-' + id); ab.classList.remove('text-slate-500', 'font-medium'); ab.classList.add('text-indigo-600', 'bg-white', 'shadow-sm', 'font-bold');
        window.renderMemoList();
    };

    window.openMemoListForTool = function(toolId, levelId) {
        window.switchMemoTool(toolId);
        window.switchMemoLevel(levelId);
        window.openMemoListModal();
    };

    window.renderMemoList = function() {
        const c = document.getElementById('render-memo-list'); if (!c) return; c.innerHTML = '';
        const fm = memoData.filter(x => x.toolId === currentMemoTool && x.levelId === currentMemoLevel);
        fm.forEach((m, i) => {
            const cd = toolData[currentMemoTool][currentMemoLevel].find(x => x.id === m.cardId); const ct = cd ? (cd.title || '없음') : '연결안됨';
            const eb = isEditMode ? `<button ${actionAttrs('openMemoEditModal', [m.id], { stop: true })} class="text-slate-400 hover:text-indigo-600 p-1.5 rounded-md hover:bg-indigo-50"><i data-lucide="edit" class="w-4 h-4"></i></button>` : '';
            c.insertAdjacentHTML('beforeend', `<div ${actionAttrs('openMemoViewModal', [m.id])} class="grid grid-cols-12 gap-4 p-4 border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer items-center group"><div class="col-span-1 text-center text-[13px] font-bold text-slate-400">${fm.length - i}</div><div class="col-span-3 truncate text-[12px] font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md" title="${ct}">${ct}</div><div class="col-span-5 md:col-span-6 flex items-center gap-3"><h3 class="text-[14px] font-bold text-slate-700 truncate group-hover:text-indigo-600">${m.title}</h3></div><div class="col-span-3 md:col-span-2 flex justify-end gap-3 pr-2"><span class="text-[12px] font-medium text-slate-400">${m.date}</span>${eb}</div></div>`);
        });
        if (isEditMode) {
            c.insertAdjacentHTML('beforeend', `<div ${actionAttrs('openMemoEditModal', ['new'])} class="p-6 flex flex-col items-center justify-center text-slate-400 hover:text-indigo-600 bg-slate-50/50 cursor-pointer h-[100px]"><i data-lucide="plus-circle" class="w-5 h-5 mb-1.5"></i><span class="font-bold text-[13px]">새 작성</span></div>`);
        } else if (fm.length === 0) {
            c.innerHTML = `<div class="p-12 text-center text-slate-400">등록된 메모가 없습니다.</div>`;
        }
        lucide.createIcons();
    };

    window.openMemoEditModal = function(id) {
        document.getElementById('mem-id').value = id; let m = { title: '', content: '', cardId: '' };
        if (id !== 'new') m = memoData.find(x => x.id === id) || m;
        document.getElementById('mem-title').value = m.title; document.getElementById('mem-content').value = m.content;
        const cs = document.getElementById('mem-cardId'); cs.innerHTML = `<option value="">연결 안함</option>`;
        (toolData[currentMemoTool][currentMemoLevel] || []).forEach(c => {
            const is = m.cardId === c.id ? 'selected' : ''; cs.innerHTML += `<option value="${c.id}" ${is}>${c.title}</option>`;
        });
        const db = document.getElementById('btn-mem-delete'); if (id === 'new') db.classList.add('hidden'); else db.classList.remove('hidden');
        const md = document.getElementById('memo-edit-modal'); md.classList.remove('hidden'); md.classList.add('flex');
        setTimeout(() => md.classList.add('opacity-100'), 10);
    };

    window.closeMemoEditModal = function() {
        const md = document.getElementById('memo-edit-modal'); md.classList.remove('opacity-100');
        setTimeout(() => { md.classList.add('hidden'); md.classList.remove('flex'); }, 300);
    };

    window.saveMemo = function() {
        const id = document.getElementById('mem-id').value; const t = document.getElementById('mem-title').value.trim(); const c = document.getElementById('mem-content').value.trim(); const ci = document.getElementById('mem-cardId').value;
        if (!t) return window.showToast("제목입력");
        if (id === 'new') {
            const d = new Date();
            memoData.unshift({
                id: 'm_' + Date.now(), toolId: currentMemoTool, levelId: currentMemoLevel, cardId: ci, title: t, content: c, date: `${String(d.getFullYear()).slice(-2)}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
            });
        } else {
            const idx = memoData.findIndex(x => x.id === id);
            if (idx > -1) { memoData[idx].title = t; memoData[idx].content = c; memoData[idx].cardId = ci; }
        }
        window.saveToFirebase(); window.renderMemoList(); window.renderAllToolCards(); window.closeMemoEditModal(); window.showToast('저장됨');
    };

    window.deleteMemo = function() {
        window.promptDeleteMemo(document.getElementById('mem-id').value); window.closeMemoEditModal();
    };

    window.promptDeleteMemo = function(id) {
        currentDeleteMemoId = id; const m = document.getElementById('memo-delete-confirm-modal'); m.classList.remove('hidden'); m.classList.add('flex');
        setTimeout(() => m.classList.add('opacity-100'), 10);
    };

    window.closeMemoDeleteConfirm = function() {
        const m = document.getElementById('memo-delete-confirm-modal'); m.classList.remove('opacity-100');
        setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); currentDeleteMemoId = null; }, 300);
    };

    window.executeDeleteMemo = function() {
        if (!currentDeleteMemoId) return;
        memoData = memoData.filter(x => x.id !== currentDeleteMemoId);
        window.saveToFirebase(); window.renderMemoList(); window.renderAllToolCards(); window.closeMemoDeleteConfirm(); window.showToast('삭제됨');
    };

    window.openMemoViewModal = function(id) {
        const m = memoData.find(x => x.id === id); if (!m) return; currentViewMemoId = id;
        document.getElementById('mvm-title').textContent = m.title; document.getElementById('mvm-date').textContent = m.date;
        const cd = toolData[m.toolId][m.levelId].find(x => x.id === m.cardId); const cb = document.getElementById('mvm-card');
        if (cd) { cb.classList.remove('hidden'); cb.classList.add('flex'); document.getElementById('mvm-card-text').textContent = cd.title; }
        else { cb.classList.add('hidden'); cb.classList.remove('flex'); }
        document.getElementById('mvm-content').innerHTML = m.content.replace(/\n/g, '<br>');
        const md = document.getElementById('memo-view-modal'); md.classList.remove('hidden'); md.classList.add('flex');
        setTimeout(() => md.classList.add('opacity-100'), 10);
    };

    window.closeMemoViewModal = function() {
        const m = document.getElementById('memo-view-modal'); m.classList.remove('opacity-100');
        setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300);
    };

    window.openMemoListFromView = function() {
        const m = memoData.find(x => x.id === currentViewMemoId); window.closeMemoViewModal();
        if (m) { window.switchMemoTool(m.toolId); window.switchMemoLevel(m.levelId); }
        window.openMemoListModal();
    };

    window.copyMemoContent = function() {
        const m = memoData.find(x => x.id === currentViewMemoId); if (!m) return;
        navigator.clipboard.writeText(`[${m.title}]\n\n${m.content}`).then(() => window.showToast("복사됨")).catch(() => window.showToast("실패"));
    };

    window.updateSummary = function() {
        if (!progressData || Object.keys(progressData).length === 0) return;
        let tt = 0; let cnt = 0;
        for (const s in progressData) { for (const t in progressData[s]) { tt += parseInt(progressData[s][t]) || 0; cnt++; } }
        const avg = cnt === 0 ? 0 : Math.round(tt / cnt); const el = document.getElementById('summary-avg'); if (el) el.textContent = avg + '%';
    };

    window.renderStudentLegend = function() {
        const c = document.getElementById('custom-legend'); if (!c) return; c.innerHTML = '';
        studentsList.forEach((s, i) => {
            const sm = tasksList.reduce((a, t) => a + (parseInt(progressData[s][t]) || 0), 0); const av = Math.round(sm / tasksList.length) || 0;
            const btn = document.createElement('button'); btn.className = 'w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 bg-white group';
            btn.setAttribute('data-action', 'toggleLegendDataset');
            btn.setAttribute('data-action-args', JSON.stringify([i]));
            btn.id = `legend-btn-${i}`;
            const cb = isEditMode ? `<button ${actionAttrs('openCommentModal', [s], { stop: true })} class="w-7 h-7 flex items-center justify-center bg-indigo-50 hover:bg-indigo-500 hover:text-white rounded-lg text-indigo-400 ml-1"><i data-lucide="message-square" class="w-3.5 h-3.5"></i></button>` : '';
            btn.innerHTML = `<div class="flex items-center gap-3"><div class="w-3 h-3 rounded-full ${studentColorClass(i)}"></div><span class="text-[14px] font-bold text-slate-700">${s}</span></div><div class="flex items-center gap-1.5"><span class="text-[12px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md mr-1">${av}%</span><span ${actionAttrs('openModal', [s], { stop: true })} class="w-7 h-7 flex items-center justify-center bg-slate-100 hover:bg-figjam hover:text-white rounded-lg text-slate-400"><i data-lucide="edit-2" class="w-3.5 h-3.5"></i></span>${cb}</div>`;
            c.appendChild(btn); if (myChart && myChart.isDatasetVisible(i) === false) btn.classList.add('opacity-40');
        });
        lucide.createIcons();
    };

    window.toggleDataset = function(i) { if (!myChart) return; if (myChart.isDatasetVisible(i)) myChart.hide(i); else myChart.show(i); };
    window.toggleLegendDataset = function(i) { window.toggleDataset(i); window.updateLegendStyle(i); };
    window.updateLegendStyle = function(i) { if (!myChart) return; const b = document.getElementById(`legend-btn-${i}`); if (!b) return; if (myChart.isDatasetVisible(i)) b.classList.remove('opacity-40'); else b.classList.add('opacity-40'); };

    window.renderChart = function() {
        const cx = document.getElementById('progressChart'); if (!cx) return;
        const ds = studentsList.map((s, i) => {
            return {
                label: s, data: tasksList.map(t => progressData[s][t] || 0), borderColor: studentColors[i % studentColors.length], backgroundColor: studentColors[i % studentColors.length] + '15', borderWidth: 2, pointBackgroundColor: '#fff', pointBorderColor: studentColors[i % studentColors.length], pointBorderWidth: 2, pointRadius: 4, pointHoverRadius: 6, tension: 0.3, fill: true
            };
        });
        if (myChart) { myChart.data.datasets = ds; myChart.update(); }
        else {
            myChart = new Chart(cx, {
                type: 'line', data: { labels: tasksList, datasets: ds }, options: {
                    responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false }, plugins: {
                        legend: { display: false }, tooltip: {
                            backgroundColor: 'rgba(15,23,42,0.9)', titleFont: { family: 'Pretendard', size: 13, weight: 'bold' }, bodyFont: { family: 'Pretendard', size: 12 }, padding: 12, cornerRadius: 8, callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y}%` }
                        }
                    }, scales: {
                        y: { min: 0, max: 100, grid: { color: '#f1f5f9', borderDash: [5, 5] }, ticks: { font: { family: 'Pretendard', size: 11, weight: 'bold' }, color: '#94a3b8', stepSize: 20 } }, x: { grid: { display: false }, ticks: { font: { family: 'Pretendard', size: 11, weight: 'bold' }, color: '#64748b', maxRotation: 45, minRotation: 45 } }
                    }
                }
            });
        }
        window.renderStudentLegend();
    };

    window.openModal = function(s) {
        currentEditingStudent = s; document.getElementById('modal-title').textContent = `${s} 진척도 수정`; const g = document.getElementById('modal-form-grid'); g.innerHTML = '';
        tasksList.forEach((t, i) => {
            g.innerHTML += `<div class="relative bg-slate-50 p-4 rounded-xl border border-slate-100"><label class="block text-[11px] font-bold text-slate-500 mb-2 truncate"><span class="text-slate-300 mr-1">${i + 1}.</span>${t}</label><div class="relative"><input type="number" id="input-${i}" value="${progressData[s][t]}" min="0" max="100" class="w-full bg-white border border-slate-200 rounded-lg py-2 pl-3 pr-8 text-sm font-bold outline-none focus:border-figjam"><span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">%</span></div></div>`;
        });
        const m = document.getElementById('modal'); m.classList.remove('hidden'); m.classList.add('flex');
        setTimeout(() => m.classList.add('opacity-100'), 10);
    };

    window.closeModal = function() {
        const m = document.getElementById('modal'); m.classList.remove('opacity-100');
        setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); currentEditingStudent = ''; }, 300);
    };

    window.saveData = function() {
        if (!currentEditingStudent) return;
        tasksList.forEach((t, i) => { const v = parseInt(document.getElementById(`input-${i}`).value) || 0; progressData[currentEditingStudent][t] = Math.min(100, Math.max(0, v)); });
        window.saveToFirebase(); window.renderChart(); window.updateSummary(); window.closeModal(); window.showToast('저장됨');
    };

    window.copyProgressData = function() {
        let t = "이름\t" + tasksList.join("\t") + "\n";
        studentsList.forEach(s => { t += s + "\t" + tasksList.map(x => progressData[s][x] + "%").join("\t") + "\n"; });
        navigator.clipboard.writeText(t).then(() => window.showToast("복사됨")).catch(() => window.showToast("실패"));
    };

    window.openCommentModal = function(s) {
        document.getElementById('scm-title').textContent = `${s} 코멘트`; document.getElementById('scm-content').value = studentComments[s] || ''; currentEditingStudent = s;
        const m = document.getElementById('student-comment-modal'); m.classList.remove('hidden'); m.classList.add('flex');
        setTimeout(() => m.classList.add('opacity-100'), 10);
    };

    window.closeCommentModal = function() {
        const m = document.getElementById('student-comment-modal'); m.classList.remove('opacity-100');
        setTimeout(() => { m.classList.add('hidden'); m.classList.remove('flex'); }, 300);
    };

    window.saveCommentModal = function() {
        if (!currentEditingStudent) return;
        studentComments[currentEditingStudent] = document.getElementById('scm-content').value;
        window.saveToFirebase(); window.closeCommentModal(); window.showToast('저장됨');
    };

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
                console.warn("Netlify API 저장 실패, 기존 저장 방식으로 전환합니다.", e);
            }
        }

        try {
            if (await saveStateToSupabase(state)) {
                saveStateToLocal(state);
                return;
            }
        } catch (e) {
            console.warn("Supabase 저장 실패, 기존 저장 방식으로 전환합니다.", e);
        }

        if (db && auth && auth.currentUser) {
            const r = doc(db, FIREBASE_COLLECTION, REMOTE_ROW_ID);
            try {
                await setDoc(r, toFirebaseDocument(state));
                setCloudStatus('클라우드 연동됨', 'text-emerald-500');
            } catch (e) {
                console.error("클라우드 저장 실패", e);
                saveStateToLocal(state);
                setCloudStatus('로컬 저장 중', 'text-amber-500');
            }
        } else {
            saveStateToLocal(state);
        }
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
                console.warn("Netlify API 로드 실패, 기존 저장소로 전환합니다.", e);
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
            console.warn("Supabase 로드 실패, 기존 저장소로 전환합니다.", e);
        }

        await initFirebaseModules();
        if (auth && db) {
            onAuthStateChanged(auth, (u) => {
                if (u) {
                    const r = doc(db, FIREBASE_COLLECTION, REMOTE_ROW_ID);
                    onSnapshot(r, (s) => {
                        if (s.exists()) {
                            applyStateSnapshot(s.data());
                            setCloudStatus('클라우드 연동됨', 'text-emerald-500');
                            window.forceDataSync(); 
                            window.updateDesignFilterSelects(); 
                            window.renderAll();
                        } else {
                            window.loadFromLocal();
                        }
                    }, (e) => {
                        console.error("Firebase 로드 실패:", e);
                        window.loadFromLocal();
                    });
                } else {
                    signInAnonymously(auth).catch(e => {
                        console.error("인증 실패:", e);
                        window.loadFromLocal();
                    });
                }
            });
        } else {
            window.loadFromLocal();
        }
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
